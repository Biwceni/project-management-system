'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Users } from 'lucide-react';
import { CreateProjectDialog } from '@/features/projects/components/CreateProjectDialog';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { fetchProjects } from '@/store/slices/projectsSlice';

export default function ProjectsPage() {
  const dispatch = useAppDispatch();
  const { items: projects, loading } = useAppSelector((state) => state.projects);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#172b4d] sm:text-2xl">Projetos</h1>
          <p className="text-sm text-[#6b778c]">Gerencie todos os seus projetos</p>
        </div>
        <CreateProjectDialog />
      </div>

      {loading ? (
        <p className="text-sm text-[#6b778c]">Carregando...</p>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-sm border border-dashed border-[#dfe1e6] bg-white py-12 sm:py-16">
          <p className="mb-4 text-sm text-[#6b778c]">Nenhum projeto encontrado</p>
          <CreateProjectDialog />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="group rounded-sm border border-[#dfe1e6] bg-white p-4 transition-shadow hover:shadow-md sm:p-5"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-[#deebff] text-sm font-bold text-[#0052cc]">
                  {project.key || project.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-[#172b4d] group-hover:text-[#0052cc]">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-[#6b778c]">
                      {project.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4 flex items-center gap-4 text-xs text-[#6b778c]">
                <span>{project._count?.tasks ?? 0} tarefas</span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {(project._count?.members ?? 0) + 1}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
