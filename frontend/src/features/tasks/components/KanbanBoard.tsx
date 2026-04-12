'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { Plus, MessageSquare, User as UserIcon } from 'lucide-react';
import { Task, TaskStatus, TaskPriority } from '@/types';
import { taskService } from '../services/taskService';

const COLUMNS: { status: TaskStatus; label: string; color: string; bg: string }[] = [
  { status: TaskStatus.PENDING, label: 'A FAZER', color: '#6b778c', bg: '#f4f5f7' },
  { status: TaskStatus.IN_PROGRESS, label: 'EM PROGRESSO', color: '#0052cc', bg: '#deebff' },
  { status: TaskStatus.COMPLETED, label: 'CONCLUÍDO', color: '#00875a', bg: '#e3fcef' },
];

const PRIORITY_COLORS: Record<TaskPriority, { bg: string; text: string; label: string }> = {
  [TaskPriority.URGENT]: { bg: '#ffebe6', text: '#de350b', label: 'Urgente' },
  [TaskPriority.HIGH]: { bg: '#ffebe6', text: '#de350b', label: 'Alta' },
  [TaskPriority.MEDIUM]: { bg: '#fffae6', text: '#ff991f', label: 'Média' },
  [TaskPriority.LOW]: { bg: '#e3fcef', text: '#00875a', label: 'Baixa' },
};

interface KanbanBoardProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskUpdated: () => void;
}

export function KanbanBoard({ tasks, onTaskClick, onTaskUpdated }: KanbanBoardProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggingId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = useCallback(async (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    setDraggingId(null);

    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === targetStatus) return;

    try {
      await taskService.update(taskId, { status: targetStatus });
      onTaskUpdated();
    } catch {
      toast.error('Erro ao mover tarefa');
    }
  }, [tasks, onTaskUpdated]);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.status);

        return (
          <div
            key={col.status}
            className="w-[280px] min-w-[280px] flex-shrink-0 rounded-sm"
            style={{ backgroundColor: col.bg }}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.status)}
          >
            <div className="flex items-center gap-2 px-3 py-2.5">
              <span
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: col.color }}
              >
                {col.label}
              </span>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#dfe1e6] text-xs font-bold text-[#6b778c]">
                {columnTasks.length}
              </span>
            </div>

            <div className="space-y-2 px-2 pb-2">
              {columnTasks.map((task) => {
                const priority = task.priority
                  ? PRIORITY_COLORS[task.priority as TaskPriority]
                  : null;

                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onClick={() => onTaskClick(task)}
                    className={`cursor-pointer rounded-sm border border-[#dfe1e6] bg-white p-3 shadow-sm transition-shadow hover:shadow-md ${
                      draggingId === task.id ? 'opacity-50' : ''
                    }`}
                  >
                    <p className="text-sm font-medium text-[#172b4d]">{task.title}</p>
                    {task.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-[#6b778c]">
                        {task.description}
                      </p>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {priority && (
                          <span
                            className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase"
                            style={{ backgroundColor: priority.bg, color: priority.text }}
                          >
                            {priority.label}
                          </span>
                        )}
                        {(task._count?.comments ?? 0) > 0 && (
                          <span className="flex items-center gap-0.5 text-xs text-[#6b778c]">
                            <MessageSquare className="h-3 w-3" />
                            {task._count?.comments}
                          </span>
                        )}
                      </div>
                      {task.assignee ? (
                        <div
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0052cc] text-[10px] font-bold text-white"
                          title={task.assignee.name}
                        >
                          {task.assignee.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-[#dfe1e6]">
                          <UserIcon className="h-3 w-3 text-[#c1c7d0]" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
