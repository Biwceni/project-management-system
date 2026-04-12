'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from './StatusBadge';
import { taskService } from '../services/taskService';
import { useAppDispatch } from '@/hooks/useAppStore';
import { fetchProject } from '@/store/slices/projectsSlice';
import type { Task } from '@/types';
import { TaskStatus } from '@/types';

interface TaskListProps {
  projectId: string;
  tasks: Task[];
}

export function TaskList({ projectId, tasks }: TaskListProps) {
  const [filter, setFilter] = useState<string>('ALL');
  const dispatch = useAppDispatch();

  const filteredTasks =
    filter === 'ALL'
      ? tasks
      : tasks.filter((t) => t.status === filter);

  const handleFilterChange = (value: string | null) => {
    if (value) setFilter(value);
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      await taskService.update(taskId, { status });
      toast.success('Status atualizado');
      dispatch(fetchProject(projectId));
    } catch {
      toast.error('Erro ao atualizar status');
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;

    try {
      await taskService.delete(taskId);
      toast.success('Tarefa excluída');
      dispatch(fetchProject(projectId));
    } catch {
      toast.error('Erro ao excluir tarefa');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Filtrar:</span>
        <Select value={filter} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas</SelectItem>
            <SelectItem value={TaskStatus.PENDING}>Pendente</SelectItem>
            <SelectItem value={TaskStatus.IN_PROGRESS}>Em Progresso</SelectItem>
            <SelectItem value={TaskStatus.COMPLETED}>Concluída</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredTasks.length === 0 ? (
        <p className="text-muted-foreground py-4">
          Nenhuma tarefa encontrada.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="w-24">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">{task.title}</TableCell>
                <TableCell className="max-w-xs truncate text-muted-foreground">
                  {task.description || '—'}
                </TableCell>
                <TableCell>
                  <Select
                    value={task.status}
                    onValueChange={(value) => {
                      if (value) handleStatusChange(task.id, value as TaskStatus);
                    }}
                  >
                    <SelectTrigger className="w-40">
                      <StatusBadge status={task.status} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TaskStatus.PENDING}>Pendente</SelectItem>
                      <SelectItem value={TaskStatus.IN_PROGRESS}>Em Progresso</SelectItem>
                      <SelectItem value={TaskStatus.COMPLETED}>Concluída</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(task.createdAt).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(task.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
