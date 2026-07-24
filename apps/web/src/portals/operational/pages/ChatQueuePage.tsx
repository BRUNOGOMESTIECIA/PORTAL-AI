import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, Plus, Clock, MessageCircle, User, Send, CheckCircle, ArrowRightLeft, Image as ImageIcon, FileText, PanelRight, X, ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';
import { MockChatSession, MockChatMessage, MOCK_CLIENTS, MOCK_STAFF, MOCK_MACROS } from '../../../mocks/data';
import { ContextPanel } from '../components/ContextPanel';
import { useAuth } from '../../../hooks/use-mock-auth';
import { useChats } from '../../../hooks/use-chats';

type ChatTab = 'entrada' | 'meus' | 'em_atendimento' | 'encerrados';

function getCompanyByEmail(clientEmail: string) {
  if (!clientEmail) return 'Empresa desconhecida';
  const domain = clientEmail.split('@')[1];
  if (!domain) return 'Empresa desconhecida';
  
  const match = MOCK_CLIENTS.find(c => c.email.split('@')[1] === domain);
  if (match && match.company) return match.company;
  
  const name = domain.split('.')[0];
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function formatTimeBR(dateString: string | undefined) {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  } catch(e) {
    return '';
  }
}

export default function ChatQueuePage() {
  const { hasPermission, user } = useAuth();
  const { chats, updateChat } = useChats();
  const [searchParams] = useSearchParams();
  
  const [selectedId, setSelectedId] = useState<string | null>('ch_andre');
  const selected = chats.find(c => c.id === selectedId) || null;
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState<ChatTab>('em_atendimento');
  const [search, setSearch] = useState('');
  const [forceRender, setForceRender] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [sunTzuMode, setSunTzuMode] = useState(() => {
    const saved = localStorage.getItem('portal_sun_tzu_mode');
    return saved !== null ? JSON.parse(saved) : false;
  });

  const isAdmin = user && 'role' in user && (user as any).role === 'Administrator';
  const isSunTzuBlocked = sunTzuMode && !isAdmin;

  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem('portal_sun_tzu_mode');
      setSunTzuMode(saved !== null ? JSON.parse(saved) : false);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const [macros, setMacros] = useState<{command: string; text: string}[]>(() => {
    const saved = localStorage.getItem('portal_macros');
    return saved ? JSON.parse(saved) : MOCK_MACROS;
  });

  const [chatPriorities, setChatPriorities] = useState<Record<string, string>>({
    'ch_andre': 'alta'
  });

  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [isInternalNote, setIsInternalNote] = useState(false);

  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem('portal_macros');
      setMacros(saved ? JSON.parse(saved) : MOCK_MACROS);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selected) {
      toast.success(`Anexo "${file.name}" enviado com sucesso.`);
      const newMsg: MockChatMessage = {
        id: 'attach_' + Date.now(),
        body: `[Anexo enviado: ${file.name}]`,
        senderName: user?.name || 'Agente',
        senderType: 'agent',
        createdAt: new Date().toISOString()
      };
      updateChat(selected.id, { messages: [...selected.messages, newMsg] });
    }
  };

  // Seleciona o chat automaticamente se a URL tiver o parâmetro chatId (ex: ao clicar no alerta)
  useEffect(() => {
    const chatId = searchParams.get('chatId');
    if (chatId) {
      const chat = chats.find(c => c.id === chatId);
      if (chat) {
        setSelectedId(chat.id);
        // Atualiza também a aba para corresponder ao status do chat selecionado
        if (chat.status === 'waiting') setActiveTab('entrada');
        else if (chat.status === 'active') setActiveTab('em_atendimento');
        else if (chat.status === 'closed') setActiveTab('encerrados');
      }
    }
  }, [searchParams]);

  // Keep track of active chat globally so NewManualTicketModal can auto-fill
  useEffect(() => {
    if (selectedId) {
      localStorage.setItem('portal_active_chat', selectedId);
    } else {
      localStorage.removeItem('portal_active_chat');
    }
    // Cleanup on unmount if we leave the page
    return () => localStorage.removeItem('portal_active_chat');
  }, [selectedId]);
  
  const [showTransferMenu, setShowTransferMenu] = useState(false);
  const transferRef = useRef<HTMLDivElement>(null);

  // Hook para detectar cliques fora do menu de transferência e fechá-lo
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (transferRef.current && !transferRef.current.contains(e.target as Node)) {
        setShowTransferMenu(false);
      }
    }
    if (showTransferMenu) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [showTransferMenu]);

  const wsRef = useRef<WebSocket | null>(null);

  // Scroll automático para o final quando houver nova mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selected?.messages.length, forceRender]);

  // Conexão com o painel cliente via WebSocket (Rede Local) ou BroadcastChannel
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/mock-chat`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'client_msg') {
          const targetChatId = selected?.id || chats.find(c => c.status === 'active' || c.status === 'waiting')?.id;
          if (targetChatId) {
            const chatInMock = chats.find(c => c.id === targetChatId);
            if (chatInMock) {
              chatInMock.messages.push({
                id: `m_user_sync_${Date.now()}`,
                body: data.body,
                senderName: chatInMock.clientName,
                senderType: 'user',
                createdAt: new Date().toISOString()
              });
              if (selected?.id === chatInMock.id) {
                
              }
              
            }
          }
        }
      } catch (e) {}
    };

    const channel = new BroadcastChannel('chat_sync');
    channel.onmessage = (event) => {
      if (event.data.type === 'client_msg') {
        // Pega o chat atualmente selecionado, ou o primeiro ativo/esperando
        const targetChatId = selected?.id || chats.find(c => c.status === 'active' || c.status === 'waiting')?.id;
        if (targetChatId) {
          const chatInMock = chats.find(c => c.id === targetChatId);
          if (chatInMock) {
            chatInMock.messages.push({
              id: `m_user_sync_${Date.now()}`,
              body: event.data.body,
              senderName: chatInMock.clientName,
              senderType: 'user',
              createdAt: new Date().toISOString()
            });
            if (selected?.id === chatInMock.id) {
              
            }
            
          }
        }
      }
    };
    return () => {
      ws.close();
      channel.close();
    };
  }, [selected?.id]);

  // ── Auto-reply imediato: Boas-vindas ao entrar na fila ──
  useEffect(() => {
    let changed = false;
    chats.forEach(chat => {
      if (chat.status === 'waiting') {
        const hasWelcome = chat.messages.some(m => m.senderType === 'system' && m.body.includes('Podemos ajudar'));
        if (!hasWelcome) {
          updateChat(chat.id, { messages: [...chat.messages, {
            id: `welcome_${Date.now()}_${Math.random()}`,
            body: 'Olá! Em que Podemos ajudar?',
            senderName: 'Sistema',
            senderType: 'system',
            createdAt: new Date().toISOString()
          }] });
          changed = true;
        }
      }
    });
    
    if (changed) {
      // Forçar atualização do chat selecionado se ele estiver na fila de entrada
      
      
    }
  }, []);

  

  // Seleção via URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cId = params.get('chatId');
    if (cId) {
      const found = chats.find(c => c.id === cId);
      if (found) {
        setSelectedId(found.id);
        setActiveTab(found.status === 'waiting' ? 'entrada' : found.status === 'active' ? 'em_atendimento' : 'encerrados');
      }
    }
  }, []);

  const handleStatusChange = async (newStatus: 'waiting' | 'active' | 'finished' | 'closed') => {
    if (selected) {
      const chatInMock = chats.find(c => c.id === selected.id);
      if (chatInMock) {
        if (newStatus === 'active') {
          const welcomeMsg: MockChatMessage = {
            id: `m_agent_${Date.now()}`,
            body: `Olá, bem-vindo! Tudo bem? Meu nome é ${user?.name || 'Atendente'} e eu irei seguir com o seu atendimento.`,
            senderName: user?.name || 'Você',
            senderType: 'agent',
            createdAt: new Date().toISOString()
          };
          
          setActiveTab('em_atendimento');
          await updateChat(chatInMock.id, { 
            status: newStatus, 
            agentName: user?.name || 'Atendente',
            messages: [...chatInMock.messages, welcomeMsg] 
          });

          // Simular o cliente respondendo às boas-vindas para iniciar o timer de inatividade de 2m
          setTimeout(() => {
            const currentChat = chats.find(c => c.id === chatInMock.id);
            if (!currentChat || currentChat.status !== 'active') return;

            const clientReply: MockChatMessage = {
              id: `m_user_${Date.now()}`,
              body: 'Oi, tudo bem. Preciso de ajuda com um problema.',
              senderName: currentChat.clientName,
              senderType: 'user',
              createdAt: new Date().toISOString()
            };
            
            updateChat(currentChat.id, { messages: [...currentChat.messages, clientReply] });
          }, 4000);
        } else {
          setActiveTab(newStatus === 'waiting' ? 'entrada' : 'encerrados');
          await updateChat(chatInMock.id, { status: newStatus });
        }
      }
    }
  };

  const handleSendMessage = () => {
    if (!input.trim() || !selected || selected.status === 'waiting' || !hasPermission('chat.attend')) return;

    const newMsg: MockChatMessage = {
      id: `m_agent_${Date.now()}`,
      body: input.trim(),
      senderName: 'Você',
      senderType: isInternalNote ? 'internal' : 'agent',
      createdAt: new Date().toISOString()
    };

    const chatInMock = chats.find(c => c.id === selected.id);
    if (chatInMock) {
      updateChat(chatInMock.id, { messages: [...chatInMock.messages, newMsg] });
      
    }

    setInput('');
    

    // Envia a mensagem para o painel do cliente pela rede local se não for nota interna
    if (!isInternalNote) {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'agent_msg', body: newMsg.body }));
      } else {
        const channel = new BroadcastChannel('chat_sync');
        channel.postMessage({ type: 'agent_msg', body: newMsg.body });
        channel.close();
      }
    }

    // (Mock removal: removed automatic client reply simulation to allow real local network testing)
    if (isInternalNote) {
      // Simular resposta de um colega atendente se ele for mencionado na nota interna
      const mentionedStaff = MOCK_STAFF.find(s => input.includes(`@${s.name}`));
      if (mentionedStaff) {
        setTimeout(() => {
          const chatInMockNow = chats.find(c => c.id === selected.id);
          if (!chatInMockNow || chatInMockNow.status !== 'active') return;

          const staffReply: MockChatMessage = {
            id: `m_staff_${Date.now()}`,
            body: `Oi! Vi que você me marcou na nota. Como posso ajudar neste caso?`,
            senderName: mentionedStaff.name,
            senderType: 'internal',
            createdAt: new Date().toISOString()
          };
          
          updateChat(chatInMockNow.id, { messages: [...chatInMockNow.messages, staffReply] });
          
          
        }, 3500); // 3.5 segundos para parecer natural
      }
    }
  };

  // ── Mock Filters ──
  const waiting = chats.filter(c => c.status === 'waiting');
  const active  = chats.filter(c => c.status === 'active');
  const closed  = chats.filter(c => c.status === 'closed'); // Assume exists in mock or just empty

  const getChatsForTab = () => {
    switch (activeTab) {
      case 'entrada': return waiting;
      case 'meus': return active; // Mock: treating 'active' as mine
      case 'em_atendimento': return active; 
      case 'encerrados': return closed;
      default: return [];
    }
  };

  const currentChats = getChatsForTab()
    .filter(c => 
      c.clientName.toLowerCase().includes(search.toLowerCase()) || 
      (c.ticketId && c.ticketId.includes(search))
    )
    .sort((a, b) => {
      const aLast = a.messages[a.messages.length - 1];
      const bLast = b.messages[b.messages.length - 1];
      const aTime = aLast ? new Date(aLast.createdAt).getTime() : new Date(a.createdAt).getTime();
      const bTime = bLast ? new Date(bLast.createdAt).getTime() : new Date(b.createdAt).getTime();
      return bTime - aTime; // Mais recentes no topo
    });

  return (
    <div className="relative h-full flex bg-white dark:bg-slate-900 overflow-hidden">
      
      {/* ─── Coluna 1: Fila de Atendimento (Sidebar) ─── */}
      <div className={`shrink-0 border-r border-slate-200 flex flex-col h-full bg-slate-50/50 transition-all ${selected ? 'hidden lg:flex w-full lg:w-[320px]' : 'flex w-full lg:w-[320px]'}`}>
        
        {/* Header: Chats */}
        <div className="p-4 pt-5 flex items-center shrink-0">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Chats</h1>
        </div>

        {/* Search & Filter */}
        <div className="px-4 pb-2 flex gap-2 shrink-0">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar"
              className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-100 transition-all shadow-sm"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 pt-2 border-b border-slate-200 shrink-0">
          <div className="flex gap-5 overflow-x-auto no-scrollbar">
            {(['entrada', 'meus', 'em_atendimento', 'encerrados'] as ChatTab[]).map(tab => {
              const labels = {
                entrada: 'Entrada',
                meus: 'Meus',
                em_atendimento: 'Em atendimento',
                encerrados: 'Encerrados'
              };
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative pb-3 text-[13px] font-semibold transition-colors whitespace-nowrap ${
                    isActive ? 'text-teal-600' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {labels[tab]}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500 rounded-t-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* List of Chats */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {currentChats.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-slate-500 text-sm">Nenhuma conversa encontrada.</p>
            </div>
          ) : (
            currentChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setSelectedId(chat.id)}
                className={`w-full text-left rounded-xl p-3 transition-all border ${
                  selected?.id === chat.id 
                    ? 'bg-blue-50/50 border-blue-200 shadow-sm' 
                    : 'bg-transparent border-transparent hover:bg-white hover:border-slate-200 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      chat.status === 'waiting' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' : 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400'
                    }`}>
                      {chat.clientName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate block">{chat.clientName}</span>
                      {chat.status === 'closed' ? (
                        <div className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5 space-y-0.5">
                          {chat.ticketId && <p className="truncate">Ticket: <span className="font-medium text-slate-700 dark:text-slate-300">#{chat.ticketId}</span></p>}
                          <p className="truncate">Empresa: <span className="font-medium text-slate-700 dark:text-slate-300">{getCompanyByEmail(chat.clientEmail)}</span></p>
                          <p className="truncate">Colab: <span className="font-medium text-slate-700 dark:text-slate-300">{chat.agentName || 'Sistema'}</span></p>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block">{chat.messages[chat.messages.length - 1]?.body}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0 gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400">
                        {formatTimeBR(chat.messages[chat.messages.length - 1]?.createdAt || chat.createdAt)}
                      </span>
                      <div className={`w-2 h-2 rounded-full ${chat.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    </div>
                    {chat.status === 'waiting' ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400">
                        Baixa
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-rose-700 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400">
                        Alta
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ─── Coluna 2: Palco de Chat (Centro) ─── */}
      <div className={`flex-1 flex flex-col min-w-0 bg-slate-50/50 dark:bg-slate-900 ${!selected ? 'hidden lg:flex' : 'flex'}`}>
        {!selected ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">Selecione uma conversa para iniciar o atendimento</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header do Palco */}
            <div className="h-[72px] shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-3 md:px-5">
              <div className="flex items-center gap-2 md:gap-3">
                <button 
                  onClick={() => setSelectedId(null)}
                  className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center">
                    Ticket #{selected.ticketId || '1048'} 
                    <span className={`ml-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      (chatPriorities[selected.id] || 'alta') === 'critica' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                      (chatPriorities[selected.id] || 'alta') === 'alta' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                      (chatPriorities[selected.id] || 'alta') === 'media' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                      'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-400'
                    }`}>
                      {chatPriorities[selected.id] || 'alta'} prioridade
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    Não consigo acessar o ERP
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                    Fila de Chat
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  title="Alternar Painel Lateral"
                >
                  <PanelRight className="w-5 h-5" />
                </button>
                {selected.status === 'waiting' ? (
                  <button 
                    onClick={() => handleStatusChange('active')}
                    disabled={!hasPermission('chat.attend') || isSunTzuBlocked} 
                    className={`${isSunTzuBlocked ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'} text-sm font-semibold px-4 py-2 rounded-lg transition-colors`}
                  >
                    {isSunTzuBlocked ? 'Modo Sun Tzu Ativo (Automático)' : 'Assumir Atendimento'}
                  </button>
                ) : (
                  <>
                    <div className="relative" ref={transferRef}>
                      <button 
                        onClick={() => !selected.pendingTransferTo && setShowTransferMenu(!showTransferMenu)}
                        disabled={!!selected.pendingTransferTo || selected.status === 'closed'}
                        className={`${selected.pendingTransferTo ? 'bg-slate-300 text-slate-500 cursor-wait' : 'bg-amber-500 hover:bg-amber-600 text-white'} text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {selected.pendingTransferTo ? (
                          <>Aguardando Aceite...</>
                        ) : (
                          <><ArrowRightLeft className="w-3.5 h-3.5" /> Transferir</>
                        )}
                      </button>
                      
                      {showTransferMenu && (
                        <div className="absolute top-full mt-2 right-0 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden z-20 animate-in fade-in slide-in-from-top-2">
                          <div className="py-1 max-h-[300px] overflow-y-auto">
                            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Departamentos</div>
                            {['Comercial', 'Logística'].map((dept) => (
                              <button 
                                key={dept}
                                onClick={() => {
                                  setShowTransferMenu(false);
                                  toast.success(`Chat transferido para ${dept}`);
                                  handleStatusChange('closed');
                                }}
                                className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                              >
                                {dept}
                              </button>
                            ))}
                            
                            <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                            
                            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Atendentes</div>
                            {MOCK_STAFF.map((staff) => (
                              <button 
                                key={staff.id}
                                onClick={() => {
                                  setShowTransferMenu(false);
                                  
                                  // Marca como pendente de aprovação
                                  if (selected) {
                                    const chatInMock = chats.find(c => c.id === selected.id);
                                    if (chatInMock) {
                                      chatInMock.pendingTransferTo = staff.id;
                                      chatInMock.pendingTransferFrom = user?.name || 'Sistema';
                                      toast.success(`Transferência solicitada para ${staff.name}. Aguardando aceite.`);
                                      // Force re-render to reflect state
                                      setForceRender(prev => prev + 1);
                                    }
                                  }
                                }}
                                className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                              >
                                <div className="flex justify-between items-center w-full">
                                  <span>{staff.name}</span>
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                                    {staff.role === 'Administrator' ? 'Admin' : staff.role === 'Technician' ? 'N2' : 'N1'}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => document.getElementById('btn-open-ticket-modal')?.click()}
                      disabled={!hasPermission('chat.attend') || selected.status === 'closed'} 
                      className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Finalizar
                    </button>
                  </>
                )}
                <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                <button
                  onClick={() => setSelectedId(null)}
                  className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                  title="Fechar aba"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Histórico de Mensagens */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {selected.messages.map((msg) => {
                const isRightSide = msg.senderType === 'agent' || msg.senderType === 'system' || msg.senderType === 'internal';
                const isInternal = msg.senderType === 'internal';
                return (
                  <div key={msg.id} className={`flex ${isRightSide ? 'justify-end' : 'justify-start'}`}>
                    {!isRightSide && (
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center mr-2 flex-shrink-0 mt-auto">
                        <User className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      </div>
                    )}
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed shadow-sm ${
                      isInternal
                        ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-100 border border-amber-200 dark:border-amber-800/50 rounded-br-sm'
                        : isRightSide 
                          ? 'bg-slate-950 dark:bg-slate-800 text-white rounded-br-sm' 
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-bl-sm'
                    }`}>
                      {isInternal && <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400/80 mb-1 flex items-center gap-1">🔒 Nota Interna</p>}
                      {!isRightSide && <p className="text-xs font-bold mb-1 text-slate-500 dark:text-slate-400">{msg.senderName}</p>}
                      {msg.body}
                      <div className={`text-[10px] mt-1 text-right ${
                        isInternal 
                          ? 'text-amber-700/60 dark:text-amber-400/50' 
                          : isRightSide 
                            ? 'text-slate-300' 
                            : 'text-slate-400 dark:text-slate-500'
                      }`}>
                        {formatTimeBR(msg.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Wrapper */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0 flex flex-col">
              <div className="flex gap-4 mb-3 px-1">
                <button 
                  onClick={() => setIsInternalNote(false)}
                  className={`text-xs font-bold pb-1.5 border-b-2 transition-colors ${!isInternalNote ? 'border-slate-800 dark:border-slate-200 text-slate-800 dark:text-slate-200' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                >
                  Mensagem Pública
                </button>
                <button 
                  onClick={() => setIsInternalNote(true)}
                  className={`text-xs font-bold pb-1.5 border-b-2 transition-colors flex items-center gap-1.5 ${isInternalNote ? 'border-amber-500 text-amber-600 dark:text-amber-400' : 'border-transparent text-slate-400 hover:text-amber-600/70 dark:hover:text-amber-400/70'}`}
                >
                  🔒 Nota Interna
                </button>
              </div>
              <div className="relative">
                {/* Sugestão de Macro (Exemplo se digitar /) */}
                {input.startsWith('/') && (
                  <div className="absolute bottom-full mb-2 left-0 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden z-10 flex flex-col max-h-[240px]">
                    <div className="px-3 py-2 text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 shrink-0">Respostas Rápidas</div>
                    <div className="overflow-y-auto flex-1">
                    {macros.filter(m => m.command.toLowerCase().includes(input.toLowerCase())).length > 0 ? macros.filter(m => m.command.toLowerCase().includes(input.toLowerCase())).map(macro => (
                      <button 
                        key={macro.command}
                        onClick={() => { setInput(macro.text); inputRef.current?.focus(); }} 
                        className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 font-medium"
                      >
                        {macro.command}
                      </button>
                    )) : (
                      <div className="px-3 py-3 text-xs text-slate-500 text-center">Nenhuma macro encontrada.</div>
                    )}
                    </div>
                  </div>
                )}
                
                {/* Sugestão de Menção (se digitar @ em nota interna) */}
                {isInternalNote && input.includes('@') && (
                  <div className="absolute bottom-full mb-2 left-0 w-64 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700/50 rounded-xl shadow-xl overflow-hidden z-10 flex flex-col max-h-[240px]">
                    <div className="px-3 py-2 text-xs font-bold text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-800/50 shrink-0">Mencionar Atendente</div>
                    <div className="overflow-y-auto flex-1">
                    {MOCK_STAFF.filter(s => s.name.toLowerCase().includes(input.split('@').pop()?.toLowerCase() || '')).length > 0 ? MOCK_STAFF.filter(s => s.name.toLowerCase().includes(input.split('@').pop()?.toLowerCase() || '')).map(staff => (
                      <button 
                        key={staff.id}
                        onClick={() => { 
                          const parts = input.split('@');
                          parts.pop();
                          setInput((parts.length > 0 ? parts.join('@') : '') + '@' + staff.name + ' ');
                          inputRef.current?.focus(); 
                        }} 
                        className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-900/30 font-medium flex items-center gap-2"
                      >
                        <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                          <User className="w-3 h-3 text-slate-500" />
                        </div>
                        <span className="truncate">{staff.name}</span>
                      </button>
                    )) : (
                      <div className="px-3 py-3 text-xs text-slate-500 text-center">Nenhum atendente encontrado.</div>
                    )}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} disabled={selected.status === 'closed'} />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={selected.status === 'waiting' || selected.status === 'closed' || !hasPermission('chat.attend')} 
                    className="p-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Enviar foto ou arquivo"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => { setInput('/'); inputRef.current?.focus(); }}
                    disabled={selected.status === 'waiting' || selected.status === 'closed' || !hasPermission('chat.attend')} 
                    className="p-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Mensagens pré-prontas (Macros)"
                  >
                    <FileText className="w-5 h-5" />
                  </button>
                  <input 
                    type="text" 
                    ref={inputRef}
                    value={input} onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                    placeholder={selected.status === 'closed' ? "Chat encerrado" : (selected.status === 'waiting' ? "Assuma o atendimento para responder..." : (isInternalNote ? "Digite uma nota interna (invisível para o cliente)..." : "Digite sua mensagem pública..."))}
                    disabled={selected.status === 'waiting' || selected.status === 'closed' || !hasPermission('chat.attend')}
                    className={`flex-1 rounded-xl border px-4 py-3 text-[15px] outline-none transition shadow-sm disabled:cursor-not-allowed ${
                      isInternalNote 
                        ? 'border-amber-300 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-900/10 text-amber-900 dark:text-amber-100 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 placeholder-amber-700/50 dark:placeholder-amber-400/50' 
                        : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:dark:bg-slate-900'
                    }`}
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={!input.trim() || selected.status === 'waiting' || selected.status === 'closed' || !hasPermission('chat.attend')} 
                    className={`${isInternalNote ? 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600' : 'bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600'} disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl transition-colors shadow-sm flex items-center justify-center shrink-0`}
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ─── Coluna 3: Contexto (Right Sidebar) ─── */}
      <div className={`shrink-0 transition-all duration-300 ease-in-out border-slate-200 dark:border-slate-800 absolute xl:relative right-0 h-full bg-white dark:bg-slate-900 z-30 shadow-2xl xl:shadow-none flex flex-col ${isRightSidebarOpen ? 'w-full xl:w-72 border-l' : 'w-0 overflow-hidden border-none'}`}>
        {isRightSidebarOpen && (
          <button onClick={() => setIsRightSidebarOpen(false)} className="xl:hidden absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full z-50 shadow-sm">
            <X className="w-4 h-4" />
          </button>
        )}
        <div className="w-full xl:w-72 h-full overflow-hidden">
          <ContextPanel 
            session={selected} 
            onStatusChange={handleStatusChange} 
            priority={selected ? (chatPriorities[selected.id] || 'alta') : 'alta'}
            onPriorityChange={(p) => selected && setChatPriorities({...chatPriorities, [selected.id]: p})}
          />
        </div>
      </div>
    </div>
  );
}
