import { Place } from '../models/Place.js';
import { Trip } from '../models/Trip.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { calculateTripDays } from '../utils/calculateTripDays.js';
import { buildDayFallback, buildDraftItinerary } from '../services/itineraryService.js';
import { autocompleteDestinations, discoverDestinationPlaces, normalizeDestinationName } from '../services/googlePlacesService.js';
import { enrichItineraryDaysWithImages, getDestinationBannerImage } from '../services/imageEnrichmentService.js';
import { generateItineraryNarrative, regenerateItineraryDay } from '../services/openaiService.js';

const VALID_BUDGETS = ['low', 'medium', 'luxury'];
const VALID_PACES = ['relaxed', 'balanced', 'packed'];
const VALID_TRIP_TYPES = ['solo', 'couple', 'family', 'friends'];

const placeNameFromSlotItem = (item) => (typeof item === 'string' ? item : item?.name);

const destinationVariants = (destination) => {
  const cleaned = String(destination || '').trim();
  const normalized = normalizeDestinationName(cleaned);

  return [...new Set([cleaned, normalized].filter(Boolean))];
};

const findStoredPlacesForDestination = async (destination) => {
  const variants = destinationVariants(destination);
  const orConditions = variants.map((variant) => ({ city: new RegExp(`^${variant}$`, 'i') }));
  return Place.find(orConditions.length ? { $or: orConditions } : { city: '__none__' });
};

const getDestinationPlaces = async (destination) => {
  let places = await findStoredPlacesForDestination(destination);

  if (places.length) {
    return places;
  }

  const discoveredPlaces = await discoverDestinationPlaces(destination);
  if (!discoveredPlaces.length) {
    return [];
  }

  try {
    await Place.insertMany(discoveredPlaces, { ordered: false });
  } catch (error) {
    if (error?.code !== 11000) {
      console.warn('Failed to persist Google Places results:', error.message);
    }
  }

  places = await findStoredPlacesForDestination(destination);
  return places.length ? places : discoveredPlaces;
};

const sanitizeTripPayload = (payload) => ({
  destination: String(payload.destination || '').trim(),
  startDate: payload.startDate,
  endDate: payload.endDate,
  travelers: Number(payload.travelers || 1),
  budget: payload.budget,
  tripType: payload.tripType,
  interests: Array.isArray(payload.interests) ? payload.interests.filter(Boolean) : [],
  pace: payload.pace,
  hotelPreference: String(payload.hotelPreference || '').trim(),
  transportPreference: String(payload.transportPreference || '').trim(),
  foodPreference: String(payload.foodPreference || '').trim(),
  notes: String(payload.notes || '').trim(),
  premium: Boolean(payload.premium),
});

const validateTripPayload = (payload) => {
  if (!payload.destination) {
    throw new Error('Destination is required');
  }
  if (!VALID_BUDGETS.includes(payload.budget)) {
    throw new Error('Budget selection is invalid');
  }
  if (!VALID_PACES.includes(payload.pace)) {
    throw new Error('Travel pace is invalid');
  }
  if (!VALID_TRIP_TYPES.includes(payload.tripType)) {
    throw new Error('Trip type is invalid');
  }
  if (!payload.startDate || !payload.endDate) {
    throw new Error('Trip dates are required');
  }
  if (payload.travelers < 1 || payload.travelers > 12) {
    throw new Error('Traveler count must be between 1 and 12');
  }
};

const mapAiDaysToStoredDays = (days, draftDays) =>
  draftDays.map((draftDay, index) => {
    const matchingDay =
      days.find((day) => Number(day.dayNumber) === draftDay.dayNumber) ||
      days[index] ||
      {};

    return {
      dayNumber: draftDay.dayNumber,
      title: matchingDay.title || draftDay.title || `Day ${index + 1}`,
      theme: draftDay.theme || '',
      morning: matchingDay.morning?.length ? matchingDay.morning : draftDay.morning || [],
      afternoon: matchingDay.afternoon?.length ? matchingDay.afternoon : draftDay.afternoon || [],
      evening: matchingDay.evening?.length ? matchingDay.evening : draftDay.evening || [],
      foodSuggestions: matchingDay.foodSuggestions?.length
        ? matchingDay.foodSuggestions
        : draftDay.foodSuggestions || [],
      tips: matchingDay.tips?.length ? matchingDay.tips : draftDay.tips || [],
      notes: draftDay.notes || [],
      estimatedDayCost: draftDay.estimatedDayCost || 0,
    };
  });

const buildGenerateFallbackResponse = ({ payload, destination, draft }) => ({
  tripSummary: {
    destination,
    vibe: `${payload.pace} exploration with a ${payload.budget} travel profile built from scored local highlights`,
    budgetNote: `This itinerary used backend fallback planning with ${payload.budget} cost balancing and realistic daily pacing.`,
  },
  estimatedCost: draft.estimatedCost,
  destinationImage: null,
  days: draft.draftDays.map((day) => ({
    dayNumber: day.dayNumber,
    title: day.title,
    morning: day.morning,
    afternoon: day.afternoon,
    evening: day.evening,
    foodSuggestions: day.foodSuggestions,
    tips: day.tips,
  })),
});

export const generateTrip = asyncHandler(async (req, res) => {
  const payload = sanitizeTripPayload(req.body);
  validateTripPayload(payload);

  const totalDays = calculateTripDays(payload.startDate, payload.endDate);
  const destination = payload.destination;
  const places = await getDestinationPlaces(destination);
  if (!places.length) {
    res.status(404);
    throw new Error(`No destination data found for ${destination}`);
  }

  const enrichedPreferences = { ...payload, destination: normalizeDestinationName(destination) };
  const draft = buildDraftItinerary({
    places,
    preferences: enrichedPreferences,
    totalDays,
  });

  let aiResponse;
  try {
    aiResponse = await generateItineraryNarrative({
      tripPreferences: {
        ...enrichedPreferences,
        totalDays,
      },
      shortlistedPlaces: draft.shortlistedPlaces,
      draftDays: draft.draftDays,
      estimatedCost: draft.estimatedCost,
      premium: payload.premium,
    });
  } catch (error) {
    aiResponse = buildGenerateFallbackResponse({ payload, destination, draft });
  }

  const enrichedItinerary = await enrichItineraryDaysWithImages(
    mapAiDaysToStoredDays(aiResponse.days, draft.draftDays),
    destination
  );
  const destinationImage = aiResponse.destinationImage || (await getDestinationBannerImage(destination));

  res.status(200).json({
    success: true,
    data: {
      tripInputs: {
        ...payload,
        totalDays,
      },
      tripSummary: aiResponse.tripSummary,
      estimatedCost: aiResponse.estimatedCost || draft.estimatedCost,
      destinationImage,
      itinerary: enrichedItinerary,
      shortlistedPlaces: draft.shortlistedPlaces,
    },
  });
});

export const saveGeneratedTrip = asyncHandler(async (req, res) => {
  const payload = sanitizeTripPayload(req.body.tripInputs || {});
  validateTripPayload(payload);

  const totalDays = calculateTripDays(payload.startDate, payload.endDate);
  const trip = await Trip.create({
    userId: req.user._id,
    ...payload,
    totalDays,
    destinationImage: req.body.destinationImage,
    tripSummary: req.body.tripSummary,
    estimatedCost: req.body.estimatedCost,
    itinerary: req.body.itinerary,
  });

  res.status(201).json({
    success: true,
    data: trip,
  });
});

export const regenerateDay = asyncHandler(async (req, res) => {
  const payload = sanitizeTripPayload(req.body.tripInputs || {});
  validateTripPayload(payload);

  const currentDay = req.body.day;
  if (!currentDay?.dayNumber) {
    res.status(400);
    throw new Error('A valid itinerary day is required');
  }

  const places = await getDestinationPlaces(payload.destination);
  if (!places.length) {
    res.status(404);
    throw new Error(`No place data found for ${payload.destination}`);
  }

  const totalDays = calculateTripDays(payload.startDate, payload.endDate);
  const draft = buildDraftItinerary({
    places,
    preferences: { ...payload, destination: normalizeDestinationName(payload.destination) },
    totalDays,
  });

  const alternatives = draft.shortlistedPlaces.filter(
    (place) =>
      !(currentDay.morning || []).some((item) => placeNameFromSlotItem(item) === place.name) &&
      !(currentDay.afternoon || []).some((item) => placeNameFromSlotItem(item) === place.name) &&
      !(currentDay.evening || []).some((item) => placeNameFromSlotItem(item) === place.name)
  );

  let refreshed;
  try {
    refreshed = await regenerateItineraryDay({
      tripPreferences: {
        ...payload,
        totalDays,
      },
      currentDay,
      alternatives: alternatives.slice(0, 5),
      premium: payload.premium,
    });
  } catch (error) {
    refreshed = {
      day: buildDayFallback({
        currentDay,
        preferences: payload,
        alternatives,
      }),
    };
  }

  if (req.body.tripId) {
    const trip = await Trip.findOne({ _id: req.body.tripId, userId: req.user._id });
    if (!trip) {
      res.status(404);
      throw new Error('Trip not found');
    }

    const enrichedDay = (await enrichItineraryDaysWithImages([refreshed.day], payload.destination))[0];
    trip.itinerary = trip.itinerary.map((item) =>
      item.dayNumber === enrichedDay.dayNumber
        ? {
            ...item.toObject(),
            ...enrichedDay,
          }
        : item
    );
    await trip.save();
    refreshed.day = enrichedDay;
  } else {
    refreshed.day = (await enrichItineraryDaysWithImages([refreshed.day], payload.destination))[0];
  }

  res.status(200).json({
    success: true,
    data: refreshed.day,
  });
});

export const getTrips = asyncHandler(async (req, res) => {
  const query = String(req.query.q || '').trim();

  const mongoQuery = query
    ? {
        userId: req.user._id,
        $or: [
          { destination: { $regex: query, $options: 'i' } },
          { tripType: { $regex: query, $options: 'i' } },
        ],
      }
    : { userId: req.user._id };

  const trips = await Trip.find(mongoQuery).sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: trips });
});

export const getTripById = asyncHandler(async (req, res) => {
  const trip = await Trip.findOne({ _id: req.params.id, userId: req.user._id });
  if (!trip) {
    res.status(404);
    throw new Error('Trip not found');
  }

  res.status(200).json({ success: true, data: trip });
});

export const deleteTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findOne({ _id: req.params.id, userId: req.user._id });
  if (!trip) {
    res.status(404);
    throw new Error('Trip not found');
  }

  await trip.deleteOne();
  res.status(200).json({ success: true, message: 'Trip deleted successfully' });
});

export const getPlacesByCity = asyncHandler(async (req, res) => {
  const places = (await findStoredPlacesForDestination(req.params.city)).sort((a, b) => (b.rating || 0) - (a.rating || 0));
  res.status(200).json({ success: true, data: places });
});

export const getDestinationAutocomplete = asyncHandler(async (req, res) => {
  const query = String(req.query.q || '').trim();
  const suggestions = await autocompleteDestinations(query);
  res.status(200).json({ success: true, data: suggestions });
});
