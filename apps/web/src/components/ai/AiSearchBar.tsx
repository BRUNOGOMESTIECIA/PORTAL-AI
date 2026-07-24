import React, { useRef, useState } from 'react';
import { Bot, Loader2, Send, X } from 'lucide-react';
import { apiPost } from '../../services/api';
import { useSocket } from '../../hooks/use-socket';
import { SocketEvent } from '@portal/shared';
import { cn } from '../../lib/utils';

interface AiMessage {
  role: 'user' | 'assistant';
  content: string;
  wasFallback?: boolean;
}

interface AiSearchBarProps {
  compact?: boolean;
}

export function AiSearchBar({ compact = false }: AiSearchBarProps) {
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { socket } = useSocket();

  // Listen for AI service unavailability
  React.useEffect(() => {
    if (!socket) return;
    socket.on(SocketEvent.AI_SERVICE_UNAVAILABLE, () => {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: '⚠️ O serviço de IA está temporariamente indisponível. Um agente humano pode ajudá-lo — por favor, utilize o chat de suporte.',
        wasFallback: true,
      }]);
      setIsLoading(false);
    });
  }, [socket]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const res = await apiPost<{ content: string; wasFallback: boolean; conversationId: string }>(
        '/ai/chat',
        { message: userMsg, history: messages.slice(-10) },
      );

      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: res.content,
        wasFallback: res.wasFallback,
      }]);

      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'Desculpe, não consegui processar sua solicitação. Por favor, tente novamente.',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (compact && !expanded) {
    return (
      <button
        onClick={() => { setExpanded(true); setTimeout(() => inputRef.current?.focus(), 50); }}
        className="flex w-full items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-ring transition-colors"
      >
        <Bot className="h-4 w-4" />
        <span className="truncate">Pergunte à IA…</span>
      </button>
    );
  }

  return (
    <div className={cn('flex flex-col', compact ? 'w-full' : 'w-full max-w-2xl mx-auto')}>
      {/* Messages */}
      {(expanded || !compact) && messages.length > 0 && (
        <div className="mb-3 max-h-80 overflow-y-auto space-y-3 rounded-lg border border-border bg-card p-3">
          {messages.map((msg, i) => (
            <div key={i} className={cn('flex gap-2', msg.role === 'user' && 'flex-row-reverse')}>
              <div className={cn(
                'rounded-lg px-3 py-2 text-sm max-w-[80%]',
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : msg.wasFallback
                    ? 'bg-destructive/10 text-destructive border border-destructive/20'
                    : 'bg-muted text-foreground',
              )}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2">
              <div className="rounded-lg px-3 py-2 bg-muted">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-md border border-input bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1 transition-all">
          <Bot className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte à IA ou descreva um problema…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            disabled={isLoading}
          />
          {messages.length > 0 && (
            <button
              type="button"
              onClick={() => { setMessages([]); setExpanded(false); }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}
