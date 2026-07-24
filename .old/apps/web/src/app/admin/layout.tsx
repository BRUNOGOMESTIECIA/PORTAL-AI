"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ChartPieIcon, 
  UsersIcon, 
  ShieldCheckIcon, 
  DocumentTextIcon, 
  TicketIcon, 
  Cog6ToothIcon, 
  WrenchScrewdriverIcon, 
  ArrowRightOnRectangleIcon,
  PaintBrushIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Impersonation state
  const [impersonatedTenant, setImpersonatedTenant] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  // Collapse state
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    // Read impersonation state from localStorage
    const tenantName = localStorage.getItem("impersonated_tenant_name");
    const role = localStorage.getItem("mock_user_role");
    
    if (tenantName) setImpersonatedTenant(tenantName);
    if (role) setUserRole(role);
  }, []);

  const handleExitImpersonation = () => {
    localStorage.removeItem("impersonated_tenant_slug");
    localStorage.removeItem("impersonated_tenant_name");
    localStorage.removeItem("mock_user_role");
    router.push("/super-admin/tenants");
  };

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: ChartPieIcon, requiresAdmin: false },
    { name: "Base de Conhecimento", href: "/admin/knowledge", icon: DocumentTextIcon, requiresAdmin: false },
    { name: "Tickets", href: "/admin/tickets", icon: TicketIcon, requiresAdmin: false },
    { name: "Aparência do Chat", href: "/admin/chat-builder", icon: PaintBrushIcon, requiresAdmin: false },
    { name: "Equipe", href: "/admin/users", icon: UsersIcon, requiresAdmin: false },
    { name: "Segurança", href: "/admin/security", icon: ShieldCheckIcon, requiresAdmin: true },
    { name: "Configurações", href: "/admin/settings", icon: Cog6ToothIcon, requiresAdmin: true },
  ];

  // Filtrar o menu: se for um "technician" fazendo impersonação, esconder abas confidenciais (requiresAdmin)
  const filteredNavigation = navigation.filter(item => {
    if (userRole === "technician" && item.requiresAdmin) {
      return false; // Técnicos não veem telas administrativas (Segurança, Faturamento, etc)
    }
    return true;
  });

  return (
    <div className="flex h-screen bg-[#050505] text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className={`${isCollapsed ? "w-20" : "w-64"} bg-[#0A0A0A] border-r border-gray-800 flex flex-col shadow-2xl z-20 relative overflow-hidden transition-all duration-300 flex-shrink-0`}>
        <div className="p-6 flex flex-col relative z-10">
          <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)] flex-shrink-0">
                 <span className="font-bold text-white text-lg">IA</span>
               </div>
               {!isCollapsed && (
                 <div className="whitespace-nowrap overflow-hidden">
                   <h1 className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 leading-tight">Portal Admin</h1>
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
          {!isCollapsed && <p className="px-2 text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3 mt-2">Administração</p>}
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                title={isCollapsed ? item.name : ""}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20 shadow-inner"
                    : "text-gray-400 hover:bg-white/[0.04] hover:text-gray-200 border border-transparent"
                } ${isCollapsed ? "justify-center" : ""}`}
              >
                <item.icon
                  className={`w-5 h-5 flex-shrink-0 transition-colors ${
                    isActive ? "text-blue-400" : "text-gray-500 group-hover:text-blue-400"
                  }`}
                  aria-hidden="true"
                />
                {!isCollapsed && <span className={`text-sm ${isActive ? "font-semibold tracking-wide" : "font-medium"} truncate`}>{item.name}</span>}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-gray-800 relative z-10 bg-gray-900/50">
          <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"} p-2 rounded-xl hover:bg-gray-800 transition-colors cursor-pointer border border-transparent hover:border-gray-700`}>
            <div className="w-9 h-9 flex-shrink-0 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center font-bold text-white shadow-md text-xs">
              AD
            </div>
            {!isCollapsed && (
              <div className="whitespace-nowrap overflow-hidden">
                <p className="text-sm font-bold text-white tracking-wide truncate">Admin User</p>
                <p className="text-xs text-gray-500 truncate">admin@tenant.com</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#050505] relative z-10">
        {/* Top Navbar */}
        <header className="h-16 border-b border-gray-800/60 bg-[#0A0A0A]/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
          {impersonatedTenant ? (
             <div className="flex items-center gap-3 bg-purple-500/10 border border-purple-500/30 px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                <WrenchScrewdriverIcon className="w-4 h-4 text-purple-400 animate-pulse" />
                <span className="text-sm font-semibold text-purple-300">
                  Modo Suporte: Atendendo <strong className="text-white">{impersonatedTenant}</strong>
                </span>
                <button onClick={handleExitImpersonation} className="ml-3 text-xs font-bold text-gray-400 hover:text-white flex items-center gap-1 transition-colors border-l border-purple-500/30 pl-3">
                  Sair <ArrowRightOnRectangleIcon className="w-3.5 h-3.5" />
                </button>
             </div>
          ) : (
             <h2 className="text-sm font-semibold text-gray-400">Ambiente do Cliente</h2>
          )}
          
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center cursor-pointer hover:border-gray-500 transition-colors">
              <span className="text-sm font-bold text-gray-300">A</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8 relative">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />
           {children}
        </main>
      </div>
    </div>
  );
}
