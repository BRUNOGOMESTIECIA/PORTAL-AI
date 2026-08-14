import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Ticket, MessageCircle, MessageSquare, BookOpen,
  ShoppingBag, BarChart3, Users, Settings, ChevronLeft, ChevronRight, ChevronUp, ChevronDown,
  Bell, LogOut, User, ShieldCheck, Menu, X, Building2, Wrench, Plus, Clock, ArrowRightLeft, Volume2, VolumeX, BellRing, Search, Layers, Cpu, UserCheck
} from 'lucide-react';


import { useAuth, AppUser } from '../../hooks/use-mock-auth';
import { useChats } from '../../hooks/use-chats';
import { useTickets } from '../../hooks/use-tickets';
import { cn } from '../../lib/utils';
import { apiClient } from '../../lib/api-client';

import { useEscapeModal } from '../../hooks/use-escape-modal';
import { NewManualTicketModal } from './components/NewManualTicketModal';
import { SessionLockModal } from './components/SessionLockModal';
import { GlobalSearchModal } from '../../components/layout/GlobalSearchModal';
import { useInactivityTimeout } from '../../hooks/use-inactivity-timeout';
import { useTabNotification } from '../../hooks/use-tab-notification';
import { OperatorStatusToggle } from './components/OperatorStatusToggle';
import { useSessionIpGuard } from '../../hooks/use-session-ip-guard';
import { SessionIpDriftModal } from './components/SessionIpDriftModal';
import { useTheme } from '../../components/theme-provider';
import { Sun, Moon, Palette } from 'lucide-react';
import { UserMenu } from '../../components/layout/UserMenu';
import { CorporateFooterWidget } from '../../components/shared/CorporateFooterWidget';
import { PageTransitionWrapper } from '../../components/shared/PageTransitionWrapper';
import { BugReporterCricketWidget } from '../../components/shared/BugReporterCricketWidget';
import { toast } from 'sonner';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { getSoundSettings, saveSoundSettings, playAlertSound } from '../../lib/sound-effects';
import { useNotifications } from '../../hooks/use-notifications';

interface NavItem { label: string; path: string; icon: React.ComponentType<{ className?: string }>; permission?: string; badge?: number }

const NAV_MAIN: NavItem[] = [
  { label: 'Dashboard', path: '/operacional/app/dashboard', icon: LayoutDashboard },
  { label: 'Tickets', path: '/operacional/app/tickets', icon: Ticket, permission: 'tickets.view' },
  { label: 'Fila de Chat', path: '/operacional/app/chat', icon: MessageCircle, permission: 'chat.view' },
  { label: 'Chat Interno', path: '/operacional/app/internal', icon: MessageSquare },
  { label: 'Base de Conhecimento', path: '/operacional/app/kb', icon: BookOpen, permission: 'kb.view' },
  { label: 'Catálogo', path: '/operacional/app/catalog', icon: ShoppingBag, permission: 'catalog.view' },
  { label: 'Relatórios', path: '/operacional/app/reports', icon: BarChart3, permission: 'reports.view' },
  { label: 'Ferramentas', path: '/operacional/app/tools', icon: Wrench },
];

const NAV_ADMIN: NavItem[] = [
  { label: 'Usuários', path: '/operacional/app/admin/users', icon: UserCheck, permission: 'admin.users' },
  { label: 'Clientes (Tenants)', path: '/operacional/app/admin/clients', icon: Building2, permission: 'admin.users' },
  { label: 'Automações', path: '/operacional/app/admin/automation', icon: Layers, permission: 'admin.settings' },
  { label: 'Consumo de IA', path: '/operacional/app/admin/ai-usage', icon: Cpu, permission: 'admin.settings' },
  { label: 'Configurações', path: '/operacional/app/admin/settings', icon: Settings, permission: 'admin.settings' },
];


function SystemClock() {
  const [time, setTime] = useState(new Date());
  const [show, setShow] = useState(() => {
    const saved = localStorage.getItem('portal_show_top_clock');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const handleStorage = () => {
      const saved = localStorage.getItem('portal_show_top_clock');
      setShow(saved !== null ? JSON.parse(saved) : true);
    };
    window.addEventListener('storage', handleStorage);
    return () => {
      clearInterval(timer);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  if (!show) return null;

  const formattedTime = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(time);

  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(time);

  return (
    <div className="flex items-center gap-2 mr-4 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 select-none">
      <Clock className="w-4 h-4 text-emerald-500" />
      <div className="text-right">
        <div className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-none mb-0.5">{formattedTime}</div>
        <div className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-medium leading-none tracking-wider">{formattedDate} (BRT)</div>
      </div>
    </div>
  );
}

function GlobalChatAlerts({ collapsed }: { collapsed?: boolean }) {
  const { user } = useAuth();

  // Presença do Operador no Descarregamento da Página (beforeunload / Fechar Aba)
  useEffect(() => {
    if (!user?.email) return;
    
    const handleUnload = () => {
      try {
        import('../../lib/firebase').then(({ instaPassoDb }) => {
          import('firebase/firestore').then(({ collection, query, where, getDocs, updateDoc, doc }) => {
            const q = query(collection(instaPassoDb, 'operators'), where('email', '==', user.email.toLowerCase()));
            getDocs(q).then(snap => {
              snap.forEach(d => {
                updateDoc(doc(instaPassoDb, 'operators', d.id), {
                  isOnline: false,
                  lastSeen: new Date().toISOString()
                });
              });
            });
          });
        });
      } catch(e) {}
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [user?.email]);

  const { chats, updateChat } = useChats();
  const [alerts, setAlerts] = useState<{ id: string, title: string, desc: string, type: 'warning'|'error', chatId: string }[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const intervalId = setInterval(() => {
      let hasChanges = false;
      const now = Date.now();

      chats.forEach(chat => {
        const messages = chat.messages;
        if (messages.length === 0) return;
        
        const lastMessage = messages[messages.length - 1];
        const lastMsgTime = new Date(lastMessage.createdAt).getTime();
        const timeSinceLastMsg = now - lastMsgTime;
        
        if (chat.status === 'waiting') {
          const isAgentLast = lastMessage.senderType === 'agent';
          
          if (!isAgentLast && timeSinceLastMsg >= 90000) {
            updateChat(chat.id, { messages: [...chat.messages, {
              id: `auto_90s_${chat.id}_${now}`,
              body: 'Logo iremos te atender, informe em que podemos te ajudar!',
              senderName: 'Sistema',
              senderType: 'system',
              createdAt: new Date(now).toISOString()
            }] });
            hasChanges = true;
          }
        }

        if (chat.status === 'active') {
          const isAgentLast = lastMessage.senderType === 'agent';
          
          if (!isAgentLast && timeSinceLastMsg >= 120000) {
            // Envia a cada intervalo de 2 minutos de ociosidade
            updateChat(chat.id, { messages: [...chat.messages, {
              id: `auto_2m_${chat.id}_${now}`,
              body: 'Já irei te responder, aguarde um pouquinho por favor.',
              senderName: 'Sistema',
              senderType: 'system',
              createdAt: new Date(now).toISOString()
            }] });
            hasChanges = true;
          }
        }
      });

      const newAlerts: any[] = [];
      chats.forEach(chat => {
        if (!chat.messages || chat.messages.length === 0) return;
        const lastMessage = chat.messages[chat.messages.length - 1];
        const isAgentLast = lastMessage.senderType === 'agent';
        if (isAgentLast) return;

        let sysCount = 0;
        for (let i = chat.messages.length - 1; i >= 0; i--) {
          if (chat.messages[i].senderType === 'system') sysCount++;
          else break;
        }

        if (chat.status === 'waiting') {
          newAlerts.push({
            id: chat.id + '_err', chatId: chat.id,
            title: `Atenção! Cliente aguardando!`,
            desc: `${chat.clientName} está esperando na fila.`,
            type: 'error'
          });
        } else if (chat.status === 'active') {
          const lastMsgTime = new Date(lastMessage.createdAt).getTime();
          if (sysCount >= 1 || (now - lastMsgTime >= 60000)) {
            newAlerts.push({
              id: `${chat.id}_warn_${sysCount}`, chatId: chat.id,
              title: `Atendimento ocioso (${sysCount > 0 ? sysCount : 1}x)`,
              desc: `${chat.clientName} aguarda seu retorno.`,
              type: 'warning'
            });
          }
        }
      });

      /**
       * MODO SUN TZU - LÓGICA DE DISTRIBUIÇÃO INTELIGENTE DE CHATS (MOCK)
       * 
       * Este bloco é executado em background para distribuir automaticamente 
       * chats na fila ('waiting') para agentes N1 ('Support Agent') que estejam ociosos.
       * 
       * Regras:
       * 1. Apenas agentes 'Support Agent' recebem chats automaticamente.
       * 2. Limite base: 3 chats simultâneos por agente.
       * 3. Bônus de sobrecarga: Se um chat ativo ultrapassar 35 minutos, o limite do agente sobe em +1.
       */
      const sunTzuMode = JSON.parse(localStorage.getItem('portal_sun_tzu_mode') || 'false');
      if (sunTzuMode) {
        // 1. Mapear a capacidade inicial dos agentes ativos
        const staffCapacities: Record<string, { name: string, used: number, max: number }> = {};
        if (user?.name) {
          staffCapacities[user.id || user.name] = { name: user.name, used: 0, max: 3 };
        }

        // 2. Calcular o uso atual de capacidade por agente
        chats.forEach(c => {
          if (c.status === 'active' && c.agentName) {
            const agentKey = c.agentName;
            if (!staffCapacities[agentKey]) {
              staffCapacities[agentKey] = { name: c.agentName, used: 0, max: 3 };
            }
            staffCapacities[agentKey].used++;

            // 3. Regra de Sobrecarga: Verifica se há chats com mais de 35 minutos
            const chatAgeMs = now - new Date(c.createdAt).getTime();
            const chatAgeMins = chatAgeMs / (1000 * 60);
            if (chatAgeMins > 35) {
              staffCapacities[agentKey].max++; // Concede capacidade extra
            }
          }
        });

        // 4. Distribuir os chats aguardando (Limitado a 1 chat a cada 30 segundos para evitar flood)
        const waitingChats = chats.filter(c => c.status === 'waiting');
        const lastAssign = parseInt(localStorage.getItem('portal_suntzu_last_assign') || '0', 10);
        
        if (waitingChats.length > 0 && (now - lastAssign >= 30000)) {
          const waitingChat = waitingChats[0]; // Pega sempre o chat mais antigo da fila
          
          // 5. Encontrar o agente mais ocioso (maior capacidade disponível, menor quantidade de chats usados)
          let bestAgentKey: string | null = null;
          let highestAvailable = 0;
          let lowestUsed = 999;

          Object.entries(staffCapacities).forEach(([agentKey, cap]) => {
            const available = cap.max - cap.used;
            if (available > 0) {
              if (available > highestAvailable || (available === highestAvailable && cap.used < lowestUsed)) {
                highestAvailable = available;
                lowestUsed = cap.used;
                bestAgentKey = agentKey;
              }
            }
          });

          if (bestAgentKey && staffCapacities[bestAgentKey]) {
            // 6. Atribuir o chat automaticamente para o agente selecionado
            const agentName = staffCapacities[bestAgentKey].name;
            waitingChat.status = 'active';
            waitingChat.agentName = agentName;
            
            waitingChat.messages.push({
              id: `m_suntzu_${Date.now()}`,
              body: `Olá, bem-vindo! Meu nome é ${agentName} e eu assumi o seu atendimento.`,
              senderName: agentName,
              senderType: 'agent',
              createdAt: new Date().toISOString()
            });
            hasChanges = true;
            localStorage.setItem('portal_suntzu_last_assign', now.toString());
          }
        }
      }

      setAlerts(newAlerts);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [chats, updateChat]);


  if (alerts.length === 0) return null;

  if (collapsed) {
    return (
      <div className="mt-4 flex justify-center">
        <div className="relative p-2 bg-slate-800 rounded-lg">
          <MessageCircle className="w-4 h-4 text-rose-500" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 px-3 flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl flex flex-col gap-2 max-h-[350px] overflow-y-auto">
        <div className="px-3 pt-3 flex items-center justify-between">
          <p className="text-xs font-black text-rose-400 uppercase tracking-widest flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
            Alertas de Fila
          </p>
        </div>
        <div className="px-2 pb-2 mt-2 flex flex-col gap-2">
          {alerts.map(alert => (
            <div 
              key={alert.id}
              onClick={() => navigate(`/operacional/app/chat?chatId=${alert.chatId}`)}
              className={`p-3 rounded-lg border-2 text-xs cursor-pointer transition-all shadow-lg ${
                alert.type === 'error' 
                  ? 'bg-rose-600 border-rose-400 text-white hover:bg-rose-500 shadow-rose-900/50' 
                  : 'bg-amber-500 border-amber-200 text-slate-900 hover:bg-amber-400 shadow-amber-900/50'
              }`}
            >
              <div className="font-black mb-1 flex items-center gap-2 text-[13px]">
                <MessageCircle className="w-4 h-4 animate-bounce" /> 
                {alert.title}
              </div>
              <div className="font-medium opacity-90 text-[11px] leading-snug">{alert.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function OperationalShell() {
  const { user, hasPermission, logout } = useAuth();
  const { chats, updateChat } = useChats();

  const { tickets } = useTickets();
  const { theme, setTheme } = useTheme();
  const { permission, requestPermission } = useNotifications();
  const [soundConfig, setSoundConfig] = useState(() => getSoundSettings());

  const toggleSound = () => {
    const updated = saveSoundSettings({ enabled: !soundConfig.enabled });
    setSoundConfig(updated);
    if (updated.enabled) {
      playAlertSound('chime', updated.volume);
      toast.success('Alertas sonoros ativados');
    } else {
      toast.info('Alertas sonoros silenciados');
    }
  };

  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('portal_sidebar_collapsed');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [isHovered, setIsHovered] = useState(false);
  const isEffectiveCollapsed = collapsed && !isHovered;

  useEffect(() => {
    localStorage.setItem('portal_sidebar_collapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  const [showQueueWidget, setShowQueueWidget] = useState(() => {
    const saved = localStorage.getItem('portal_show_queue');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [showAdminWidget, setShowAdminWidget] = useState(() => {
    const saved = localStorage.getItem('portal_show_admin');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('portal_show_queue', JSON.stringify(showQueueWidget));
  }, [showQueueWidget]);

  useEffect(() => {
    localStorage.setItem('portal_show_admin', JSON.stringify(showAdminWidget));
  }, [showAdminWidget]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(() => new Set());
  const [remoteNotifications, setRemoteNotifications] = useState<any[]>([]);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const [pendingTransferChat, setPendingTransferChat] = useState<typeof chats[0] | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { isLocked, unlockSession } = useInactivityTimeout(30);
  const ipGuard = useSessionIpGuard();

  // Atalho global de teclado Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const chat = chats.find(c => c.pendingTransferTo === user?.id);
      setPendingTransferChat(chat || null);
    }, 1500);
    return () => clearInterval(timer);
  }, [user?.id]);

  useEscapeModal(showNotifications, () => setShowNotifications(false));

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);


  useEffect(() => {
    apiClient.get('/notifications/unread')
      .then((data: any) => {
        if (Array.isArray(data)) setRemoteNotifications(data);
      })
      .catch(() => null);
  }, []);

  const localNotifications = useMemo(() => {
    const list: Array<{ id: string; title: string; body: string; read: boolean }> = [];

    // 1. Notificações da Fila de Chat
    chats.filter(c => c.status === 'waiting').forEach(c => {
      list.push({
        id: `chat_waiting_${c.id}`,
        title: 'Nova conversa na fila',
        body: `${c.clientName} aguardando na fila de suporte.`,
        read: readNotificationIds.has(`chat_waiting_${c.id}`),
      });
    });

    // 2. Notificações de Tickets em Risco ou Novos
    tickets.filter(t => t.priority === 'critical' || t.status === 'new').slice(0, 5).forEach(t => {
      list.push({
        id: `ticket_${t.id}`,
        title: t.priority === 'critical' ? 'SLA em risco / Crítico' : 'Chamado atribuído / Novo',
        body: `#${t.id} — ${t.title}`,
        read: readNotificationIds.has(`ticket_${t.id}`),
      });
    });

    // 3. Notificações do Servidor API
    remoteNotifications.forEach(n => {
      list.push({
        id: n.id,
        title: n.title,
        body: n.body,
        read: !!n.read_at || readNotificationIds.has(n.id),
      });
    });

    return list;
  }, [chats, tickets, remoteNotifications, readNotificationIds]);


  const markAsRead = (id: string) => {
    setReadNotificationIds(prev => new Set(prev).add(id));
  };

  const markAllAsRead = () => {
    const allIds = localNotifications.map(n => n.id);
    setReadNotificationIds(new Set(allIds));
  };


  const unread = localNotifications.filter((n) => !n.read).length;
  
  // Alerta de Notificação em Aba Minimizada (Item 039)
  useTabNotification(unread, '💬 (1) Nova Notificação no Portal!');
  const isActive = (path: string) => location.pathname.startsWith(path);
  const visible = (item: NavItem) => !item.permission || hasPermission(item.permission);

  const SidebarContent = ({ isCollapsed }: { isCollapsed?: boolean }) => {
    const isCol = isCollapsed ?? collapsed;
    return (
      <>
        {/* Logo */}
        <div className={cn('flex items-center border-b border-slate-700 h-14 flex-shrink-0 px-4', 'justify-center')}>
          {isCol ? (
            <div className="w-8 h-8 rounded bg-slate-800 flex flex-shrink-0 items-center justify-center text-xs font-bold text-white shadow-sm" title="Logo Minimizado">
              M
            </div>
          ) : (
            <div className="h-8 w-full max-w-[140px] bg-slate-800 rounded flex items-center justify-center text-xs font-bold text-white shadow-sm" title="Logo Completo">
              Logo Horizontal
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5 scrollbar-thin">
          {NAV_MAIN.filter(visible).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path} to={item.path}
                onClick={() => setMobileOpen(false)}
                title={isCol ? item.label : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                  active ? 'bg-blue-600 text-white shadow-sm font-semibold' : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                  isCol && 'justify-center px-2',
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {!isCol && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}

          {/* Bottom Section */}
          <div className="mt-auto">
            {/* Widget Fila de Tickets */}
            {!isCol && (
              <div className="px-3 pt-6 pb-2">
                <div className="border-t border-slate-700/50 pt-4">
                <button 
                  onClick={() => setShowQueueWidget(!showQueueWidget)}
                  className="w-full flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white transition-colors mb-3 group"
                >
                  Fila de Tickets
                  {showQueueWidget ? (
                    <ChevronDown className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" />
                  ) : (
                    <ChevronUp className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" />
                  )}
                </button>
                
                {showQueueWidget && (
                  <div className="space-y-2.5 mb-4">
                    <Link to="/operacional/app/tickets?priority=critical" onClick={() => setMobileOpen(false)} className="flex items-center justify-between text-sm hover:bg-slate-800/50 p-1.5 -mx-1.5 rounded-lg transition-colors cursor-pointer group">
                        <div className="flex items-center gap-2.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                          <span className="text-slate-300 group-hover:text-white transition-colors">Crítica</span>
                        </div>
                        <span className="bg-slate-800 group-hover:bg-slate-700 text-slate-400 group-hover:text-white text-xs px-2 py-0.5 rounded-md font-medium transition-colors">
                          {tickets.filter(t => ['new', 'open', 'in_progress', 'pending'].includes(t.status) && t.priority === 'critical').length}
                        </span>
                      </Link>
                      <Link to="/operacional/app/tickets?priority=high" onClick={() => setMobileOpen(false)} className="flex items-center justify-between text-sm hover:bg-slate-800/50 p-1.5 -mx-1.5 rounded-lg transition-colors cursor-pointer group">
                        <div className="flex items-center gap-2.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                          <span className="text-slate-300 group-hover:text-white transition-colors">Alta prioridade</span>
                        </div>
                        <span className="bg-slate-800 group-hover:bg-slate-700 text-slate-400 group-hover:text-white text-xs px-2 py-0.5 rounded-md font-medium transition-colors">
                          {tickets.filter(t => ['new', 'open', 'in_progress', 'pending'].includes(t.status) && t.priority === 'high').length}
                        </span>
                      </Link>
                      <Link to="/operacional/app/tickets?priority=medium" onClick={() => setMobileOpen(false)} className="flex items-center justify-between text-sm hover:bg-slate-800/50 p-1.5 -mx-1.5 rounded-lg transition-colors cursor-pointer group">
                        <div className="flex items-center gap-2.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                          <span className="text-slate-300 group-hover:text-white transition-colors">Média prioridade</span>
                        </div>
                        <span className="bg-slate-800 group-hover:bg-slate-700 text-slate-400 group-hover:text-white text-xs px-2 py-0.5 rounded-md font-medium transition-colors">
                          {tickets.filter(t => ['new', 'open', 'in_progress', 'pending'].includes(t.status) && t.priority === 'medium').length}
                        </span>
                      </Link>
                      <Link to="/operacional/app/tickets?priority=low" onClick={() => setMobileOpen(false)} className="flex items-center justify-between text-sm hover:bg-slate-800/50 p-1.5 -mx-1.5 rounded-lg transition-colors cursor-pointer group">
                        <div className="flex items-center gap-2.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                          <span className="text-slate-300 group-hover:text-white transition-colors">Baixa prioridade</span>
                        </div>
                        <span className="bg-slate-800 group-hover:bg-slate-700 text-slate-400 group-hover:text-white text-xs px-2 py-0.5 rounded-md font-medium transition-colors">
                          {tickets.filter(t => ['new', 'open', 'in_progress', 'pending'].includes(t.status) && t.priority === 'low').length}
                        </span>
                      </Link>
                    </div>
                )}
                
                <button onClick={() => { setMobileOpen(false); setShowNewTicketModal(true); }} className="w-[85%] mx-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white text-[13px] font-medium py-1.5 rounded-md transition-all border border-slate-700/50 mt-4 shadow-sm">
                  <Plus className="w-3.5 h-3.5" /> Novo Ticket Manual
                </button>
                </div>
              </div>
            )}

            {/* ADMIN */}
            {NAV_ADMIN.filter(visible).length > 0 && (
              <div className="pb-2">
                <div className={cn('pt-3 pb-1', !isCol && 'px-3')}>
                  {!isCol && (
                    <button 
                      onClick={() => setShowAdminWidget(!showAdminWidget)}
                      className="w-full flex items-center justify-between text-xs font-semibold text-slate-500 hover:text-slate-300 uppercase tracking-wider transition-colors group"
                    >
                      Administração
                      {showAdminWidget ? (
                        <ChevronDown className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" />
                      ) : (
                        <ChevronUp className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" />
                      )}
                    </button>
                  )}
                  {isCol && <div className="border-t border-slate-700" />}
                </div>
                {(isCol || showAdminWidget) && NAV_ADMIN.filter(visible).map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path} to={item.path}
                      onClick={() => setMobileOpen(false)}
                      title={isCol ? item.label : undefined}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                        active ? 'bg-blue-600 text-white shadow-sm font-semibold' : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                        isCol && 'justify-center px-2',
                      )}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      {!isCol && <span className="truncate">{item.label}</span>}
                    </Link>
                  );
                })}

                {/* Theme Switcher */}
                <div className={cn("mt-4 flex flex-col gap-2", isCol ? "items-center px-0" : "px-3")}>
                  {!isCol && (
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tema</span>
                  )}
                  <div className={cn("flex items-center justify-between bg-slate-800 border border-slate-700 rounded-md p-1", isCol && "flex-col")}>
                    <button
                      onClick={() => setTheme('light')}
                      title="Tema Claro"
                      className={cn("p-1.5 rounded-sm text-slate-400 hover:text-white hover:bg-slate-700 transition-colors", theme === 'light' && "bg-slate-700 text-white")}
                    >
                      <Sun className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      title="Tema Escuro"
                      className={cn("p-1.5 rounded-sm text-slate-400 hover:text-white hover:bg-slate-700 transition-colors", theme === 'dark' && "bg-slate-700 text-white")}
                    >
                      <Moon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setTheme('original')}
                      title="Tema Original"
                      className={cn("p-1.5 rounded-sm text-slate-400 hover:text-white hover:bg-slate-700 transition-colors", theme === 'original' && "bg-slate-700 text-white")}
                    >
                      <Palette className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Chat Alerts under Theme Switcher */}
                <GlobalChatAlerts collapsed={isCol} />
              </div>
            )}
          </div>
        </nav>

        {/* Collapse + Logout */}
        <div className="border-t border-slate-700 p-2 space-y-1">
          <button
            onClick={logout}
            title="Sair"
            className={cn('w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-700 hover:text-white transition-colors', isCol && 'justify-center px-2')}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {!isCol && <span>Sair</span>}
          </button>
        </div>
      </>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* Desktop sidebar */}
      <aside 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          'relative hidden lg:flex flex-col bg-slate-900 transition-all duration-300 ease-in-out flex-shrink-0 z-40 shadow-2xl',
          isEffectiveCollapsed ? 'w-16' : 'w-60'
        )}
      >
        <SidebarContent isCollapsed={isEffectiveCollapsed} />
        <button
          onClick={(e) => {
            e.stopPropagation();
            setCollapsed(!collapsed);
          }}
          className="absolute -right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 transition-all shadow-md z-50 cursor-pointer hover:scale-110"
          title={collapsed ? "Fixar / Expandir Menu (Travar)" : "Minimizar Menu (Travar)"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex flex-col w-64 h-full bg-slate-900">
            <button onClick={() => setMobileOpen(false)} className="absolute top-3 right-3 text-slate-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 flex-shrink-0">
          {/* Botão de Menu Hambúrguer (Funciona em Desktop e Mobile com Hover e Clique) */}
          <button 
            onClick={() => {
              if (window.innerWidth < 1024) {
                setMobileOpen(!mobileOpen);
              } else {
                setCollapsed(!collapsed);
              }
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="flex items-center justify-center p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer mr-2"
            title={collapsed ? "Expandir / Fixar Menu Sidebar" : "Minimizar Menu Sidebar"}
          >
            <Menu className="h-5 w-5" />
          </button>
          
          {/* Botão de Busca Global Ctrl+K */}
          <div className="flex-1 max-w-md mx-4">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-100 transition-all cursor-pointer shadow-sm"
            >
              <div className="flex items-center gap-2 truncate">
                <Search className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="hidden sm:inline truncate">Buscar tickets (#2026XXXX), ferramentas...</span>
                <span className="sm:hidden">Pesquisar...</span>
              </div>
              <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-500 flex-shrink-0 ml-1">
                Ctrl+K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-2">
            
            {/* Seletor de Status de Presença/Ausência do Operador (Item 120) */}
            <OperatorStatusToggle />

            <SystemClock />

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              title={soundConfig.enabled ? "Som de alertas ativado (Clique para silenciar)" : "Som de alertas silenciado (Clique para ativar)"}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500"
            >
              {soundConfig.enabled ? (
                <Volume2 className="h-4 w-4 text-blue-600" />
              ) : (
                <VolumeX className="h-4 w-4 text-slate-400" />
              )}
            </button>

            {/* Desktop Notification Request */}
            {permission !== 'granted' && (
              <button
                onClick={requestPermission}
                title="Ativar Notificações Desktop"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition-colors"
              >
                <BellRing className="h-3.5 w-3.5" />
                <span>Ativar Alertas</span>
              </button>
            )}

            {/* Notifications (Item 041 - Sininho com Badge Contador Animado) */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                title="Notificações e Alertas"
                className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
              >
                <Bell className={cn("h-4 w-4 transition-transform", unread > 0 && "animate-bounce text-slate-700 dark:text-slate-200")} />
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-600 text-[10px] font-black text-white shadow-sm">
                      {unread > 99 ? '99+' : unread}
                    </span>
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Notificações</p>
                      {unread > 0 && (
                        <span className="bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-red-200 dark:border-red-800">
                          {unread} nova{unread > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    {unread > 0 && (
                      <button onClick={markAllAsRead} className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 font-semibold transition-colors">
                        Marcar todas como lidas
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {localNotifications.length === 0 ? (
                      <div className="p-8 text-center text-sm text-slate-400">Nenhuma notificação recente.</div>
                    ) : (
                      localNotifications.map((n) => (
                        <div 
                          key={n.id} 
                          onClick={() => markAsRead(n.id)}
                          className={cn(
                            'p-3.5 flex items-start gap-3 cursor-pointer transition-colors',
                            !n.read 
                              ? 'bg-blue-50/40 dark:bg-blue-950/30 hover:bg-blue-50/80 dark:hover:bg-blue-950/50' 
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          )}
                        >
                          <div className={cn(
                            'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                            !n.read ? 'bg-blue-600' : 'bg-transparent'
                          )} />
                          <div className="flex-1 min-w-0">
                            <p className={cn('text-xs font-bold leading-snug', n.read ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-slate-100')}>
                              {n.title}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{n.body}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Separator */}
            <div className="w-px h-6 bg-slate-200 mx-1" />

            {/* User Profile Menu */}
            <div className="flex items-center justify-center">
              <UserMenu />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className={cn('flex-1 relative flex flex-col', location.pathname.includes('/chat') ? 'overflow-hidden h-full' : 'overflow-y-auto p-4 sm:p-6')}>
          <div className={cn("flex-1 flex flex-col justify-between", location.pathname.includes('/chat') ? 'h-full min-h-0' : 'min-h-[calc(100vh-140px)]')}>
            <ErrorBoundary>
              <PageTransitionWrapper keyName={location.pathname} className={location.pathname.includes('/chat') ? 'min-h-0 h-full' : ''}>
                <Outlet />
              </PageTransitionWrapper>
            </ErrorBoundary>
            {!location.pathname.includes('/chat') && (
              <div className="mt-12 pt-4">
                <CorporateFooterWidget />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      {showNewTicketModal && (
        <NewManualTicketModal onClose={() => setShowNewTicketModal(false)} />
      )}
      
      {pendingTransferChat && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4 mx-auto">
                <ArrowRightLeft className="w-6 h-6 text-amber-600 dark:text-amber-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white text-center mb-2">
                Transferência de Chat
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 text-center mb-6">
                O atendente <strong className="text-slate-800 dark:text-slate-200">{pendingTransferChat.pendingTransferFrom}</strong> quer te transferir o chat do cliente <strong className="text-slate-800 dark:text-slate-200">{pendingTransferChat.clientName}</strong>.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    pendingTransferChat.pendingTransferTo = undefined;
                    pendingTransferChat.pendingTransferFrom = undefined;
                    setPendingTransferChat(null);
                    toast.error('Transferência recusada.');
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Recusar
                </button>
                <button
                  onClick={() => {
                    pendingTransferChat.agentName = user?.name || 'Atendente';
                    pendingTransferChat.pendingTransferTo = undefined;
                    pendingTransferChat.pendingTransferFrom = undefined;
                    
                    pendingTransferChat.messages.push({
                      id: `m_transfer_${Date.now()}`,
                      body: `Olá! Meu nome é ${user?.name} e eu assumi o seu atendimento a partir de agora.`,
                      senderName: user?.name || 'Atendente',
                      senderType: 'agent',
                      createdAt: new Date().toISOString()
                    });
                    
                    setPendingTransferChat(null);
                    toast.success('Chat assumido com sucesso!');
                    navigate(`/operacional/app/chat?chatId=${pendingTransferChat.id}`);
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-sm"
                >
                  Aceitar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Bloqueio de Sessão por Inatividade (LGPD / ISO 27001) */}
      {isLocked && <SessionLockModal onUnlock={unlockSession} />}

      {/* Modal de Pesquisa Global Instantânea (Ctrl+K) */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Modal de Detecção de Alteração de IP na Mesma Sessão (Item 113) */}
      <SessionIpDriftModal
        isOpen={ipGuard.isIpDriftDetected}
        initialIp={ipGuard.initialIp}
        currentIp={ipGuard.currentIp}
        onResolve={ipGuard.resolveIpDrift}
      />

      {/* Widget Flutuante: ALERTAS DE FILA com Envio Rápido de Aguarde SLA */}
      <QueueAlertsFloatingWidget
        waitingChats={chats.filter(c => c.status === 'waiting')}
        onOpenChat={(chatId) => navigate(`/operacional/app/chat?chatId=${chatId}`)}
        onSendSlaWait={(chat) => {
          const waitMsg = 'Olá! Já recebi sua mensagem e estou abrindo seu cadastro no sistema para te atender. Só um instante por favor!';
          const updated = [...(chat.messages || []), {
            id: `m_wait_${Date.now()}`,
            body: waitMsg,
            senderName: user?.name || 'Atendente',
            senderType: 'agent',
            createdAt: new Date().toISOString()
          }];
          updateChat(chat.id, { messages: updated } as any);
          toast.success(`⚡ Mensagem de aguarde enviada para ${chat.clientName}!`);
        }}
      />

      {/* Grilo Relator de Bugs (Envia direto para a mesa Bub Engenheiros) */}
      <BugReporterCricketWidget />
    </div>
  );
}

function QueueAlertsFloatingWidget({
  waitingChats,
  onOpenChat,
  onSendSlaWait
}: {
  waitingChats: any[];
  onOpenChat: (chatId: string) => void;
  onSendSlaWait: (chat: any) => void;
}) {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [minimized, setMinimized] = useState(false);
  
  const activeWaitingChats = waitingChats.filter(c => !dismissedIds.includes(c.id));
  const activeAlertChat = activeWaitingChats[0];

  if (!activeAlertChat) return null;

  const totalCount = activeWaitingChats.length;
  const currentIndex = 1; // Pega sempre o topo da pilha ativa

  // Minimizado: barra compacta centralizada no rodapé
  if (minimized) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
        <button
          onClick={() => setMinimized(false)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900/95 border border-pink-500/50 rounded-full shadow-2xl backdrop-blur-md text-pink-300 hover:text-pink-100 hover:border-pink-400 transition-all cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
          <span className="text-[11px] font-extrabold uppercase tracking-wider">ALERTAS DE FILA</span>
          <span className="text-[10px] bg-pink-500/30 text-pink-200 px-1.5 py-0.5 rounded-full font-bold">{totalCount}</span>
          <ChevronUp className="w-3.5 h-3.5 text-pink-400" />
        </button>
      </div>
    );
  }

  // Expandido: card centralizado no meio da tela
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="w-80 p-4 bg-slate-950 text-slate-100 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl space-y-3 pointer-events-auto ring-1 ring-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="text-[11px] font-black uppercase tracking-widest text-rose-400">ALERTAS DE FILA</span>
            <span className="text-[10px] bg-rose-500/30 text-rose-200 px-2 py-0.5 rounded-full font-extrabold border border-rose-500/40">
              {currentIndex} de {totalCount}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMinimized(true)}
              className="text-slate-400 hover:text-white text-xs p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Minimizar"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setDismissedIds(prev => [...prev, activeAlertChat.id])}
              className="text-slate-400 hover:text-white text-xs p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Pular / Fechar Este Alerta"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-3.5 bg-rose-950/80 border border-rose-500/80 rounded-xl space-y-1.5 shadow-md">
          <div className="flex items-center gap-2 text-white">
            <MessageCircle className="w-4 h-4 text-rose-300 shrink-0 animate-bounce" />
            <span className="text-xs font-black text-white tracking-wide">Atenção! Cliente aguardando!</span>
          </div>
          <p className="text-xs text-rose-100 font-medium pl-6">
            <strong className="text-white font-extrabold underline decoration-rose-400/50">{activeAlertChat.clientName}</strong> está esperando na fila.
          </p>
        </div>

        <div className="flex gap-2 pt-0.5">
          <button
            onClick={() => {
              onSendSlaWait(activeAlertChat);
              setDismissedIds(prev => [...prev, activeAlertChat.id]);
            }}
            className="flex-1 py-2.5 px-3 text-[11px] font-extrabold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95"
            title="Enviar mensagem inédita de aguarde por SLA"
          >
            <Clock className="w-3.5 h-3.5 text-slate-950 font-bold" /> Enviar Aguarde
          </button>

          <button
            onClick={() => {
              onOpenChat(activeAlertChat.id);
              setDismissedIds(prev => [...prev, activeAlertChat.id]);
            }}
            className="flex-1 py-2.5 px-3 text-[11px] font-extrabold rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            Abrir Chat <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

