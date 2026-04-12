'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { hydrateAuth } from '@/store/slices/authSlice';

export function Header() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    dispatch(hydrateAuth());
  }, [dispatch]);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  return (
    <header className="flex h-12 items-center justify-between border-b border-[#dfe1e6] bg-white px-6">
      <div />
      <div className="flex items-center gap-3">
        <span className="text-sm text-[#6b778c]">{user?.name}</span>
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0052cc] text-xs font-bold text-white">
          {initials}
        </div>
      </div>
    </header>
  );
}
