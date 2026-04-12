import api from '@/services/api';

export const userService = {
  getProfile() {
    return api.get('/users/me');
  },
  updateProfile(data: { name?: string; password?: string }) {
    return api.put('/users/profile', data);
  },
  uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
