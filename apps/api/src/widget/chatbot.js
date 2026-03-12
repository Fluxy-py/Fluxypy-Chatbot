/**
 * Fluxypy Bot Widget
 * Embedded chatbot with enhanced security
 * 
 * Usage:
 * <script 
 *   src="https://api.fluxypy.com/widget/chatbot.js"
 *   data-api-key="fpy_pub_xxxxx"
 *   async 
 *   defer
 * ></script>
 */

(function () {
  // ─────────────────────────────────────────
  // CONSTANTS & CONFIGURATION
  // ─────────────────────────────────────────

  const scriptTag = document.currentScript;
  const API_KEY = scriptTag?.getAttribute('data-api-key');

  // Determine API_BASE from script source
  const scriptSrc = scriptTag?.src || '';
  const API_BASE = scriptTag?.getAttribute('data-api-url') ||
    (scriptSrc ? new URL(scriptSrc).origin + '/api/v1' : 'https://fluxypy-chat-api.onrender.com/api/v1');

  const ROOT_ID = 'fluxypy-widget-root';
  const WIDGET_CONTAINER_ID = 'fluxypy-widget-container';
  const CHAT_BODY_ID = 'fluxypy-chat-body';
  const MESSAGE_INPUT_ID = 'fluxypy-message-input';
  const SEND_BUTTON_ID = 'fluxypy-send-btn';

  // ─────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────

  let isOpen = false;
  let orgConfig = {
    botName: 'Fluxypy Bot',
    primaryColor: '#6366F1',
    welcomeMessage: 'Hi! How can I help you today?',
    position: 'bottom-right',
    showBranding: true,
  };

  // Session token state (NEW)
  let sessionToken = null;
  let tokenExpiresAt = 0;

  // ─────────────────────────────────────────
  // UTILITY FUNCTIONS
  // ─────────────────────────────────────────

  function log(msg, level = 'info') {
    if (window.FLUXYPY_DEBUG) {
      console[level](`[Fluxypy] ${msg}`);
    }
  }

  function getOrigin() {
    return window.location.origin;
  }

  /**
   * Initialize session with API key (one time only)
   */
  async function initSession() {
    try {
      log('Initializing session...');
      
      const res = await fetch(`${API_BASE}/widget/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: API_KEY }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Init failed (${res.status})`);
      }

      const data = await res.json();
      sessionToken = data.sessionToken;
      tokenExpiresAt = Date.now() + (data.expiresIn * 1000);
      orgConfig = data.config;

      log(`Session initialized. Token expires in ${data.expiresIn}s`);
      applyBranding();
      addMessage('bot', orgConfig.welcomeMessage);
    } catch (err) {
      log(`Session init error: ${err.message}`, 'error');
      
      if (err.message?.includes('not authorized') || err.message?.includes('Domain')) {
        addMessage('bot', '⚠️ This website is not authorized to use this chatbot.');
      } else {
        addMessage('bot', 'Hi! How can I help you today? 🤖');
      }
    }
  }

  /**
   * Ensure session token is valid (refresh if needed)
   */
  async function ensureValidToken() {
    // If no token or token expires in less than 1 minute, refresh
    if (!sessionToken || Date.now() > tokenExpiresAt - 60000) {
      log('Token expired or missing, refreshing...');
      await initSession();
    }
  }

  /**
   * Send message to backend
   */
  async function sendMessage(message) {
    // Ensure we have a valid token before sending
    await ensureValidToken();

    if (!sessionToken) {
      addMessage('bot', 'Error: Could not establish session. Please refresh the page.');
      return;
    }

    try {
      const payload = {
        message,
        sessionId: getSessionId(),
      };

      log(`Sending message with token...`);

      const sendRequest = async (token) => {
        const response = await fetch(`${API_BASE}/widget/message`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-session-token': token,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw {
            status: response.status,
            error,
          };
        }

        return await response.json();
      };

      try {
        const result = await sendRequest(sessionToken);
        addMessage('bot', result.message);
        log('Message processed successfully');
      } catch (error) {
        // If 401/403, token might be invalid - refresh and retry once
        if (error.status === 401 || error.status === 403) {
          log('Session invalid, refreshing and retrying...', 'warn');
          sessionToken = null;
          await ensureValidToken();

          if (sessionToken) {
            const result = await sendRequest(sessionToken);
            addMessage('bot', result.message);
            log('Message processed successfully on retry');
          } else {
            addMessage('bot', 'Error: Could not re-establish session.');
          }
        } else {
          throw error;
        }
      }
    } catch (err) {
      log(`Error sending message: ${err.message}`, 'error');
      addMessage('bot', 'Sorry, I encountered an error. Please try again.');
    }

    // Clear input
    const input = document.getElementById(MESSAGE_INPUT_ID);
    if (input) input.value = '';
  }

  /**
   * Generate or retrieve session ID from localStorage
   */
  function getSessionId() {
    const key = `fluxypy_session_${API_KEY}`;
    let sessionId = localStorage.getItem(key);

    if (!sessionId) {
      sessionId = 'session_' + Math.random().toString(36).substring(2);
      localStorage.setItem(key, sessionId);
    }

    return sessionId;
  }

  /**
   * Add message to chat
   */
  function addMessage(role, content) {
    const chatBody = document.getElementById(CHAT_BODY_ID);
    if (!chatBody) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = `fluxypy-message fluxypy-message-${role}`;
    msgDiv.textContent = content;

    chatBody.appendChild(msgDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  /**
   * Apply branding to widget
   */
  function applyBranding() {
    // Update primary color
    if (orgConfig.primaryColor) {
      const style = document.getElementById('fluxypy-dynamic-styles');
      if (style) {
        style.textContent = `
          .fluxypy-send-btn { background-color: ${orgConfig.primaryColor}; }
          .fluxypy-header { background-color: ${orgConfig.primaryColor}; }
          .fluxypy-message-bot { color: ${orgConfig.primaryColor}; }
        `;
      }
    }

    // Update bot name in header
    const headerText = document.getElementById('fluxypy-header-text');
    if (headerText && orgConfig.botName) {
      headerText.textContent = orgConfig.botName;
    }
  }

  /**
   * Toggle chat window open/close
   */
  function toggleChat() {
    const container = document.getElementById(WIDGET_CONTAINER_ID);
    if (!container) return;

    isOpen = !isOpen;
    container.style.display = isOpen ? 'flex' : 'none';

    if (isOpen && !sessionToken) {
      addMessage('bot', 'Initializing... Please wait.');
    }
  }

  /**
   * Initialize the widget UI
   */
  function init() {
    // Don't initialize if API key is missing
    if (!API_KEY) {
      log(
        'ERROR: data-api-key attribute is required on the script tag',
        'error'
      );
      return;
    }

    log(`Initializing with API: ${API_KEY.substring(0, 15)}...`);

    // Create root element if it doesn't exist
    if (!document.getElementById(ROOT_ID)) {
      const root = document.createElement('div');
      root.id = ROOT_ID;
      document.body.appendChild(root);
    }

    const root = document.getElementById(ROOT_ID);

    // Create widget HTML
    root.innerHTML = `
      <style id="fluxypy-dynamic-styles">
        .fluxypy-message-bot { color: ${orgConfig.primaryColor}; }
        .fluxypy-send-btn { background-color: ${orgConfig.primaryColor}; }
        .fluxypy-header { background-color: ${orgConfig.primaryColor}; }
      </style>
      
      <div id="${WIDGET_CONTAINER_ID}" class="fluxypy-widget-container" style="display: none;">
        <div class="fluxypy-widget">
          <div class="fluxypy-header">
            <span id="fluxypy-header-text">${orgConfig.botName}</span>
            <button class="fluxypy-close-btn" onclick="window.FLUXYPY_toggleChat()">✕</button>
          </div>
          <div id="${CHAT_BODY_ID}" class="fluxypy-chat-body"></div>
          <div class="fluxypy-input-area">
            <input 
              id="${MESSAGE_INPUT_ID}"
              type="text" 
              placeholder="Type your message..." 
              onkeypress="if(event.key==='Enter') window.FLUXYPY_sendMessage()"
            />
            <button id="${SEND_BUTTON_ID}" class="fluxypy-send-btn" onclick="window.FLUXYPY_sendMessage()">
              Send
            </button>
          </div>
        </div>
      </div>

      <button class="fluxypy-toggle-btn" onclick="window.FLUXYPY_toggleChat()">
        💬
      </button>
    `;

    // Add CSS styles
    const style = document.createElement('style');
    style.textContent = `
      #${ROOT_ID} {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      .fluxypy-toggle-btn {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: ${orgConfig.primaryColor};
        color: white;
        border: none;
        font-size: 24px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transition: all 0.3s ease;
        z-index: 9998;
      }

      .fluxypy-toggle-btn:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
      }

      .fluxypy-widget-container {
        position: fixed;
        bottom: 80px;
        right: 20px;
        width: 400px;
        max-width: 90vw;
        height: 500px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 5px 40px rgba(0, 0, 0, 0.16);
        display: flex;
        flex-direction: column;
        z-index: 9999;
        animation: slideUp 0.3s ease;
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .fluxypy-widget {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      .fluxypy-header {
        background: ${orgConfig.primaryColor};
        color: white;
        padding: 16px;
        border-radius: 12px 12px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 600;
      }

      .fluxypy-close-btn {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
      }

      .fluxypy-chat-body {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .fluxypy-message {
        padding: 10px 12px;
        border-radius: 8px;
        max-width: 80%;
        word-wrap: break-word;
        font-size: 14px;
        line-height: 1.4;
      }

      .fluxypy-message-user {
        align-self: flex-end;
        background: ${orgConfig.primaryColor};
        color: white;
      }

      .fluxypy-message-bot {
        align-self: flex-start;
        background: #f0f0f0;
        color: ${orgConfig.primaryColor};
      }

      .fluxypy-input-area {
        display: flex;
        gap: 8px;
        padding: 12px;
        border-top: 1px solid #e0e0e0;
        background: white;
        border-radius: 0 0 12px 12px;
      }

      .fluxypy-input-area input {
        flex: 1;
        border: 1px solid #ddd;
        border-radius: 20px;
        padding: 10px 16px;
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s;
      }

      .fluxypy-input-area input:focus {
        border-color: ${orgConfig.primaryColor};
      }

      .fluxypy-send-btn {
        background: ${orgConfig.primaryColor};
        color: white;
        border: none;
        border-radius: 20px;
        padding: 10px 20px;
        cursor: pointer;
        font-weight: 500;
        transition: opacity 0.2s;
      }

      .fluxypy-send-btn:hover {
        opacity: 0.9;
      }

      .fluxypy-send-btn:active {
        transform: scale(0.98);
      }

      @media (max-width: 500px) {
        .fluxypy-widget-container {
          width: 100%;
          height: 100vh;
          max-width: 100vw;
          bottom: 0;
          right: 0;
          border-radius: 0;
        }

        .fluxypy-message {
          max-width: 85%;
        }
      }
    `;
    document.head.appendChild(style);

    // Expose functions globally for onclick handlers
    window.FLUXYPY_toggleChat = toggleChat;
    window.FLUXYPY_sendMessage = () => {
      const input = document.getElementById(MESSAGE_INPUT_ID);
      if (input && input.value.trim()) {
        addMessage('user', input.value);
        sendMessage(input.value);
      }
    };

    // Initialize session when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initSession);
    } else {
      initSession();
    }
  }

  // ─────────────────────────────────────────
  // INITIALIZATION
  // ─────────────────────────────────────────

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
