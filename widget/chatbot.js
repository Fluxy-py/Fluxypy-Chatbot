(function () {
  'use strict';

  // ── Get API key from script tag FIRST ───────────────
  const scriptTag =
    document.currentScript ||
    document.querySelector('script[data-api-key]');

  const API_KEY = scriptTag?.getAttribute('data-api-key');
  const API_BASE =
    scriptTag?.getAttribute('data-api-url') ||
    'http://localhost:3001/api/v1';

  const WIDGET_VERSION = '1.0.0';

  if (!API_KEY) {
    console.error('[Fluxypy Bot] No data-api-key found on script tag');
    return;
  }

  // ── State ────────────────────────────────────────────
  let isOpen = false;
  let isLoading = false;
  let orgConfig = null;
  let sessionId = generateSessionId();
  let messages = [];

  // ── Helpers ──────────────────────────────────────────
  function generateSessionId() {
    return 'sess_' + Math.random().toString(36).substr(2, 16);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  }

  function formatMessage(text) {
    return escapeHtml(text)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  // ── Fetch org config ─────────────────────────────────
  async function loadConfig() {
    try {
      const res = await fetch(
        `${API_BASE}/chat/config?apiKey=${API_KEY}`,
      );
      if (!res.ok) throw new Error('Invalid API key');
      orgConfig = await res.json();
      applyBranding();
    } catch (err) {
      console.error('[Fluxypy Bot] Failed to load config:', err);
      // Still show widget with defaults
      addMessage('bot', 'Hi! How can I help you today?');
    }
  }

  // ── Apply org branding ───────────────────────────────
  function applyBranding() {
    if (!orgConfig) return;
    const settings = orgConfig.settings || {};
    const color = settings.primaryColor || '#6366F1';
    const botName = settings.botName || 'Fluxypy Bot';
    const welcomeMsg =
      settings.welcomeMessage || 'Hi! How can I help you today?';

    document.documentElement.style.setProperty('--fpy-primary', color);

    const nameEl = document.getElementById('fpy-bot-name');
    if (nameEl) nameEl.textContent = botName;

    if (messages.length === 0) {
      addMessage('bot', welcomeMsg);
    }
  }

  // ── Send message ─────────────────────────────────────
  async function sendMessage(text) {
    if (!text.trim() || isLoading) return;

    addMessage('user', text);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
        },
        body: JSON.stringify({ message: text, sessionId }),
      });

      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      addMessage('bot', data.message, data.sources);
    } catch (err) {
      addMessage('bot', 'Sorry, something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // ── Add message ──────────────────────────────────────
  function addMessage(role, text, sources = []) {
    messages.push({ role, text, sources });

    const container = document.getElementById('fpy-messages');
    if (!container) return;

    const msgEl = document.createElement('div');
    msgEl.className = `fpy-msg fpy-msg-${role}`;

    const bubble = document.createElement('div');
    bubble.className = 'fpy-bubble';
    bubble.innerHTML = formatMessage(text);

    if (sources && sources.length > 0) {
      const sourcesEl = document.createElement('div');
      sourcesEl.className = 'fpy-sources';
      sourcesEl.innerHTML =
        '📄 ' + sources.slice(0, 2).map((s) => s.sourceName).join(', ');
      bubble.appendChild(sourcesEl);
    }

    msgEl.appendChild(bubble);
    container.appendChild(msgEl);
    container.scrollTop = container.scrollHeight;
  }

  // ── Loading ──────────────────────────────────────────
  function setLoading(loading) {
    isLoading = loading;
    const btn = document.getElementById('fpy-send-btn');
    const input = document.getElementById('fpy-input');
    const typingEl = document.getElementById('fpy-typing');

    if (btn) btn.disabled = loading;
    if (input) input.disabled = loading;
    if (typingEl) typingEl.style.display = loading ? 'flex' : 'none';

    if (!loading) {
      const container = document.getElementById('fpy-messages');
      if (container) container.scrollTop = container.scrollHeight;
    }
  }

  // ── Toggle ───────────────────────────────────────────
  function toggleChat() {
    isOpen = !isOpen;
    const win = document.getElementById('fpy-window');
    const fabIcon = document.getElementById('fpy-fab-icon');

    if (win) win.style.display = isOpen ? 'flex' : 'none';
    if (fabIcon) fabIcon.innerHTML = isOpen ? closeIcon() : chatIcon();

    if (isOpen) {
      setTimeout(() => {
        const input = document.getElementById('fpy-input');
        if (input) input.focus();
      }, 100);
    }
  }

  // ── Icons ─────────────────────────────────────────────
  function chatIcon() {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;
  }

  function closeIcon() {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
  }

  // ── Styles ────────────────────────────────────────────
  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      :root { --fpy-primary: #6366F1; --fpy-primary-dark: #4F46E5; }
      #fpy-container * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; }
      #fpy-fab { position: fixed; bottom: 24px; right: 24px; width: 56px; height: 56px; border-radius: 50%; background: var(--fpy-primary); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 4px 20px rgba(99,102,241,0.4); z-index: 999999; transition: transform 0.2s ease; }
      #fpy-fab:hover { transform: scale(1.08); }
      #fpy-badge { position: absolute; top: -4px; right: -4px; width: 18px; height: 18px; background: #EF4444; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-size: 10px; color: white; font-weight: bold; }
      #fpy-window { position: fixed; bottom: 92px; right: 24px; width: 380px; height: 560px; background: white; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); z-index: 999998; display: none; flex-direction: column; overflow: hidden; animation: fpySlideUp 0.3s ease; }
      @keyframes fpySlideUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
      #fpy-header { background: var(--fpy-primary); padding: 16px 20px; display: flex; align-items: center; gap: 12px; color: white; }
      #fpy-avatar { width: 38px; height: 38px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
      #fpy-header-info { flex: 1; }
      #fpy-bot-name { font-size: 15px; font-weight: 600; color: white; }
      #fpy-status { font-size: 12px; color: rgba(255,255,255,0.8); display: flex; align-items: center; gap: 4px; margin-top: 2px; }
      #fpy-status::before { content: ''; width: 6px; height: 6px; background: #4ADE80; border-radius: 50%; display: inline-block; }
      #fpy-close-btn { background: none; border: none; color: rgba(255,255,255,0.8); cursor: pointer; padding: 4px; display: flex; border-radius: 6px; transition: background 0.15s; }
      #fpy-close-btn:hover { background: rgba(255,255,255,0.2); color: white; }
      #fpy-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; background: #F8FAFC; }
      #fpy-messages::-webkit-scrollbar { width: 4px; }
      #fpy-messages::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 2px; }
      .fpy-msg { display: flex; align-items: flex-end; gap: 8px; max-width: 85%; animation: fpyFadeIn 0.2s ease; }
      @keyframes fpyFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      .fpy-msg-user { align-self: flex-end; flex-direction: row-reverse; }
      .fpy-msg-bot { align-self: flex-start; }
      .fpy-bubble { padding: 10px 14px; border-radius: 18px; font-size: 14px; line-height: 1.5; word-wrap: break-word; }
      .fpy-msg-user .fpy-bubble { background: var(--fpy-primary); color: white; border-bottom-right-radius: 4px; }
      .fpy-msg-bot .fpy-bubble { background: white; color: #1E293B; border-bottom-left-radius: 4px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
      .fpy-sources { margin-top: 8px; padding-top: 8px; border-top: 1px solid #E2E8F0; font-size: 11px; color: #94A3B8; }
      #fpy-typing { display: none; align-self: flex-start; align-items: flex-end; gap: 8px; }
      .fpy-typing-bubble { background: white; padding: 12px 16px; border-radius: 18px; border-bottom-left-radius: 4px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); display: flex; gap: 4px; align-items: center; }
      .fpy-dot { width: 7px; height: 7px; background: #94A3B8; border-radius: 50%; animation: fpyBounce 1.2s infinite; }
      .fpy-dot:nth-child(2) { animation-delay: 0.2s; }
      .fpy-dot:nth-child(3) { animation-delay: 0.4s; }
      @keyframes fpyBounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }
      #fpy-input-area { padding: 12px 16px; background: white; border-top: 1px solid #F1F5F9; display: flex; gap: 8px; align-items: center; }
      #fpy-input { flex: 1; border: 1.5px solid #E2E8F0; border-radius: 12px; padding: 10px 14px; font-size: 14px; color: #1E293B; outline: none; transition: border-color 0.15s; background: #F8FAFC; }
      #fpy-input:focus { border-color: var(--fpy-primary); background: white; }
      #fpy-input::placeholder { color: #94A3B8; }
      #fpy-send-btn { width: 40px; height: 40px; border-radius: 12px; background: var(--fpy-primary); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0; transition: background 0.15s, transform 0.1s; }
      #fpy-send-btn:hover { background: var(--fpy-primary-dark); transform: scale(1.05); }
      #fpy-send-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
      #fpy-branding { text-align: center; padding: 6px; font-size: 11px; color: #CBD5E1; background: white; }
      #fpy-branding a { color: #94A3B8; text-decoration: none; }
      @media (max-width: 480px) { #fpy-window { width: calc(100vw - 32px); height: calc(100vh - 120px); bottom: 84px; right: 16px; left: 16px; } #fpy-fab { right: 16px; bottom: 16px; } }
    `;
    document.head.appendChild(style);
  }

  // ── Build HTML ────────────────────────────────────────
  function buildWidget() {
    const container = document.createElement('div');
    container.id = 'fpy-container';
    container.innerHTML = `
      <div id="fpy-window">
        <div id="fpy-header">
          <div id="fpy-avatar">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1"/></svg>
          </div>
          <div id="fpy-header-info">
            <div id="fpy-bot-name">Fluxypy Bot</div>
            <div id="fpy-status">Online — Ready to help</div>
          </div>
          <button id="fpy-close-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div id="fpy-messages">
          <div id="fpy-typing">
            <div class="fpy-typing-bubble">
              <div class="fpy-dot"></div>
              <div class="fpy-dot"></div>
              <div class="fpy-dot"></div>
            </div>
          </div>
        </div>
        <div id="fpy-input-area">
          <input id="fpy-input" type="text" placeholder="Type your message..." autocomplete="off" maxlength="500" />
          <button id="fpy-send-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
        <div id="fpy-branding">Powered by <a href="https://fluxypy.ai" target="_blank">Fluxypy Bot</a></div>
      </div>
      <button id="fpy-fab">
        <span id="fpy-fab-icon">${chatIcon()}</span>
        <span id="fpy-badge" style="display:none">1</span>
      </button>
    `;
    document.body.appendChild(container);
  }

  // ── Events ────────────────────────────────────────────
  function attachEvents() {
    document.getElementById('fpy-fab')?.addEventListener('click', () => {
      toggleChat();
      const badge = document.getElementById('fpy-badge');
      if (badge) badge.style.display = 'none';
    });

    document.getElementById('fpy-close-btn')?.addEventListener('click', toggleChat);
    document.getElementById('fpy-send-btn')?.addEventListener('click', handleSend);
    document.getElementById('fpy-input')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });
  }

  function handleSend() {
    const input = document.getElementById('fpy-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    sendMessage(text);
  }

  function showUnreadBadge() {
    setTimeout(() => {
      if (!isOpen) {
        const badge = document.getElementById('fpy-badge');
        if (badge) badge.style.display = 'flex';
      }
    }, 3000);
  }

  // ── Init ──────────────────────────────────────────────
  function init() {
    injectStyles();
    buildWidget();
    attachEvents();
    loadConfig();
    showUnreadBadge();
    console.log(`[Fluxypy Bot] Widget v${WIDGET_VERSION} initialized ✅`);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
