'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useThemeStore, getTokens } from '@/store/theme.store';
import { Bot } from 'lucide-react';

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { setAuth, clearAuth } = useAuthStore();
  const { dark, hydrate, hydrated } = useThemeStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => { hydrate(); }, [hydrate]);

  useEffect(() => {
    const verifyAuth = async () => {
      const token = Cookies.get('accessToken');

      if (!token) {
        router.replace('/login');
        return;
      }

      try {
        const res = await api.get('/auth/me');
        const data = res.data;

        setAuth(
          { id: data.id, email: data.email, role: data.role },
          {
            id: data.org.id,
            name: data.org.name,
            slug: data.org.slug,
            apiKey: data.org.apiKey,
            status: data.org.status,
            subscriptionStatus: data.org.subscriptionStatus,
            plan: data.org.plan ?? null,
            settings: data.org.settings,
          },
          token,
        );

        setChecking(false);
      } catch {
        clearAuth();
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        router.replace('/login');
      }
    };

    verifyAuth();
  }, []);

  if (checking || !hydrated) {
    const t = getTokens(true);
    return (
      <div style={{
        minHeight: '100vh',
        background: '#080808',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 16,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 24px rgba(99,102,241,0.3)',
        }}>
          <Bot size={28} color="white" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 18, height: 18, border: '2px solid rgba(99,102,241,0.3)',
            borderTopColor: '#6366f1', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.4)', fontFamily: "'DM Sans', sans-serif" }}>
            Loading dashboard...
          </span>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return <>{children}</>;
}