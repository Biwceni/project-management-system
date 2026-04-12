'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Settings, Trash2, ArrowLeft, Users, LayoutGrid, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { fetchProject } from '@/store/slices/projectsSlice';
import { KanbanBoard } from '@/features/tasks/components/KanbanBoard';
import { CreateTaskDialog } from '@/features/tasks/components/CreateTaskDialog';
import { TaskDetailPanel } from '@/features/tasks/components/TaskDetailPanel';
import { MembersPanel } from '@/features/projects/components/MembersPanel';
import { AttachmentsPanel } from '@/features/projects/components/AttachmentsPanel';
import { projectService } from '@/features/projects/services/projectService';
import { Task } from '@/types';

type Tab = 'board' | 'members' | 'attachments' | 'settings';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { current: project, loading } = useAppSelector((state) => state.projects);

  const [tab, setTab] = useState<Tab>('board');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const refreshProject = useCallback(() => {
    dispatch(fetchProject(id));
  }, [dispatch, id]);

  useEffect(() => {
    refreshProject();
  }, [refreshProject]);

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este projeto?')) return;
    try {
      await projectService.delete(id);
      toast.success('Projeto excluído');
      router.push('/projects');
    } catch {
      toast.error('Erro ao excluir projeto');
    }
  };

  const handleEditSave = async () => {
    try {
      await projectService.update(id, { name: editName, description: editDesc });
      toast.success('Projeto atualizado');
      setEditOpen(false);
      refreshProject();
    } catch {
      toast.error('Erro ao atualizar projeto');
    }
  };

  const openEditDialog = () => {
    if (project) {
      setEditName(project.name);
      setEditDesc(project.description || '');
      setEditOpen(true);
    }
  };

  if (loading || !project) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-[#6b778c]">
        Carregando...
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'board', label: 'Board', icon: LayoutGrid },
    { key: 'members', label: 'Membros', icon: Users },
    { key: 'attachments', label: 'Arquivos', icon: Paperclip },
    { key: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4">
        <button
          onClick={() => router.push('/projects')}
          className="rounded p-1 text-[#6b778c] hover:bg-[#f4f5f7] hover:text-[#172b4d]"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex h-8 w-8 items-center justify-center rounded bg-[#deebff] text-xs font-bold text-[#0052cc]">
          {project.key || project.name.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h1 className="text-lg font-bold text-[#172b4d]">{project.name}</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0 border-b border-[#dfe1e6]">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                tab === t.key
                  ? 'border-[#0052cc] text-[#0052cc]'
                  : 'border-transparent text-[#6b778c] hover:text-[#172b4d]'
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="pt-4">
        {tab === 'board' && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-[#6b778c]">
                {project.tasks?.length ?? 0} tarefa(s)
              </p>
              <CreateTaskDialog
                projectId={id}
                members={project.members}
                onCreated={refreshProject}
              />
            </div>
            <KanbanBoard
              tasks={project.tasks || []}
              onTaskClick={(task) => setSelectedTask(task)}
              onTaskUpdated={refreshProject}
            />
          </div>
        )}

        {tab === 'members' && (
          <MembersPanel
            projectId={id}
            members={project.members || []}
            ownerId={project.ownerId}
            onUpdated={refreshProject}
          />
        )}

        {tab === 'attachments' && (
          <AttachmentsPanel projectId={id} />
        )}

        {tab === 'settings' && (
          <div className="max-w-lg space-y-6">
            <div className="rounded-sm border border-[#dfe1e6] bg-white p-5">
              <h3 className="text-base font-semibold text-[#172b4d]">Informações do Projeto</h3>
              <p className="mt-1 text-sm text-[#6b778c]">{project.description || 'Sem descrição'}</p>
              <p className="mt-2 text-xs text-[#6b778c]">
                Chave: <span className="font-semibold text-[#172b4d]">{project.key}</span>
              </p>
              <p className="text-xs text-[#6b778c]">
                Dono: <span className="font-semibold text-[#172b4d]">{project.owner?.name}</span>
              </p>
              <div className="mt-4 flex gap-2">
                <Button size="sm" onClick={openEditDialog}>
                  Editar
                </Button>
                <Button size="sm" variant="destructive" onClick={handleDelete}>
                  <Trash2 className="mr-1 h-4 w-4" />
                  Excluir
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Task Detail Panel */}
      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          projectId={id}
          members={project.members || []}
          onClose={() => setSelectedTask(null)}
          onUpdated={() => {
            refreshProject();
            setSelectedTask(null);
          }}
        />
      )}

      {/* Edit Project Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Projeto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={3} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
              <Button onClick={handleEditSave}>Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
