import mongoose from 'mongoose';

const itineraryPlaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    note: { type: String, default: '' },
    image: { type: String, default: '' },
    thumbnail: { type: String, default: '' },
    imageSource: { type: String, default: '' },
    imageAlt: { type: String, default: '' },
    photographerName: { type: String, default: '' },
    photographerUsername: { type: String, default: '' },
    photographerProfile: { type: String, default: '' },
    unsplashPhotoLink: { type: String, default: '' },
  },
  { _id: false }
);

const destinationImageSchema = new mongoose.Schema(
  {
    image: { type: String, default: '' },
    thumbnail: { type: String, default: '' },
    imageSource: { type: String, default: '' },
    imageAlt: { type: String, default: '' },
    photographerName: { type: String, default: '' },
    photographerUsername: { type: String, default: '' },
    photographerProfile: { type: String, default: '' },
    unsplashPhotoLink: { type: String, default: '' },
  },
  { _id: false }
);

const itineraryDaySchema = new mongoose.Schema(
  {
    dayNumber: { type: Number, required: true },
    title: { type: String, required: true },
    theme: { type: String, default: '' },
    morning: [itineraryPlaceSchema],
    afternoon: [itineraryPlaceSchema],
    evening: [itineraryPlaceSchema],
    foodSuggestions: [{ type: String }],
    tips: [{ type: String }],
    notes: [{ type: String }],
    estimatedDayCost: { type: Number, default: 0 },
  },
  { _id: false }
);

const estimatedCostSchema = new mongoose.Schema(
  {
    stay: { type: Number, default: 0 },
    food: { type: Number, default: 0 },
    localTransport: { type: Number, default: 0 },
    tickets: { type: Number, default: 0 },
    misc: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },
  { _id: false }
);

const tripSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    destination: { type: String, required: true, index: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalDays: { type: Number, required: true },
    travelers: { type: Number, required: true, min: 1 },
    budget: {
      type: String,
      enum: ['low', 'medium', 'luxury'],
      required: true,
    },
    tripType: {
      type: String,
      enum: ['solo', 'couple', 'family', 'friends'],
      required: true,
    },
    interests: [{ type: String }],
    pace: {
      type: String,
      enum: ['relaxed', 'balanced', 'packed'],
      required: true,
    },
    hotelPreference: { type: String, default: '' },
    transportPreference: { type: String, default: '' },
    foodPreference: { type: String, default: '' },
    notes: { type: String, default: '' },
    premium: { type: Boolean, default: false },
    destinationImage: destinationImageSchema,
    tripSummary: {
      destination: { type: String, default: '' },
      vibe: { type: String, default: '' },
      budgetNote: { type: String, default: '' },
    },
    estimatedCost: estimatedCostSchema,
    itinerary: [itineraryDaySchema],
  },
  { timestamps: true }
);

export const Trip = mongoose.model('Trip', tripSchema);
