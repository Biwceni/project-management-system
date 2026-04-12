'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { taskService } from '../services/taskService';
import { ProjectMember, TaskPriority } from '@/types';

interface CreateTaskDialogProps {
  projectId: string;
  members?: ProjectMember[];
  onCreated: () => void;
}

export function CreateTaskDialog({ projectId, members, onCreated }: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [assigneeId, setAssigneeId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await taskService.create({
        title,
        description: description || undefined,
        projectId,
        priority,
        assigneeId: assigneeId || undefined,
      });
      toast.success('Tarefa criada com sucesso!');
      setTitle('');
      setDescription('');
      setPriority(TaskPriority.MEDIUM);
      setAssigneeId('');
      setOpen(false);
      onCreated();
    } catch {
      toast.error('Erro ao criar tarefa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <Plus className="mr-1 h-4 w-4" />
        Criar Tarefa
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Tarefa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Título</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título da tarefa"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-description">Descrição</Label>
            <Textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição (opcional)"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="task-priority">Prioridade</Label>
              <select
                id="task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="h-9 w-full rounded-sm border border-[#dfe1e6] bg-white px-3 text-sm text-[#172b4d] focus:border-[#4c9aff] focus:outline-none focus:ring-1 focus:ring-[#4c9aff]"
              >
                <option value={TaskPriority.LOW}>Baixa</option>
                <option value={TaskPriority.MEDIUM}>Média</option>
                <option value={TaskPriority.HIGH}>Alta</option>
                <option value={TaskPriority.URGENT}>Urgente</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-assignee">Responsável</Label>
              <select
                id="task-assignee"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="h-9 w-full rounded-sm border border-[#dfe1e6] bg-white px-3 text-sm text-[#172b4d] focus:border-[#4c9aff] focus:outline-none focus:ring-1 focus:ring-[#4c9aff]"
              >
                <option value="">Não atribuído</option>
                {members?.map((m) => (
                  <option key={m.user.id} value={m.user.id}>
                    {m.user.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Criando...' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
