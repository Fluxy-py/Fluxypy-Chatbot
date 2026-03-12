'use client';

import { useState, useEffect } from 'react';
import { useThemeStore, getTokens } from '@/store/theme.store';
import { MessageSquare, Users, BookOpen, Zap, BarChart3 } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';

const demoData = [
  { day: 'Mon', conversations: 0 },
  { day: 'Tue', conversations: 0 },
  { day: 'Wed', conversations: 0 },
  { day: 'Thu', conversations: 0 },
  { day: 'Fri', conversations: 0 },
  { day: 'Sat', conversations: 0 },
  { day: 'Sun', conversations: 0 },
];

const timeRanges = ['Today', '7 Days', '30 Days', '90 Days'] as const;

export default function AnalyticsPage() {
  const { dark } = useThemeStore();
  const t = getTokens(dark);
  const [range, setRange] = useState<string>('7 Days');
  const [w, setW] = useState(1200);

  useEffect(() => {
    const u = () => setW(window.innerWidth);
    u();
    window.addEventListener('resize', u);
    return () => window.removeEventListener('resize', u);
  }, []);

  const isMobile = w < 640;
  const isSmall = w < 440;

  const stats = [
    { label: 'Total Conversations', value: '—', icon: MessageSquare, accent: '#6366f1', accentBg: 'rgba(99,102,241,0.1)' },
    { label: 'Unique Visitors', value: '—', icon: Users, accent: '#22c55e', accentBg: 'rgba(34,197,94,0.1)' },
    { label: 'Knowledge Sources', value: '—', icon: BookOpen, accent: '#8b5cf6', accentBg: 'rgba(139,92,246,0.1)' },
    { label: 'API Calls', value: '—', icon: Zap, accent: '#f59e0b', accentBg: 'rgba(245,158,11,0.1)' },
  ];

  const card: React.CSSProperties = {
    background: t.cardBg,
    border: `1px solid ${t.cardBd}`,
    borderRadius: isSmall ? 12 : 16,
    padding: isSmall ? '14px 14px' : '20px 24px',
    boxShadow: t.shadow,
    transition: 'all 0.2s',
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Header + Time Range */}
      <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', flexWrap: 'wrap', flexDirection: isMobile ? 'column' : 'row', gap: 12, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(20px, 2.5vw, 26px)', fontWeight: 800, letterSpacing: '-0.025em', color: t.text, marginBottom: 4 }}>
            Analytics
          </h1>
          <p style={{ fontSize: 14, color: t.textMuted }}>Track your chatbot performance</p>
        </div>
        <div className="hide-scrollbar" style={{ display: 'flex', background: t.inBg, borderRadius: 10, border: `1px solid ${t.inBd}`, padding: 3, overflowX: 'auto', maxWidth: '100%' }}>
          {timeRanges.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              style={{
                padding: isSmall ? '7px 10px' : '8px 14px', borderRadius: 8, border: 'none',
                fontSize: isSmall ? 12 : 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                fontFamily: "'DM Sans', sans-serif",
                transition: 'all 0.2s',
                background: range === r ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
                color: range === r ? 'white' : t.textMuted,
                boxShadow: range === r ? '0 2px 8px rgba(99,102,241,0.3)' : 'none',
              }}
            >{r}</button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${isSmall ? '140px' : '200px'}, 1fr))`, gap: isSmall ? 10 : 16, marginBottom: 24 }}>
        {stats.map((s) => (
          <div key={s.label} style={card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isSmall ? 8 : 12 }}>
              <div style={{ width: isSmall ? 32 : 38, height: isSmall ? 32 : 38, borderRadius: 10, background: s.accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={isSmall ? 15 : 18} color={s.accent} />
              </div>
            </div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: isSmall ? 22 : 28, fontWeight: 800, color: t.text, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: isSmall ? 11 : 13, color: t.textMuted, marginTop: 4 }}>{s.label}</div>
            <p style={{ fontSize: 11, color: t.textDim, marginTop: 4 }}>Coming in next phase</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ ...card, marginBottom: 24 }}>
        <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, color: t.text, marginBottom: 16 }}>
          Conversations Over Time
        </h3>
        <div style={{ width: '100%', height: isMobile ? 200 : 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={demoData}>
              <CartesianGrid stroke={t.divider} strokeDasharray="3 3" />
              <XAxis dataKey="day" stroke={t.textMuted} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke={t.textMuted} fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: dark ? 'rgba(20,20,20,0.95)' : 'rgba(255,255,255,0.95)',
                  border: `1px solid ${t.cardBd}`,
                  borderRadius: 10,
                  boxShadow: t.shadow,
                  color: t.text,
                  fontSize: 13,
                }}
              />
              <Line type="monotone" dataKey="conversations" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Questions */}
      <div style={card}>
        <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, color: t.text, marginBottom: 16 }}>
          Top Questions
        </h3>
        <div style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <BarChart3 size={24} color="#6366f1" />
          </div>
          <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 6 }}>
            Analytics Coming Soon
          </h3>
          <p style={{ fontSize: 14, color: t.textMuted, maxWidth: 320, margin: '0 auto' }}>
            Detailed analytics including conversation trends, popular questions, and lead tracking will be available in the next update.
          </p>
        </div>
      </div>
    </div>
  );
}