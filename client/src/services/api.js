import axios from 'axios';

const LOCAL_FRONTEND_ORIGIN = 'http://localhost:5173';
const LOCAL_API_BASE_URL = 'http://localhost:3000/api';
const PRODUCTION_API_BASE_URL = 'https://tripsyncfinal.onrender.com/api';

const getBaseURL = () => {
  if (typeof window === 'undefined') {
    return PRODUCTION_API_BASE_URL;
  }

  return window.location.origin === LOCAL_FRONTEND_ORIGIN
    ? LOCAL_API_BASE_URL
    : PRODUCTION_API_BASE_URL;
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
});

export const tripApi = {
  generate: async (payload) => (await api.post('/trips/generate', payload)).data,
  save: async (payload) => (await api.post('/trips', payload)).data,
  regenerateDay: async (payload) => (await api.post('/trips/regenerate-day', payload)).data,
  list: async (query = '') => (await api.get(`/trips${query ? `?q=${encodeURIComponent(query)}` : ''}`)).data,
  get: async (id) => (await api.get(`/trips/${id}`)).data,
  remove: async (id) => (await api.delete(`/trips/${id}`)).data,
};

export const placesApi = {
  autocomplete: async (query) => (await api.get(`/places/autocomplete?q=${encodeURIComponent(query)}`)).data,
  byCity: async (city) => (await api.get(`/places/${city}`)).data,
};

export default api;
