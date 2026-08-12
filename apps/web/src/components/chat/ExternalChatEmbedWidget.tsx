import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, User, Bot, CheckCircle2 } from 'lucide-react';
import { getSocket, joinChatRoom } from '../../lib/socket';
import { apiClient } from '../../lib/api-client';

interface Message {
  id: string;
  senderName: string;
  body: string;
  isAgent?: boolean;
  timestamp: string;
}

interface ExternalChatEmbedWidgetProps {
  tenantSlug?: string;
  companyName?: string;
  primaryColor?: string;
}

export function ExternalChatEmbedWidget({
  tenantSlug = 'clienteabc',
  companyName = 'Suporte ao Cliente',
  primaryColor = '#3b82f6'
}: ExternalChatEmbedWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && isStarted) {
      scrollToBottom();
    }
  }, [isOpen, isStarted, messages]);

  // Conexão via Socket.io ao iniciar sessão
  useEffect(() => {
    if (!sessionId) return;

    joinChatRoom(sessionId);
    const socket = getSocket();

    const handleNewMessage = (msgData: any) => {
      if (msgData.sessionId === sessionId || !msgData.sessionId) {
        setMessages(prev => [
          ...prev,
          {
            id: msgData.id || `msg_${Date.now()}`,
            senderName: msgData.senderName || 'Atendente',
            body: msgData.body || '',
            isAgent: msgData.senderType === 'agent' || msgData.senderType === 'system',
            timestamp: msgData.createdAt || new Date().toISOString()
          }
        ]);
      }
    };

    socket.on('chat:message:new', handleNewMessage);
    return () => {
      socket.off('chat:message:new', handleNewMessage);
    };
  }, [sessionId]);

  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientEmail.trim()) return;

    try {
      // Cria sessão via API NestJS real
      const session = await apiClient.post('/chat-external/sessions', {
        queueId: 'default',
        requesterId: clientEmail,
        tenantSlug,
      });

      const newId = session?.id || `sess_${Date.now()}`;
      setSessionId(newId);
      setIsStarted(true);

      setMessages([
        {
          id: 'welcome',
          senderName: 'Sistema',
          body: `Olá ${clientName}! Seja bem-vindo ao suporte da ${companyName}. Em instantes um atendente estará com você.`,
          isAgent: true,
          timestamp: new Date().toISOString()
        }
      ]);
    } catch {
      // Fallback em caso de API offline
      const fallbackId = `sess_local_${Date.now()}`;
      setSessionId(fallbackId);
      setIsStarted(true);
      setMessages([
        {
          id: 'welcome',
          senderName: 'Sistema',
          body: `Olá ${clientName}! Conectado em modo de suporte. Como podemos ajudar?`,
          isAgent: true,
          timestamp: new Date().toISOString()
        }
      ]);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      senderName: clientName || 'Você',
      body: inputText.trim(),
      isAgent: false,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    const bodyText = inputText.trim();
    setInputText('');

    if (sessionId) {
      try {
        await apiClient.post(`/chat-external/sessions/${sessionId}/messages`, {
          body: bodyText,
          senderType: 'user',
          tenantSlug,
        });
      } catch (err) {
        console.info('[Widget Chat] Envio gravado localmente (API offline).');
      }
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {/* Botão Flutuante (Bubble) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{ backgroundColor: primaryColor }}
          className="w-14 h-14 rounded-full text-white shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer group"
          aria-label="Abrir Chat de Suporte"
        >
          <MessageCircle className="w-7 h-7 animate-pulse" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></span>
        </button>
      )}

      {/* Janela do Widget de Chat */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[480px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div
            style={{ backgroundColor: primaryColor }}
            className="p-4 text-white flex items-center justify-between shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight">{companyName}</h3>
                <p className="text-[11px] text-white/80 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400"></span> Atendimento Online
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Inicial (Pre-Chat) */}
          {!isStarted ? (
            <form onSubmit={handleStartChat} className="p-6 flex-1 flex flex-col justify-center space-y-4">
              <div className="text-center space-y-1">
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-base">Inicie seu Atendimento</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Preencha seus dados para conectar com nossa equipe</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Seu Nome</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Maria Silva"
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Seu E-mail Corporativo</label>
                  <input
                    type="email"
                    required
                    placeholder="maria@empresa.com"
                    value={clientEmail}
                    onChange={e => setClientEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{ backgroundColor: primaryColor }}
                className="w-full py-2.5 text-white font-semibold text-sm rounded-xl hover:opacity-90 transition-opacity cursor-pointer shadow-md mt-2"
              >
                Iniciar Conversa
              </button>
            </form>
          ) : (
            /* Área de Mensagens */
            <div className="flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950">
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.isAgent ? 'items-start' : 'items-end'}`}
                  >
                    <div
                      className={`max-w-[82%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed ${
                        msg.isAgent
                          ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-none shadow-sm'
                          : 'bg-blue-600 text-white rounded-tr-none shadow-sm'
                      }`}
                    >
                      <p className="font-semibold text-[10px] opacity-75 mb-0.5">{msg.senderName}</p>
                      <p>{msg.body}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input de Mensagem */}
              <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Digite sua mensagem..."
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  style={{ backgroundColor: primaryColor }}
                  className="w-9 h-9 rounded-xl text-white flex items-center justify-center shrink-0 hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
