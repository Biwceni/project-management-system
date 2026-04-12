'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { hydrateAuth } from '@/store/slices/authSlice';
import { userService } from '@/features/auth/services/userService';

export default function AccountPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await userService.getProfile();
      const profile = res.data.data;
      setName(profile.name);
      setAvatarUrl(profile.avatarUrl);
    } catch {
      /* ignore */
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }
    setSaving(true);
    try {
      const data: { name?: string; password?: string } = {};
      if (name) data.name = name;
      if (password) data.password = password;

      const res = await userService.updateProfile(data);
      const updated = res.data.data;

      localStorage.setItem('user', JSON.stringify(updated));
      dispatch(hydrateAuth());
      setPassword('');
      setConfirmPassword('');
      toast.success('Perfil atualizado!');
    } catch {
      toast.error('Erro ao atualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const res = await userService.uploadAvatar(file);
      const updated = res.data.data;
      setAvatarUrl(updated.avatarUrl);

      localStorage.setItem('user', JSON.stringify(updated));
      dispatch(hydrateAuth());
      toast.success('Avatar atualizado!');
    } catch {
      toast.error('Erro ao atualizar avatar');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#172b4d] sm:text-2xl">Minha Conta</h1>
        <p className="text-sm text-[#6b778c]">Gerencie suas informações pessoais</p>
      </div>

      <div className="max-w-lg space-y-6">
        {/* Avatar */}
        <div className="rounded-sm border border-[#dfe1e6] bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-[#172b4d]">Foto de Perfil</h3>
          <div className="flex items-center gap-4">
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0052cc] text-lg font-bold text-white">
                  {initials}
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#0052cc] text-white hover:bg-[#0747a6]"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>
            <div>
              <p className="text-sm font-medium text-[#172b4d]">{user?.name}</p>
              <p className="text-xs text-[#6b778c]">{user?.email}</p>
              <p className="mt-1 text-xs text-[#6b778c]">
                PNG ou WebP. Máximo 2MB.
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/webp"
            onChange={handleAvatarUpload}
            className="hidden"
          />
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSave} className="rounded-sm border border-[#dfe1e6] bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-[#172b4d]">Informações Pessoais</h3>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-[#6b778c]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-[#f4f5f7] text-[#6b778c]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-[#6b778c]">
                Nome
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-[#dfe1e6]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-[#6b778c]">
                Nova Senha
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Deixe em branco para manter"
                minLength={6}
                className="border-[#dfe1e6]"
              />
            </div>
            {password && (
              <div className="space-y-1.5">
                <Label htmlFor="confirm-password" className="text-xs font-semibold uppercase tracking-wider text-[#6b778c]">
                  Confirmar Senha
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  minLength={6}
                  className="border-[#dfe1e6]"
                />
              </div>
            )}
            <Button
              type="submit"
              disabled={saving}
              className="w-full bg-[#0052cc] text-white hover:bg-[#0747a6] sm:w-auto"
            >
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
