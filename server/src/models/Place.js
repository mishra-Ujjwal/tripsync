import mongoose from 'mongoose';

const placeSchema = new mongoose.Schema(
  {
    city: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    avgVisitDurationHours: { type: Number, required: true },
    bestTimeToVisit: { type: String, required: true },
    ticketCost: { type: Number, required: true, default: 0 },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    tags: [{ type: String }],
    rating: { type: Number, required: true, min: 0, max: 5 },
    googlePlaceId: { type: String, default: '', index: true },
    googleMapsUri: { type: String, default: '' },
    googlePrimaryType: { type: String, default: '' },
    idealTripTypes: [{ type: String }],
    bestSlot: {
      type: String,
      enum: ['morning', 'afternoon', 'evening'],
      required: true,
    },
    indoorOutdoor: {
      type: String,
      enum: ['indoor', 'outdoor', 'mixed'],
      required: true,
    },
    image: { type: String, default: '' },
    thumbnail: { type: String, default: '' },
    imageSource: { type: String, default: '' },
    imageAlt: { type: String, default: '' },
    photographerName: { type: String, default: '' },
    photographerUsername: { type: String, default: '' },
    photographerProfile: { type: String, default: '' },
    unsplashPhotoLink: { type: String, default: '' },
    imageLookupStatus: {
      type: String,
      enum: ['pending', 'success', 'miss', 'error'],
      default: 'pending',
    },
    imageLastFetchedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

placeSchema.index({ city: 1, name: 1 }, { unique: true });

export const Place = mongoose.model('Place', placeSchema);
