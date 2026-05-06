import { estimateTripCost, getPaceProfile, scorePlaces, shortlistPlaces } from './scoringService.js';

const foodSuggestionsByBudget = {
  low: {
    solo: ['Choose dependable local cafes for authentic meals without overspending.', 'Keep one chai or snack stop near your main sightseeing area.'],
    couple: ['Split one local thali-style meal and add a scenic cafe stop.', 'Use a trusted neighborhood restaurant for a comfortable dinner.'],
    family: ['Prefer family-friendly restaurants close to the day’s main stop.', 'Keep one quick snack break planned to avoid long hunger gaps.'],
    friends: ['Use one budget-friendly local spot and one lively snack stop.', 'Save bigger spend for a signature evening meal only if the day remains light.'],
  },
  medium: {
    solo: ['Mix one destination-signature meal with one easy cafe break.', 'Use well-rated local dining close to your sightseeing cluster.'],
    couple: ['Plan one charming local dining experience with relaxed pacing.', 'Add a scenic cafe or dessert stop in the evening.'],
    family: ['Balance familiar options with one well-rated regional specialty meal.', 'Keep lunch practical so the afternoon stays comfortable for everyone.'],
    friends: ['Use one energetic local food stop and one relaxed dinner venue.', 'End the day at a lively area if the itinerary pace still feels easy.'],
  },
  luxury: {
    solo: ['Reserve one standout destination meal with ambiance and local character.', 'Use a polished cafe or lounge for a slow recharge break.'],
    couple: ['Plan one elevated dining experience with a scenic or romantic setting.', 'Use a premium coffee, dessert, or sunset lounge stop in the evening.'],
    family: ['Choose premium but approachable dining with comfortable service and seating.', 'Use pre-booked dinner windows to reduce waiting.'],
    friends: ['Mix one standout dining reservation with a stylish evening social stop.', 'Use premium casual dining to keep the energy high without rushing.'],
  },
};

const tipsByTripType = {
  solo: ['Keep your route clustered so solo transit remains simple and efficient.'],
  couple: ['Leave a little unstructured evening time for a slower, more personal finish.'],
  family: ['Keep transitions predictable and allow short rest windows between major stops.'],
  friends: ['Use one anchor plan and one flexible stop so the group can adapt easily.'],
};

const paceThemes = {
  relaxed: 'Easy-flow discovery',
  balanced: 'Well-paced city highlights',
  packed: 'High-energy exploration',
};

const slotOrder = ['morning', 'afternoon', 'evening'];
const slotCapacityByPace = {
  relaxed: { morning: 1, afternoon: 1, evening: 1 },
  balanced: { morning: 1, afternoon: 1, evening: 1 },
  packed: { morning: 1, afternoon: 1, evening: 1 },
};

const getRelevantFoodSuggestions = ({ budget, tripType, foodPreference }) => {
  const baseSuggestions =
    foodSuggestionsByBudget[budget]?.[tripType] ||
    foodSuggestionsByBudget.medium.solo;

  if (!foodPreference) {
    return baseSuggestions;
  }

  const preferenceLine = `Bias choices toward ${foodPreference.toLowerCase()} while staying aligned with the day’s budget.`;
  return [baseSuggestions[0], preferenceLine];
};

const buildDayTips = ({ preferences, placeNames, slotLoad }) => {
  const tips = [
    `Use ${preferences.transportPreference || 'local transport'} between ${slotLoad > 1 ? 'major stops' : 'the main stop'} to keep the day smooth.`,
    `This day is tuned for a ${preferences.pace} pace and ${preferences.budget} budget profile.`,
    tipsByTripType[preferences.tripType]?.[0] || 'Keep transfers simple and realistic throughout the day.',
  ];

  if (placeNames.some((name) => /fort|palace|temple|church/i.test(name))) {
    tips.push('Start heritage-heavy visits a little earlier to avoid the most crowded window.');
  }

  return tips.slice(0, 3);
};

const createEmptyDay = (index, preferences) => ({
  dayNumber: index + 1,
  title: `Day ${index + 1}`,
  theme: paceThemes[preferences.pace],
  morning: [],
  afternoon: [],
  evening: [],
  foodSuggestions: getRelevantFoodSuggestions(preferences),
  tips: [],
  notes: [],
  estimatedDayCost: 0,
  usedHours: 0,
  places: [],
});

const dayLoadFor = (day) => day.morning.length + day.afternoon.length + day.evening.length;

const createPlaceSlotItem = (place) => ({
  name: place.name,
  note: place.description,
});

const normalizePlaceItem = (place) =>
  typeof place === 'string'
    ? { name: place, note: '' }
    : {
        name: place?.name || '',
        note: place?.note || '',
      };

const canPlaceFitInDay = ({ day, place, slot, preferences, paceProfile }) => {
  const slotCap = slotCapacityByPace[preferences.pace]?.[slot] ?? 1;
  const nextHours = day.usedHours + place.avgVisitDurationHours;
  return day[slot].length < slotCap && nextHours <= paceProfile.maxHoursPerDay;
};

const assignPlaceToDay = ({ day, place }) => {
  day[place.bestSlot].push(createPlaceSlotItem(place));
  day.places.push(place);
  day.usedHours += place.avgVisitDurationHours;
  day.estimatedDayCost += place.ticketCost;
  day.notes.push(`${place.name}: ${place.description}`);
};

const chooseBestDayForPlace = ({ itinerary, place, preferences, paceProfile }) => {
  const preferredSlot = place.bestSlot || 'afternoon';
  const candidates = itinerary
    .map((day, index) => ({ day, index }))
    .filter(({ day }) => canPlaceFitInDay({ day, place, slot: preferredSlot, preferences, paceProfile }));

  if (!candidates.length) {
    return -1;
  }

  candidates.sort((a, b) => {
    const loadDiff = dayLoadFor(a.day) - dayLoadFor(b.day);
    if (loadDiff !== 0) return loadDiff;
    return a.day.usedHours - b.day.usedHours;
  });

  return candidates[0].index;
};

const enrichSparseDay = ({ day, selectedPlaces }) => {
  if (dayLoadFor(day) > 0) {
    return;
  }

    const firstPlace = selectedPlaces.find((place) => place.bestSlot === 'morning') || selectedPlaces[0];
  const secondPlace = selectedPlaces.find((place) => place.bestSlot === 'evening' && place.name !== firstPlace?.name);

  if (firstPlace) assignPlaceToDay({ day, place: firstPlace });
  if (secondPlace) assignPlaceToDay({ day, place: secondPlace });
};

export const buildDraftItinerary = ({ places, preferences, totalDays }) => {
  const scoredPlaces = scorePlaces({ places, preferences, totalDays });
  const selectedPlaces = shortlistPlaces({
    scoredPlaces,
    totalDays,
    pace: preferences.pace,
    budget: preferences.budget,
  });
  const paceProfile = getPaceProfile(preferences.pace);
  const itinerary = Array.from({ length: totalDays }, (_, index) => createEmptyDay(index, preferences));

  for (const place of selectedPlaces) {
    const targetDayIndex = chooseBestDayForPlace({
      itinerary,
      place,
      preferences,
      paceProfile,
    });

    if (targetDayIndex >= 0) {
      assignPlaceToDay({ day: itinerary[targetDayIndex], place });
    }
  }

  for (const day of itinerary) {
    enrichSparseDay({ day, selectedPlaces });

    const uniquePlaceNames = [...new Set(day.places.map((place) => place.name))];
    const leadPlace = uniquePlaceNames[0];
    const categories = [...new Set(day.places.map((place) => place.category))];
    const themeWord = categories[0] ? categories[0].replace(/^\w/, (char) => char.toUpperCase()) : 'Discovery';

    day.title = leadPlace
      ? `${preferences.destination} ${themeWord} day: ${leadPlace}`
      : `${preferences.destination} ${paceThemes[preferences.pace]}`;
    day.foodSuggestions = getRelevantFoodSuggestions(preferences);
    day.tips = buildDayTips({
      preferences,
      placeNames: uniquePlaceNames,
      slotLoad: dayLoadFor(day),
    });
    day.estimatedDayCost *= preferences.travelers;
  }

  const estimatedCost = estimateTripCost({
    selectedPlaces,
    travelers: preferences.travelers,
    totalDays,
    budget: preferences.budget,
    transportPreference: preferences.transportPreference,
    hotelPreference: preferences.hotelPreference,
    tripType: preferences.tripType,
  });

  return {
    scoredPlaces,
    selectedPlaces,
    estimatedCost,
    draftDays: itinerary.map(({ places: dayPlaces, usedHours, ...day }) => day),
    shortlistedPlaces: selectedPlaces.map((place) => ({
      name: place.name,
      category: place.category,
      description: place.description,
      bestSlot: place.bestSlot,
      ticketCost: place.ticketCost,
      rating: place.rating,
      tags: place.tags,
      avgVisitDurationHours: place.avgVisitDurationHours,
      idealTripTypes: place.idealTripTypes,
      score: place.score,
    })),
  };
};

export const buildDayFallback = ({ currentDay, preferences, alternatives = [] }) => {
  const fallbackAlternative = alternatives[0];
  const title = fallbackAlternative
    ? `${preferences.destination} refreshed day: ${fallbackAlternative.name}`
    : currentDay.title;

  const currentMorning = (currentDay.morning || []).map(normalizePlaceItem);
  const currentAfternoon = (currentDay.afternoon || []).map(normalizePlaceItem);
  const currentEvening = (currentDay.evening || []).map(normalizePlaceItem);

  const morning = fallbackAlternative?.bestSlot === 'morning' ? [createPlaceSlotItem(fallbackAlternative)] : currentMorning;
  const afternoon =
    fallbackAlternative?.bestSlot === 'afternoon' ? [createPlaceSlotItem(fallbackAlternative)] : currentAfternoon;
  const evening = fallbackAlternative?.bestSlot === 'evening' ? [createPlaceSlotItem(fallbackAlternative)] : currentEvening;

  return {
    dayNumber: currentDay.dayNumber,
    title,
    morning,
    afternoon,
    evening,
    foodSuggestions: getRelevantFoodSuggestions(preferences),
    tips: [
      ...buildDayTips({
        preferences,
        placeNames: [...morning, ...afternoon, ...evening].map((place) => place.name),
        slotLoad: morning.length + afternoon.length + evening.length,
      }),
      'A safe fallback refresh was used because AI regeneration was unavailable.',
    ].slice(0, 4),
  };
};
