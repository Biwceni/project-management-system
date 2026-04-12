'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FolderKanban, LogOut, Plus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { logout } from '@/store/slices/authSlice';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/projects', label: 'Projetos', icon: FolderKanban },
];

export function Sidebar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = 'token=; path=/; max-age=0';
    dispatch(logout());
    window.location.href = '/login';
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  return (
    <aside className="flex h-full w-[240px] flex-col bg-[#0747a6] text-white">
      <div className="flex h-14 items-center gap-2 px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-white/20 text-sm font-bold">
          PM
        </div>
        <span className="text-sm font-semibold tracking-wide">Project Manager</span>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 pt-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-white/20 text-white'
                  : 'text-blue-200 hover:bg-white/10 hover:text-white',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}

        <Link
          href="/projects"
          className="flex items-center gap-3 rounded px-3 py-2 text-sm font-medium text-blue-200 hover:bg-white/10 hover:text-white"
        >
          <Plus className="h-4 w-4 shrink-0" />
          Criar Projeto
        </Link>
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 rounded px-3 py-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#00875a] text-xs font-bold">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium">{user?.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded p-1 text-blue-200 hover:bg-white/10 hover:text-white"
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
