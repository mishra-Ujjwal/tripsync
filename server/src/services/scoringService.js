const budgetWeights = {
  low: {
    maxComfortableTicket: 250,
    stayPerNight: 1800,
    foodPerDay: 700,
    transportPerDay: 500,
    miscPerDay: 350,
    premiumComfortMultiplier: 0.92,
  },
  medium: {
    maxComfortableTicket: 700,
    stayPerNight: 4200,
    foodPerDay: 1400,
    transportPerDay: 900,
    miscPerDay: 800,
    premiumComfortMultiplier: 1,
  },
  luxury: {
    maxComfortableTicket: 2000,
    stayPerNight: 9000,
    foodPerDay: 2800,
    transportPerDay: 1800,
    miscPerDay: 1600,
    premiumComfortMultiplier: 1.22,
  },
};

const paceWeights = {
  relaxed: { slotsPerDay: 2, targetHoursPerDay: 4.5, maxHoursPerDay: 5.5, slotCap: 1 },
  balanced: { slotsPerDay: 3, targetHoursPerDay: 6.5, maxHoursPerDay: 7.5, slotCap: 1 },
  packed: { slotsPerDay: 3, targetHoursPerDay: 8, maxHoursPerDay: 9, slotCap: 1 },
};

const transportMultiplierByPreference = {
  'Private cab': 1.2,
  'Rental scooter': 0.85,
  'Public transport': 0.72,
  'Walking-friendly': 0.68,
};

export const getBudgetProfile = (budget) => budgetWeights[budget] || budgetWeights.medium;
export const getPaceProfile = (pace) => paceWeights[pace] || paceWeights.balanced;

const scoreBudgetFit = (place, budgetProfile, budget) => {
  if (place.ticketCost === 0) return 10;
  if (place.ticketCost <= budgetProfile.maxComfortableTicket) return 14;
  if (budget === 'low') return -16;
  if (budget === 'medium' && place.ticketCost > budgetProfile.maxComfortableTicket * 1.5) return -10;
  return 3;
};

const scorePaceFit = (place, pace, paceProfile, totalDays) => {
  let score = 0;

  if (place.avgVisitDurationHours <= paceProfile.targetHoursPerDay / 2) {
    score += 6;
  }

  if (pace === 'relaxed' && place.avgVisitDurationHours > 3.5) {
    score -= 8;
  }

  if (pace === 'packed' && place.avgVisitDurationHours <= 2.5) {
    score += 5;
  }

  if (totalDays <= 2 && place.avgVisitDurationHours > 3.5) {
    score -= 8;
  }

  return score;
};

const scoreInterestFit = (place, normalizedInterests) => {
  const tagMatches = place.tags.filter((tag) => normalizedInterests.includes(tag.toLowerCase())).length;
  let score = tagMatches * 16;

  if (normalizedInterests.includes(place.category.toLowerCase())) {
    score += 16;
  }

  if (normalizedInterests.includes('relaxation') && ['garden', 'scenic', 'beach'].includes(place.category)) {
    score += 6;
  }

  return score;
};

const scoreFoodFit = (place, foodPreference = '') => {
  if (!foodPreference) return 0;

  const normalizedFoodPreference = foodPreference.toLowerCase();
  if (place.tags.some((tag) => tag.toLowerCase().includes('food'))) return 8;
  if (normalizedFoodPreference.includes('local') && place.tags.includes('culture')) return 5;
  return 0;
};

export const scorePlaces = ({ places, preferences, totalDays }) => {
  const budgetProfile = getBudgetProfile(preferences.budget);
  const paceProfile = getPaceProfile(preferences.pace);
  const normalizedInterests = (preferences.interests || []).map((item) => item.toLowerCase());

  return places
    .map((place) => {
      let score = 0;

      score += scoreInterestFit(place, normalizedInterests);

      if (place.idealTripTypes.includes(preferences.tripType)) {
        score += 18;
      }

      if (preferences.tripType === 'family' && place.indoorOutdoor !== 'outdoor') {
        score += 4;
      }

      if (preferences.tripType === 'couple' && (place.tags.includes('views') || place.tags.includes('romantic'))) {
        score += 7;
      }

      if (preferences.tripType === 'friends' && (place.tags.includes('adventure') || place.tags.includes('nightlife'))) {
        score += 7;
      }

      score += Math.round(place.rating * 10);
      score += scoreBudgetFit(place, budgetProfile, preferences.budget);
      score += scorePaceFit(place, preferences.pace, paceProfile, totalDays);
      score += scoreFoodFit(place, preferences.foodPreference);

      if (preferences.transportPreference === 'Walking-friendly' && place.avgVisitDurationHours <= 2.5) {
        score += 3;
      }

      if (place.bestSlot === 'evening' && preferences.pace === 'relaxed') {
        score += 2;
      }

      return {
        ...place.toObject(),
        score,
      };
    })
    .sort((a, b) => b.score - a.score);
};

export const shortlistPlaces = ({ scoredPlaces, totalDays, pace, budget }) => {
  const paceProfile = getPaceProfile(pace);
  const shortlistTarget = Math.min(
    scoredPlaces.length,
    Math.max(totalDays * paceProfile.slotsPerDay + 2, totalDays * 2)
  );
  const shortlisted = [];
  const categoryCounts = new Map();

  for (const place of scoredPlaces) {
    const categoryCount = categoryCounts.get(place.category) || 0;
    const shouldLimitCategory = totalDays <= 2 ? categoryCount >= 1 : categoryCount >= 2;
    const priceyForBudget = budget === 'low' && place.ticketCost > getBudgetProfile(budget).maxComfortableTicket * 1.8;

    if (shouldLimitCategory || priceyForBudget) {
      continue;
    }

    shortlisted.push(place);
    categoryCounts.set(place.category, categoryCount + 1);

    if (shortlisted.length >= shortlistTarget) {
      break;
    }
  }

  return shortlisted.length ? shortlisted : scoredPlaces.slice(0, shortlistTarget);
};

export const estimateTripCost = ({
  selectedPlaces,
  travelers,
  totalDays,
  budget,
  transportPreference = '',
  hotelPreference = '',
  tripType = '',
}) => {
  const budgetProfile = getBudgetProfile(budget);
  const transportMultiplier = transportMultiplierByPreference[transportPreference] || 1;
  const hotelBoost =
    hotelPreference.toLowerCase().includes('luxury') || hotelPreference.toLowerCase().includes('resort')
      ? 1.18
      : hotelPreference.toLowerCase().includes('homestay')
        ? 0.88
        : 1;
  const tripTypeFoodBoost = tripType === 'family' ? 1.08 : tripType === 'couple' && budget === 'luxury' ? 1.1 : 1;

  const tickets = Math.round(selectedPlaces.reduce((sum, place) => sum + place.ticketCost, 0) * travelers);
  const stay = Math.round(budgetProfile.stayPerNight * Math.max(totalDays - 1, 1) * hotelBoost);
  const food = Math.round(budgetProfile.foodPerDay * travelers * totalDays * tripTypeFoodBoost);
  const localTransport = Math.round(budgetProfile.transportPerDay * totalDays * transportMultiplier);
  const misc = Math.round(
    budgetProfile.miscPerDay * travelers * totalDays * budgetProfile.premiumComfortMultiplier
  );
  const total = stay + food + localTransport + misc + tickets;

  return {
    stay,
    food,
    localTransport,
    tickets,
    misc,
    total,
  };
};
