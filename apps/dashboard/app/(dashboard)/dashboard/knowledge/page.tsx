'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { knowledgeApi } from '@/lib/api';
import { KnowledgeSource } from '@/types';
import { useThemeStore, getTokens } from '@/store/theme.store';
import {
  Upload, Trash2, FileText, CheckCircle,
  XCircle, Clock, RefreshCw, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

const statusMap: Record<string, { color: string; bg: string; bd: string; label: string }> = {
  READY: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', bd: 'rgba(34,197,94,0.2)', label: 'Ready' },
  PROCESSING: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', bd: 'rgba(245,158,11,0.2)', label: 'Processing' },
  PENDING: { color: '#6366f1', bg: 'rgba(99,102,241,0.1)', bd: 'rgba(99,102,241,0.2)', label: 'Pending' },
  FAILED: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', bd: 'rgba(239,68,68,0.2)', label: 'Failed' },
};

const statusIcon: Record<string, React.FC<{ size?: number; color?: string; style?: React.CSSProperties }>> = {
  READY: CheckCircle,
  PROCESSING: Loader2,
  PENDING: Clock,
  FAILED: XCircle,
};

const typeColor: Record<string, string> = {
  PDF: '#ef4444',
  DOCX: '#3b82f6',
  TXT: '#6b7280',
};

export default function KnowledgePage() {
  const { dark } = useThemeStore();
  const t = getTokens(dark);
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [w, setW] = useState(1200);

  useEffect(() => {
    const u = () => setW(window.innerWidth);
    u();
    window.addEventListener('resize', u);
    return () => window.removeEventListener('resize', u);
  }, []);

  const isMobile = w < 640;
  const isSmall = w < 440;

  const { data: sources = [], isLoading } = useQuery({
    queryKey: ['knowledge'],
    queryFn: async () => {
      const res = await knowledgeApi.list();
      return res.data as KnowledgeSource[];
    },
    refetchInterval: (query) => {
      const data = query.state.data as KnowledgeSource[] | undefined;
      const hasProcessing = (data || []).some(
        (s) => s.status === 'PROCESSING' || s.status === 'PENDING',
      );
      return hasProcessing ? 3000 : false;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => knowledgeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge'] });
      toast.success('Deleted successfully');
    },
    onError: () => toast.error('Delete failed'),
  });

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', file.name.replace(/\.[^/.]+$/, ''));
    setUploading(true);
    try {
      await knowledgeApi.upload(formData);
      queryClient.invalidateQueries({ queryKey: ['knowledge'] });
      toast.success('File uploaded! Processing started.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const card: React.CSSProperties = {
    background: t.cardBg,
    border: `1px solid ${t.cardBd}`,
    borderRadius: isSmall ? 12 : 16,
    padding: isSmall ? '14px 14px' : '20px 24px',
    boxShadow: t.shadow,
    transition: 'all 0.2s',
  };

  const shimmer: React.CSSProperties = {
    background: dark
      ? 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)'
      : 'linear-gradient(90deg, rgba(0,0,0,0.04) 25%, rgba(0,0,0,0.08) 50%, rgba(0,0,0,0.04) 75%)',
    backgroundSize: '200% auto',
    animation: 'shimmer 1.5s linear infinite',
    borderRadius: 8,
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: isSmall ? 16 : 24 }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(20px, 2.5vw, 26px)', fontWeight: 800, letterSpacing: '-0.025em', color: t.text, marginBottom: 4 }}>
          Knowledge Base
        </h1>
        <p style={{ fontSize: isSmall ? 13 : 14, color: t.textMuted }}>Upload documents to train your AI chatbot</p>
      </div>

      {/* Upload Zone */}
      <div
        style={{
          ...card,
          border: dragOver ? '2px solid #6366f1' : '2px dashed rgba(99,102,241,0.3)',
          background: dragOver ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.05)',
          textAlign: 'center',
          cursor: 'pointer',
          padding: isSmall ? '24px 14px' : '40px 24px',
          marginBottom: 24,
          transition: 'all 0.2s',
        }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileUpload(e.dataTransfer.files); }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input ref={fileInputRef} type="file" style={{ display: 'none' }} accept=".pdf,.docx,.txt" onChange={(e) => handleFileUpload(e.target.files)} />
        {uploading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 18, height: 18, border: '2px solid rgba(99,102,241,0.3)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ fontSize: 14, fontWeight: 600, color: t.text }}>Uploading...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: isSmall ? 10 : 12 }}>
            <div style={{ width: isSmall ? 44 : 56, height: isSmall ? 44 : 56, borderRadius: isSmall ? 12 : 16, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Upload size={isSmall ? 20 : 24} color="#6366f1" />
            </div>
            <div>
              <p style={{ fontSize: isSmall ? 14 : 15, fontWeight: 600, color: t.text }}>{isMobile ? 'Tap to upload files' : 'Drag files here or click to browse'}</p>
              <p style={{ fontSize: isSmall ? 12 : 13, color: t.textMuted, marginTop: 4 }}>PDF, DOCX, TXT up to 10MB</p>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
              {['PDF', 'TXT', 'DOCX', 'MD'].map((fmt) => (
                <span key={fmt} style={{ fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 100, background: t.inBg, color: t.textMuted, border: `1px solid ${t.inBd}` }}>{fmt}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Files List */}
      <div style={card}>
        <div style={{
          display: 'flex', alignItems: isSmall ? 'flex-start' : 'center',
          flexDirection: isSmall ? 'column' : 'row',
          justifyContent: 'space-between', marginBottom: isSmall ? 12 : 16, gap: isSmall ? 10 : 0,
        }}>
          <div>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: isSmall ? 15 : 16, color: t.text, margin: 0 }}>
              Knowledge Sources
            </h3>
            <p style={{ fontSize: isSmall ? 12 : 13, color: t.textMuted, marginTop: 2 }}>
              {sources.length} document{sources.length !== 1 ? 's' : ''} in your knowledge base
            </p>
          </div>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['knowledge'] })}
            style={{
              background: 'transparent',
              color: dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
              border: `1px solid ${t.cardBd}`,
              borderRadius: 10, padding: isSmall ? '8px 12px' : '8px 14px', fontSize: 13,
              fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6,
              minHeight: 44, width: isSmall ? '100%' : undefined, justifyContent: isSmall ? 'center' : undefined,
            }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ ...shimmer, height: 60 }} />
            ))}
          </div>
        ) : sources.length === 0 ? (
          <div style={{ textAlign: 'center', padding: isSmall ? '32px 14px' : isMobile ? '40px 20px' : '48px 24px' }}>
            <div style={{ width: isSmall ? 44 : 56, height: isSmall ? 44 : 56, borderRadius: isSmall ? 12 : 16, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <FileText size={isSmall ? 20 : 24} color="#6366f1" />
            </div>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: isSmall ? 14 : 16, fontWeight: 700, color: t.text, marginBottom: 6 }}>No documents yet</h3>
            <p style={{ fontSize: isSmall ? 12 : 14, color: t.textMuted, maxWidth: 280, margin: '0 auto' }}>Upload your first document above to get started</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sources.map((source) => {
              const st = statusMap[source.status] || statusMap.PENDING;
              const SIcon = statusIcon[source.status] || Clock;
              const fType = source.type?.toUpperCase() || 'TXT';
              const isProcessing = source.status === 'PROCESSING';

              return (
                <div
                  key={source.id}
                  style={{
                    display: 'flex',
                    alignItems: isMobile ? 'flex-start' : 'center',
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: isMobile ? 'flex-start' : 'space-between',
                    gap: isMobile ? 10 : 0,
                    padding: isSmall ? '12px' : '14px 16px',
                    borderRadius: 12,
                    background: isProcessing ? undefined : t.inBg,
                    border: `1px solid ${t.inBd}`,
                    transition: 'all 0.2s',
                    ...(isProcessing ? {
                      background: dark
                        ? 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.04) 75%)'
                        : 'linear-gradient(90deg, rgba(0,0,0,0.03) 25%, rgba(0,0,0,0.06) 50%, rgba(0,0,0,0.03) 75%)',
                      backgroundSize: '200% auto',
                      animation: 'shimmer 1.5s linear infinite',
                    } : {}),
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: isSmall ? 10 : 12, flex: 1, minWidth: 0 }}>
                    <div style={{
                      width: isSmall ? 32 : 38, height: isSmall ? 32 : 38, borderRadius: isSmall ? 8 : 10,
                      background: `${typeColor[fType] || '#6b7280'}15`,
                      border: `1px solid ${typeColor[fType] || '#6b7280'}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <FileText size={isSmall ? 15 : 18} color={typeColor[fType] || '#6b7280'} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: isSmall ? 13 : 14, fontWeight: 600, color: t.text, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{source.name}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                        <span style={{ fontSize: 11, fontWeight: 500, padding: '1px 7px', borderRadius: 100, background: t.inBg, color: t.textMuted, border: `1px solid ${t.inBd}` }}>{fType}</span>
                        {source.chunkCount > 0 && (
                          <span style={{ fontSize: 11, color: t.textMuted }}>{source.chunkCount} chunks</span>
                        )}
                        {source.errorMsg && (
                          <span style={{ fontSize: 11, color: '#ef4444' }}>{source.errorMsg}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 10, flexShrink: 0, ...(isMobile ? { alignSelf: 'flex-end' } : {}) }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '3px 10px', borderRadius: 100,
                      fontSize: 11, fontWeight: 600,
                      background: st.bg, color: st.color,
                      border: `1px solid ${st.bd}`,
                    }}>
                      <SIcon size={12} color={st.color} style={isProcessing ? { animation: 'spin 1s linear infinite' } : {}} />
                      {st.label}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(source.id); }}
                      disabled={deleteMutation.isPending}
                      style={{
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        color: t.textDim, padding: isSmall ? 8 : 6, borderRadius: 8,
                        display: 'flex', transition: 'all 0.2s',
                        minWidth: 36, minHeight: 36, alignItems: 'center', justifyContent: 'center',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = t.textDim; e.currentTarget.style.background = 'transparent'; }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}