'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useThemeStore, getTokens } from '@/store/theme.store';
import {
  CheckCircle, Zap, Crown, Building2,
  Loader2, AlertCircle, CreditCard,
  Gift, Clock, XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

declare global {
  interface Window { Razorpay: any; }
}

// ── Plan Config ───────────────────────────────────
const PLAN_CONFIG: Record<string, any> = {
  Free: {
    icon: Zap,
    accent: '#64748b', accentBg: 'rgba(100,116,139,0.1)',
    features: [
      '50 API calls/day', '15 conversations/day', '50 visitors/day',
      '10MB knowledge base', '5 messages/conversation', 'Fluxypy branding',
    ],
  },
  Starter: {
    icon: Zap,
    accent: '#3b82f6', accentBg: 'rgba(59,130,246,0.1)',
    features: [
      '400 API calls/day', '70 conversations/day', '200 visitors/day',
      '100MB knowledge base', '20 messages/conversation', 'Email support',
    ],
  },
  Pro: {
    icon: Crown,
    accent: '#6366f1', accentBg: 'rgba(99,102,241,0.1)',
    popular: true,
    features: [
      '3,500 API calls/day', '500 conversations/day', '900 visitors/day',
      '500MB knowledge base', '50 messages/conversation',
      'Custom domain ✅', 'Priority support ✅',
    ],
  },
  Business: {
    icon: Building2,
    accent: '#8b5cf6', accentBg: 'rgba(139,92,246,0.1)',
    features: [
      '10,000 API calls/day', '2,500 conversations/day', '3,500 visitors/day',
      '2GB knowledge base', '100 messages/conversation',
      'Custom domain ✅', 'Remove branding ✅',
      'Priority support ✅', 'Dedicated manager ✅',
    ],
  },
};

// ── Status Banner ─────────────────────────────────
function StatusBanner({ subscription, t }: { subscription: any; t: any }) {
  if (!subscription) return null;
  const { status, plan, trialEndDate, daysLeftInTrial, currentPeriodEnd } = subscription;

  const bannerBase: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
    borderRadius: 16, border: `1px solid ${t.cardBd}`,
    background: t.cardBg, boxShadow: t.shadow, flexWrap: 'wrap',
  };
  const iconBox = (bg: string): React.CSSProperties => ({
    width: 36, height: 36, borderRadius: 10, background: bg,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  });
  const badge = (bg: string, color: string): React.CSSProperties => ({
    marginLeft: 'auto', padding: '4px 10px', borderRadius: 8,
    fontSize: 12, fontWeight: 600, background: bg, color,
  });

  const configs: Record<string, any> = {
    none: { icon: <Zap size={18} color="#64748b" />, iconBg: 'rgba(100,116,139,0.1)', title: 'Free Plan', sub: '50 API calls/day · Upgrade for more', badge: ['rgba(100,116,139,0.15)', '#64748b', 'Free'] },
    trial: { icon: <Gift size={18} color="#eab308" />, iconBg: 'rgba(234,179,8,0.1)', title: '🎁 Free Trial Active', sub: `Expires: ${trialEndDate ? new Date(trialEndDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'} · ${daysLeftInTrial} days left`, badge: daysLeftInTrial <= 5 ? ['rgba(239,68,68,0.15)', '#ef4444', 'Expiring Soon!'] : ['rgba(234,179,8,0.15)', '#eab308', 'Trial'] },
    active: { icon: <CheckCircle size={18} color="#22c55e" />, iconBg: 'rgba(34,197,94,0.1)', title: `✅ ${plan?.name} Plan Active`, sub: subscription.paymentType === 'subscription' ? `Auto-renews: ${currentPeriodEnd ? new Date(currentPeriodEnd).toLocaleDateString('en-IN') : 'N/A'}` : 'One-time payment · No auto-renewal', badge: ['rgba(34,197,94,0.15)', '#22c55e', 'Active'] },
    expired: { icon: <XCircle size={18} color="#ef4444" />, iconBg: 'rgba(239,68,68,0.1)', title: 'Trial Expired', sub: 'Subscribe to continue using all features', badge: ['rgba(239,68,68,0.15)', '#ef4444', 'Expired'] },
    cancelled: { icon: <AlertCircle size={18} color="#f97316" />, iconBg: 'rgba(249,115,22,0.1)', title: 'Subscription Cancelled', sub: `Access until: ${currentPeriodEnd ? new Date(currentPeriodEnd).toLocaleDateString('en-IN') : 'N/A'}`, badge: ['rgba(249,115,22,0.15)', '#f97316', 'Cancelled'] },
  };

  const c = configs[status];
  if (!c) return null;

  return (
    <div style={bannerBase}>
      <div style={iconBox(c.iconBg)}>{c.icon}</div>
      <div>
        <p style={{ fontWeight: 600, color: t.text, fontSize: 14 }}>{c.title}</p>
        <p style={{ fontSize: 13, color: t.textMuted, marginTop: 2 }}>{c.sub}</p>
      </div>
      {c.badge && <span style={badge(c.badge[0], c.badge[1])}>{c.badge[2]}</span>}
    </div>
  );
}

// ── Trial Request Section ─────────────────────────
function TrialSection({ subscription, onTrialRequested, t }: any) {
  const [loading, setLoading] = useState(false);

  const { data: trialStatus, refetch: refetchTrialStatus } = useQuery({
    queryKey: ['trial-status'],
    queryFn: async () => {
      const res = await api.get('/billing/trial/status');
      return res.data;
    },
  });

  const canRequestTrial =
    !['trial', 'active'].includes(subscription?.status) &&
    subscription?.status !== 'cancelled';

  if (!canRequestTrial) return null;

  const card: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px',
    borderRadius: 16, border: `1px solid ${t.cardBd}`,
    background: t.cardBg, boxShadow: t.shadow,
  };
  const iconBox: React.CSSProperties = {
    width: 40, height: 40, borderRadius: 12, display: 'flex',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  };

  if (trialStatus?.status === 'pending') {
    return (
      <div style={card}>
        <div style={{ ...iconBox, background: 'rgba(234,179,8,0.1)' }}>
          <Clock size={18} color="#eab308" />
        </div>
        <div>
          <p style={{ fontWeight: 600, color: t.text, fontSize: 14 }}>⏳ Trial Request Pending</p>
          <p style={{ fontSize: 13, color: t.textMuted, marginTop: 2 }}>Your request is under review. Admin will approve within 24 hours.</p>
        </div>
        <span style={{ marginLeft: 'auto', padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: 'rgba(234,179,8,0.15)', color: '#eab308' }}>Under Review</span>
      </div>
    );
  }

  if (trialStatus?.status === 'rejected') {
    return (
      <div style={card}>
        <div style={{ ...iconBox, background: 'rgba(239,68,68,0.1)' }}>
          <XCircle size={18} color="#ef4444" />
        </div>
        <div>
          <p style={{ fontWeight: 600, color: t.text, fontSize: 14 }}>Trial Request Rejected</p>
          <p style={{ fontSize: 13, color: t.textMuted, marginTop: 2 }}>{trialStatus.rejectReason || 'Contact support for more information.'}</p>
        </div>
      </div>
    );
  }

  const handleRequestTrial = async () => {
    setLoading(true);
    try {
      const res = await api.post('/billing/trial/verify-order');
      if (!res.data.canProceed) {
        toast.error('Not eligible for trial');
        return;
      }
      await api.post('/billing/trial/submit', { verified: true });
      toast.success('🎉 Trial request submitted! Admin will review within 24 hours.');
      refetchTrialStatus();
      onTrialRequested();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ ...card, background: `linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.06))`, flexWrap: 'wrap' }}>
      <div style={{ ...iconBox, background: 'rgba(99,102,241,0.12)' }}>
        <Gift size={20} color="#6366f1" />
      </div>
      <div style={{ flex: 1, minWidth: 140 }}>
        <p style={{ fontWeight: 700, color: t.text, fontSize: 16, fontFamily: "'Space Grotesk', sans-serif" }}>Try Free for 30 Days! 🎁</p>
        <p style={{ fontSize: 13, color: t.textMuted, marginTop: 2 }}>No credit card · Admin approves within 24 hrs</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
          {['100 API calls/day', '30MB KB', '50 conversations/day'].map((f) => (
            <span key={f} style={{ fontSize: 11, background: 'rgba(99,102,241,0.12)', color: '#6366f1', padding: '2px 8px', borderRadius: 99 }}>✅ {f}</span>
          ))}
        </div>
      </div>
      <button
        onClick={handleRequestTrial}
        disabled={loading}
        style={{
          padding: '12px 20px', border: 'none', borderRadius: 10, minHeight: 44,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white',
          fontWeight: 600, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />Submitting...</> : <><Gift size={16} />Request Free Trial</>}
      </button>
    </div>
  );
}

// ── Main Billing Page ─────────────────────────────
export default function BillingPage() {
  const { dark } = useThemeStore();
  const t = getTokens(dark);
  const queryClient = useQueryClient();
  const [paymentType, setPaymentType] = useState<'subscription' | 'one_time'>('subscription');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [w, setW] = useState(1200);

  useEffect(() => {
    const u = () => setW(window.innerWidth);
    u();
    window.addEventListener('resize', u);
    return () => window.removeEventListener('resize', u);
  }, []);

  const isMobile = w < 640;
  const isSmall = w < 440;

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const { data: subscription, refetch: refetchSub } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const res = await api.get('/billing/subscription');
      return res.data;
    },
  });

  const { data: plans } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const res = await api.get('/billing/plans');
      return res.data;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => api.post('/billing/cancel'),
    onSuccess: () => {
      toast.success('Subscription cancelled successfully');
      refetchSub();
    },
    onError: () => toast.error('Failed to cancel subscription'),
  });

  const handlePayment = async (planName: string, priceMonthly: number) => {
    setLoadingPlan(planName);
    try {
      const endpoint = paymentType === 'subscription'
        ? '/billing/subscription-order'
        : '/billing/one-time-order';

      const res = await api.post(endpoint, { planName });
      const orderData = res.data;

      const options: any = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: 'INR',
        name: 'Fluxypy Bot',
        description: `${planName} Plan — ${paymentType === 'subscription' ? 'Monthly' : 'One-time'}`,
        prefill: { name: orderData.orgName, email: orderData.email },
        theme: { color: '#6366F1' },
        handler: async (response: any) => {
          try {
            await api.post('/billing/verify', { ...response, planName, paymentType });
            toast.success(`🎉 ${planName} plan activated!`);
            refetchSub();
            queryClient.invalidateQueries({ queryKey: ['usage'] });
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        modal: {
          ondismiss: () => {
            setLoadingPlan(null);
            toast.error('Payment cancelled');
          },
        },
      };

      if (paymentType === 'subscription') {
        options.subscription_id = orderData.subscriptionId;
      } else {
        options.order_id = orderData.orderId;
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setLoadingPlan(null);
    }
  };

  const activePlanName = subscription?.plan?.name;
  const isActive = subscription?.status === 'active';

  const card: React.CSSProperties = {
    background: t.cardBg, border: `1px solid ${t.cardBd}`,
    borderRadius: isSmall ? 12 : 16, boxShadow: t.shadow, transition: 'all 0.2s',
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(20px, 2.5vw, 26px)', fontWeight: 800, letterSpacing: '-0.025em', color: t.text, marginBottom: 4 }}>
          Billing
        </h1>
        <p style={{ fontSize: 14, color: t.textMuted }}>Manage your subscription and billing</p>
      </div>

      {/* Status Banner */}
      <StatusBanner subscription={subscription} t={t} />

      {/* Trial Request */}
      <TrialSection subscription={subscription} onTrialRequested={refetchSub} t={t} />

      {/* Payment Type Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: t.textMuted }}>Payment Type:</span>
        <div style={{ display: 'flex', background: t.inBg, borderRadius: 10, border: `1px solid ${t.inBd}`, padding: 3 }}>
          {([
            { key: 'subscription' as const, label: '🔄 Monthly' },
            { key: 'one_time' as const, label: '💳 One-time' },
          ]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPaymentType(key)}
              style={{
                padding: isSmall ? '7px 12px' : '8px 14px', borderRadius: 8, border: 'none',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 36,
                fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s',
                background: paymentType === key ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
                color: paymentType === key ? 'white' : t.textMuted,
                boxShadow: paymentType === key ? '0 2px 8px rgba(99,102,241,0.3)' : 'none',
              }}
            >{label}</button>
          ))}
        </div>
        {paymentType === 'one_time' && (
          <span style={{ fontSize: 11, color: '#f97316', background: 'rgba(249,115,22,0.1)', padding: '4px 10px', borderRadius: 8 }}>
            ⚠️ One-time = 1 month access, no auto-renewal
          </span>
        )}
      </div>

      {/* Plans Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${isSmall ? '100%' : isMobile ? '240px' : '280px'}, 1fr))`, gap: isSmall ? 14 : 20 }}>
        {(plans || [])
          .filter((p: any) => p.name !== 'Free' && p.name !== 'Enterprise')
          .map((plan: any) => {
            const config = PLAN_CONFIG[plan.name] || {};
            const Icon = config.icon || Zap;
            const isCurrent = activePlanName === plan.name && isActive;

            return (
              <div
                key={plan.name}
                style={{
                  ...card,
                  padding: isSmall ? '16px' : '24px',
                  position: 'relative',
                  border: isCurrent
                    ? '2px solid #22c55e'
                    : config.popular
                      ? '2px solid #6366f1'
                      : `1px solid ${t.cardBd}`,
                  boxShadow: config.popular && !isCurrent
                    ? '0 0 0 1px rgba(99,102,241,0.2), 0 8px 24px rgba(99,102,241,0.12)'
                    : t.shadow,
                }}
              >
                {/* Badge */}
                {(config.popular && !isCurrent) && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)' }}>
                    <span style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', padding: '4px 14px', borderRadius: 99, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>⭐ Most Popular</span>
                  </div>
                )}
                {isCurrent && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)' }}>
                    <span style={{ background: '#22c55e', color: 'white', padding: '4px 14px', borderRadius: 99, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>✅ Current Plan</span>
                  </div>
                )}

                {/* Icon + Name */}
                <div style={{ width: 40, height: 40, borderRadius: 12, background: config.accentBg || 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, marginTop: (config.popular || isCurrent) ? 8 : 0 }}>
                  <Icon size={20} color={config.accent || '#6366f1'} />
                </div>
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: isSmall ? 17 : 20, fontWeight: 700, color: t.text }}>{plan.name}</h3>

                {/* Price */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 8 }}>
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: isSmall ? 26 : 32, fontWeight: 800, color: t.text }}>
                    ₹{Number(plan.priceMonthly).toLocaleString('en-IN')}
                  </span>
                  <span style={{ fontSize: 13, color: t.textMuted }}>
                    {paymentType === 'subscription' ? '/month' : ' one-time'}
                  </span>
                </div>
                {paymentType === 'subscription' && (
                  <p style={{ fontSize: 12, color: '#22c55e', fontWeight: 600, marginTop: 4 }}>
                    Save ₹{(Number(plan.priceMonthly) * 2).toLocaleString('en-IN')} yearly →
                  </p>
                )}

                {/* Features */}
                <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(config.features || []).map((f: string) => (
                    <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: t.textMuted }}>
                      <CheckCircle size={15} color="#22c55e" style={{ flexShrink: 0, marginTop: 2 }} />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => handlePayment(plan.name, Number(plan.priceMonthly))}
                  disabled={isCurrent || loadingPlan === plan.name}
                  style={{
                    width: '100%', padding: '12px 0', borderRadius: 10, minHeight: 44,
                    fontSize: 14, fontWeight: 700, cursor: isCurrent ? 'default' : 'pointer',
                    fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    background: isCurrent
                      ? '#22c55e'
                      : config.popular
                        ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                        : 'transparent',
                    color: isCurrent || config.popular ? 'white' : t.text,
                    border: isCurrent || config.popular ? 'none' : `1px solid ${t.cardBd}`,
                    opacity: (isCurrent || loadingPlan === plan.name) ? 0.7 : 1,
                  }}
                >
                  {loadingPlan === plan.name ? (
                    <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />Processing...</>
                  ) : isCurrent ? (
                    <><CheckCircle size={16} />Current Plan</>
                  ) : (
                    <><CreditCard size={16} />{paymentType === 'subscription' ? 'Subscribe' : 'Pay Once'} — ₹{Number(plan.priceMonthly).toLocaleString('en-IN')}</>
                  )}
                </button>
              </div>
            );
          })}
      </div>

      {/* Cancel Subscription */}
      {isActive && subscription?.paymentType === 'subscription' && (
        <div style={{ ...card, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, borderColor: 'rgba(239,68,68,0.2)' }}>
          <div>
            <p style={{ fontWeight: 600, color: t.text, fontSize: 14 }}>Cancel Subscription</p>
            <p style={{ fontSize: 13, color: t.textMuted, marginTop: 2 }}>You'll retain access until end of billing period</p>
          </div>
          <button
            onClick={() => { if (confirm('Are you sure you want to cancel?')) cancelMutation.mutate(); }}
            disabled={cancelMutation.isPending}
            style={{
              padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, minHeight: 44,
              cursor: cancelMutation.isPending ? 'not-allowed' : 'pointer',
              background: 'transparent', color: '#ef4444',
              border: '1px solid rgba(239,68,68,0.3)',
              fontFamily: "'DM Sans', sans-serif",
              opacity: cancelMutation.isPending ? 0.6 : 1,
            }}
          >
            {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Subscription'}
          </button>
        </div>
      )}

      {/* Test Mode Notice */}
      <div style={{ ...card, padding: isSmall ? '12px 14px' : '14px 20px', display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', gap: 12, borderColor: 'rgba(234,179,8,0.25)', background: dark ? 'rgba(234,179,8,0.05)' : 'rgba(234,179,8,0.06)', flexWrap: 'wrap' }}>
        <AlertCircle size={18} color="#eab308" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: isSmall ? 12 : 13, color: t.textMuted, overflowWrap: 'break-word', wordBreak: 'break-word' }}>
          <strong style={{ color: t.text }}>Test Mode:</strong> Card:{' '}
          <code style={{ background: t.inBg, padding: '1px 5px', borderRadius: 4, fontFamily: 'monospace', fontSize: 12 }}>4111 1111 1111 1111</code>
          {' '}· Expiry: any future · CVV:{' '}
          <code style={{ background: t.inBg, padding: '1px 5px', borderRadius: 4, fontFamily: 'monospace', fontSize: 12 }}>123</code>
          {' '}· UPI:{' '}
          <code style={{ background: t.inBg, padding: '1px 5px', borderRadius: 4, fontFamily: 'monospace', fontSize: 12 }}>success@razorpay</code>
        </div>
      </div>
    </div>
  );
}