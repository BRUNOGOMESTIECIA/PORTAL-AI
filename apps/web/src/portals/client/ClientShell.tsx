import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { HeadphonesIcon, Ticket, BookOpen, LogOut, LayoutGrid, Bell, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../hooks/use-mock-auth';
import { ChatWidget } from './components/ChatWidget';
import { MockClient, MOCK_NOTIFICATIONS, MockNotification } from '../../mocks/data';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useEscapeModal } from '../../hooks/use-escape-modal';

export default function ClientShell() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const client = user as MockClient;

  const [showNotifications, setShowNotifications] = React.useState(false);
  const [notifications, setNotifications] = React.useState<MockNotification[]>(MOCK_NOTIFICATIONS);
  
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
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const navItems = [
    { path: '/portal', label: 'Início', icon: LayoutGrid, exact: true },
    { path: '/portal/tickets', label: 'Meus Chamados', icon: Ticket },
    { path: '/portal/kb', label: 'Base de Conhecimento', icon: BookOpen },
  ];

  const isActive = (path: string, exact?: boolean) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-6 h-14">
          {/* Logo + company */}
          <div className="flex items-center gap-2">
            <HeadphonesIcon className="h-5 w-5 text-blue-600 dark:text-blue-500" />
            <span className="font-semibold text-slate-800 dark:text-white text-sm">
              {client?.company ?? 'Portal de Suporte'}
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
      <main className="mx-auto max-w-5xl px-6 py-8">
        <Outlet />
      </main>

      {/* Floating chat */}
      <ChatWidget />
    </div>
  );
}
