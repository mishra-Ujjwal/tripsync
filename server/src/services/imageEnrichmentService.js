import { Place } from '../models/Place.js';
import { getBestDestinationPhoto, getBestPhotoForGooglePlace } from './googlePlacePhotoService.js';

const slotKeys = ['morning', 'afternoon', 'evening'];
const IMAGE_CACHE_TTL_MS = 1000 * 60 * 60 * 24;

const ensureStructuredPlace = (place) => {
  if (!place) return null;
  if (typeof place === 'string') {
    return { name: place, note: '' };
  }

  return {
    name: String(place.name || '').trim(),
    note: String(place.note || '').trim(),
    image: place.image || '',
    thumbnail: place.thumbnail || '',
    imageSource: place.imageSource || '',
    imageAlt: place.imageAlt || '',
    photographerName: place.photographerName || '',
    photographerUsername: place.photographerUsername || '',
    photographerProfile: place.photographerProfile || '',
    unsplashPhotoLink: place.unsplashPhotoLink || '',
  };
};

const hasFreshCachedImage = (placeDoc) => {
  if (!placeDoc?.image || !placeDoc?.imageLastFetchedAt) {
    return false;
  }

  return Date.now() - new Date(placeDoc.imageLastFetchedAt).getTime() < IMAGE_CACHE_TTL_MS;
};

const buildFallbackFields = (destination) => ({
  image: '',
  thumbnail: '',
  imageSource: 'google_places_fallback',
  imageAlt: `Travel view of ${destination}`,
  photographerName: 'Google Places',
  photographerUsername: '',
  photographerProfile: '',
  unsplashPhotoLink: '',
});

const mapImagePayload = (imagePayload) => ({
  image: imagePayload?.imageUrl || '',
  thumbnail: imagePayload?.thumbUrl || '',
  imageSource: imagePayload?.source || 'google_places',
  imageAlt: imagePayload?.altDescription || '',
  photographerName: imagePayload?.photographerName || 'Google Places',
  photographerUsername: imagePayload?.photographerUsername || '',
  photographerProfile: imagePayload?.photographerProfile || '',
  unsplashPhotoLink: imagePayload?.unsplashPhotoLink || '',
});

const getPlaceNote = ({ structuredPlace, placeDoc }) =>
  structuredPlace.note || placeDoc?.description || `${structuredPlace.name} in ${placeDoc?.city || 'your destination'}`;

const cacheKeyFor = (destination, placeName) => `${String(destination).toLowerCase()}::${String(placeName).toLowerCase()}`;

const findPlaceDoc = async (destination, placeName) =>
  Place.findOne({
    city: new RegExp(`^${String(destination).split(',')[0].trim()}$`, 'i'),
    name: new RegExp(`^${placeName}$`, 'i'),
  });

const enrichSinglePlace = async ({ structuredPlace, destination, requestCache }) => {
  const requestKey = cacheKeyFor(destination, structuredPlace.name);
  if (requestCache.has(requestKey)) {
    return requestCache.get(requestKey);
  }

  const enrichmentPromise = (async () => {
    const placeDoc = await findPlaceDoc(destination, structuredPlace.name);

    const basePlace = {
      ...structuredPlace,
      note: getPlaceNote({ structuredPlace, placeDoc }),
    };

    if (hasFreshCachedImage(placeDoc)) {
      return {
        ...basePlace,
        image: placeDoc.image,
        thumbnail: placeDoc.thumbnail,
        imageSource: placeDoc.imageSource,
        imageAlt: placeDoc.imageAlt,
        photographerName: placeDoc.photographerName,
        photographerUsername: placeDoc.photographerUsername,
        photographerProfile: placeDoc.photographerProfile,
        unsplashPhotoLink: placeDoc.unsplashPhotoLink,
      };
    }

    if (!placeDoc?.googlePlaceId) {
      return {
        ...basePlace,
        ...buildFallbackFields(destination),
      };
    }

    try {
      const googleImage = await getBestPhotoForGooglePlace({
        googlePlaceId: placeDoc.googlePlaceId,
        fallbackAlt: `${structuredPlace.name} in ${destination}`,
      });

      if (googleImage) {
        const imageFields = mapImagePayload(googleImage);
        placeDoc.image = imageFields.image;
        placeDoc.thumbnail = imageFields.thumbnail;
        placeDoc.imageSource = imageFields.imageSource;
        placeDoc.imageAlt = imageFields.imageAlt;
        placeDoc.photographerName = imageFields.photographerName;
        placeDoc.photographerUsername = imageFields.photographerUsername;
        placeDoc.photographerProfile = imageFields.photographerProfile;
        placeDoc.unsplashPhotoLink = imageFields.unsplashPhotoLink;
        placeDoc.imageLookupStatus = 'success';
        placeDoc.imageLastFetchedAt = new Date();
        await placeDoc.save();

        return {
          ...basePlace,
          ...imageFields,
        };
      }
    } catch (error) {
      console.warn(`Google image enrichment failed for ${structuredPlace.name}:`, error.message);
      if (placeDoc) {
        placeDoc.imageLookupStatus = 'error';
        placeDoc.imageLastFetchedAt = new Date();
        await placeDoc.save();
      }
    }

    return {
      ...basePlace,
      ...buildFallbackFields(destination),
    };
  })();

  requestCache.set(requestKey, enrichmentPromise);
  return enrichmentPromise;
};

export const enrichPlacesWithImages = async (places, destination, requestCache = new Map()) => {
  const enrichedPlaces = [];

  for (const rawPlace of places) {
    const structuredPlace = ensureStructuredPlace(rawPlace);
    if (!structuredPlace?.name) continue;

    enrichedPlaces.push(
      await enrichSinglePlace({
        structuredPlace,
        destination,
        requestCache,
      })
    );
  }

  return enrichedPlaces;
};

export const enrichItineraryDaysWithImages = async (days, destination) => {
  const requestCache = new Map();
  const enrichedDays = [];

  for (const day of days) {
    const enrichedDay = { ...day };
    for (const slotKey of slotKeys) {
      enrichedDay[slotKey] = await enrichPlacesWithImages(day[slotKey] || [], destination, requestCache);
    }
    enrichedDays.push(enrichedDay);
  }

  return enrichedDays;
};

export const getDestinationBannerImage = async (destination) => {
  try {
    const banner = await getBestDestinationPhoto(destination);
    if (!banner) {
      return buildFallbackFields(destination);
    }
    return mapImagePayload(banner);
  } catch (error) {
    console.warn(`Google destination banner lookup failed for ${destination}:`, error.message);
    return buildFallbackFields(destination);
  }
};
