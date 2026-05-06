import axios from 'axios';

const defaultBaseURL = import.meta.env.PROD
  ? 'https://tripsyncfinal.onrender.com/api'
  : 'http://localhost:3000/api';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || defaultBaseURL,
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
