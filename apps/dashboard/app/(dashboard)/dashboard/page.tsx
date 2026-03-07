'use client';

import { useAuthStore } from '@/store/auth.store';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Bot,
  BookOpen,
  MessageSquare,
  Key,
  Copy,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function DashboardPage() {
  const { organization, user } = useAuthStore();
  const [copied, setCopied] = useState(false);

  const widgetScript = `<script src="https://fluxypy-chat-api.onrender.com/widget/chatbot.js" data-api-key="${organization?.apiKey}" async defer></script>`;

  const copyScript = () => {
    navigator.clipboard.writeText(widgetScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Welcome back! 👋
        </h1>
        <p className="text-slate-500 mt-1">
          {organization?.name} — Fluxypy Bot Dashboard
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Plan
            </CardTitle>
            <Bot className="w-4 h-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organization?.plan?.name || 'Free'}
            </div>
            <Badge variant="secondary" className="mt-1">
              {organization?.status}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Knowledge Base
            </CardTitle>
            <BookOpen className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Ready</div>
            <Link
              href="/dashboard/knowledge"
              className="text-xs text-indigo-600 hover:underline"
            >
              Manage sources →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Chat Widget
            </CardTitle>
            <MessageSquare className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <Link
              href="/dashboard/chat"
              className="text-xs text-indigo-600 hover:underline"
            >
              Test your bot →
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Widget Script */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-indigo-500" />
            Add Fluxypy Bot to Your Website
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-500">
            Copy and paste this script tag into your website&apos;s HTML,
            just before the closing{' '}
            <code className="bg-slate-100 px-1 rounded">&lt;/body&gt;</code>{' '}
            tag.
          </p>

          <div className="bg-slate-900 rounded-lg p-4 flex items-start justify-between gap-4">
            <code className="text-green-400 text-xs font-mono break-all flex-1">
              {widgetScript}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={copyScript}
              className="shrink-0 border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700"
            >
              {copied ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/dashboard/knowledge">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Upload Knowledge Base</h3>
                <p className="text-sm text-slate-500">
                  Add PDFs, docs, or text
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/chat">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Test Your Bot</h3>
                <p className="text-sm text-slate-500">
                  Chat with your AI assistant
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}