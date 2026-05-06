const GOOGLE_PLACES_BASE = 'https://places.googleapis.com/v1';

const CATEGORY_RULES = [
  { match: ['hindu_temple', 'mosque', 'church', 'synagogue', 'temple'], category: 'spiritual', slot: 'morning', indoorOutdoor: 'mixed', ticketCost: 150, visitHours: 1.5, bestTime: 'Morning' },
  { match: ['museum', 'art_gallery'], category: 'culture', slot: 'afternoon', indoorOutdoor: 'indoor', ticketCost: 350, visitHours: 2, bestTime: 'Late morning' },
  { match: ['historical_landmark', 'cultural_landmark', 'fortress', 'fort', 'monument', 'castle'], category: 'heritage', slot: 'morning', indoorOutdoor: 'mixed', ticketCost: 500, visitHours: 2.5, bestTime: 'Morning' },
  { match: ['tourist_attraction', 'observation_deck', 'point_of_interest'], category: 'scenic', slot: 'evening', indoorOutdoor: 'mixed', ticketCost: 250, visitHours: 2, bestTime: 'Evening' },
  { match: ['park', 'beach', 'hiking_area', 'mountain_peak', 'national_park', 'natural_feature'], category: 'nature', slot: 'morning', indoorOutdoor: 'outdoor', ticketCost: 200, visitHours: 2.5, bestTime: 'Morning' },
  { match: ['shopping_mall', 'market'], category: 'shopping', slot: 'afternoon', indoorOutdoor: 'mixed', ticketCost: 0, visitHours: 2, bestTime: 'Afternoon' },
];

const getGoogleApiKey = () => String(process.env.GOOGLE_MAPS_API_KEY || '').trim();

const cleanupDestination = (value = '') => String(value).trim();

const normalizeDestinationName = (destination) => {
  const cleaned = cleanupDestination(destination);
  return cleaned.split(',').map((part) => part.trim()).filter(Boolean)[0] || cleaned;
};

const requestGooglePlaces = async ({ endpoint, fieldMask, body }) => {
  const apiKey = getGoogleApiKey();
  if (!apiKey) {
    return null;
  }

  const response = await fetch(`${GOOGLE_PLACES_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': fieldMask,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Places request failed (${response.status}): ${errorText}`);
  }

  return response.json();
};

export const autocompleteDestinations = async (input) => {
  const trimmedInput = String(input || '').trim();
  if (!trimmedInput || trimmedInput.length < 2) {
    return [];
  }

  try {
    const data = await requestGooglePlaces({
      endpoint: '/places:autocomplete',
      fieldMask:
        'suggestions.placePrediction.place,suggestions.placePrediction.text.text,suggestions.placePrediction.structuredFormat.mainText.text,suggestions.placePrediction.structuredFormat.secondaryText.text',
      body: {
        input: trimmedInput,
        includedPrimaryTypes: ['(cities)', '(regions)'],
        includeQueryPredictions: false,
        languageCode: 'en',
      },
    });

    const predictions = (data?.suggestions || [])
      .map((suggestion) => suggestion.placePrediction)
      .filter(Boolean)
      .map((prediction) => ({
        placeId: prediction.place || '',
        text: prediction.text?.text || '',
        primaryText: prediction.structuredFormat?.mainText?.text || prediction.text?.text || '',
        secondaryText: prediction.structuredFormat?.secondaryText?.text || '',
      }))
      .filter((prediction) => prediction.text);

    if (predictions.length) {
      return predictions;
    }
  } catch (error) {
    console.warn('Google destination autocomplete failed:', error.message);
  }

  try {
    const searchData = await requestGooglePlaces({
      endpoint: '/places:searchText',
      fieldMask: 'places.id,places.displayName,places.formattedAddress',
      body: {
        textQuery: trimmedInput,
        languageCode: 'en',
      },
    });

    return (searchData?.places || [])
      .map((place) => ({
        placeId: place.id || '',
        text: place.displayName?.text
          ? [place.displayName.text, place.formattedAddress].filter(Boolean).join(', ')
          : place.formattedAddress || '',
        primaryText: place.displayName?.text || place.formattedAddress || '',
        secondaryText: place.formattedAddress || '',
      }))
      .filter((prediction) => prediction.text)
      .slice(0, 8);
  } catch (error) {
    console.warn('Google destination text-search fallback failed:', error.message);
    return [];
  }
};

const inferCategoryMeta = (types = [], name = '') => {
  const normalizedTypes = types.map((type) => String(type).toLowerCase());
  const normalizedName = String(name).toLowerCase();

  const matchedRule =
    CATEGORY_RULES.find((rule) =>
      rule.match.some((token) => normalizedTypes.includes(token) || normalizedName.includes(token.replace(/_/g, ' ')))
    ) || CATEGORY_RULES[3];

  return matchedRule;
};

const toTagList = (types = []) =>
  types
    .map((type) => String(type).replace(/_/g, ' ').toLowerCase())
    .filter(Boolean)
    .slice(0, 6);

const mapGooglePlaceToLocalPlace = (place, destination) => {
  const displayName = place.displayName?.text || 'Destination highlight';
  const types = place.types || [];
  const meta = inferCategoryMeta(types, displayName);

  return {
    city: normalizeDestinationName(destination),
    name: displayName,
    description: place.formattedAddress || `${displayName} in ${destination}`,
    category: meta.category,
    avgVisitDurationHours: meta.visitHours,
    bestTimeToVisit: meta.bestTime,
    ticketCost: meta.ticketCost,
    coordinates: {
      lat: Number(place.location?.latitude || 0),
      lng: Number(place.location?.longitude || 0),
    },
    tags: toTagList(types),
    rating: Math.max(3.8, Math.min(5, Number(place.rating || 4.4))),
    googlePlaceId: String(place.id || ''),
    googleMapsUri: String(place.googleMapsUri || ''),
    googlePrimaryType: String(place.primaryType || ''),
    idealTripTypes: ['solo', 'couple', 'family', 'friends'],
    bestSlot: meta.slot,
    indoorOutdoor: meta.indoorOutdoor,
  };
};

export const discoverDestinationPlaces = async (destination) => {
  const cleanedDestination = cleanupDestination(destination);
  if (!cleanedDestination) {
    return [];
  }

  const queries = [
    `top tourist attractions in ${cleanedDestination}`,
    `best places to visit in ${cleanedDestination}`,
    `iconic landmarks in ${cleanedDestination}`,
  ];

  const collected = new Map();

  for (const query of queries) {
    try {
      const data = await requestGooglePlaces({
        endpoint: '/places:searchText',
        fieldMask: 'places.id,places.displayName,places.formattedAddress,places.googleMapsUri,places.primaryType,places.types,places.rating,places.location',
        body: {
          textQuery: query,
          languageCode: 'en',
        },
      });

      for (const place of data?.places || []) {
        const key = String(place.id || place.displayName?.text || '').trim();
        if (!key || collected.has(key)) {
          continue;
        }

        const mapped = mapGooglePlaceToLocalPlace(place, cleanedDestination);
        if (!mapped.coordinates.lat && !mapped.coordinates.lng) {
          continue;
        }

        collected.set(key, mapped);
      }
    } catch (error) {
      console.warn(`Google destination discovery failed for "${query}":`, error.message);
    }
  }

  return Array.from(collected.values()).slice(0, 14);
};

export { normalizeDestinationName };
