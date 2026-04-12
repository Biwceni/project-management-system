'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { UserPlus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { projectService } from '../services/projectService';
import { ProjectMember } from '@/types';
import { useAppSelector } from '@/hooks/useAppStore';

interface MembersPanelProps {
  projectId: string;
  members: ProjectMember[];
  ownerId: string;
  onUpdated: () => void;
}

export function MembersPanel({ projectId, members, ownerId, onUpdated }: MembersPanelProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const currentUser = useAppSelector((state) => state.auth.user);

  const isOwner = currentUser?.id === ownerId;

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await projectService.addMember(projectId, email);
      toast.success('Membro adicionado!');
      setEmail('');
      onUpdated();
    } catch {
      toast.error('Erro ao adicionar membro');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm('Remover este membro?')) return;
    try {
      await projectService.removeMember(projectId, memberId);
      toast.success('Membro removido');
      onUpdated();
    } catch {
      toast.error('Erro ao remover membro');
    }
  };

  return (
    <div className="space-y-4">
      {isOwner && (
        <form onSubmit={handleAddMember} className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email do membro"
            type="email"
            className="flex-1"
          />
          <Button type="submit" disabled={loading} size="sm" className="w-full sm:w-auto">
            <UserPlus className="mr-1 h-4 w-4" />
            {loading ? 'Adicionando...' : 'Adicionar'}
          </Button>
        </form>
      )}

      <div className="rounded-sm border border-[#dfe1e6] bg-white">
        {members.length === 0 ? (
          <p className="p-5 text-center text-sm text-[#6b778c]">
            Nenhum membro adicionado
          </p>
        ) : (
          members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between border-b border-[#dfe1e6] px-3 py-3 last:border-b-0 sm:px-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0052cc] text-xs font-bold text-white">
                  {member.user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#172b4d]">{member.user.name}</p>
                  <p className="truncate text-xs text-[#6b778c]">{member.user.email}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2 ml-2">
                <span className="hidden rounded bg-[#f4f5f7] px-2 py-0.5 text-xs font-medium text-[#6b778c] sm:inline">
                  {member.role}
                </span>
                {isOwner && (
                  <button
                    onClick={() => handleRemove(member.user.id)}
                    className="rounded p-1 text-[#6b778c] hover:text-[#de350b]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
