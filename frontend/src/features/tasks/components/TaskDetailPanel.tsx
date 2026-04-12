'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { X, Trash2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { taskService } from '../services/taskService';
import { Task, TaskStatus, TaskPriority, ProjectMember, Comment } from '@/types';

interface TaskDetailPanelProps {
  task: Task;
  projectId: string;
  members: ProjectMember[];
  onClose: () => void;
  onUpdated: () => void;
}

const STATUS_OPTIONS = [
  { value: TaskStatus.PENDING, label: 'A Fazer' },
  { value: TaskStatus.IN_PROGRESS, label: 'Em Progresso' },
  { value: TaskStatus.COMPLETED, label: 'Concluído' },
];

const PRIORITY_OPTIONS = [
  { value: TaskPriority.LOW, label: 'Baixa' },
  { value: TaskPriority.MEDIUM, label: 'Média' },
  { value: TaskPriority.HIGH, label: 'Alta' },
  { value: TaskPriority.URGENT, label: 'Urgente' },
];

export function TaskDetailPanel({
  task,
  projectId,
  members,
  onClose,
  onUpdated,
}: TaskDetailPanelProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [status, setStatus] = useState(task.status);
  const [priority, setPriority] = useState(task.priority || TaskPriority.MEDIUM);
  const [assigneeId, setAssigneeId] = useState(task.assigneeId || '');
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadComments();
  }, [task.id]);

  const loadComments = async () => {
    try {
      const res = await taskService.getComments(task.id);
      setComments(res.data.data || []);
    } catch {
      /* ignore */
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await taskService.update(task.id, {
        title,
        description: description || undefined,
        status,
        priority,
        assigneeId: assigneeId || null,
      });
      toast.success('Tarefa atualizada');
      onUpdated();
    } catch {
      toast.error('Erro ao atualizar tarefa');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Excluir esta tarefa?')) return;
    try {
      await taskService.delete(task.id);
      toast.success('Tarefa excluída');
      onUpdated();
    } catch {
      toast.error('Erro ao excluir tarefa');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      await taskService.addComment(task.id, newComment);
      setNewComment('');
      loadComments();
    } catch {
      toast.error('Erro ao adicionar comentário');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await taskService.deleteComment(task.id, commentId);
      loadComments();
    } catch {
      toast.error('Erro ao excluir comentário');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-lg flex-col bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#dfe1e6] px-5 py-3">
          <h2 className="text-base font-semibold text-[#172b4d]">Detalhes da Tarefa</h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-[#6b778c] hover:bg-[#f4f5f7]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="space-y-2">
            <Label>Título</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Adicionar descrição..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="h-9 w-full rounded-sm border border-[#dfe1e6] bg-white px-3 text-sm text-[#172b4d] focus:border-[#4c9aff] focus:outline-none focus:ring-1 focus:ring-[#4c9aff]"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="h-9 w-full rounded-sm border border-[#dfe1e6] bg-white px-3 text-sm text-[#172b4d] focus:border-[#4c9aff] focus:outline-none focus:ring-1 focus:ring-[#4c9aff]"
              >
                {PRIORITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Responsável</Label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="h-9 w-full rounded-sm border border-[#dfe1e6] bg-white px-3 text-sm text-[#172b4d] focus:border-[#4c9aff] focus:outline-none focus:ring-1 focus:ring-[#4c9aff]"
            >
              <option value="">Não atribuído</option>
              {members.map((m) => (
                <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
            <Button variant="destructive" size="icon" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Comments */}
          <div className="border-t border-[#dfe1e6] pt-4">
            <h3 className="mb-3 text-sm font-semibold text-[#172b4d]">
              Comentários ({comments.length})
            </h3>

            <div className="space-y-3">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-sm border border-[#dfe1e6] bg-[#f4f5f7] p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0052cc] text-[10px] font-bold text-white">
                        {comment.user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <span className="text-xs font-medium text-[#172b4d]">
                        {comment.user.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-[#6b778c]">
                        {new Date(comment.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="rounded p-0.5 text-[#6b778c] hover:text-[#de350b]"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-[#172b4d]">{comment.content}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 flex gap-2">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Adicionar comentário..."
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
              />
              <Button size="icon" onClick={handleAddComment}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
