'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useThemeStore, getTokens } from '@/store/theme.store';
import { Bot, Key, Copy, CheckCircle, User, Shield } from 'lucide-react';

const tabs = ['Profile', 'Organization', 'Security'] as const;
type Tab = typeof tabs[number];

const tabIcons: Record<Tab, any> = {
  'Profile': User,
  'Organization': Bot,
  'Security': Shield,
};

export default function SettingsPage() {
  const { organization, user } = useAuthStore();
  const { dark } = useThemeStore();
  const t = getTokens(dark);
  const [activeTab, setActiveTab] = useState<Tab>('Profile');
  const [copied, setCopied] = useState(false);
  const [w, setW] = useState(1200);
  const [showFullKey, setShowFullKey] = useState(false);

  useEffect(() => {
    const u = () => setW(window.innerWidth);
    u();
    window.addEventListener('resize', u);
    return () => window.removeEventListener('resize', u);
  }, []);

  const isMobile = w < 640;
  const isSmall = w < 440;

  const copyApiKey = () => {
    navigator.clipboard.writeText(organization?.apiKey || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const card: React.CSSProperties = {
    background: t.cardBg, border: `1px solid ${t.cardBd}`,
    borderRadius: isSmall ? 12 : 16, padding: isSmall ? '14px' : '24px', boxShadow: t.shadow,
  };
  const label: React.CSSProperties = {
    fontSize: isSmall ? 12 : 13, fontWeight: 600, color: t.textMuted, marginBottom: 6, display: 'block',
  };
  const input: React.CSSProperties = {
    width: '100%', padding: isSmall ? '9px 12px' : '10px 14px', borderRadius: 10,
    border: `1px solid ${t.inBd}`, background: t.inBg,
    color: t.text, fontSize: isSmall ? 13 : 14, fontFamily: "'DM Sans', sans-serif",
    outline: 'none', boxSizing: 'border-box',
  };

  const apiKey = organization?.apiKey || '';
  const displayKey = (!showFullKey && isSmall && apiKey.length > 20)
    ? `${apiKey.slice(0, 12)}...${apiKey.slice(-8)}`
    : apiKey;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: isSmall ? 16 : 24 }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(20px, 2.5vw, 26px)', fontWeight: 800, letterSpacing: '-0.025em', color: t.text, marginBottom: 4 }}>
          Settings
        </h1>
        <p style={{ fontSize: isSmall ? 13 : 14, color: t.textMuted }}>Manage your account and configuration</p>
      </div>

      {/* Tab Bar — pill-style on mobile for discoverability */}
      {isMobile ? (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {tabs.map((tab) => {
            const Icon = tabIcons[tab];
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '8px 14px', borderRadius: 10, flex: 1,
                  border: isActive
                    ? '1.5px solid rgba(99,102,241,0.4)'
                    : `1px solid ${t.cardBd}`,
                  background: isActive ? 'rgba(99,102,241,0.08)' : t.cardBg,
                  cursor: 'pointer', fontSize: 13, fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#6366f1' : t.textMuted,
                  transition: 'all 0.2s', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 6,
                  fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap', minHeight: 40,
                }}
              >
                <Icon size={14} />
                {tab}
              </button>
            );
          })}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${t.divider}`, marginBottom: 24 }}>
          {tabs.map((tab) => {
            const Icon = tabIcons[tab];
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '10px 18px', border: 'none', background: 'transparent',
                  cursor: 'pointer', fontSize: 14, fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#6366f1' : t.textMuted,
                  borderBottom: isActive ? '2px solid #6366f1' : '2px solid transparent',
                  transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6,
                  fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap',
                }}
              >
                <Icon size={15} />
                {tab}
              </button>
            );
          })}
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'Profile' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 14 : 20 }}>
          <div style={card}>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: isSmall ? 15 : 16, color: t.text, marginBottom: isSmall ? 12 : 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <User size={isSmall ? 16 : 18} color="#6366f1" />
              Account Information
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <span style={label}>Email</span>
                <input style={input} value={user?.email || ''} readOnly />
              </div>
              <div>
                <span style={label}>Role</span>
                <span style={{
                  display: 'inline-block', padding: '4px 12px', borderRadius: 8,
                  fontSize: 12, fontWeight: 600,
                  background: 'rgba(99,102,241,0.1)', color: '#6366f1',
                }}>{user?.role}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Organization Tab */}
      {activeTab === 'Organization' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 14 : 20 }}>
          <div style={card}>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: isSmall ? 15 : 16, color: t.text, marginBottom: isSmall ? 12 : 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Bot size={isSmall ? 16 : 18} color="#6366f1" />
              Organization Details
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <span style={label}>Company Name</span>
                <input style={input} value={organization?.name || ''} readOnly />
              </div>
              <div>
                <span style={label}>Slug</span>
                <input style={input} value={organization?.slug || ''} readOnly />
              </div>
              <div>
                <span style={label}>Status</span>
                <span style={{
                  display: 'inline-block', padding: '4px 12px', borderRadius: 8,
                  fontSize: 12, fontWeight: 600,
                  background: organization?.status === 'ACTIVE' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  color: organization?.status === 'ACTIVE' ? '#22c55e' : '#ef4444',
                }}>{organization?.status}</span>
              </div>
            </div>
          </div>

          {/* API Key */}
          <div style={card}>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: isSmall ? 15 : 16, color: t.text, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Key size={isSmall ? 16 : 18} color="#6366f1" />
              Widget API Key
            </h3>
            <p style={{ fontSize: isSmall ? 12 : 13, color: t.textMuted, marginBottom: 14 }}>Use this key in your website script tag</p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
              <div
                onClick={isSmall ? () => setShowFullKey(!showFullKey) : undefined}
                style={{
                  flex: 1, padding: isSmall ? '9px 12px' : '10px 14px', borderRadius: 10,
                  border: `1px solid ${t.inBd}`, background: t.inBg, color: t.text,
                  fontSize: isSmall ? 11 : 13, fontFamily: 'monospace',
                  overflow: 'hidden', textOverflow: 'ellipsis',
                  whiteSpace: showFullKey && isSmall ? 'normal' : 'nowrap',
                  wordBreak: showFullKey && isSmall ? 'break-all' : undefined,
                  display: 'flex', alignItems: 'center', minWidth: 0,
                  cursor: isSmall ? 'pointer' : 'default',
                }}>
                {displayKey}
              </div>
              <button
                onClick={copyApiKey}
                style={{
                  padding: '0 14px', borderRadius: 10, border: `1px solid ${t.inBd}`,
                  background: copied ? 'rgba(34,197,94,0.08)' : t.inBg, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, minWidth: 44, minHeight: 44, transition: 'all 0.2s',
                }}
              >
                {copied ? <CheckCircle size={16} color="#22c55e" /> : <Copy size={16} color={t.textMuted} />}
              </button>
            </div>
            <p style={{ fontSize: 11, color: t.textDim, marginTop: 8 }}>
              {isSmall ? '⚠️ Tap key to expand · Keep it safe' : '⚠️ Keep this key safe. It identifies your organization.'}
            </p>
          </div>

          {/* Bot Config */}
          <div style={card}>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: isSmall ? 15 : 16, color: t.text, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Bot size={isSmall ? 16 : 18} color="#8b5cf6" />
              Bot Configuration
            </h3>
            <p style={{ fontSize: isSmall ? 12 : 13, color: t.textMuted, marginBottom: 14 }}>Current settings (edit in Widget Settings)</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <span style={label}>Bot Name</span>
                <input style={input} value={(organization?.settings as any)?.botName || 'Fluxypy Bot'} readOnly />
              </div>
              <div>
                <span style={label}>Primary Color</span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ width: isSmall ? 36 : 42, height: isSmall ? 36 : 42, borderRadius: 10, border: `1px solid ${t.inBd}`, flexShrink: 0, background: (organization?.settings as any)?.primaryColor || '#6366F1' }} />
                  <input style={{ ...input, flex: 1 }} value={(organization?.settings as any)?.primaryColor || '#6366F1'} readOnly />
                </div>
              </div>
              <div>
                <span style={label}>Welcome Message</span>
                <input style={input} value={(organization?.settings as any)?.welcomeMessage || 'Hi! How can I help you?'} readOnly />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'Security' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 14 : 20 }}>
          <div style={card}>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: isSmall ? 15 : 16, color: t.text, marginBottom: isSmall ? 12 : 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Shield size={isSmall ? 16 : 18} color="#6366f1" />
              Security Settings
            </h3>
            <div style={{ textAlign: 'center', padding: isSmall ? '24px 12px' : isMobile ? '32px 16px' : '40px 24px' }}>
              <div style={{ width: isSmall ? 44 : 56, height: isSmall ? 44 : 56, borderRadius: isSmall ? 12 : 16, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <Shield size={isSmall ? 20 : 24} color="#6366f1" />
              </div>
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: isSmall ? 14 : 16, fontWeight: 700, color: t.text, marginBottom: 6 }}>
                Password & 2FA Coming Soon
              </h3>
              <p style={{ fontSize: isSmall ? 12 : 14, color: t.textMuted, maxWidth: 300, margin: '0 auto', lineHeight: 1.5 }}>
                Change password, enable two-factor authentication, and manage sessions.
              </p>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}