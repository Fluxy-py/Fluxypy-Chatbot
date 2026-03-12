'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { useThemeStore, getTokens } from '@/store/theme.store';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

interface DomainSettingsProps {
  currentDomains: string[];
  onSaved: (domains: string[]) => void;
}

export function DomainSettings({ currentDomains, onSaved }: DomainSettingsProps) {
  const { dark } = useThemeStore();
  const t = getTokens(dark);
  const { user, organization, token, setAuth } = useAuthStore();
  const [domains, setDomains] = useState<string[]>(currentDomains);
  const [newDomain, setNewDomain] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Clean up domain format: strip https://, www., trailing slashes
   */
  const cleanDomain = (domain: string): string => {
    let cleaned = domain.trim().toLowerCase();

    // Remove protocol
    cleaned = cleaned.replace(/^https?:\/\//i, '');

    // Remove www. (but keep it in wildcard)
    if (!cleaned.startsWith('*.')) {
      cleaned = cleaned.replace(/^www\./i, '');
    } else {
      // For *.example.com, clean the part after *
      cleaned = cleaned.replace(/^\*\.www\./i, '*.').replace(/^\*\./, '*.');
    }

    // Remove trailing slash
    cleaned = cleaned.replace(/\/$/, '');

    // Remove trailing colon and port
    cleaned = cleaned.replace(/:\d+$/, '');

    return cleaned;
  };

  /**
   * Validate domain format
   */
  const isValidDomain = (domain: string): boolean => {
    const cleaned = cleanDomain(domain);

    // Empty check
    if (!cleaned) {
      return false;
    }

    // Check for wildcard format or standard domain
    const wildCardRegex = /^\*\.([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/i;
    const domainRegex = /^(localhost(:\d+)?|127\.0\.0\.1(:\d+)?|[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*(\:\d+)?)$/i;

    return wildCardRegex.test(cleaned) || domainRegex.test(cleaned);
  };

  /**
   * Add new domain
   */
  const addDomain = () => {
    if (!newDomain.trim()) {
      toast.error('Please enter a domain');
      return;
    }

    const cleaned = cleanDomain(newDomain);

    if (!isValidDomain(cleaned)) {
      toast.error(
        'Invalid domain format. Use: example.com, *.example.com, or localhost'
      );
      return;
    }

    if (domains.includes(cleaned)) {
      toast.error('This domain is already added');
      return;
    }

    setDomains([...domains, cleaned]);
    setNewDomain('');
    toast.success(`Domain added: ${cleaned}`);
  };

  /**
   * Remove domain
   */
  const removeDomain = (domain: string) => {
    setDomains(domains.filter((d) => d !== domain));
    toast.success(`Domain removed: ${domain}`);
  };

  /**
   * Save domains to backend
   */
  const saveDomains = async () => {
    setIsLoading(true);

    try {
      // Use centralized API client which handles auth and refresh logic
      const res = await api.patch('/org/settings', { allowedDomains: domains });

      // Update auth store organization settings so UI reflects the change
      try {
        if (setAuth) {
          const updatedOrg = { ...(organization || {}), settings: { ...(organization?.settings || {}), ...(res.data || {}), allowedDomains: domains } };
          setAuth(user as any, updatedOrg as any, token as any);
        }
      } catch (e) {
        // non-fatal
      }

      toast.success('Domain settings saved successfully!');
      onSaved(domains);
    } catch (error) {
      console.error('Error saving domains:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to save settings'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges =
    JSON.stringify(domains) !== JSON.stringify(currentDomains);
  const showWarning = domains.length === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 style={{ color: t.text }} className="text-2xl font-bold">Domain Settings</h2>
        <p style={{ color: t.textMuted, marginTop: 4 }}>
          Control which domains can use your chatbot widget
        </p>
      </div>

      {/* Warning Banner */}
      {showWarning && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
          <div className="shrink-0 text-yellow-600 text-lg">⚠️</div>
          <div>
            <h3 className="font-semibold text-yellow-800">No domains configured</h3>
            <p className="text-yellow-700 text-sm mt-1">
              Your chatbot can be used from any website. Add domains to restrict access.
            </p>
          </div>
        </div>
      )}

      {/* Add Domain Section */}
      <div
        className="rounded-lg border p-6"
        style={{ backgroundColor: t.cardBg, borderColor: t.cardBd, boxShadow: t.shadow }}
      >
        <h3 style={{ color: t.text }} className="font-semibold mb-4">Add New Domain</h3>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="example.com or *.example.com"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addDomain()}
            className="flex-1 px-4 py-2 rounded-lg"
            style={{
              backgroundColor: t.inBg,
              color: t.text,
              border: `1px solid ${t.inBd}`,
              WebkitTextFillColor: t.text,
              caretColor: t.text,
              appearance: 'none',
            }}
          />
          <button
            onClick={addDomain}
            className="px-4 py-2 rounded-lg font-medium"
            style={{ backgroundColor: t.btnPrimary, color: t.btnText }}
          >
            Add Domain
          </button>
        </div>

        <div style={{ marginTop: 12, color: t.textMuted }} className="text-sm space-y-1">
          <p>✓ Exact match: <code style={{ backgroundColor: t.bgSecond, padding: '2px 8px', borderRadius: 6 }}>example.com</code></p>
          <p>✓ Wildcard: <code style={{ backgroundColor: t.bgSecond, padding: '2px 8px', borderRadius: 6 }}>* .example.com</code> (matches any subdomain)</p>
          <p>✓ Localhost: <code style={{ backgroundColor: t.bgSecond, padding: '2px 8px', borderRadius: 6 }}>localhost</code> (always allowed for development)</p>
        </div>
      </div>

      {/* Allowed Domains List */}
      <div className="rounded-lg border p-6" style={{ backgroundColor: t.cardBg, borderColor: t.cardBd }}>
        <h3 className="font-semibold mb-4" style={{ color: t.text }}>
          Allowed Domains ({domains.length})
        </h3>

        {domains.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No domains configured yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {domains.map((domain) => (
              <div
                key={domain}
                className="flex items-center justify-between p-4 rounded-lg transition-colors"
                style={{ backgroundColor: t.bgSecond, border: `1px solid ${t.cardBd}` }}
              >
                <div className="flex items-center gap-3">
                  <div style={{ fontSize: 18, color: '#6366f1' }}>✓</div>
                  <div>
                    <p className="font-medium" style={{ color: t.text }}>{domain}</p>
                    {domain.startsWith('*.') && (
                      <p style={{ fontSize: 12, color: t.textMuted }}>
                        Wildcard: matches all subdomains
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeDomain(domain)}
                  className="px-3 py-1 rounded transition-colors text-sm font-medium"
                  style={{ color: '#dc2626', backgroundColor: 'transparent' }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex gap-3">
        <button
          onClick={saveDomains}
          disabled={!hasChanges || isLoading}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
        {hasChanges && (
          <button
            onClick={() => setDomains(currentDomains)}
            disabled={isLoading}
            className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">How it works</h4>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>
            1. The widget script can be embedded on any website, but requires a valid API key
          </li>
          <li>
            2. When a user loads the widget, the origin domain is checked against this list
          </li>
          <li>
            3. If the domain matches, a secure session token is issued (valid for 2 hours)
          </li>
          <li>
            4. All messages use the session token, never the raw API key
          </li>
        </ul>
      </div>
    </div>
  );
}
