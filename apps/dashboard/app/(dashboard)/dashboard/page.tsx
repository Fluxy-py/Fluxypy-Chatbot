'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { useThemeStore, getTokens } from '@/store/theme.store';
import {
  MessageSquare, Zap, Database, Clock, Upload,
  Copy, CheckCircle, BarChart3, ArrowUpRight,
} from 'lucide-react';

export default function DashboardPage() {
  const { organization, user } = useAuthStore();
  const { dark } = useThemeStore();
  const t = getTokens(dark);
  const [copied, setCopied] = useState(false);
  const [w, setW] = useState(1200);

  useEffect(() => {
    const u = () => setW(window.innerWidth);
    u();
    window.addEventListener('resize', u);
    return () => window.removeEventListener('resize', u);
  }, []);

  const isMobile = w < 768;
  const isSmall = w < 440;

  const widgetScript = `<script src="https://fluxypy-chat-api.onrender.com/widget/chatbot.js" data-api-key="${organization?.apiKey}" async defer></script>`;

  const copyScript = () => {
    navigator.clipboard.writeText(widgetScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const planName = organization?.plan?.name || 'Free';

  const stats = [
    { label: 'Total Conversations', value: '—', icon: MessageSquare, accent: '#6366f1', accentBg: 'rgba(99,102,241,0.1)' },
    { label: 'API Calls Today', value: '—', icon: Zap, accent: '#8b5cf6', accentBg: 'rgba(139,92,246,0.1)' },
    { label: 'Knowledge Base Size', value: '—', icon: Database, accent: '#f59e0b', accentBg: 'rgba(245,158,11,0.1)' },
    { label: 'Avg Response Time', value: '—', icon: Clock, accent: '#22c55e', accentBg: 'rgba(34,197,94,0.1)' },
  ];

  const cardStyle: React.CSSProperties = {
    background: t.cardBg,
    border: `1px solid ${t.cardBd}`,
    borderRadius: isSmall ? 12 : 16,
    padding: isSmall ? '14px 14px' : '20px 24px',
    boxShadow: t.shadow,
    transition: 'all 0.2s',
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(20px, 2.5vw, 26px)', fontWeight: 800, letterSpacing: '-0.025em', color: t.text, marginBottom: 4 }}>
          Welcome back! 👋
        </h1>
        <p style={{ fontSize: 14, color: t.textMuted }}>
          {organization?.name} — Fluxypy Bot Dashboard
        </p>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${isSmall ? '140px' : '200px'}, 1fr))`, gap: isSmall ? 10 : 16, marginBottom: 24 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ ...cardStyle, padding: isSmall ? '14px 14px' : '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isSmall ? 8 : 12 }}>
              <div style={{ width: isSmall ? 32 : 38, height: isSmall ? 32 : 38, borderRadius: 10, background: s.accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={isSmall ? 15 : 18} color={s.accent} />
              </div>
            </div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: isSmall ? 22 : 28, fontWeight: 800, color: t.text, lineHeight: 1 }}>
              {s.value}
            </div>
            <div style={{ fontSize: isSmall ? 11 : 13, color: t.textMuted, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
        <Link href="/dashboard/knowledge" style={{ textDecoration: 'none', flex: isMobile ? '1 1 100%' : undefined }}>
          <button
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white', border: 'none', borderRadius: 10,
              padding: '10px 20px', fontSize: 14, fontWeight: 700,
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              transition: 'all 0.2s', boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
              display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
              width: isMobile ? '100%' : undefined,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <Upload size={15} /> Upload Document
          </button>
        </Link>
        <button
          onClick={copyScript}
          style={{
            background: 'transparent',
            color: dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
            border: `1px solid ${t.cardBd}`,
            borderRadius: 10, padding: isSmall ? '10px 14px' : '10px 18px', fontSize: isSmall ? 13 : 14,
            fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8,
            minHeight: 44,
          }}
        >
          {copied ? <><CheckCircle size={15} color="#22c55e" /> Copied!</> : <><Copy size={15} /> Copy Widget Script</>}
        </button>
        <Link href="/dashboard/analytics" style={{ textDecoration: 'none' }}>
          <button
            style={{
              background: 'transparent',
              color: dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
              border: `1px solid ${t.cardBd}`,
              borderRadius: 10, padding: isSmall ? '10px 14px' : '10px 18px', fontSize: isSmall ? 13 : 14,
              fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8,
              minHeight: 44,
            }}
          >
            <BarChart3 size={15} /> View Analytics
          </button>
        </Link>
      </div>

      {/* Embed Script Card */}
      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, color: t.text, margin: 0 }}>
              Add Fluxypy to Your Website
            </h3>
            <p style={{ fontSize: 13, color: t.textMuted, marginTop: 2 }}>
              Paste this before the closing &lt;/body&gt; tag
            </p>
          </div>
        </div>
        <div className="code-block-scroll" style={{ position: 'relative' }}>
          <div style={{
            background: '#0a0a0a', borderRadius: 12, padding: isSmall ? 14 : 20,
            fontFamily: "'Fira Code', 'Courier New', monospace",
            fontSize: isSmall ? 11 : 13, color: '#a5b4fc', lineHeight: 1.6,
            wordBreak: 'break-all', overflowX: 'auto',
          }}>
            {widgetScript}
          </div>
          <button
            onClick={copyScript}
            style={{
              position: 'absolute', top: 10, right: 10,
              width: 34, height: 34, borderRadius: 8,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
              color: copied ? '#22c55e' : '#a5b4fc',
            }}
          >
            {copied ? <CheckCircle size={15} /> : <Copy size={15} />}
          </button>
        </div>
      </div>

      {/* Plan Usage Card */}
      <div style={{ ...cardStyle, background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, color: t.text, margin: 0 }}>
              Plan Usage
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100,
                background: 'rgba(99,102,241,0.1)', color: '#818cf8',
                border: '1px solid rgba(99,102,241,0.2)',
              }}>
                {planName}
              </span>
            </div>
          </div>
          {planName === 'Free' && (
            <Link href="/dashboard/billing" style={{ textDecoration: 'none' }}>
              <button
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: 'white', border: 'none', borderRadius: 10,
                  padding: '8px 16px', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                Upgrade Plan <ArrowUpRight size={14} />
              </button>
            </Link>
          )}
        </div>
        {[
          { label: 'API Calls', used: 0, limit: planName === 'Free' ? 50 : 400 },
          { label: 'Conversations', used: 0, limit: planName === 'Free' ? 15 : 70 },
          { label: 'Storage', used: 0, limit: planName === 'Free' ? 10 : 100 },
        ].map((bar) => (
          <div key={bar.label} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: t.textMuted, marginBottom: 4 }}>
              <span>{bar.label}</span>
              <span>{bar.used}/{bar.limit}</span>
            </div>
            <div style={{ background: t.divider, borderRadius: 100, height: 6, overflow: 'hidden' }}>
              <div style={{
                width: `${bar.limit > 0 ? Math.min((bar.used / bar.limit) * 100, 100) : 0}%`,
                height: '100%',
                borderRadius: 100,
                background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                transition: 'width 0.5s ease',
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}