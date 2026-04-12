'use client';

import { useEffect } from 'react';
import { Menu } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { hydrateAuth } from '@/store/slices/authSlice';

interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    dispatch(hydrateAuth());
  }, [dispatch]);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  return (
    <header className="flex h-12 items-center justify-between border-b border-[#dfe1e6] bg-white px-4 md:px-6">
      <button
        onClick={onMenuToggle}
        className="rounded p-1.5 text-[#6b778c] hover:bg-[#f4f5f7] md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="hidden md:block" />
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-[#6b778c] sm:inline">{user?.name}</span>
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt="Avatar"
            className="h-7 w-7 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0052cc] text-xs font-bold text-white">
            {initials}
          </div>
        )}
      </div>
    </header>
  );
}
