'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useThemeStore, getTokens } from '@/store/theme.store';
import { authApi } from '@/lib/api';
import {
  Bot, LayoutDashboard, BookOpen, MessageSquare,
  BarChart3, Settings, CreditCard, LogOut,
  Sun, Moon, Menu, X, Database, Palette,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/knowledge', icon: Database, label: 'Knowledge Base' },
  { href: '/dashboard/chat', icon: MessageSquare, label: 'Conversations' },
  { href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/dashboard/widget', icon: Palette, label: 'Widget Settings' },
  { href: '/dashboard/billing', icon: CreditCard, label: 'Billing' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

const mobileNavItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/dashboard/knowledge', icon: Database, label: 'Knowledge' },
  { href: '/dashboard/chat', icon: MessageSquare, label: 'Chat' },
  { href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

function planBadgeColor(plan?: string) {
  switch (plan?.toLowerCase()) {
    case 'pro': return { bg: 'rgba(99,102,241,0.1)', color: '#818cf8', bd: 'rgba(99,102,241,0.2)' };
    case 'business': return { bg: 'rgba(139,92,246,0.1)', color: '#a78bfa', bd: 'rgba(139,92,246,0.2)' };
    case 'starter': return { bg: 'rgba(34,197,94,0.1)', color: '#22c55e', bd: 'rgba(34,197,94,0.2)' };
    default: return { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', bd: 'rgba(255,255,255,0.1)' };
  }
}

export default function DashboardLayout({
  children,
  pageTitle,
}: {
  children: React.ReactNode;
  pageTitle?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { organization, user, clearAuth } = useAuthStore();
  const { dark, toggleTheme, hydrate, hydrated } = useThemeStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [w, setW] = useState(1200);

  useEffect(() => { hydrate(); }, [hydrate]);

  useEffect(() => {
    const update = () => setW(window.innerWidth);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  if (!hydrated) return null;

  const t = getTokens(dark);
  const isMobile = w < 768;
  const isSmallMobile = w < 440;
  const isTablet = w >= 768 && w < 1024;
  const sidebarW = isTablet ? 60 : 240;
  const planName = organization?.plan?.name || 'Free';
  const planColors = planBadgeColor(planName);

  const handleLogout = async () => {
    try { await authApi.logout(); } finally {
      clearAuth();
      router.push('/login');
    }
  };

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  const currentPageTitle =
    pageTitle ||
    navItems.find((n) => isActive(n.href))?.label ||
    'Dashboard';

  /* ── Sidebar Content ─────────────────────────── */
  const sidebarContent = (mobile?: boolean) => {
    const expanded = mobile || !isTablet;
    return (
      <div
        style={{
          width: mobile ? 260 : sidebarW,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: t.sidebarBg,
          borderRight: `1px solid ${t.divider}`,
          backdropFilter: dark ? 'none' : 'blur(20px)',
          WebkitBackdropFilter: dark ? 'none' : 'blur(20px)',
        }}
      >
        {/* Logo */}
        <div style={{ padding: expanded ? '20px 20px 16px' : '20px 10px 16px', borderBottom: `1px solid ${t.divider}`, display: 'flex', alignItems: 'center', gap: 10, justifyContent: expanded ? 'flex-start' : 'center' }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Bot size={18} color="white" />
          </div>
          {expanded && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15, color: t.text }}>Fluxypy</span>
                <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: planColors.bg, color: planColors.color, border: `1px solid ${planColors.bd}` }}>{planName}</span>
              </div>
              <p style={{ fontSize: 12, color: t.textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {organization?.name || 'Loading...'}
              </p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: expanded ? '12px 12px' : '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: expanded ? '9px 12px' : '9px 0',
                    justifyContent: expanded ? 'flex-start' : 'center',
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: active ? 600 : 500,
                    color: active ? '#818cf8' : t.textMuted,
                    background: active ? 'rgba(99,102,241,0.12)' : 'transparent',
                    border: active ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
                      e.currentTarget.style.color = t.text;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = t.textMuted;
                    }
                  }}
                >
                  <item.icon size={17} />
                  {expanded && <span>{item.label}</span>}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div style={{ padding: expanded ? '12px 16px 16px' : '12px 8px 16px', borderTop: `1px solid ${t.divider}` }}>
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              justifyContent: expanded ? 'flex-start' : 'center',
              padding: '8px 12px',
              borderRadius: 10,
              border: `1px solid ${t.cardBd}`,
              background: 'transparent',
              color: t.textMuted,
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginBottom: 10,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
            {expanded && <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>

          {/* User */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: expanded ? 'space-between' : 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'white' }}>
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              {expanded && (
                <span style={{ fontSize: 12, color: t.textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.email}
                </span>
              )}
            </div>
            <button
              onClick={handleLogout}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.textMuted, padding: 4, display: 'flex', transition: 'color 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = t.textMuted; }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: t.bg, color: t.text, transition: 'background 0.3s, color 0.3s' }}>
      {/* Desktop / Tablet Sidebar */}
      {!isMobile && (
        <div style={{ position: 'fixed', left: 0, top: 0, height: '100vh', zIndex: 40 }}>
          {sidebarContent()}
        </div>
      )}

      {/* Mobile Overlay */}
      {isMobile && mobileOpen && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
            onClick={() => setMobileOpen(false)}
          />
          <div style={{ position: 'fixed', left: 0, top: 0, height: '100vh', zIndex: 51, animation: 'fadeIn 0.15s ease both' }}>
            <button
              onClick={() => setMobileOpen(false)}
              style={{ position: 'absolute', top: 16, right: -44, width: 36, height: 36, borderRadius: 10, background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 52 }}
            ><X size={18} /></button>
            {sidebarContent(true)}
          </div>
        </>
      )}

      {/* Main */}
      <div style={{ flex: 1, marginLeft: isMobile ? 0 : sidebarW, display: 'flex', flexDirection: 'column', minHeight: '100vh', transition: 'margin-left 0.2s' }}>
        {/* Top Bar */}
        <div style={{
          height: isMobile ? 52 : 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isMobile ? '0 14px' : '0 24px',
          borderBottom: `1px solid ${t.divider}`,
          background: t.bg,
          position: 'sticky',
          top: 0,
          zIndex: 30,
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {isMobile && (
              <button
                onClick={() => setMobileOpen(true)}
                style={{ background: 'none', border: 'none', color: t.text, cursor: 'pointer', display: 'flex', padding: 8, margin: -4, borderRadius: 8 }}
              >
                <Menu size={22} />
              </button>
            )}
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: isMobile ? 16 : 18, fontWeight: 700, color: t.text, margin: 0 }}>
              {currentPageTitle}
            </h1>
          </div>
          {!isMobile && (
            <button
              onClick={toggleTheme}
              style={{
                width: 34, height: 34, borderRadius: 10,
                border: `1px solid ${t.cardBd}`,
                background: 'transparent',
                color: t.textMuted,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          )}
        </div>

        {/* Page Content */}
        <div style={{
          flex: 1,
          padding: isSmallMobile ? '16px 10px 88px' : isMobile ? '20px 16px 88px' : isTablet ? '24px 24px' : '28px 32px',
          overflow: 'auto',
          animation: 'fadeIn 0.3s ease both',
        }}>
          {children}
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      {isMobile && (
        <div className="mobile-safe-bottom" style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          background: dark ? 'rgba(8,8,8,0.97)' : 'rgba(255,255,255,0.97)',
          borderTop: `1px solid ${t.divider}`,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          zIndex: 40,
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}>
          {mobileNavItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: 'none', flex: 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, color: active ? '#818cf8' : t.textMuted, transition: 'color 0.2s', minHeight: 44, padding: '4px 0' }}>
                  <item.icon size={20} />
                  <span style={{ fontSize: 9, fontWeight: 500, maxWidth: '100%', textAlign: 'center', lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
