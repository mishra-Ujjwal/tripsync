import api from './api';

export const authApi = {
  register: async (payload) => (await api.post('/auth/register', payload)).data,
  login: async (payload) => (await api.post('/auth/login', payload)).data,
  logout: async () => (await api.post('/auth/logout')).data,
  me: async () => (await api.get('/auth/me')).data,
};

export default authApi;


