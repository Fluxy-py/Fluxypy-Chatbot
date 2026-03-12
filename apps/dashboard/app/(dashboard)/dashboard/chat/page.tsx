'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { chatApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Send, User, Loader2, RefreshCw } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: any[];
  responseTime?: number;
}

export default function ChatTestPage() {
  const { organization } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hi! I'm ${organization?.settings?.botName || 'Fluxypy Bot'}. Ask me anything about your knowledge base!`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => uuidv4());
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading || !organization?.apiKey) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await chatApi.sendMessage(
        organization.apiKey,
        userMessage,
        sessionId,
      );
      const { message, sources, responseTime } = response.data;
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: message, sources, responseTime },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: `Hi! I'm Fluxypy Bot. Ask me anything about your knowledge base!`,
      },
    ]);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-slate-900">Test Your Bot</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Chat with your AI assistant powered by your knowledge base
          </p>
        </div>
        <Button variant="outline" onClick={resetChat} size="sm" className="min-h-[44px]">
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset Chat
        </Button>
      </div>

      <Card className="h-[calc(100vh-220px)] sm:h-[600px] flex flex-col">
        <CardHeader className="border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-500 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-base">
                {organization?.settings?.botName || 'Fluxypy Bot'}
              </CardTitle>
              <CardDescription className="text-xs">
                Powered by your knowledge base
              </CardDescription>
            </div>
            <Badge className="ml-auto bg-green-100 text-green-700 border-0">
              Online
            </Badge>
          </div>
        </CardHeader>

        {/* Messages */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'assistant'
                    ? 'bg-indigo-500'
                    : 'bg-slate-200'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <Bot className="w-4 h-4 text-white" />
                ) : (
                  <User className="w-4 h-4 text-slate-600" />
                )}
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-sm'
                    : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>

                {/* Sources */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-200">
                    <p className="text-xs text-slate-400 mb-1">Sources:</p>
                    {msg.sources.map((s, j) => (
                      <span
                        key={j}
                        className="text-xs bg-white px-2 py-0.5 rounded border border-slate-200 mr-1"
                      >
                        📄 {s.sourceName} ({(s.score * 100).toFixed(0)}%)
                      </span>
                    ))}
                  </div>
                )}

                {/* Response time */}
                {msg.responseTime && (
                  <p className="text-xs text-slate-400 mt-1">
                    {(msg.responseTime / 1000).toFixed(1)}s
                  </p>
                )}
              </div>
            </div>
          ))}

          {/* Loading bubble */}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </CardContent>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your bot a question..."
              disabled={loading}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 min-h-[44px] min-w-[44px]"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-slate-400 mt-2 text-center">
            Press Enter to send
          </p>
        </div>
      </Card>
    </div>
  );
}