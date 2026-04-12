import api from '@/services/api';
import { TaskStatus, TaskPriority } from '@/types';

export const taskService = {
  getAll(projectId: string, status?: TaskStatus) {
    const params: Record<string, string> = { projectId };
    if (status) params.status = status;
    return api.get('/tasks', { params });
  },
  create(data: {
    title: string;
    description?: string;
    projectId: string;
    assigneeId?: string;
    priority?: TaskPriority;
  }) {
    return api.post('/tasks', data);
  },
  update(
    id: string,
    data: {
      title?: string;
      description?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      assigneeId?: string | null;
    },
  ) {
    return api.put(`/tasks/${id}`, data);
  },
  delete(id: string) {
    return api.delete(`/tasks/${id}`);
  },
  getComments(taskId: string) {
    return api.get(`/tasks/${taskId}/comments`);
  },
  addComment(taskId: string, content: string) {
    return api.post(`/tasks/${taskId}/comments`, { content });
  },
  deleteComment(taskId: string, commentId: string) {
    return api.delete(`/tasks/${taskId}/comments/${commentId}`);
  },
  getAttachments(taskId: string) {
    return api.get(`/tasks/${taskId}/attachments`);
  },
  uploadAttachment(taskId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/tasks/${taskId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteAttachment(taskId: string, attachmentId: string) {
    return api.delete(`/tasks/${taskId}/attachments/${attachmentId}`);
  },
};
