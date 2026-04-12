'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';
import { login } from '@/lib/kestopur/auth';
import { useToast } from '@/providers/toast-context';
import { KpField, KpBtn } from '@/components/kestopur/ui';
import { useAppStore } from '@/stores/app-store';
import { assignRole } from '@/lib/roles';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const { dispatch } = useAppStore();

  const redirectPath = searchParams.get('redirect') || '/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success && res.user) {
        const userInfo = {
          ...res.user,
          role: assignRole(res.user.email)
        };
        
        dispatch({ type: 'SET_USER', payload: userInfo });
        dispatch({ type: 'SET_AUTHENTICATED', payload: true });
        
        showToast(`Welcome back, ${userInfo.name}!`, 'success');
        router.push(redirectPath);
      } else {
        showToast(res.error || 'Invalid credentials. Please try again.', 'error');
      }
    } catch (err) {
      showToast('A network error occurred during login.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[var(--neon-green)]/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/2 -right-24 w-[30rem] h-[30rem] bg-blue-500/10 rounded-full blur-[160px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
        <div className="absolute inset-0 bg-grid-white/[0.02] [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" />
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 theme-neon-bg rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(var(--neon-green-rgb),0.3)] mb-6">
            <ShieldCheck className="w-10 h-10 theme-text-on-neon" />
          </div>
          <h1 className="theme-text text-3xl font-black tracking-tight">Backend Access</h1>
          <p className="theme-text-muted text-sm font-medium">Log in to your Kestopur management account</p>
        </div>

        <div className="theme-panel theme-border-header rounded-3xl border p-8 shadow-2xl backdrop-blur-xl bg-white/[0.02]">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <KpField
                label="Email Address / Username"
                type="text"
                placeholder="name@store.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
              <KpField
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-black/20 accent-[var(--neon-green)]" />
                <span className="theme-text-muted group-hover:theme-text transition-colors">Remember me</span>
              </label>
              <a href="#" className="theme-text-link hover:underline transition-all">Forgot?</a>
            </div>

            <KpBtn 
              loading={loading} 
              className="w-full justify-center h-12 text-base shadow-[0_4px_20px_rgba(var(--neon-green-rgb),0.2)]"
            >
              Sign In to weboffice
              <ArrowRight className="w-4 h-4 ml-1" />
            </KpBtn>
          </form>
        </div>

        <div className="text-center">
          <p className="theme-text-muted text-xs font-semibold opacity-40 uppercase tracking-[0.2em]">
            Enterprise Grade Security Enforcement
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center theme-text">Loading access portal...</div>}>
      <LoginForm />
    </Suspense>
  );
}
