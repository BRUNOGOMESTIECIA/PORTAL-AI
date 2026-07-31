import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MessageCircle, X, Send, Bot, Minimize2, Paperclip, Reply, Download, Star } from 'lucide-react';
import { useAuth } from '../../../hooks/use-mock-auth';
import { useChats } from '../../../hooks/use-chats';
import { MockChatSession, MockChatMessage } from '../../../mocks/data';
import { EmojiStickerPicker } from '../../../components/chat/EmojiStickerPicker';
import { exportChatTranscriptToPdf } from '../../../lib/export-utils';
import { formatTicketProtocol, logSecurityAudit } from '../../../lib/audit-logger';
import { QueuePositionWidget } from './QueuePositionWidget';
import { classifyTicketOrChatWithAi } from '../../../lib/ai-ticket-classifier';
import { useTypingIndicator } from '../../../hooks/use-typing-indicator';
import { TypingIndicator } from '../../../components/TypingIndicator';
import { validateAndSanitizeFile } from '../../../lib/file-upload-sanitizer';
import { ChatbotTriageWidget } from '../../../components/chat/ChatbotTriageWidget';
import { toast } from 'sonner';

const BUSINESS_HOURS = [
  { days: 'Seg – Sex', hours: '08:00 – 18:00' },
  { days: 'Sábado',    hours: '09:00 – 13:00' },
];

export function ChatWidget() {
  const { user } = useAuth();
  const { chats, createChat, updateChat } = useChats();
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [hoursTooltip, setHoursTooltip] = useState(false);
  const [widgetCsatScore, setWidgetCsatScore] = useState(0);
  const [widgetCsatHovered, setWidgetCsatHovered] = useState(0);
  const [widgetCsatComment, setWidgetCsatComment] = useState('');
  const [widgetCsatSubmitted, setWidgetCsatSubmitted] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const hiddenFileInputRef = useRef<HTMLInputElement>(null);

  const processAndUploadFile = async (file: File) => {
    toast.info(`Analisando ${file.name} no antivírus ClamAV...`);
    const sanitization = await validateAndSanitizeFile(file);

    if (!sanitization.safe) {
      toast.error(`[DOWNLOAD BLOQUEADO] ${sanitization.reason}`);
      return;
    }

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        send(`[GIF: Imagem Anexada] (${dataUrl})`);
        toast.success(`Imagem ${file.name} enviada com sucesso!`);
      };
      reader.readAsDataURL(file);
    } else {
      const sizeKb = (file.size / 1024).toFixed(1);
      send(`📄 [Arquivo Anexado: ${file.name}] (${sizeKb} KB)`);
      toast.success(`Arquivo ${file.name} anexado ao chat!`);
    }
  };

  const activeChat = useMemo(() => {
    if (!user) return null;
    const userChats = chats.filter(c => c.clientEmail === user.email || (c as any).clientId === user.id || (c as any).requesterId === user.email);
    if (userChats.length === 0) return null;
    const active = userChats.find(c => c.status !== 'closed');
    return active || userChats[0];
  }, [chats, user]);

  const { isPeerTyping, peerTypingName, notifyTyping, notifyStopTyping } = useTypingIndicator(
    activeChat?.id,
    'client',
    user?.name || 'Cliente'
  );

  const [open, setOpen] = useState(() => {
    const savedOpen = localStorage.getItem('portal_chat_open');
    if (savedOpen !== null) return JSON.parse(savedOpen);
    return false;
  });

  useEffect(() => {
    try {
      localStorage.setItem('portal_chat_open', JSON.stringify(open));
    } catch(e) {}
  }, [open]);

  // Se houver um atendimento ativo do cliente em andamento, mantém a janela aberta no F5
  useEffect(() => {
    if (activeChat && activeChat.status !== 'closed') {
      setOpen(true);
    }
  }, [activeChat?.id, activeChat?.status]);

  const messages = activeChat?.messages || [];

  // Sugestões contextuais baseadas na URL atual
  const pathname = window.location.pathname;
  let suggestions: string[] = [];
  if (pathname.includes('/tickets')) {
    suggestions = ['Status do meu ticket', 'Como reabrir ticket?'];
  } else if (pathname.includes('/kb')) {
    suggestions = ['Buscar artigo sobre rede', 'Como recuperar senha?'];
  } else if (pathname.includes('/profile')) {
    suggestions = ['Como alterar minha senha?', 'Atualizar meus dados'];
  } else {
    suggestions = ['Como abrir um ticket?', 'Falar com um técnico'];
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, open, minimized]);

  const startChat = async (initialMessage?: string) => {
    if (!user) return;
    
    const ticketNumber = String(Math.floor(Math.random() * 90000) + 10000);
    
    const aiClassification = initialMessage ? classifyTicketOrChatWithAi(initialMessage) : null;

    const newChat: MockChatSession = {
      id: `chat_${Date.now()}`,
      ticketId: ticketNumber,
      clientName: user.name,
      clientEmail: user.email,
      status: 'waiting',
      agentName: null,
      queue: aiClassification ? aiClassification.category : 'Atendimento Geral',
      waitingMinutes: 0,
      createdAt: new Date().toISOString(),
      messages: []
    };

    if (initialMessage) {
      newChat.messages.push({
        id: `m_user_${Date.now()}`,
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

  const [replyTo, setReplyTo] = useState<{ id: string; senderName: string; body: string } | null>(null);

  const send = async (text: string) => {
    const msgBody = text.trim();
    if (!msgBody || !user) return;
    setInput('');
    notifyStopTyping();

    if (!activeChat) {
      await startChat(msgBody);
      setReplyTo(null);
      return;
    }

    const newMsg: MockChatMessage = {
      id: `m_user_${Date.now()}`,
      body: msgBody,
      senderName: user.name,
      senderType: 'user',
      createdAt: new Date().toISOString(),
      ...(replyTo ? { replyTo } : {})
    };

    setReplyTo(null);

    await updateChat(activeChat.id, {
      messages: [...activeChat.messages, newMsg],
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
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingFile(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDraggingFile(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDraggingFile(false);
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              processAndUploadFile(e.dataTransfer.files[0]);
            }
          }}
          className="w-[calc(100vw-40px)] sm:w-80 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col relative overflow-hidden"
          style={{ height: 420 }}
        >
          {/* Overlay de Drag-and-Drop (Item 045) */}
          {isDraggingFile && (
            <div className="absolute inset-0 bg-blue-600/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-white p-6 text-center animate-in fade-in duration-150 border-4 border-dashed border-white/60 m-2 rounded-xl">
              <Paperclip className="w-10 h-10 animate-bounce mb-2" />
              <p className="font-bold text-sm">Solte o arquivo para enviar</p>
              <p className="text-[11px] text-blue-100 mt-1">Imagens, PDFs, documentos até 25MB (Varredura ClamAV)</p>
            </div>
          )}

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
                    {activeChat?.status === 'active' ? `Atendido por ${activeChat.agentName || 'Agente'}` : 'Online agora'}
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
              {activeChat && (
                <button
                  onClick={() => {
                    exportChatTranscriptToPdf({
                      id: activeChat.id,
                      protocol: activeChat.ticketId || activeChat.id,
                      clientName: user?.name || 'Cliente',
                      clientEmail: user?.email || '',
                      companyName: (user as any)?.company || 'Empresa B2B',
                      agentName: (activeChat as any)?.assignedOperatorName || (activeChat as any)?.assigneeName || 'Suporte TIECIA',
                      clientIp: '187.52.190.44',
                      messages: activeChat.messages.map(m => ({
                        senderName: m.senderName,
                        text: m.body,
                        timestamp: new Date(m.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                        isAgent: m.senderType === 'agent' || (m.senderType as string) === 'staff'
                      }))
                    });
                  }}
                  className="p-1 hover:bg-blue-500 rounded transition-colors text-white text-xs flex items-center gap-1 font-semibold"
                  title="Exportar Transcrição do Chat em PDF"
                >
                  <Download className="h-3.5 w-3.5" /> PDF
                </button>
              )}
              <button onClick={() => setMinimized(true)} className="p-1 hover:bg-blue-500 rounded transition-colors">
                <Minimize2 className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => { setOpen(false); setMinimized(false); }} className="p-1 hover:bg-blue-500 rounded transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50 dark:bg-slate-900">
            
            {/* Widget de Posição na Fila em Tempo Real (Item 117) */}
            {activeChat?.status === 'waiting' && (
              <>
                <QueuePositionWidget
                  queueName={activeChat.queue || 'Atendimento N1 Operacional'}
                  position={(activeChat as any).position || 2}
                  estimatedMinutes={(activeChat as any).waitingMinutes ? Math.max(1, (activeChat as any).waitingMinutes + 2) : 3}
                  activeAgentsCount={4}
                  ticketProtocol={formatTicketProtocol(activeChat.ticketId || activeChat.id)}
                />
                
                {/* Chatbot de Triagem Inicial com Árvore de Opções (Item 047) */}
                <ChatbotTriageWidget
                  onSelectOption={(opt) => {
                    send(`🤖 Escolheu: ${opt.label}`);
                  }}
                  onEscalateToHuman={async (cat, prio) => {
                    if (activeChat) {
                      await updateChat(activeChat.id, {
                        queue: cat || activeChat.queue,
                        messages: [
                          ...activeChat.messages,
                          {
                            id: `m_bot_sys_${Date.now()}`,
                            body: `🤖 [TRIAGEM BOT COMPLETA] Atendimento categorizado em "${cat || 'Geral'}" com prioridade ${prio || 'Média'}. Transferindo para a fila do Suporte N1.`,
                            senderName: 'Assistente Virtual',
                            senderType: 'system',
                            createdAt: new Date().toISOString()
                          }
                        ]
                      });
                      toast.success('Solicitação encaminhada ao Suporte Humano N1 com sucesso!');
                    }
                  }}
                  onResolvedByBot={async () => {
                    if (activeChat) {
                      await updateChat(activeChat.id, {
                        status: 'closed',
                        messages: [
                          ...activeChat.messages,
                          {
                            id: `m_bot_sys_${Date.now()}`,
                            body: `✅ Dúvida resolvida pelo Assistente Virtual da Base de Conhecimento. Atendimento concluído.`,
                            senderName: 'Assistente Virtual',
                            senderType: 'system',
                            createdAt: new Date().toISOString()
                          }
                        ]
                      });
                      toast.success('Atendimento concluído pelo Assistente Virtual. Obrigado!');
                    }
                  }}
                />
              </>
            )}

            {messages.length === 0 && activeChat?.status !== 'waiting' && (
               <div className="text-center text-xs text-slate-400 my-4">
                 Envie uma mensagem para iniciar o atendimento.
               </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex items-end gap-1.5 group ${msg.senderType === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.senderType === 'user' && (
                  <button
                    type="button"
                    onClick={() => setReplyTo({ id: msg.id, senderName: msg.senderName, body: msg.body })}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-500 rounded transition-opacity"
                    title="Citar esta mensagem"
                  >
                    <Reply className="w-3 h-3" />
                  </button>
                )}
                {msg.senderType !== 'user' && (
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-1 mt-0.5 flex-shrink-0">
                    <Bot className="h-3 w-3 text-blue-600" />
                  </div>
                )}
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${msg.senderType === 'user' ? 'bg-blue-600 text-white rounded-br-sm shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-sm shadow-sm border border-slate-200 dark:border-slate-700'}`}>
                  {msg.replyTo && (
                    <div className="mb-1.5 p-1.5 rounded-lg bg-black/10 dark:bg-black/30 border-l-2 border-blue-400 text-xs">
                      <span className="font-bold opacity-90 block mb-0.5">{msg.replyTo.senderName}</span>
                      <p className="truncate opacity-80 text-[11px]">{msg.replyTo.body}</p>
                    </div>
                  )}
                  {msg.body.startsWith('[GIF:') && msg.body.includes('http') ? (
                    <img 
                      src={msg.body.match(/\((.*?)\)/)?.[1] || ''} 
                      alt="GIF Animado" 
                      className="max-w-[180px] rounded-lg shadow-sm" 
                    />
                  ) : (
                    msg.body
                  )}
                </div>
                {msg.senderType !== 'user' && (
                  <button
                    type="button"
                    onClick={() => setReplyTo({ id: msg.id, senderName: msg.senderName, body: msg.body })}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-500 rounded transition-opacity"
                    title="Citar esta mensagem"
                  >
                    <Reply className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
            <TypingIndicator isTyping={isPeerTyping} name={peerTypingName || 'Atendente N1'} />
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

          {/* Input or Closed Status */}
          <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700/50 rounded-b-2xl">
            {replyTo && (
              <div className="flex items-center justify-between px-2.5 py-1.5 bg-blue-50 dark:bg-slate-900 border-l-4 border-blue-500 rounded-lg mb-2 text-xs">
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-blue-600 dark:text-blue-400">Respondendo a {replyTo.senderName}:</span>
                  <p className="text-slate-600 dark:text-slate-300 truncate text-[11px]">{replyTo.body}</p>
                </div>
                <button type="button" onClick={() => setReplyTo(null)} className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            {activeChat?.status === 'closed' ? (
              <div className="text-center py-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
                {widgetCsatSubmitted ? (
                  <div>
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-2">✓ Avaliação enviada! Obrigado pelo seu feedback.</p>
                    <button onClick={() => { setWidgetCsatSubmitted(false); setWidgetCsatScore(0); setWidgetCsatComment(''); startChat(); }} className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer">
                      Iniciar novo atendimento
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">Como você avalia este atendimento?</p>
                    <div className="flex justify-center gap-1.5 mb-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setWidgetCsatScore(n)}
                          onMouseEnter={() => setWidgetCsatHovered(n)}
                          onMouseLeave={() => setWidgetCsatHovered(0)}
                          className="transition-transform hover:scale-110 cursor-pointer"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              n <= (widgetCsatHovered || widgetCsatScore)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300 dark:text-slate-600'
                            }`}
                          />
                        </button>
                      ))}
                    </div>

                    <textarea
                      value={widgetCsatComment}
                      onChange={(e) => setWidgetCsatComment(e.target.value)}
                      placeholder="Deixe seu comentário sobre o suporte (opcional)..."
                      rows={2}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 mb-2"
                    />

                    <div className="flex items-center justify-between gap-2">
                      <button onClick={() => startChat()} className="text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors cursor-pointer">
                        Iniciar novo
                      </button>
                      <button
                        disabled={widgetCsatScore === 0}
                        onClick={async () => {
                          setWidgetCsatSubmitted(true);
                          if (activeChat) {
                            await updateChat(activeChat.id, {
                              rating: widgetCsatScore,
                              ratingComment: widgetCsatComment
                            } as any);

                            logSecurityAudit({
                              protocol: formatTicketProtocol(activeChat.ticketId || activeChat.id),
                              action: `Avaliação CSAT Chat (${widgetCsatScore} Estrelas)`,
                              originPortal: 'Portal do Cliente',
                              userName: user?.name || 'Cliente',
                              userEmail: user?.email || '',
                              details: widgetCsatComment ? `Comentário: ${widgetCsatComment}` : 'Sem comentário'
                            });
                          }
                        }}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        Enviar Avaliação
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <form
                onSubmit={(e) => { e.preventDefault(); send(input); }}
                className="flex items-center gap-2"
              >
                <input
                  type="file"
                  ref={hiddenFileInputRef}
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      processAndUploadFile(e.target.files[0]);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => hiddenFileInputRef.current?.click()}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
                  title="Anexar arquivo ou imagem"
                >
                  <Paperclip className="h-4 w-4" />
                </button>
                <EmojiStickerPicker
                  onSelectEmoji={(emoji) => setInput(prev => prev + emoji)}
                  onSelectSticker={(stickerText) => send(stickerText)}
                />
                <input
                  type="text"
                  value={input}
                  onChange={(e) => {
                    const val = e.target.value;
                    setInput(val);
                    if (val.trim()) {
                      notifyTyping();
                    } else {
                      notifyStopTyping();
                    }
                  }}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
                >
                  <Send className="h-4 w-4 ml-0.5" />
                </button>
              </form>
            )}
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
