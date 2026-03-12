'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useThemeStore, getTokens } from '@/store/theme.store';
import { api } from '@/lib/api';
import { Copy, CheckCircle, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { DomainSettings } from '@/components/settings/DomainSettings';

export default function WidgetSettingsPage() {
  const { organization } = useAuthStore();
  const { dark } = useThemeStore();
  const t = getTokens(dark);
  const [copied, setCopied] = useState(false);
  const [w, setW] = useState(1200);

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

  const widgetScript = `<script src="https://fluxypy-chat-api.onrender.com/widget/chatbot.js" data-api-key="${organization?.apiKey}" async defer></script>`;

  const copyScript = () => {
    navigator.clipboard.writeText(widgetScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  const isDesktop = w >= 768;
  const isSmall = w < 440;

  const card: React.CSSProperties = {
    background: t.cardBg,
    border: `1px solid ${t.cardBd}`,
    borderRadius: isSmall ? 12 : 16,
    padding: isSmall ? '16px 14px' : '20px 24px',
    boxShadow: t.shadow,
    transition: 'all 0.2s',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 10,
    border: `1px solid ${t.inBd}`,
    background: t.inBg,
    color: t.text,
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    transition: 'all 0.2s',
    boxSizing: 'border-box',
  };

  const focusHandler = {
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.11)'; },
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.target.style.borderColor = t.inBd; e.target.style.boxShadow = 'none'; },
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(20px, 2.5vw, 26px)', fontWeight: 800, letterSpacing: '-0.025em', color: t.text, marginBottom: 4 }}>
          Widget Settings
        </h1>
        <p style={{ fontSize: 14, color: t.textMuted }}>Customize your chatbot widget and get the embed code</p>
      </div>

      <div style={{ display: isDesktop ? 'grid' : 'flex', gridTemplateColumns: isDesktop ? '1fr 1fr' : undefined, flexDirection: isDesktop ? undefined : 'column', gap: 20 }}>
        {/* Left — Customization */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={card}>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, color: t.text, marginBottom: 16 }}>
              Customization
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: t.textMuted, display: 'block', marginBottom: 6 }}>Bot Name</label>
                <input style={inputStyle} value={botName} onChange={(e) => setBotName(e.target.value)} {...focusHandler} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: t.textMuted, display: 'block', marginBottom: 6 }}>Welcome Message</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                  value={welcome}
                  onChange={(e) => setWelcome(e.target.value)}
                  onFocus={focusHandler.onFocus as any}
                  onBlur={focusHandler.onBlur as any}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: t.textMuted, display: 'block', marginBottom: 6 }}>Primary Color</label>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    style={{ width: 42, height: 42, borderRadius: 10, border: `1px solid ${t.inBd}`, background: t.inBg, cursor: 'pointer', padding: 2 }}
                  />
                  <input style={{ ...inputStyle, flex: 1 }} value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} {...focusHandler} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: t.textMuted, display: 'block', marginBottom: 6 }}>Show Branding</label>
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
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    position: 'absolute', top: 3,
                    left: showBranding ? 25 : 3,
                    transition: 'left 0.2s',
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
                fontFamily: "'DM Sans', sans-serif",
                transition: 'all 0.2s',
                boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
                width: '100%', marginTop: 18,
                opacity: saving ? 0.6 : 1,
              }}
              onMouseEnter={(e) => { if (!saving) { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = saving ? '0.6' : '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Right — Embed Code */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={card}>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, color: t.text, marginBottom: 12 }}>
              Embed Code
            </h3>
            <p style={{ fontSize: 13, color: t.textMuted, marginBottom: 12 }}>
              Copy and paste this into your website before &lt;/body&gt;
            </p>
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

          {/* Domain Whitelist */}
          <div style={card}>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, color: t.text, marginBottom: 4 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Globe size={18} color="#6366f1" />
                Domain Whitelist
              </span>
            </h3>
            <p style={{ fontSize: 13, color: t.textMuted, marginBottom: 16 }}>
              Control which domains can use your chatbot widget
            </p>
            <DomainSettings
              currentDomains={settings?.allowedDomains || []}
              onSaved={() => {}}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
