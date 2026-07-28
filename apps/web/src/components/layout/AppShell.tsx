import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Book,
  Bot,
  ChevronLeft,
  ChevronRight,
  Cog,
  LayoutDashboard,
  MessageCircle,
  MessageSquare,
  ShoppingBag,
  Ticket,
  Users,
  Sun,
  Moon,
  Palette
} from 'lucide-react';
import { useAuth } from '../../hooks/use-mock-auth';
import { useTheme } from '../theme-provider';
import { NotificationCenter } from './NotificationCenter';
import { UserMenu } from './UserMenu';
import { AiSearchBar } from '../ai/AiSearchBar';
import { cn } from '../../lib/utils';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Chamados', path: '/tickets', icon: Ticket, permission: 'tickets.view' },
  { label: 'Chat Externo', path: '/chat', icon: MessageCircle, permission: 'chat.view' },
  { label: 'Chat Interno', path: '/internal', icon: MessageSquare },
  { label: 'Base de Conhecimento', path: '/kb', icon: Book, permission: 'kb.view' },
  { label: 'Catálogo de Serviços', path: '/catalog', icon: ShoppingBag, permission: 'catalog.view' },
  { label: 'Relatórios', path: '/reports', icon: BarChart3, permission: 'reports.view' },
];

const ADMIN_ITEMS: NavItem[] = [
  { label: 'Usuários', path: '/admin/users', icon: Users, permission: 'admin.users' },
  { label: 'Automação', path: '/admin/automation', icon: Bot, permission: 'automation.view' },
  { label: 'Configurações', path: '/admin/settings', icon: Cog, permission: 'admin.settings' },
];

export function AppShell() {
  const { hasPermission, deviceInfo } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path: string) => location.pathname.startsWith(path);
  const visible = (item: NavItem) => !item.permission || hasPermission(item.permission);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          'flex flex-col border-r border-border bg-card transition-all duration-300',
          collapsed ? 'w-16' : 'w-64',
        )}
      >
        {/* Logo */}
        <div className={cn('flex items-center border-b border-border p-4', collapsed && 'justify-center')}>
          {!collapsed && (
            <span className="text-lg font-semibold text-primary">Portal ITSM</span>
          )}
          {collapsed && <Ticket className="h-6 w-6 text-primary" />}
        </div>

        {/* AI Search Bar (only when expanded) */}
        {!collapsed && (
          <div className="px-3 py-3 border-b border-border">
            <AiSearchBar compact />
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {NAV_ITEMS.filter(visible).map((item) => (
            <NavLink key={item.path} item={item} isActive={isActive(item.path)} collapsed={collapsed} />
          ))}

          <div className="pt-4 border-t border-border mt-4">
            {ADMIN_ITEMS.filter(visible).map((item) => (
              <NavLink key={item.path} item={item} isActive={isActive(item.path)} collapsed={collapsed} />
            ))}

            {/* Theme Switcher */}
            <div className={cn("mt-4 flex flex-col gap-2", collapsed ? "items-center px-0" : "px-3")}>
              {!collapsed && (
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tema</span>
              )}
              <div className={cn("flex items-center justify-between bg-background border border-border rounded-md p-1", collapsed && "flex-col")}>
                <button
                  onClick={() => setTheme('light')}
                  title="Tema Claro"
                  className={cn("p-1.5 rounded-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors", theme === 'light' && "bg-accent text-foreground")}
                >
                  <Sun className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  title="Tema Escuro"
                  className={cn("p-1.5 rounded-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors", theme === 'dark' && "bg-accent text-foreground")}
                >
                  <Moon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setTheme('original')}
                  title="Tema Original"
                  className={cn("p-1.5 rounded-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors", theme === 'original' && "bg-accent text-foreground")}
                >
                  <Palette className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center p-3 border-t border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="relative z-10 flex h-14 items-center justify-between border-b border-border bg-card px-6">
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            {deviceInfo && (
              <div 
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-accent/60 text-muted-foreground border border-border"
                title={`Dispositivo conectado nesta sessão: ${deviceInfo.label}`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{deviceInfo.label}</span>
              </div>
            )}
            <NotificationCenter />
            <UserMenu />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function NavLink({ item, isActive, collapsed }: { item: NavItem; isActive: boolean; collapsed: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.path}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
        collapsed && 'justify-center px-2',
      )}
      title={collapsed ? item.label : undefined}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}
