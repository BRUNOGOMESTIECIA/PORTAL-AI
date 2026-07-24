const fs = require('fs');
const path = require('path');

const chatWidgetPath = path.join(__dirname, 'src', 'portals', 'client', 'components', 'ChatWidget.tsx');

const newContent = `import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MessageCircle, X, Send, Bot, Minimize2, Paperclip } from 'lucide-react';
import { useAuth } from '../../../hooks/use-mock-auth';
import { useChats } from '../../../hooks/use-chats';
import { MockChatSession, MockChatMessage } from '../../../mocks/data';

const BUSINESS_HOURS = [
  { days: 'Seg – Sex', hours: '08:00 – 18:00' },
  { days: 'Sábado',    hours: '09:00 – 13:00' },
];

export function ChatWidget() {
  const { user } = useAuth();
  const { chats, createChat, updateChat } = useChats();
  const [open, setOpen] = useState(false); // Fechado por padrão, cliente clica para abrir
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [hoursTooltip, setHoursTooltip] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Busca o chat ativo atual do usuário
  const activeChat = useMemo(() => {
    if (!user) return null;
    return chats.find(c => c.clientEmail === user.email && c.status !== 'closed');
  }, [chats, user]);

  const messages = activeChat?.messages || [];

  // Sugestões contextuais baseadas na URL atual
  const pathname = window.location.pathname;
  let suggestions: string[] = [];
  if (pathname.includes('/tickets')) {
    suggestions = ['Status do meu chamado', 'Como reabrir chamado?'];
  } else if (pathname.includes('/kb')) {
    suggestions = ['Buscar artigo sobre rede', 'Como recuperar senha?'];
  } else if (pathname.includes('/profile')) {
    suggestions = ['Como alterar minha senha?', 'Atualizar meus dados'];
  } else {
    suggestions = ['Como abrir um chamado?', 'Falar com um técnico'];
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, open, minimized]);

  const startChat = async (initialMessage?: string) => {
    if (!user) return;
    
    const newChat: MockChatSession = {
      id: \`chat_\${Date.now()}\`,
      clientName: user.name,
      clientEmail: user.email,
      status: 'waiting',
      agentName: null,
      queue: 'Atendimento Geral',
      waitingMinutes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: []
    };

    if (initialMessage) {
      newChat.messages.push({
        id: \`m_user_\${Date.now()}\`,
        body: initialMessage,
        senderName: user.name,
        senderType: 'user',
        createdAt: new Date().toISOString()
      });
    }

    await createChat(newChat);
    setOpen(true);
    setMinimized(false);
  };

  const send = async (text: string) => {
    const msgBody = text.trim();
    if (!msgBody || !user) return;
    setInput('');

    if (!activeChat) {
      await startChat(msgBody);
      return;
    }

    const newMsg: MockChatMessage = {
      id: \`m_user_\${Date.now()}\`,
      body: msgBody,
      senderName: user.name,
      senderType: 'user',
      createdAt: new Date().toISOString()
    };

    await updateChat(activeChat.id, {
      messages: [...activeChat.messages, newMsg],
      updatedAt: new Date().toISOString()
    });
  };

  if (!open && !minimized && !activeChat) {
    return (
      <div className="fixed bottom-5 right-5 z-50">
        <button
          onClick={() => {
            setOpen(true);
            setMinimized(false);
            if (!activeChat) startChat();
          }}
          className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && !minimized && (
        <div className="w-[calc(100vw-40px)] sm:w-80 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col" style={{ height: 420 }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white rounded-t-2xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">Suporte</p>
                <div className="relative inline-block">
                  <p
                    className="text-xs text-blue-200 cursor-default select-none"
                    onMouseEnter={() => setHoursTooltip(true)}
                    onMouseLeave={() => setHoursTooltip(false)}
                  >
                    {activeChat?.status === 'active' ? \`Atendido por \${activeChat.agentName || 'Agente'}\` : 'Online agora'}
                  </p>

                  {hoursTooltip && (
                    <div className="absolute bottom-full left-0 mb-2 w-44 bg-slate-900 text-white rounded-xl shadow-xl px-3 py-2.5 pointer-events-none z-50">
                      <p className="text-xs font-semibold text-slate-300 mb-1.5">Horário de atendimento</p>
                      {BUSINESS_HOURS.map((slot) => (
                        <div key={slot.days} className="flex justify-between gap-3 text-xs leading-5">
                          <span className="text-slate-400 dark:text-slate-500">{slot.days}</span>
                          <span className="font-medium">{slot.hours}</span>
                        </div>
                      ))}
                      <div className="absolute top-full left-4 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setMinimized(true)} className="p-1 hover:bg-blue-500 rounded transition-colors">
                <Minimize2 className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => { setOpen(false); setMinimized(false); }} className="p-1 hover:bg-blue-500 rounded transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50 dark:bg-slate-900/50">
            {messages.length === 0 && (
               <div className="text-center text-xs text-slate-400 my-4">
                 Envie uma mensagem para iniciar o atendimento.
               </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={\`flex \${msg.senderType === 'user' ? 'justify-end' : 'justify-start'}\`}>
                {msg.senderType !== 'user' && (
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                    <Bot className="h-3 w-3 text-blue-600" />
                  </div>
                )}
                <div className={\`max-w-[80%] rounded-2xl px-3 py-2 text-sm \${msg.senderType === 'user' ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm shadow-sm border border-slate-100 dark:border-slate-700/50'}\`}>
                  {msg.body}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Contextual Suggestions */}
          {messages.length <= 1 && (
            <div className="px-3 pb-3 bg-slate-50 dark:bg-slate-900/50 flex flex-wrap gap-2">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => send(s)}
                  className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:border-blue-300 hover:text-blue-600 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700/50 rounded-b-2xl">
            <form
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              className="flex items-center gap-2"
            >
              <button type="button" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                <Paperclip className="h-4 w-4" />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:text-white"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
              >
                <Send className="h-4 w-4 ml-0.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Minimized state */}
      {minimized && (
        <button
          onClick={() => { setMinimized(false); setOpen(true); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        >
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="h-3 w-3" />
          </div>
          <span className="text-sm font-medium">TI & CIA</span>
          <span className="flex h-2 w-2 relative ml-1">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
             <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
        </button>
      )}
      
      {/* Closed State Button (always show if not open and not minimized but chat is active) */}
      {!open && !minimized && activeChat && (
        <button
          onClick={() => { setOpen(true); setMinimized(false); }}
          className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}
`;

fs.writeFileSync(chatWidgetPath, newContent);
console.log('ChatWidget refactored to use Firebase hooks.');
