# 🚀 Quick Reference - Fluxypy Widget Security

## Embed Code for Customers

```html
<!-- Basic Usage -->
<script 
  src="https://fluxypy-chat-api.onrender.com/widget/chatbot.js"
  data-api-key="fpy_pub_YOUR_API_KEY_HERE"
  async 
  defer
></script>
```

## Configuration

### Widget Load Process
1. Script tag loads `chatbot.js`
2. Widget calls `POST /api/v1/widget/init` with API key
3. Server validates domain and returns session token
4. Token stored in widget (never leaves client)
5. All messages use session token

### Allowed Domains Format
```
example.com          # Exact match
*.example.com        # All subdomains
localhost            # Development
127.0.0.1           # Localhost IP
sub.example.com     # Specific subdomain
```

## For Dashboard Admin

### Adding Domains
1. Go to **Settings → Domain Settings**
2. Enter domain (format: `example.com` or `*.example.com`)
3. Click "Add Domain"
4. Review list, remove if needed
5. Click "Save Changes"

### Security Status
- ✅ Empty list = Allow any domain (legacy behavior)
- ✅ With list = Only whitelisted domains work
- ✅ Token expires in 2 hours
- ✅ Auto-refresh if expired mid-session

## For Developers

### Debug Widget
```javascript
// In browser console
window.FLUXYPY_DEBUG = true;
// All logs will appear prefixed with [Fluxypy]
```

### Test Widget
- Navigate to: `http://localhost:3001/widget/test.html`
- Enter API key
- Click "Load Widget"
- Test messaging

### Monitor Sessions (Backend)
```bash
# Check active session count
curl http://localhost:3001/api/v1/widget/health
# Response: { status: "ok", activeSessions: 42 }
```

### API Endpoints

#### Initialize Session (Widget)
```
POST /api/v1/widget/init
Content-Type: application/json

{
  "apiKey": "fpy_pub_xxxxx"
}

Response:
{
  "sessionToken": "fpy_st_xxxxx",
  "expiresIn": 7200,
  "config": {
    "botName": "Fluxypy Bot",
    "primaryColor": "#6366F1",
    "welcomeMessage": "Hi! How can I help you?",
    "position": "bottom-right",
    "showBranding": true
  }
}
```

#### Send Message (Widget)
```
POST /api/v1/widget/message
Headers:
  x-session-token: fpy_st_xxxxx
  Content-Type: application/json

{
  "message": "Hello!",
  "sessionId": "session_xyz"
}

Response:
{
  "sessionId": "session_xyz",
  "message": "Hi! How can I help?",
  "sources": [ ... ],
  "responseTime": 1234
}
```

#### Update Settings (Dashboard)
```
PATCH /api/v1/org/settings
Headers:
  Authorization: Bearer <jwt-token>
  Content-Type: application/json

{
  "allowedDomains": ["example.com", "*.example.com"],
  "botName": "My Bot",
  "primaryColor": "#6366F1",
  "welcomeMessage": "Hello!",
  "showBranding": true
}

Response:
{
  "success": true,
  "data": { ... }
}
```

## Environment Variables

No new environment variables needed - uses existing setup.

## File Locations

```
Backend:
  src/modules/widget/widget-security.service.ts      (Security logic)
  src/modules/widget/widget-security.controller.ts   (Endpoints)
  src/modules/widget/widget.module.ts                (Module)
  src/modules/organizations/organizations.controller.ts (Settings)

Frontend:
  dashboard/components/settings/DomainSettings.tsx   (React component)
  
Widget:
  src/widget/chatbot.js                              (Client code)
  widget/test.html                                   (Test page)

Documentation:
  SECURITY_IMPLEMENTATION.md                         (Full guide)
```

## Performance Metrics

- **Token Generation:** < 5ms
- **Session Validation:** < 1ms  
- **Cleanup Interval:** Every 30 minutes
- **Max Token Storage:** In-memory (scales to ~10,000 tokens)
- **Typical Response Time:** 1-2s (includes LLM)

## Common Issues & Fixes

| Problem | Solution |
|---------|----------|
| 403 Domain not authorized | Add domain to whitelist in settings |
| 401 Invalid session token | Widget auto-refreshes, reload page if issues persist |
| Widget not loading | Check API key format: `fpy_pub_xxxxx` |
| Settings won't save | Ensure logged in, check JWT token validity |
| CORS error | Already handled - all origins allowed |
| Token expires mid-chat | Auto-refresh handled, transparent to user |

## Production Checklist

- [ ] Update script URL from localhost to production domain
- [ ] Enable HTTPS in production
- [ ] Configure allowedDomains for each customer
- [ ] Set up monitoring for `/widget/health` endpoint
- [ ] Backup database before security update
- [ ] Test with real customer domains
- [ ] Document for customer success team

## Future Enhancements

**Planned Features:**
- [ ] Redis-based session persistence (distributed systems)
- [ ] Per-domain rate limiting (DDoS protection)
- [ ] Session rotation (token refresh without re-init)
- [ ] Audit logs (who changed domain settings)
- [ ] Analytics dashboard (widget usage by domain)
- [ ] Custom widget colors/branding per domain
- [ ] API key versioning and rolling

## Support & Debugging

### Enable Verbose Logs
```javascript
window.FLUXYPY_DEBUG = true;
// Or set in browser console before loading widget
```

### Check Token Status
```javascript
console.log('Session Token:', window.FLUXYPY_sessionToken);
console.log('Expires At:', new Date(window.FLUXYPY_tokenExpiresAt));
```

### Inspect Network Traffic
1. Open DevTools (F12)
2. Go to **Network** tab
3. Filter by `widget` or `/api/v1`
4. Verify:
   - `POST /widget/init` returns sessionToken
   - `POST /widget/message` uses x-session-token header
   - No x-api-key headers sent

---

**Questions? Check [SECURITY_IMPLEMENTATION.md](./SECURITY_IMPLEMENTATION.md) for complete documentation.**
