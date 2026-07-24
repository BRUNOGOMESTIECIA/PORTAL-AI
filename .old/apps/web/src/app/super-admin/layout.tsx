"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BuildingOfficeIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ChartPieIcon,
  Cog6ToothIcon,
  StarIcon,
  BookOpenIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  InboxStackIcon,
  CommandLineIcon,
  SparklesIcon,
  BoltIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  Squares2X2Icon,
  Bars3Icon,
  TicketIcon
} from "@heroicons/react/24/outline";
export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsNotificationsOpen(false);
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const menuItems = [
    { href: "/super-admin", label: "Painel Global", icon: Squares2X2Icon },
    { href: "/super-admin/chat", label: "Live Chat", icon: TicketIcon },
    { href: "/super-admin/tenants", label: "Tenants (Empresas)", icon: BuildingOfficeIcon },
    { href: "/super-admin/users", label: "Equipe", icon: UsersIcon },
    { href: "/super-admin/knowledge", label: "Base de Conhecimento", icon: BookOpenIcon },
    { href: "/super-admin/billing", label: "Faturamento", icon: CurrencyDollarIcon },
    { href: "/super-admin/analytics", label: "Estatísticas SaaS", icon: ChartPieIcon },
  ];

  const settingsItems = [
    { href: "/super-admin/ai-engine", label: "AI Engine Tuning", icon: SparklesIcon },
    { href: "/super-admin/automations", label: "Automações & Broadcast", icon: BoltIcon },
    { href: "/super-admin/slas", label: "Políticas de SLA", icon: ShieldCheckIcon },
    { href: "/super-admin/settings", label: "Configurações Globais", icon: Cog6ToothIcon },
    { href: "/super-admin/logs", label: "Auditoria & Logs", icon: CommandLineIcon },
  ];

  const renderLink = (item: any) => {
    const isActive = (item.href === "/super-admin" || item.href === "/admin") 
      ? pathname === item.href 
      : pathname.startsWith(item.href);
      
    return (
      <Link key={item.href} href={item.href} onClick={() => setIsMobileOpen(false)} title={isCollapsed ? item.label : ""} className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group ${isActive ? "bg-purple-600/20 text-purple-400 font-semibold border border-purple-500/30 shadow-inner" : "text-gray-400 hover:bg-gray-800 hover:text-white border border-transparent"} ${isCollapsed ? "justify-center" : ""}`}>
        <div className="flex items-center gap-3">
           <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? "text-purple-400" : "text-gray-500 group-hover:text-purple-400"}`} />
           {!isCollapsed && <span className={`text-sm leading-snug whitespace-normal break-words ${isActive ? "font-semibold tracking-wide" : "font-medium"}`}>{item.label}</span>}
        </div>
        {!isCollapsed && item.badge && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${isActive ? 'bg-purple-500/20 text-purple-300' : 'bg-gray-800 text-gray-400 group-hover:bg-gray-700'}`}>
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden">
      
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Super Admin Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        ${isCollapsed ? "lg:w-20 w-64" : "w-64"} 
        bg-[#0A0A0A] border-r border-gray-800 flex flex-col shadow-2xl flex-shrink-0
      `}>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        
        <div className="p-6 flex flex-col relative z-10">
          <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)] flex-shrink-0">
                 <span className="font-black text-lg text-white">S</span>
               </div>
               {!isCollapsed && (
                 <div className="whitespace-nowrap overflow-hidden">
                   <h2 className="text-xl font-black tracking-tighter text-white leading-tight">Super<span className="text-purple-500">Admin</span></h2>
                 </div>
               )}
             </div>
             {!isCollapsed && (
               <button onClick={() => setIsCollapsed(true)} className="w-6 h-6 rounded-lg bg-gray-800/50 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                  <ChevronLeftIcon className="w-4 h-4" />
               </button>
             )}
          </div>
          {isCollapsed && (
             <button onClick={() => setIsCollapsed(false)} className="mt-6 w-10 h-8 rounded-lg bg-gray-800/50 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors mx-auto">
                 <ChevronRightIcon className="w-4 h-4" />
             </button>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar relative z-10 mt-2">
          {!isCollapsed && <p className="px-2 text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3 mt-2">Gestão da Plataforma</p>}
          {menuItems.map(renderLink)}

          {!isCollapsed && <p className="px-2 text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3 mt-8">Sistema</p>}
          {settingsItems.map(renderLink)}
        </nav>

        <div className="p-4 border-t border-gray-800 relative z-10 bg-gray-900/50">
          <div className="relative" ref={profileRef}>
            <div 
              onClick={() => !isCollapsed && setIsProfileOpen(!isProfileOpen)}
              className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"} p-2 rounded-xl hover:bg-gray-800 transition-colors cursor-pointer border border-transparent hover:border-gray-700`}
            >
              <div className="w-9 h-9 flex-shrink-0 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center font-bold text-white shadow-md text-xs">
                SA
              </div>
              {!isCollapsed && (
                <div className="whitespace-nowrap overflow-hidden flex-1">
                  <p className="text-sm font-bold text-white tracking-wide truncate">Plataforma Owner</p>
                  <p className="text-xs text-gray-500 truncate">owner@saas.com</p>
                </div>
              )}
            </div>
            
            {/* Profile Popover */}
            {isProfileOpen && !isCollapsed && (
              <div className="absolute bottom-full left-0 w-full mb-2 bg-[#111111] border border-gray-800 rounded-xl shadow-2xl p-2 animate-in fade-in slide-in-from-bottom-2">
                 <div className="px-3 py-2 border-b border-gray-800 mb-2">
                    <p className="text-xs text-gray-400 font-bold uppercase">Sua Conta</p>
                 </div>
                 <Link href="/super-admin/profile" onClick={() => setIsProfileOpen(false)} className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2">
                    <Cog6ToothIcon className="w-4 h-4" /> Preferências
                 </Link>
                 <button className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2">
                    <ArrowRightOnRectangleIcon className="w-4 h-4" /> Sair do God Mode
                 </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative w-full">
        <header className="bg-gray-950/80 backdrop-blur-xl border-b border-gray-800 h-20 flex items-center px-4 lg:px-10 z-30 sticky top-0 justify-between">
          <div className="flex items-center gap-3">
             <button 
               onClick={() => setIsMobileOpen(true)}
               className="lg:hidden p-2 -ml-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
             >
               <Bars3Icon className="w-6 h-6" />
             </button>
             <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight flex items-center gap-3">
               <span className="hidden sm:inline">Control Plane</span>
               <span className="inline sm:hidden">Admin</span>
               <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-[10px] lg:text-xs font-bold border border-purple-500/20 uppercase tracking-wider">God Mode</span>
             </h1>
          </div>
          
          {/* Top Actions */}
          <div className="flex items-center gap-4 relative" ref={notifRef}>
             <button 
               onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
               className="w-10 h-10 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition-colors relative"
             >
               <BellIcon className="w-5 h-5" />
               <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-gray-950 rounded-full"></span>
             </button>

             {/* Notifications Dropdown */}
             {isNotificationsOpen && (
               <div className="absolute top-full mt-4 right-0 w-80 bg-[#111111] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                 <div className="p-4 border-b border-gray-800 bg-[#0A0A0A] flex items-center justify-between">
                   <h3 className="text-sm font-bold text-white">Notificações</h3>
                   <button className="text-xs text-purple-400 font-bold hover:text-purple-300">Marcar todas como lidas</button>
                 </div>
                 <div className="max-h-96 overflow-y-auto">
                    <div className="p-4 border-b border-gray-800/50 hover:bg-white/[0.02] transition-colors cursor-pointer border-l-2 border-l-red-500 bg-red-500/5">
                       <p className="text-sm font-bold text-white mb-1">Alerta de SLA Estourado</p>
                       <p className="text-xs text-gray-400 leading-relaxed">O ticket TK-1038 da Global Industries acabou de violar o SLA crítico de 4 horas.</p>
                       <p className="text-[10px] text-gray-500 mt-2 font-semibold">Há 5 min</p>
                    </div>
                    <div className="p-4 hover:bg-white/[0.02] transition-colors cursor-pointer border-l-2 border-l-transparent">
                       <p className="text-sm font-bold text-gray-300 mb-1">Triagem Concluída</p>
                       <p className="text-xs text-gray-500 leading-relaxed">A IA classificou 12 tickets nas últimas 2 horas. 2 foram escalonados.</p>
                       <p className="text-[10px] text-gray-600 mt-2 font-semibold">Há 2 horas</p>
                    </div>
                 </div>
               </div>
             )}
          </div>
        </header>
        <main className={`flex-1 overflow-auto relative ${pathname.includes('/chat') ? 'p-0' : 'p-10'}`}>
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
          
          <div className={`${pathname.includes('/chat') ? 'w-full h-full' : 'max-w-7xl mx-auto'} relative z-10`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
