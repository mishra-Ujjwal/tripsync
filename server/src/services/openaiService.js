import OpenAI from 'openai';

const itineraryResponseSchema = {
  name: 'travel_itinerary_response',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      tripSummary: {
        type: 'object',
        additionalProperties: false,
        properties: {
          destination: { type: 'string' },
          vibe: { type: 'string' },
          budgetNote: { type: 'string' },
        },
        required: ['destination', 'vibe', 'budgetNote'],
      },
      estimatedCost: {
        type: 'object',
        additionalProperties: false,
        properties: {
          stay: { type: 'number' },
          food: { type: 'number' },
          localTransport: { type: 'number' },
          tickets: { type: 'number' },
          misc: { type: 'number' },
          total: { type: 'number' },
        },
        required: ['stay', 'food', 'localTransport', 'tickets', 'misc', 'total'],
      },
      days: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            dayNumber: { type: 'number' },
            title: { type: 'string' },
            morning: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  name: { type: 'string' },
                  note: { type: 'string' },
                },
                required: ['name', 'note'],
              },
            },
            afternoon: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  name: { type: 'string' },
                  note: { type: 'string' },
                },
                required: ['name', 'note'],
              },
            },
            evening: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  name: { type: 'string' },
                  note: { type: 'string' },
                },
                required: ['name', 'note'],
              },
            },
            foodSuggestions: { type: 'array', items: { type: 'string' } },
            tips: { type: 'array', items: { type: 'string' } },
          },
          required: ['dayNumber', 'title', 'morning', 'afternoon', 'evening', 'foodSuggestions', 'tips'],
        },
      },
    },
    required: ['tripSummary', 'estimatedCost', 'days'],
  },
};

const singleDaySchema = {
  name: 'travel_single_day_response',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      day: {
        type: 'object',
        additionalProperties: false,
        properties: {
          dayNumber: { type: 'number' },
          title: { type: 'string' },
          morning: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                name: { type: 'string' },
                note: { type: 'string' },
              },
              required: ['name', 'note'],
            },
          },
          afternoon: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                name: { type: 'string' },
                note: { type: 'string' },
              },
              required: ['name', 'note'],
            },
          },
          evening: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                name: { type: 'string' },
                note: { type: 'string' },
              },
              required: ['name', 'note'],
            },
          },
          foodSuggestions: { type: 'array', items: { type: 'string' } },
          tips: { type: 'array', items: { type: 'string' } },
        },
        required: ['dayNumber', 'title', 'morning', 'afternoon', 'evening', 'foodSuggestions', 'tips'],
      },
    },
    required: ['day'],
  },
};

const getClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

const getModel = (premium) =>
  premium ? process.env.OPENAI_PREMIUM_MODEL || 'gpt-5.4' : process.env.OPENAI_MODEL || 'gpt-5.4-mini';

const buildInstructionEnvelope = (mode) =>
  JSON.stringify({
    role: 'premium_travel_planner',
    mode,
    response_rules: [
      'Return strict JSON only.',
      'Do not include markdown fences, prose outside JSON, or commentary.',
      'Preserve destination and structure supplied by backend.',
      'Do not invent places outside the selected destination unless phrased as optional alternatives inside tips.',
      'Keep plans realistic, premium, concise, and grounded in the provided shortlist.',
    ],
  });

const extractOutputText = (response) => {
  if (response.output_text) {
    return response.output_text;
  }

  const output = response.output || [];
  const textParts = output.flatMap((item) =>
    (item.content || [])
      .filter((contentItem) => contentItem.type === 'output_text' || contentItem.type === 'text')
      .map((contentItem) => contentItem.text || '')
  );

  return textParts.join('\n').trim();
};

const stripJsonWrappers = (text) =>
  text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

const safeJsonParse = (text) => {
  const cleaned = stripJsonWrappers(text);
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  const candidate = firstBrace >= 0 && lastBrace >= 0 ? cleaned.slice(firstBrace, lastBrace + 1) : cleaned;
  return JSON.parse(candidate);
};

const normalizeStringArray = (value) =>
  Array.isArray(value) ? value.filter((item) => typeof item === 'string' && item.trim()).map((item) => item.trim()) : [];

const normalizePlaceArray = (value) =>
  Array.isArray(value)
    ? value
        .map((item) =>
          typeof item === 'string'
            ? { name: item.trim(), note: '' }
            : {
                name: String(item?.name || '').trim(),
                note: String(item?.note || '').trim(),
              }
        )
        .filter((item) => item.name)
    : [];

const assertItineraryShape = (payload) => {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Itinerary response was not a JSON object');
  }

  if (!payload.tripSummary || !Array.isArray(payload.days) || !payload.estimatedCost) {
    throw new Error('Itinerary response was missing required top-level fields');
  }

  return {
    tripSummary: {
      destination: String(payload.tripSummary.destination || '').trim(),
      vibe: String(payload.tripSummary.vibe || '').trim(),
      budgetNote: String(payload.tripSummary.budgetNote || '').trim(),
    },
    estimatedCost: {
      stay: Number(payload.estimatedCost.stay || 0),
      food: Number(payload.estimatedCost.food || 0),
      localTransport: Number(payload.estimatedCost.localTransport || 0),
      tickets: Number(payload.estimatedCost.tickets || 0),
      misc: Number(payload.estimatedCost.misc || 0),
      total: Number(payload.estimatedCost.total || 0),
    },
    days: payload.days.map((day, index) => ({
      dayNumber: Number(day.dayNumber || index + 1),
      title: String(day.title || `Day ${index + 1}`).trim(),
      morning: normalizePlaceArray(day.morning),
      afternoon: normalizePlaceArray(day.afternoon),
      evening: normalizePlaceArray(day.evening),
      foodSuggestions: normalizeStringArray(day.foodSuggestions),
      tips: normalizeStringArray(day.tips),
    })),
  };
};

const assertSingleDayShape = (payload) => {
  if (!payload?.day || typeof payload.day !== 'object') {
    throw new Error('Single-day response was missing the day object');
  }

  return {
    day: {
      dayNumber: Number(payload.day.dayNumber || 1),
      title: String(payload.day.title || 'Refreshed day').trim(),
      morning: normalizePlaceArray(payload.day.morning),
      afternoon: normalizePlaceArray(payload.day.afternoon),
      evening: normalizePlaceArray(payload.day.evening),
      foodSuggestions: normalizeStringArray(payload.day.foodSuggestions),
      tips: normalizeStringArray(payload.day.tips),
    },
  };
};

const parseStructuredResponse = (response, shapeValidator) => {
  if (response.output_parsed) {
    return shapeValidator(response.output_parsed);
  }

  const outputText = extractOutputText(response);
  if (!outputText) {
    throw new Error('OpenAI response did not contain any text output');
  }

  return shapeValidator(safeJsonParse(outputText));
};

export const generateItineraryNarrative = async ({
  tripPreferences,
  shortlistedPlaces,
  draftDays,
  estimatedCost,
  premium = false,
}) => {
  const client = getClient();

  const response = await client.responses.create({
    model: getModel(premium),
    input: [
      {
        role: 'system',
        content: [{ type: 'input_text', text: buildInstructionEnvelope('full_itinerary') }],
      },
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: JSON.stringify({
              tripPreferences,
              shortlistedPlaces,
              draftDays,
              estimatedCost,
              planner_constraints: {
                keep_place_names_from_shortlist: true,
                preserve_day_count: true,
                preserve_day_numbers: true,
                avoid_overcrowding: true,
                keep_food_and_tips_relevant_to_trip_type_budget_and_pace: true,
              },
            }),
          },
        ],
      },
    ],
    text: {
      format: {
        type: 'json_schema',
        ...itineraryResponseSchema,
      },
    },
  });

  return parseStructuredResponse(response, assertItineraryShape);
};

export const regenerateItineraryDay = async ({
  tripPreferences,
  currentDay,
  alternatives,
  premium = false,
}) => {
  const client = getClient();

  const response = await client.responses.create({
    model: getModel(premium),
    input: [
      {
        role: 'system',
        content: [{ type: 'input_text', text: buildInstructionEnvelope('single_day_refresh') }],
      },
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: JSON.stringify({
              tripPreferences,
              currentDay,
              alternatives,
              planner_constraints: {
                keep_same_destination: true,
                keep_same_day_number: true,
                keep_day_realistic: true,
                use_alternatives_if_helpful: true,
                keep_food_and_tips_relevant_to_trip_type_budget_and_pace: true,
              },
            }),
          },
        ],
      },
    ],
    text: {
      format: {
        type: 'json_schema',
        ...singleDaySchema,
      },
    },
  });

  return parseStructuredResponse(response, assertSingleDayShape);
};
