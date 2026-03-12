'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useThemeStore, getTokens } from '@/store/theme.store';
import { api } from '@/lib/api';
import { Bot, Key, Copy, CheckCircle, User, Sliders, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { DomainSettings } from '@/components/settings/DomainSettings';

const tabs = ['Profile', 'Organization', 'Widget'] as const;
type Tab = typeof tabs[number];

const tabIcons: Record<Tab, any> = {
  'Profile': User,
  'Organization': Bot,
  'Widget': Sliders,
};

export default function SettingsPage() {
  const { organization, user } = useAuthStore();
  const { dark } = useThemeStore();
  const t = getTokens(dark);
  const [activeTab, setActiveTab] = useState<Tab>('Profile');
  const [copied, setCopied] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [w, setW] = useState(1200);
  const [showFullKey, setShowFullKey] = useState(false);

  const settings = organization?.settings as any;
  const [botName, setBotName] = useState(settings?.botName || 'Fluxypy Bot');
  const [welcome, setWelcome] = useState(settings?.welcomeMessage || 'Hi! How can I help you?');
  const [primaryColor, setPrimaryColor] = useState(settings?.primaryColor || '#6366F1');
  const [showBranding, setShowBranding] = useState(settings?.showBranding !== false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const u = () => setW(window.innerWidth);
    u();
    window.addEventListener('resize', u);
    return () => window.removeEventListener('resize', u);
  }, []);

  const isMobile = w < 640;
  const isSmall = w < 440;
  const isDesktop = w >= 768;

  const widgetScript = `<script src="https://fluxypy-chat-api.onrender.com/widget/chatbot.js" data-api-key="${organization?.apiKey}" async defer></script>`;

  const copyApiKey = () => {
    navigator.clipboard.writeText(organization?.apiKey || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyScript = () => {
    navigator.clipboard.writeText(widgetScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await api.patch('/org/settings', { botName, welcomeMessage: welcome, primaryColor, showBranding });
      toast.success('Widget settings saved!');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
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
    border: `1px solid ${t.inBd}`, background: t.inBg, backgroundColor: t.inBg,
    color: t.text, WebkitTextFillColor: t.text, caretColor: t.text,
    fontSize: isSmall ? 13 : 14, fontFamily: "'DM Sans', sans-serif",
    outline: 'none', boxSizing: 'border-box', appearance: 'none',
  };
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 10,
    border: `1px solid ${t.inBd}`, background: t.inBg, backgroundColor: t.inBg,
    color: t.text, WebkitTextFillColor: t.text, caretColor: t.text,
    fontSize: 14, fontFamily: "'DM Sans', sans-serif",
    outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box', appearance: 'none',
  };
  const focusHandler = {
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.11)'; },
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.target.style.borderColor = t.inBd; e.target.style.boxShadow = 'none'; },
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

        </div>
      )}

      {/* Widget Tab */}
      {activeTab === 'Widget' && (
        <div style={{ display: isDesktop ? 'grid' : 'flex', gridTemplateColumns: isDesktop ? '1fr 1fr' : undefined, flexDirection: isDesktop ? undefined : 'column', gap: isMobile ? 14 : 20 }}>
          {/* Left — Customization */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 14 : 20 }}>
            <div style={card}>
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: isSmall ? 15 : 16, color: t.text, marginBottom: isSmall ? 12 : 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sliders size={isSmall ? 16 : 18} color="#6366f1" />
                Customization
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: isSmall ? 12 : 13, fontWeight: 500, color: t.textMuted, display: 'block', marginBottom: 6 }}>Bot Name</label>
                  <input style={inputStyle} value={botName} onChange={(e) => setBotName(e.target.value)} {...focusHandler} />
                </div>
                <div>
                  <label style={{ fontSize: isSmall ? 12 : 13, fontWeight: 500, color: t.textMuted, display: 'block', marginBottom: 6 }}>Welcome Message</label>
                  <textarea
                    style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                    value={welcome}
                    onChange={(e) => setWelcome(e.target.value)}
                    onFocus={focusHandler.onFocus as any}
                    onBlur={focusHandler.onBlur as any}
                  />
                </div>
                <div>
                  <label style={{ fontSize: isSmall ? 12 : 13, fontWeight: 500, color: t.textMuted, display: 'block', marginBottom: 6 }}>Primary Color</label>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      style={{ width: isSmall ? 36 : 42, height: isSmall ? 36 : 42, borderRadius: 10, border: `1px solid ${t.inBd}`, background: t.inBg, cursor: 'pointer', padding: 2, flexShrink: 0 }}
                    />
                    <input style={{ ...inputStyle, flex: 1 }} value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} {...focusHandler} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: isSmall ? 12 : 13, fontWeight: 500, color: t.textMuted, display: 'block', marginBottom: 6 }}>Show Branding</label>
                  <div style={{ padding: '11px 0' }}>
                    <button
                      onClick={() => setShowBranding(!showBranding)}
                      style={{
                        width: 48, height: 26, borderRadius: 100, border: 'none', cursor: 'pointer',
                        background: showBranding ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : (dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'),
                        position: 'relative', transition: 'background 0.2s',
                      }}
                    >
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%', background: 'white',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)', position: 'absolute', top: 3,
                        left: showBranding ? 25 : 3, transition: 'left 0.2s',
                      }} />
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={saveSettings}
                disabled={saving}
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: 'white', border: 'none', borderRadius: 10,
                  padding: '12px 20px', fontSize: 14, fontWeight: 700, minHeight: 44,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s',
                  boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
                  width: '100%', marginTop: 18, opacity: saving ? 0.6 : 1,
                }}
                onMouseEnter={(e) => { if (!saving) { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = saving ? '0.6' : '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Right — Embed Code + Domain Whitelist */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 14 : 20 }}>
            <div style={card}>
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: isSmall ? 15 : 16, color: t.text, marginBottom: 10 }}>Embed Code</h3>
              <p style={{ fontSize: isSmall ? 12 : 13, color: t.textMuted, marginBottom: 12 }}>
                Copy and paste this into your website before &lt;/body&gt;
              </p>
              <div className="code-block-scroll" style={{ position: 'relative' }}>
                <div style={{
                  background: '#0a0a0a', borderRadius: 12, padding: isSmall ? 12 : 18,
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
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s', color: copiedScript ? '#22c55e' : '#a5b4fc',
                  }}
                >
                  {copiedScript ? <CheckCircle size={15} /> : <Copy size={15} />}
                </button>
              </div>
            </div>

            <div style={card}>
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: isSmall ? 15 : 16, color: t.text, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Globe size={isSmall ? 16 : 18} color="#6366f1" />
                Domain Whitelist
              </h3>
              <p style={{ fontSize: isSmall ? 12 : 13, color: t.textMuted, marginBottom: 16 }}>
                Control which domains can use your chatbot widget
              </p>
              <DomainSettings
                currentDomains={settings?.allowedDomains || []}
                onSaved={() => {}}
              />
            </div>
          </div>
        </div>
      )}


    </div>
  );
}