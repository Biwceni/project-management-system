import api from '@/services/api';
import { MemberRole } from '@/types';

export const projectService = {
  getAll() {
    return api.get('/projects');
  },
  getById(id: string) {
    return api.get(`/projects/${id}`);
  },
  create(data: { name: string; description?: string }) {
    return api.post('/projects', data);
  },
  update(id: string, data: { name?: string; description?: string }) {
    return api.put(`/projects/${id}`, data);
  },
  delete(id: string) {
    return api.delete(`/projects/${id}`);
  },
  getMembers(projectId: string) {
    return api.get(`/projects/${projectId}/members`);
  },
  addMember(projectId: string, email: string, role?: MemberRole) {
    return api.post(`/projects/${projectId}/members`, { email, role });
  },
  removeMember(projectId: string, memberId: string) {
    return api.delete(`/projects/${projectId}/members/${memberId}`);
  },
  getDocuments(projectId: string) {
    return api.get(`/projects/${projectId}/documents`);
  },
  uploadDocument(projectId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/projects/${projectId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteDocument(projectId: string, documentId: string) {
    return api.delete(`/projects/${projectId}/documents/${documentId}`);
  },
};
