const GOOGLE_PLACES_BASE = 'https://places.googleapis.com/v1';

const getApiKey = () => String(process.env.GOOGLE_MAPS_API_KEY || '').trim();

const buildHeaders = (fieldMask) => ({
  'Content-Type': 'application/json',
  'X-Goog-Api-Key': getApiKey(),
  'X-Goog-FieldMask': fieldMask,
});

const buildPhotoPayload = (photo, fallbackAlt, source = 'google_places') => ({
  imageUrl: photo?.photoUri || '',
  thumbUrl: photo?.photoUri || '',
  altDescription: fallbackAlt,
  photographerName: photo?.authorAttributions?.[0]?.displayName || 'Google Places',
  photographerUsername: '',
  photographerProfile: photo?.authorAttributions?.[0]?.uri || photo?.authorAttributions?.[0]?.photoUri || '',
  unsplashPhotoLink: photo?.authorAttributions?.[0]?.uri || photo?.authorAttributions?.[0]?.photoUri || '',
  source,
});

const getPhotoMedia = async (photoName, maxWidthPx = 1200, maxHeightPx = 900) => {
  const apiKey = getApiKey();
  if (!apiKey || !photoName) return null;

  const mediaUrl = new URL(`${GOOGLE_PLACES_BASE}/${photoName}/media`);
  mediaUrl.searchParams.set('maxWidthPx', String(maxWidthPx));
  mediaUrl.searchParams.set('maxHeightPx', String(maxHeightPx));
  mediaUrl.searchParams.set('skipHttpRedirect', 'true');

  const response = await fetch(mediaUrl, {
    headers: {
      'X-Goog-Api-Key': apiKey,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google photo media failed (${response.status}): ${errorText}`);
  }

  return response.json();
};

export const getBestPhotoForGooglePlace = async ({ googlePlaceId, fallbackAlt, maxWidthPx = 1200, maxHeightPx = 900 }) => {
  const apiKey = getApiKey();
  if (!apiKey || !googlePlaceId) return null;

  const url = `${GOOGLE_PLACES_BASE}/places/${googlePlaceId}`;
  const response = await fetch(url, {
    headers: buildHeaders('id,displayName,photos'),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google place details failed (${response.status}): ${errorText}`);
  }

  const place = await response.json();
  const photo = place?.photos?.[0];
  if (!photo?.name) {
    return null;
  }

  const media = await getPhotoMedia(photo.name, maxWidthPx, maxHeightPx);
  return buildPhotoPayload(
    {
      ...photo,
      photoUri: media?.photoUri || '',
    },
    fallbackAlt
  );
};

export const getBestDestinationPhoto = async (destination) => {
  const apiKey = getApiKey();
  if (!apiKey || !destination) return null;

  const response = await fetch(`${GOOGLE_PLACES_BASE}/places:searchText`, {
    method: 'POST',
    headers: buildHeaders('places.id,places.displayName,places.formattedAddress,places.photos'),
    body: JSON.stringify({
      textQuery: String(destination).trim(),
      languageCode: 'en',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google destination photo lookup failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const matchingPlace = (data?.places || []).find((place) => place?.photos?.length) || data?.places?.[0];
  if (!matchingPlace?.photos?.[0]?.name) {
    return null;
  }

  const media = await getPhotoMedia(matchingPlace.photos[0].name, 1600, 900);
  return buildPhotoPayload(
    {
      ...matchingPlace.photos[0],
      photoUri: media?.photoUri || '',
    },
    `${matchingPlace.displayName?.text || destination} destination view`,
    'google_places_destination'
  );
};

export const searchPlacePhotoByText = async ({ placeName, destination }) => {
  const apiKey = getApiKey();
  if (!apiKey || !placeName) return null;

  const query = [placeName, destination].filter(Boolean).join(', ');
  const response = await fetch(`${GOOGLE_PLACES_BASE}/places:searchText`, {
    method: 'POST',
    headers: buildHeaders('places.id,places.displayName,places.photos'),
    body: JSON.stringify({
      textQuery: query,
      languageCode: 'en',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google place text-search photo failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const matchingPlace = (data?.places || []).find((place) => place?.photos?.length);
  if (!matchingPlace?.photos?.[0]?.name) {
    return null;
  }

  const media = await getPhotoMedia(matchingPlace.photos[0].name, 1200, 900);
  return {
    googlePlaceId: matchingPlace.id || '',
    image: buildPhotoPayload(
      {
        ...matchingPlace.photos[0],
        photoUri: media?.photoUri || '',
      },
      `${placeName} in ${destination}`
    ),
  };
};
