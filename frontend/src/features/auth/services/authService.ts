import api from '@/services/api';

export const authService = {
  register(data: { name: string; email: string; password: string }) {
    return api.post('/auth/register', data);
  },

  login(data: { email: string; password: string }) {
    return api.post('/auth/login', data);
  },
};
