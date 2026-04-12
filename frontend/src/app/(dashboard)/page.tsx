'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { FolderKanban, ListTodo, Clock, CheckCircle2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { fetchProjects } from '@/store/slices/projectsSlice';
import { TaskStatus } from '@/types';

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-sm border border-[#dfe1e6] bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6b778c] sm:text-xs">{label}</p>
          <p className="mt-1 text-xl font-bold text-[#172b4d] sm:text-2xl">{value}</p>
        </div>
        <div className="rounded-md p-1.5 sm:p-2" style={{ backgroundColor: color + '18' }}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" style={{ color }} />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { items: projects, loading } = useAppSelector((state) => state.projects);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const allTasks = projects.flatMap((p) => p.tasks || []);
  const totalTasks = allTasks.length;
  const inProgressTasks = allTasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length;
  const completedTasks = allTasks.filter((t) => t.status === TaskStatus.COMPLETED).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#172b4d] sm:text-2xl">Dashboard</h1>
        <p className="text-sm text-[#6b778c]">Visão geral dos seus projetos e tarefas</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={FolderKanban} label="Projetos" value={projects.length} color="#0052cc" />
        <StatCard icon={ListTodo} label="Total Tarefas" value={totalTasks} color="#6554c0" />
        <StatCard icon={Clock} label="Em Progresso" value={inProgressTasks} color="#ff991f" />
        <StatCard icon={CheckCircle2} label="Concluídas" value={completedTasks} color="#00875a" />
      </div>

      <div className="rounded-sm border border-[#dfe1e6] bg-white">
        <div className="flex items-center justify-between border-b border-[#dfe1e6] px-4 py-3 sm:px-5">
          <h2 className="text-sm font-semibold text-[#172b4d] sm:text-base">Projetos Recentes</h2>
          <Link
            href="/projects"
            className="text-xs font-medium text-[#0052cc] hover:underline sm:text-sm"
          >
            Ver todos
          </Link>
        </div>
        <div className="p-0">
          {loading ? (
            <p className="p-5 text-sm text-[#6b778c]">Carregando...</p>
          ) : projects.length === 0 ? (
            <p className="p-5 text-sm text-[#6b778c]">
              Nenhum projeto ainda.{' '}
              <Link href="/projects" className="text-[#0052cc] hover:underline">
                Crie o primeiro
              </Link>
            </p>
          ) : (
            <div>
              {projects.slice(0, 5).map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="flex items-center justify-between border-b border-[#dfe1e6] px-4 py-3 last:border-b-0 hover:bg-[#f4f5f7] transition-colors sm:px-5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[#deebff] text-xs font-bold text-[#0052cc]">
                      {project.key || project.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#172b4d]">{project.name}</p>
                      {project.description && (
                        <p className="hidden text-xs text-[#6b778c] line-clamp-1 sm:block">{project.description}</p>
                      )}
                    </div>
                  </div>
                  <span className="ml-2 shrink-0 rounded-full bg-[#dfe1e6] px-2 py-0.5 text-xs font-medium text-[#172b4d]">
                    {project._count?.tasks ?? 0}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
