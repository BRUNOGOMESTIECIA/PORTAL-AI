import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { HeadphonesIcon, Ticket, BookOpen, LogOut, LayoutGrid, Bell, Sun, Moon, Star, X, CheckCircle2, Layers } from 'lucide-react';
import { useAuth } from '../../hooks/use-mock-auth';
import { ChatWidget } from './components/ChatWidget';
import { MockClient, MOCK_NOTIFICATIONS, MockNotification } from '../../mocks/data';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useEscapeModal } from '../../hooks/use-escape-modal';
import { useTickets } from '../../hooks/use-tickets';
import { formatTicketProtocol, logSecurityAudit } from '../../lib/audit-logger';
import { CorporateFooterWidget } from '../../components/shared/CorporateFooterWidget';
import { PageTransitionWrapper } from '../../components/shared/PageTransitionWrapper';
import { BugReporterCricketWidget } from '../../components/shared/BugReporterCricketWidget';

import { useChats } from '../../hooks/use-chats';
import { toast } from 'sonner';

/**
 * CLIENT SHELL (Portal do Cliente)
 * 
 * Este componente é o "Layout Base" (Wrapper) para todas as páginas que o cliente final acessa.
 * Ele engloba a navegação superior (Navbar), as notificações, o widget de Chat flutuante e a 
 * injeção do componente de pesquisa de satisfação (CSAT) central.
 * A tag <Outlet /> do React Router renderiza as páginas filhas no meio deste layout.
 */
export default function ClientShell() {
  const { user, logout } = useAuth();
  const { tickets, updateTicket } = useTickets();
  const { chats, updateChat } = useChats();
  const location = useLocation();
  const client = user as MockClient;

  // Lê chamados dispensados na sessão atual do navegador
  const [dismissedTicketId, setDismissedTicketIdState] = React.useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('csat_dismissed_ticket_id');
    }
    return null;
  });

  const setDismissedTicketId = (id: string | null) => {
    setDismissedTicketIdState(id);
    if (typeof window !== 'undefined') {
      if (id) sessionStorage.setItem('csat_dismissed_ticket_id', id);
      else sessionStorage.removeItem('csat_dismissed_ticket_id');
    }
  };

  // Detecta chamados ou chats finalizados não avaliados pertencentes a este cliente
  const unratedItem = React.useMemo(() => {
    if (!client) return null;
    
    // 1. Procura em chamados resolvidos/fechados sem avaliação
    const ticketMatch = tickets.find(t => 
      (t.requesterEmail === client.email || t.requesterId === client.id) &&
      ['resolved', 'closed'].includes(t.status) &&
      !(t as any).rating &&
      t.id !== dismissedTicketId
    );

    if (ticketMatch) {
      return {
        type: 'ticket',
        id: ticketMatch.id,
        number: ticketMatch.number || ticketMatch.id,
        raw: ticketMatch
      };
    }

    // 2. Procura em chats encerrados sem avaliação
    const chatMatch = chats.find(c => 
      (c.clientEmail === client.email || (c as any).clientId === client.id) &&
      ['closed', 'finished'].includes(c.status) &&
      !(c as any).rating &&
      c.id !== dismissedTicketId
    );

    if (chatMatch) {
      return {
        type: 'chat',
        id: chatMatch.id,
        number: chatMatch.ticketId || chatMatch.id,
        raw: chatMatch
      };
    }

    return null;
  }, [tickets, chats, client, dismissedTicketId]);

  const handleSendCsat = async (score: number, comment?: string) => {
    if (!unratedItem || score === 0) return;
    
    try {
      const nowIso = new Date().toISOString();
      const ratingData = {
        rating: score,
        ratingComment: comment || '',
        ratedAt: nowIso
      };

      if (unratedItem.type === 'ticket') {
        await updateTicket(unratedItem.id, ratingData as any);

        const linkedChat = chats.find(c => c.ticketId === String(unratedItem.number) || c.id === unratedItem.id);
        if (linkedChat) {
          await updateChat(linkedChat.id, ratingData as any);
        }
      } else {
        await updateChat(unratedItem.id, ratingData as any);

        const linkedTicket = tickets.find(t => String(t.number) === (unratedItem.raw as any).ticketId || t.id === unratedItem.id);
        if (linkedTicket) {
          await updateTicket(linkedTicket.id, ratingData as any);
        }
      }

      logSecurityAudit({
        protocol: formatTicketProtocol(unratedItem.number),
        action: `Pesquisa CSAT (${score} Estrelas)`,
        originPortal: 'Portal do Cliente',
        userName: client?.name || user?.name || 'Cliente',
        userEmail: client?.email || user?.email || '',
        details: comment ? `Comentário: ${comment}` : 'Avaliação registrada via Portal do Cliente'
      });

      toast.success('Obrigado pela sua avaliação!');
      setDismissedTicketId(unratedItem.id);
    } catch (e) {
      console.error("Erro ao enviar avaliação CSAT:", e);
      toast.error('Erro ao registrar avaliação.');
    }
  };

  const [showNotifications, setShowNotifications] = React.useState(false);
  
  const [readNotifs, setReadNotifs] = React.useState<Set<string>>(() => {
    const saved = localStorage.getItem('client_read_notifs');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const notifications = React.useMemo(() => {
    if (!client) return [];
    const clientTickets = tickets.filter(t => t.requesterEmail === client.email || t.requesterId === client.id);
    const notifs: any[] = [];
    
    clientTickets.forEach(t => {
      if (['resolved', 'closed'].includes(t.status)) {
        notifs.push({
          id: `res_${t.id}`,
          title: 'Chamado Resolvido',
          body: `O chamado #${t.number || t.id.substring(0,6)} (${t.title}) foi resolvido.`,
          createdAt: t.updatedAt || t.createdAt,
          read: readNotifs.has(`res_${t.id}`)
        });
      } else if (t.status === 'in_progress') {
        notifs.push({
          id: `prog_${t.id}`,
          title: 'Chamado em Andamento',
          body: `A equipe está trabalhando no chamado #${t.number || t.id.substring(0,6)} (${t.title}).`,
          createdAt: t.updatedAt || t.createdAt,
          read: readNotifs.has(`prog_${t.id}`)
        });
      } else if (t.status === 'open' || t.status === 'new') {
        notifs.push({
          id: `new_${t.id}`,
          title: 'Chamado Registrado',
          body: `Seu chamado #${t.number || t.id.substring(0,6)} foi recebido e está na fila.`,
          createdAt: t.createdAt,
          read: readNotifs.has(`new_${t.id}`)
        });
      }
    });
    
    return notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 15);
  }, [tickets, client, readNotifs]);
  
  useEscapeModal(showNotifications, () => setShowNotifications(false));

  const [isDark, setIsDark] = React.useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
           (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  React.useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setReadNotifs(prev => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem('client_read_notifs', JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const navItems = [
    { path: '/portal', label: 'Início', icon: LayoutGrid, exact: true },
    { path: '/portal/catalog', label: 'Catálogo de Serviços', icon: Layers },
    { path: '/portal/tickets', label: 'Meus Tickets', icon: Ticket },
    { path: '/portal/kb', label: 'Base de Conhecimento', icon: BookOpen },
  ];

  const isActive = (path: string, exact?: boolean) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  // White Label Theme
  const [wlTheme, setWlTheme] = React.useState<any>(null);
  React.useEffect(() => {
    if (client?.companySlug) {
      const saved = localStorage.getItem(`whitelabel_theme_${client.companySlug}`);
      if (saved) {
        try {
          setWlTheme(JSON.parse(saved));
        } catch(e) {}
      }
    }
  }, [client?.companySlug]);

  return (
    <div id="client-portal-root" className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      {wlTheme && (
        <style dangerouslySetInnerHTML={{__html: `
          #client-portal-root .bg-blue-600 { background-color: ${wlTheme.primaryColor} !important; }
          #client-portal-root .text-blue-600 { color: ${wlTheme.primaryColor} !important; }
          #client-portal-root .border-blue-600 { border-color: ${wlTheme.primaryColor} !important; }
          
          #client-portal-root .bg-blue-700 { background-color: ${wlTheme.accentColor} !important; }
          #client-portal-root .text-blue-700 { color: ${wlTheme.accentColor} !important; }
          
          #client-portal-root .hover\\:bg-blue-700:hover { background-color: ${wlTheme.accentColor} !important; }
          #client-portal-root .hover\\:text-blue-700:hover { color: ${wlTheme.accentColor} !important; }
          
          #client-portal-root .bg-blue-50 { background-color: ${wlTheme.primaryColor}15 !important; }
          #client-portal-root .hover\\:bg-blue-50:hover { background-color: ${wlTheme.primaryColor}15 !important; }
          
          #client-portal-root .ring-blue-100 { --tw-ring-color: ${wlTheme.primaryColor}30 !important; }
          #client-portal-root .focus\\:border-blue-400:focus { border-color: ${wlTheme.primaryColor} !important; }
          #client-portal-root .focus\\:border-blue-500:focus { border-color: ${wlTheme.primaryColor} !important; }
          
          #client-portal-root .text-blue-800 { color: ${wlTheme.accentColor} !important; }
          #client-portal-root .hover\\:text-blue-800:hover { color: ${wlTheme.accentColor} !important; }
          #client-portal-root .text-blue-500 { color: ${wlTheme.primaryColor} !important; }
          
          #client-portal-root .dark\\:text-blue-500:is(.dark *) { color: ${wlTheme.primaryColor} !important; }
          #client-portal-root .dark\\:text-blue-400:is(.dark *) { color: ${wlTheme.accentColor} !important; }
          #client-portal-root .dark\\:bg-blue-500\\/10:is(.dark *) { background-color: ${wlTheme.primaryColor}20 !important; }
        `}} />
      )}
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-6 h-14">
          {/* Logo + company */}
          <div className="flex items-center gap-2">
            {wlTheme?.logoUrl ? (
              <img src={wlTheme.logoUrl} alt="Logo" className="h-7 max-w-[120px] object-contain rounded" />
            ) : (
              <HeadphonesIcon className="h-5 w-5 text-blue-600 dark:text-blue-500" />
            )}
            <span className="font-semibold text-slate-800 dark:text-white text-sm">
              {wlTheme?.customTitle || client?.company || 'Portal de Suporte'}
            </span>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path, item.exact);
              return (
                <Link
                  key={item.path} to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${active ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'} transition-all duration-200 hover:-translate-y-[1.5px] active:translate-y-[0.5px] hover:shadow-md`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User menu & Notifications */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 rounded-full transition-colors"
              title="Alternar tema"
            >
              {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 rounded-full transition-colors"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Notificações</h3>
                    {unreadCount > 0 && (
                      <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-full font-medium">
                        {unreadCount} novas
                      </span>
                    )}
                  </div>
                  <div className="max-h-[320px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">Nenhuma notificação.</div>
                    ) : (
                      <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                        {notifications.map((notif) => (
                          <div 
                            key={notif.id} 
                            onClick={() => markAsRead(notif.id)}
                            className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors ${!notif.read ? 'bg-blue-50/30 dark:bg-blue-500/5' : ''}`}
                          >
                            <div className="flex justify-between items-start gap-2 mb-1">
                              <h4 className={`text-sm ${!notif.read ? 'font-semibold text-slate-900 dark:text-slate-100' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                                {notif.title}
                              </h4>
                              {!notif.read && <span className="w-2 h-2 bg-blue-500 rounded-full mt-1 shrink-0" />}
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 leading-relaxed line-clamp-2">{notif.body}</p>
                            <span className="text-xs text-slate-400 dark:text-slate-500">
                              {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: ptBR })}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>

            <Link
              to="/portal/perfil"
              className="hidden sm:flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 group transition-all duration-200 hover:-translate-y-[1.5px] active:translate-y-[0.5px] hover:shadow-md"
            >
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                <span className="text-xs font-semibold text-white leading-none">
                  {client?.name?.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-700 dark:group-hover:text-blue-400">
                {client?.name?.split(' ')[0]}
              </span>
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all duration-200 hover:-translate-y-[1.5px] active:translate-y-[0.5px] hover:shadow-md"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      <nav className="md:hidden flex items-center gap-2 overflow-x-auto px-4 py-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-800 scrollbar-hide">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path, item.exact);
          return (
            <Link
              key={item.path} to={item.path}
              className={`flex shrink-0 items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${active ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'}`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-6 py-8 flex-1 flex flex-col w-full min-h-[calc(100vh-180px)] justify-between">
        <div className="flex-1 flex flex-col">
          <PageTransitionWrapper keyName={location.pathname}>
            <Outlet />
          </PageTransitionWrapper>
        </div>
        {/* Rodapé Corporativo LGPD (Item 102) */}
        <div className="mt-12 pt-4">
          <CorporateFooterWidget />
        </div>
      </main>

      {/* Floating chat */}
      <ChatWidget />

      {/* Grilo Relator de Bugs (Envia para mesa Bub Engenheiros) */}
      <BugReporterCricketWidget />

      {/* Modal Automático de Pesquisa de Satisfação CSAT/NPS Escuro no Centro da Página */}
      {unratedItem && (
        <RatingModalDark
          ticket={unratedItem}
          onClose={() => setDismissedTicketId(unratedItem.id)}
          onConfirm={(score, comment) => handleSendCsat(score, comment)}
        />
      )}
    </div>
  );
}

function RatingModalDark({ ticket, onClose, onConfirm }: { ticket: any; onClose: () => void; onConfirm: (score: number, comment: string) => void }) {
  useEscapeModal(true, onClose);
  const [score, setScore]     = React.useState(0);
  const [hovered, setHovered] = React.useState(0);
  const [comment, setComment] = React.useState('');

  const displayProtocol = formatTicketProtocol(ticket.number || ticket.id);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-[#18181b] border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.15)] rounded-2xl p-6 w-full max-w-md text-center text-white">
        <h2 className="text-lg font-bold tracking-wide uppercase mb-2">Avaliação de Atendimento</h2>
        <p className="text-gray-300 text-sm">
          Este atendimento foi encerrado.<br/>Obrigado!
        </p>
        <div className="my-3 font-semibold text-gray-200">
          Atendimento #{displayProtocol}
        </div>
        <p className="text-sm text-gray-400 mb-3">Como você avalia nosso atendimento?</p>
        
        <div className="flex justify-center gap-1 text-amber-400 text-2xl mb-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setScore(n)}
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(0)}
              className="focus:outline-none transition-transform hover:scale-110 cursor-pointer"
            >
              <Star
                className={`h-8 w-8 transition-colors ${
                  n <= (hovered || score)
                    ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                    : 'text-gray-700 fill-gray-800'
                }`}
              />
            </button>
          ))}
        </div>

        {/* Campo de comentário de no máximo 500 caracteres */}
        <div className="mb-4 text-left">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
            placeholder="Escreva um comentário ou sugestão (opcional, máx 500 caracteres)..."
            rows={3}
            className="w-full text-xs p-3 rounded-xl border border-gray-700 bg-gray-900/80 text-gray-200 outline-none focus:border-purple-500 transition-colors resize-none placeholder:text-gray-500"
          />
          <div className="flex justify-between items-center text-[10px] text-gray-500 mt-1 px-1">
            <span>Opcional</span>
            <span>{comment.length}/500</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 font-medium transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirm(score, comment)}
            disabled={score === 0}
            className="flex-1 py-2.5 rounded-lg bg-white text-black font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Enviar Avaliação
          </button>
        </div>
      </div>
    </div>
  );
}

