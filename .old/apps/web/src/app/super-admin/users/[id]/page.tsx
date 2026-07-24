"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeftIcon,
  CheckCircleIcon,
  HandThumbUpIcon,
  ClockIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";

import { Select } from "../../../../components/ui/Select";

const availablePermissions = [
  { id: "kb_view", label: "Visualizar Base de Conhecimento", desc: "Pode ler artigos internos e externos." },
  { id: "kb_edit", label: "Editar Base de Conhecimento", desc: "Pode criar e apagar artigos." },
  { id: "tickets_delete", label: "Apagar Tickets", desc: "Pode excluir permanentemente tickets do sistema." },
  { id: "reports_view", label: "Acessar Relatórios", desc: "Pode ver dashboards de métricas globais." },
];

const availableTenants = [
  { id: "t1", name: "Acme Corporation" },
  { id: "t2", name: "Stark Industries" },
  { id: "t3", name: "Wayne Enterprises" },
  { id: "t4", name: "Globex" },
];

export default function TechnicianProfilePage() {
  const router = useRouter();
  const params = useParams();
  
  const [activeTab, setActiveTab] = useState<"log" | "csat" | "permissions">("log");
  
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [techStatus, setTechStatus] = useState<"active" | "suspended" | "pending">("active");

  const [role, setRole] = useState<"admin" | "technician">(params.id === "2" ? "technician" : "admin");
  const [permissions, setPermissions] = useState<string[]>(["kb_edit", "tickets_delete"]);
  const [allowedTenants, setAllowedTenants] = useState<string[]>(["t1", "t2"]);

  const [ticketSearch, setTicketSearch] = useState("");
  const [csatSearch, setCsatSearch] = useState("");

  // Modals
  const [showTicketFilterModal, setShowTicketFilterModal] = useState(false);
  const [showCsatFilterModal, setShowCsatFilterModal] = useState(false);

  // Filters State
  const [ticketStatusFilter, setTicketStatusFilter] = useState<"all" | "open" | "resolved">("all");
  const [ticketTenantFilter, setTicketTenantFilter] = useState<"all" | string>("all");
  const [csatStarFilter, setCsatStarFilter] = useState<number>(0);
  const [csatTenantFilter, setCsatTenantFilter] = useState<"all" | string>("all");

  // Mocked Technician
  const tech = {
    id: params.id,
    name: params.id === "2" ? "Carlos Souza" : "Alice Gomes",
    email: params.id === "2" ? "carlos@acme.com" : "alice@acme.com",
    metrics: { resolvedTotal: 1450, csat: 4.9, avgResponseTime: "8 min", openTickets: 3 }
  };

  // Mock Tickets
  const mockTickets = [
    { id: "#TK-1042", title: "Erro na integração de API", tenant: "Acme Corporation", status: "Resolvido", date: "23 Maio, 10:40", sla: "15 min" },
    { id: "#TK-1041", title: "Dúvida sobre faturamento", tenant: "Stark Industries", status: "Aberto", date: "23 Maio, 09:15", sla: "-" },
    { id: "#TK-1040", title: "Como resetar minha senha?", tenant: "Acme Corporation", status: "Resolvido", date: "22 Maio, 16:30", sla: "5 min" },
    { id: "#TK-1039", title: "Falha ao gerar relatório", tenant: "Wayne Enterprises", status: "Resolvido", date: "22 Maio, 14:00", sla: "42 min" },
  ];

  // Mock Feedbacks
  const mockFeedbacks = [
    { id: 1, ticketId: "#TK-1040", tenant: "Acme Corporation", stars: 5, comment: "Atendimento super rápido e resolveu meu problema de primeira. Alice é nota 10!", date: "22 Maio 2026" },
    { id: 2, ticketId: "#TK-1039", tenant: "Wayne Enterprises", stars: 4, comment: "Demorou um pouco para analisar os logs, mas encontrou a solução.", date: "22 Maio 2026" },
    { id: 3, ticketId: "#TK-1020", tenant: "Stark Industries", stars: 5, comment: "Excelente profissionalismo.", date: "20 Maio 2026" },
  ];

  const filteredTickets = mockTickets.filter(tk => {
    const matchesSearch = tk.title.toLowerCase().includes(ticketSearch.toLowerCase()) || tk.id.toLowerCase().includes(ticketSearch.toLowerCase());
    const matchesStatus = ticketStatusFilter === "all" ? true : ticketStatusFilter === "open" ? tk.status !== "Resolvido" : tk.status === "Resolvido";
    const matchesTenant = ticketTenantFilter === "all" ? true : tk.tenant === ticketTenantFilter;
    return matchesSearch && matchesStatus && matchesTenant;
  });

  const filteredFeedbacks = mockFeedbacks.filter(fb => {
    const matchesSearch = fb.comment.toLowerCase().includes(csatSearch.toLowerCase()) || fb.ticketId.toLowerCase().includes(csatSearch.toLowerCase());
    const matchesStars = csatStarFilter === 0 ? true : fb.stars === csatStarFilter;
    const matchesTenant = csatTenantFilter === "all" ? true : fb.tenant === csatTenantFilter;
    return matchesSearch && matchesStars && matchesTenant;
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto pb-10">
      
      {/* Header with Back Button */}
      <button onClick={() => router.push("/super-admin/users")} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 text-sm font-semibold w-fit">
        <ArrowLeftIcon className="w-4 h-4" />
        Voltar para Equipe
      </button>

      <div className="bg-[#111111] rounded-2xl shadow-2xl border border-gray-800 overflow-hidden mb-8">
        <div className="p-8 bg-gradient-to-r from-[#0A0A0A] to-[#111111] flex justify-between items-start border-b border-gray-800">
           <div className="flex items-center gap-6">
             <div className="w-24 h-24 rounded-full bg-purple-600/20 border-2 border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-4xl shadow-[0_0_30px_rgba(147,51,234,0.2)]">
               {tech.name.charAt(0)}
             </div>
             <div>
               <div className="flex items-center gap-3 mb-1">
                 <h1 className="text-3xl font-extrabold text-white tracking-tight">{tech.name}</h1>
                 <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    techStatus === 'active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                    techStatus === 'suspended' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                    'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                 }`}>
                   {techStatus === 'active' ? 'Ativo' : techStatus === 'suspended' ? 'Suspenso' : 'Pendente'}
                 </span>
               </div>
               <p className="text-gray-400">{tech.email} • ID: {tech.id}</p>
               <div className="mt-3 inline-flex px-3 py-1 bg-gray-900 border border-gray-700 rounded-lg text-xs font-bold text-gray-300 uppercase tracking-widest">
                 {role === 'admin' ? 'Administrador' : 'Técnico de Suporte'}
               </div>
             </div>
           </div>
           
           <div className="flex gap-3">
             {techStatus === 'suspended' ? (
               <button onClick={() => setTechStatus('active')} className="px-5 py-2.5 bg-green-600 border border-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-500 transition-colors shadow-[0_0_15px_rgba(22,163,74,0.3)]">
                 Reativar Conta
               </button>
             ) : (
               <button onClick={() => setShowSuspendModal(true)} className="px-5 py-2.5 bg-gray-900 border border-gray-700 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors">
                 Suspender Conta
               </button>
             )}
           </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-4 gap-0 divide-x divide-gray-800 border-b border-gray-800 bg-[#0A0A0A]">
          <div className="p-6">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <CheckCircleIcon className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Tickets Resolvidos</span>
            </div>
            <p className="text-3xl font-black text-white">{tech.metrics.resolvedTotal}</p>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <HandThumbUpIcon className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">CSAT Histórico</span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-black text-white">{tech.metrics.csat}</p>
              <StarIcon className="w-5 h-5 text-yellow-500" />
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <ClockIcon className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">TMA (Resposta)</span>
            </div>
            <p className="text-3xl font-black text-purple-400">{tech.metrics.avgResponseTime}</p>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <ChartBarIcon className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Fila Atual</span>
            </div>
            <p className="text-3xl font-black text-red-400">{tech.metrics.openTickets}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-[#0A0A0A] px-6 pt-4 gap-6">
           <button onClick={() => setActiveTab("log")} className={`pb-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'log' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
             <ChartBarIcon className="w-5 h-5" /> Histórico de Tickets
           </button>
           <button onClick={() => setActiveTab("csat")} className={`pb-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'csat' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
             <StarIcon className="w-5 h-5" /> Avaliações (CSAT)
           </button>
           <button onClick={() => setActiveTab("permissions")} className={`pb-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'permissions' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
             <ShieldCheckIcon className="w-5 h-5" /> Permissões & Carteira
           </button>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === "log" && (
        <div className="bg-[#111111] border border-gray-800 rounded-2xl shadow-xl overflow-hidden animate-in fade-in">
           <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#0A0A0A]">
             <div className="relative w-96">
               <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-2.5 text-gray-500" />
               <input type="text" value={ticketSearch} onChange={e => setTicketSearch(e.target.value)} placeholder="Buscar ticket por ID ou título..." className="w-full bg-[#111111] border border-gray-800 text-sm text-white pl-10 pr-4 py-2.5 rounded-xl focus:ring-2 focus:ring-purple-500/50 outline-none" />
             </div>
             <button onClick={() => setShowTicketFilterModal(true)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${ticketStatusFilter !== 'all' || ticketTenantFilter !== 'all' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'bg-[#111111] border border-gray-800 text-gray-300 hover:text-white hover:bg-gray-900'}`}>
               <AdjustmentsHorizontalIcon className="w-5 h-5" />
               Filtros {(ticketStatusFilter !== 'all' || ticketTenantFilter !== 'all') && "(Ativos)"}
             </button>
           </div>
           
           <table className="min-w-full divide-y divide-gray-800">
             <thead className="bg-[#050505]">
               <tr>
                 <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Ticket</th>
                 <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Empresa (Tenant)</th>
                 <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Data / Status</th>
                 <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Tempo Resolução</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-800/50">
               {filteredTickets.map((tk) => (
                 <tr 
                   key={tk.id} 
                   onClick={() => router.push(`/super-admin/tickets/${tk.id.replace('#', '')}`)}
                   className="hover:bg-[#151515] hover:border-purple-500/20 transition-colors cursor-pointer group"
                 >
                   <td className="px-6 py-4 whitespace-nowrap">
                     <span className="block font-bold text-purple-400 text-sm mb-1">{tk.id}</span>
                     <span className="block text-gray-200 text-sm font-medium">{tk.title}</span>
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap">
                     <div className="flex items-center gap-2 text-gray-300 text-sm">
                       <BuildingOfficeIcon className="w-4 h-4 text-gray-500" /> {tk.tenant}
                     </div>
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap">
                      <span className="block text-xs text-gray-400 mb-1">{tk.date}</span>
                      {tk.status === 'Resolvido' ? (
                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/10 text-green-400 uppercase border border-green-500/20">Resolvido</span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 uppercase border border-blue-500/20">Em Aberto</span>
                      )}
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap">
                     <div className="flex items-center justify-between">
                       <span className="text-gray-300 text-sm font-semibold">{tk.sla}</span>
                       <div className="text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs font-bold">
                         Ver <ArrowRightIcon className="w-3 h-3" />
                       </div>
                     </div>
                   </td>
                 </tr>
               ))}
               {filteredTickets.length === 0 && (
                 <tr><td colSpan={4} className="text-center py-8 text-gray-500">Nenhum ticket encontrado com "{ticketSearch}"</td></tr>
               )}
             </tbody>
           </table>

           <div className="p-4 border-t border-gray-800 bg-[#0A0A0A] flex justify-between items-center">
             <p className="text-sm text-gray-500 font-medium">Mostrando <span className="text-white">{filteredTickets.length}</span> resultados</p>
             <div className="flex gap-2">
               <button className="p-2 border border-gray-800 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors disabled:opacity-50"><ChevronLeftIcon className="w-4 h-4"/></button>
               <button className="p-2 border border-gray-800 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"><ChevronRightIcon className="w-4 h-4"/></button>
             </div>
           </div>
        </div>
      )}

      {activeTab === "csat" && (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-4 border border-gray-800 rounded-2xl flex justify-between items-center bg-[#0A0A0A] mb-4 shadow-sm">
             <div className="relative w-96">
               <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-2.5 text-gray-500" />
               <input type="text" value={csatSearch} onChange={e => setCsatSearch(e.target.value)} placeholder="Buscar avaliação por comentário ou ID..." className="w-full bg-[#111111] border border-gray-800 text-sm text-white pl-10 pr-4 py-2.5 rounded-xl focus:ring-2 focus:ring-purple-500/50 outline-none" />
             </div>
             <button onClick={() => setShowCsatFilterModal(true)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${csatStarFilter !== 0 || csatTenantFilter !== 'all' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'bg-[#111111] border border-gray-800 text-gray-300 hover:text-white hover:bg-gray-900'}`}>
               <AdjustmentsHorizontalIcon className="w-5 h-5" />
               Filtros {(csatStarFilter !== 0 || csatTenantFilter !== 'all') && `(Ativos)`}
             </button>
           </div>

          {filteredFeedbacks.map(fb => (
            <div 
              key={fb.id} 
              onClick={() => router.push(`/super-admin/tickets/${fb.ticketId.replace('#', '')}`)}
              className="bg-[#111111] border border-gray-800 rounded-2xl p-6 shadow-sm hover:border-purple-500/40 hover:bg-[#151515] hover:shadow-[0_0_20px_rgba(147,51,234,0.1)] transition-all cursor-pointer flex gap-6 group"
            >
              <div className="flex-shrink-0 pt-1">
                <div className="flex gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className={`w-5 h-5 transition-transform group-hover:scale-110 ${i < fb.stars ? 'text-yellow-500' : 'text-gray-800'}`} />
                  ))}
                </div>
                <p className="text-xl font-black text-white">{fb.stars}.0</p>
              </div>
              <div className="border-l border-gray-800 pl-6 w-full flex justify-between items-start">
                <div>
                  <p className="text-gray-300 italic text-lg mb-4">"{fb.comment}"</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="font-bold text-purple-400 bg-purple-500/10 px-2 py-1 rounded-lg border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors">{fb.ticketId}</span>
                    <span className="font-medium text-gray-400">{fb.tenant}</span>
                    <span>{fb.date}</span>
                  </div>
                </div>
                <div className="text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-sm font-bold mt-2">
                  Ver Atendimento <ArrowRightIcon className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
          {filteredFeedbacks.length === 0 && (
             <div className="text-center py-10 text-gray-500 bg-[#111111] rounded-2xl border border-gray-800">Nenhuma avaliação encontrada com "{csatSearch}"</div>
          )}
        </div>
      )}

      {activeTab === "permissions" && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Cargo do Usuário</h3>
            <div className="bg-[#111111] border border-gray-800 rounded-xl p-1 flex w-full max-w-md">
               <button onClick={() => setRole('admin')} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${role === 'admin' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'}`}>
                 Administrador
               </button>
               <button onClick={() => setRole('technician')} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${role === 'technician' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'}`}>
                 Técnico de Suporte
               </button>
            </div>
            <p className="text-xs text-gray-500 mt-3 font-medium">O Administrador ignora as configurações de Tenant abaixo e tem acesso total irrestrito.</p>
          </div>

          <div className={`grid grid-cols-2 gap-8 transition-opacity duration-300 ${role === 'admin' ? 'opacity-40 pointer-events-none' : ''}`}>
            <div className="bg-[#111111] border border-gray-800 rounded-2xl p-8 shadow-sm">
               <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                 <ShieldCheckIcon className="w-5 h-5 text-purple-400" /> Feature Flags do Sistema
               </h2>
               <p className="text-sm text-gray-400 mb-6">Controle as permissões globais de uso das ferramentas da plataforma.</p>
               
               <div className="space-y-3">
                  {availablePermissions.map(perm => {
                    const isChecked = role === 'admin' ? true : permissions.includes(perm.id);
                    return (
                      <label key={perm.id} className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer ${isChecked ? 'bg-purple-500/10 border-purple-500/30' : 'bg-[#0A0A0A] border-gray-800 hover:bg-gray-900'}`}>
                        <input 
                          type="checkbox" 
                          checked={isChecked}
                          onChange={() => {
                            if(isChecked) setPermissions(permissions.filter(p => p !== perm.id));
                            else setPermissions([...permissions, perm.id]);
                          }}
                          className="mt-1 flex-shrink-0 w-4 h-4 text-purple-600 bg-gray-900 border-gray-700 rounded focus:ring-purple-500/50 transition-colors" 
                        />
                        <div>
                          <p className={`text-sm font-bold ${isChecked ? 'text-purple-400' : 'text-gray-300'}`}>{perm.label}</p>
                          <p className="text-xs text-gray-500 mt-1">{perm.desc}</p>
                        </div>
                      </label>
                    );
                  })}
               </div>
            </div>

            <div className="bg-[#111111] border border-gray-800 rounded-2xl p-8 shadow-sm h-fit">
               <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                 <BuildingOfficeIcon className="w-5 h-5 text-purple-400" /> Carteira de Clientes (Tenants)
               </h2>
               <p className="text-sm text-gray-400 mb-6">Selecione quais empresas este técnico tem permissão para visualizar e atender os chamados. Se nenhuma estiver selecionada, ele terá acesso global.</p>
               
               <div className="space-y-2 bg-[#0A0A0A] p-4 rounded-xl border border-gray-800 max-h-96 overflow-y-auto custom-scrollbar">
                  {availableTenants.map(tenant => {
                    const isChecked = role === 'admin' ? true : allowedTenants.includes(tenant.id);
                    return (
                      <label key={tenant.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-900 transition-colors cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={isChecked}
                          onChange={() => {
                            if(isChecked) setAllowedTenants(allowedTenants.filter(t => t !== tenant.id));
                            else setAllowedTenants([...allowedTenants, tenant.id]);
                          }}
                          className="flex-shrink-0 w-4 h-4 text-purple-600 bg-gray-900 border-gray-700 rounded focus:ring-purple-500/50 transition-colors" 
                        />
                        <span className={`text-sm font-semibold transition-colors ${isChecked ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>{tenant.name}</span>
                      </label>
                    );
                  })}
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Modal */}
      {showSuspendModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#111111] border border-gray-800 rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-gray-800 flex justify-between items-center bg-[#0A0A0A]">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
                Suspender Técnico
              </h2>
              <button onClick={() => setShowSuspendModal(false)} className="text-gray-500 hover:text-white transition-colors">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                Tem certeza que deseja suspender o acesso de <strong className="text-white">{tech.name}</strong>?
              </p>
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-xs text-red-400 leading-relaxed">
                Esta ação bloqueará o login imediatamente. Os <strong className="text-red-300">{tech.metrics.openTickets} tickets</strong> que estão atualmente na fila deste técnico deverão ser reatribuídos para outro membro da equipe.
              </div>
            </div>

            <div className="px-6 py-5 border-t border-gray-800 bg-[#0A0A0A] flex justify-end gap-3">
              <button onClick={() => setShowSuspendModal(false)} className="px-5 py-2.5 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">Cancelar</button>
              <button 
                onClick={() => {
                  setTechStatus("suspended");
                  setShowSuspendModal(false);
                }} 
                className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-500 shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all"
              >
                Sim, Suspender
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Filter Modal */}
      {showTicketFilterModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#111111] border border-gray-800 rounded-2xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-gray-800 flex justify-between items-center bg-[#0A0A0A]">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <AdjustmentsHorizontalIcon className="w-5 h-5 text-purple-400" />
                Filtrar Tickets
              </h2>
              <button onClick={() => setShowTicketFilterModal(false)} className="text-gray-500 hover:text-white transition-colors">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">Status do Ticket</label>
                <Select 
                  value={ticketStatusFilter}
                  onChange={(val) => setTicketStatusFilter(val as any)}
                  options={[
                    { value: "all", label: "Todos os Status" },
                    { value: "open", label: "Apenas em Aberto" },
                    { value: "resolved", label: "Apenas Resolvidos" }
                  ]}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">Empresa (Tenant)</label>
                <Select 
                  value={ticketTenantFilter}
                  onChange={setTicketTenantFilter}
                  options={[
                    { value: "all", label: "Todas as Empresas" },
                    ...availableTenants.map(t => ({ value: t.name, label: t.name }))
                  ]}
                />
              </div>
            </div>

            <div className="px-6 py-5 border-t border-gray-800 bg-[#0A0A0A] flex justify-between items-center">
              <button 
                onClick={() => { setTicketStatusFilter("all"); setTicketTenantFilter("all"); setShowTicketFilterModal(false); }} 
                className="text-sm font-bold text-gray-500 hover:text-gray-300 transition-colors"
              >
                Limpar Filtros
              </button>
              <button onClick={() => setShowTicketFilterModal(false)} className="px-6 py-2.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.4)] transition-all">
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSAT Filter Modal */}
      {showCsatFilterModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#111111] border border-gray-800 rounded-2xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-gray-800 flex justify-between items-center bg-[#0A0A0A]">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <StarIcon className="w-5 h-5 text-yellow-500" />
                Filtrar Avaliações
              </h2>
              <button onClick={() => setShowCsatFilterModal(false)} className="text-gray-500 hover:text-white transition-colors">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">Empresa (Tenant)</label>
                <Select 
                  value={csatTenantFilter}
                  onChange={setCsatTenantFilter}
                  options={[
                    { value: "all", label: "Todas as Empresas" },
                    ...availableTenants.map(t => ({ value: t.name, label: t.name }))
                  ]}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-400 mb-4">Quantidade de Estrelas</label>
                <div className="space-y-2">
                   <button onClick={() => setCsatStarFilter(0)} className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors ${csatStarFilter === 0 ? 'bg-purple-600/10 border-purple-500/30 text-purple-400' : 'bg-gray-900 border-gray-800 text-gray-300 hover:bg-gray-800'}`}>
                     <span className="font-bold">Todas as Notas</span>
                   </button>
                   {[5, 4, 3, 2, 1].map(stars => (
                     <button key={stars} onClick={() => setCsatStarFilter(stars)} className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors ${csatStarFilter === stars ? 'bg-purple-600/10 border-purple-500/30' : 'bg-gray-900 border-gray-800 hover:bg-gray-800'}`}>
                       <div className="flex gap-1">
                         {[...Array(5)].map((_, i) => (
                           <StarIcon key={i} className={`w-4 h-4 ${i < stars ? 'text-yellow-500' : 'text-gray-700'}`} />
                         ))}
                       </div>
                     </button>
                   ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-5 border-t border-gray-800 bg-[#0A0A0A] flex justify-between items-center">
              <button 
                onClick={() => { setCsatStarFilter(0); setCsatTenantFilter("all"); setShowCsatFilterModal(false); }} 
                className="text-sm font-bold text-gray-500 hover:text-gray-300 transition-colors"
              >
                Limpar Filtros
              </button>
              <button onClick={() => setShowCsatFilterModal(false)} className="px-6 py-2.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.4)] transition-all">
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
