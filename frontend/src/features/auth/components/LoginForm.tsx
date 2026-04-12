'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppDispatch } from '@/hooks/useAppStore';
import { setCredentials } from '@/store/slices/authSlice';
import { authService } from '../services/authService';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.login({ email, password });
      const { user, token } = response.data.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24}`;
      dispatch(setCredentials({ user, token }));

      toast.success('Login realizado com sucesso!');
      router.push('/');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-sm border border-[#dfe1e6] bg-white p-8 shadow-sm">
      <h2 className="mb-1 text-center text-lg font-semibold text-[#172b4d]">
        Faça login na sua conta
      </h2>
      <p className="mb-6 text-center text-sm text-[#6b778c]">
        Acesse seus projetos e tarefas
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-[#6b778c]">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border-[#dfe1e6] focus:border-[#4c9aff] focus:ring-[#4c9aff]"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-[#6b778c]">
            Senha
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border-[#dfe1e6] focus:border-[#4c9aff] focus:ring-[#4c9aff]"
          />
        </div>
        <Button
          type="submit"
          className="w-full bg-[#0052cc] text-white hover:bg-[#0747a6]"
          disabled={loading}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[#6b778c]">
        Não tem conta?{' '}
        <Link href="/register" className="font-medium text-[#0052cc] hover:underline">
          Cadastre-se
        </Link>
      </p>
    </div>
  );
}
