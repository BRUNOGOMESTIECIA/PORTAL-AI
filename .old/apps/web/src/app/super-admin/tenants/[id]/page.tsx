"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeftIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  TicketIcon,
  ChartBarSquareIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  AdjustmentsHorizontalIcon,
  PencilSquareIcon,
  CheckBadgeIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function TenantCRMPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [tenantPrompt, setTenantPrompt] = useState("Contexto Especial: Cliente Enterprise com suporte VIP. Não recuse solicitações de mudança de configuração, sempre escale para Nível 2.");
  
  const handleSaveAI = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Configurações de IA do Tenant atualizadas!");
  };

  // Mock Data
  const tenant = {
    id: params.id,
    name: "Stark Enterprises",
    slug: "stark-enterprises",
    plan: "Enterprise Platinum",
    mrr: "$ 14.500,00",
    status: "Ativo",
    createdAt: "2024-01-10",
    ticketsOpen: 12,
    healthScore: 94,
    users: [
      { id: 1, name: "Tony Stark", email: "tony@stark.com", role: "CEO" },
      { id: 2, name: "Pepper Potts", email: "pepper@stark.com", role: "Admin" },
      { id: 3, name: "Happy Hogan", email: "happy@stark.com", role: "Sec Chefe" }
    ],
    slaOverrides: [
      { id: 1, type: "Técnico", priority: "Urgente", defaultTime: "4h", customTime: "1h", active: true },
      { id: 2, type: "Financeiro", priority: "Alta", defaultTime: "24h", customTime: "12h", active: true }
    ]
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto pb-10">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
         <Link href="/super-admin/tenants" className="p-2 bg-gray-900 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
            <ArrowLeftIcon className="w-5 h-5" />
         </Link>
         <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-orange-600 flex items-center justify-center text-white font-black text-2xl shadow-[0_0_20px_rgba(239,68,68,0.4)]">
           {tenant.name.charAt(0)}
         </div>
         <div>
           <div className="flex items-center gap-3">
             <h1 className="text-3xl font-extrabold text-white tracking-tight">{tenant.name}</h1>
             <span className="px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20 uppercase tracking-wider flex items-center gap-1">
               <CheckBadgeIcon className="w-4 h-4" /> {tenant.status}
             </span>
           </div>
           <p className="text-gray-400 mt-1 font-mono text-sm">{tenant.slug}.suporte.com</p>
         </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
         <div className="bg-[#111111] border border-gray-800 p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="flex items-center gap-3 mb-2">
               <CurrencyDollarIcon className="w-5 h-5 text-green-400" />
               <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">MRR Atual</h3>
            </div>
            <p className="text-3xl font-black text-white">{tenant.mrr}</p>
            <p className="text-xs text-gray-500 mt-2 font-bold text-yellow-500 bg-yellow-500/10 inline-block px-2 py-0.5 rounded">{tenant.plan}</p>
         </div>
         <div className="bg-[#111111] border border-gray-800 p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="flex items-center gap-3 mb-2">
               <TicketIcon className="w-5 h-5 text-purple-400" />
               <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Tickets Abertos</h3>
            </div>
            <p className="text-3xl font-black text-white">{tenant.ticketsOpen}</p>
            <p className="text-xs text-gray-500 mt-2">Média de 3 novos/dia</p>
         </div>
         <div className="bg-[#111111] border border-gray-800 p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="flex items-center gap-3 mb-2">
               <ChartBarSquareIcon className="w-5 h-5 text-blue-400" />
               <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Health Score</h3>
            </div>
            <div className="flex items-end gap-2">
               <p className="text-3xl font-black text-white">{tenant.healthScore}</p>
               <span className="text-sm font-bold text-gray-500 mb-1">/ 100</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-1.5 mt-3">
               <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${tenant.healthScore}%` }}></div>
            </div>
         </div>
         <div className="bg-[#111111] border border-gray-800 p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="flex items-center gap-3 mb-2">
               <UserGroupIcon className="w-5 h-5 text-orange-400" />
               <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Usuários Ativos</h3>
            </div>
            <p className="text-3xl font-black text-white">{tenant.users.length}</p>
            <p className="text-xs text-gray-500 mt-2">Limite: 50 licenças</p>
         </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800 mb-6">
         <div className="flex gap-6">
            <button 
              onClick={() => setActiveTab("overview")}
              className={`pb-4 text-sm font-bold transition-colors border-b-2 ${activeTab === "overview" ? "border-purple-500 text-purple-400" : "border-transparent text-gray-500 hover:text-gray-300"}`}
            >
              Visão Geral
            </button>
            <button 
              onClick={() => setActiveTab("users")}
              className={`pb-4 text-sm font-bold transition-colors border-b-2 flex items-center gap-2 ${activeTab === "users" ? "border-purple-500 text-purple-400" : "border-transparent text-gray-500 hover:text-gray-300"}`}
            >
              Equipe do Cliente
              <span className="px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 text-[10px]">{tenant.users.length}</span>
            </button>
            <button 
              onClick={() => setActiveTab("sla")}
              className={`pb-4 text-sm font-bold transition-colors border-b-2 ${activeTab === "sla" ? "border-purple-500 text-purple-400" : "border-transparent text-gray-500 hover:text-gray-300"}`}
            >
              Exceções de SLA (Overrides)
            </button>
            <button 
              onClick={() => setActiveTab("ai")}
              className={`pb-4 text-sm font-bold transition-colors border-b-2 flex items-center gap-2 ${activeTab === "ai" ? "border-purple-500 text-purple-400" : "border-transparent text-gray-500 hover:text-gray-300"}`}
            >
              <SparklesIcon className="w-4 h-4" /> IA Customizada
            </button>
         </div>
      </div>

      {/* Tab Content */}
      <div className="bg-[#111111] border border-gray-800 rounded-2xl p-6 min-h-[400px]">
         
         {activeTab === "overview" && (
            <div className="text-center py-20 text-gray-500 font-bold">
               Gráficos de volumetria de tickets virão aqui.
            </div>
         )}

         {activeTab === "users" && (
            <div className="space-y-4">
               <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-white">Usuários Autorizados</h2>
                  <button className="text-sm font-bold text-purple-400 hover:text-purple-300">Convidar Novo</button>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {tenant.users.map(user => (
                     <div key={user.id} className="p-4 bg-[#0A0A0A] border border-gray-800 rounded-xl flex items-center gap-4 hover:border-gray-700 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center font-bold text-gray-300 uppercase">
                           {user.name.charAt(0)}
                        </div>
                        <div>
                           <div className="text-sm font-bold text-white">{user.name}</div>
                           <div className="text-xs text-gray-500">{user.email}</div>
                           <div className="text-[10px] font-bold text-blue-400 mt-1 uppercase tracking-wider">{user.role}</div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         )}

         {activeTab === "sla" && (
            <div className="space-y-6">
               <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <ShieldCheckIcon className="w-6 h-6 text-purple-400" />
                      Regras Customizadas de SLA
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">Defina tempos de atendimento específicos para este cliente, ignorando as políticas globais.</p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-bold transition-colors">
                     <AdjustmentsHorizontalIcon className="w-5 h-5" /> Adicionar Override
                  </button>
               </div>

               <div className="bg-[#0A0A0A] border border-gray-800 rounded-xl overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-800">
                    <thead className="bg-[#050505]">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Gatilho (Tipo + Prioridade)</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">SLA Global Padrão</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-purple-400 uppercase tracking-wider">SLA Específico (Tenant)</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                      {tenant.slaOverrides.map(override => (
                         <tr key={override.id} className="hover:bg-white/[0.02] transition-colors">
                           <td className="px-6 py-4">
                              <span className="font-bold text-gray-300">{override.type}</span>
                              <span className="mx-2 text-gray-600">+</span>
                              <span className="text-xs font-bold uppercase text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">{override.priority}</span>
                           </td>
                           <td className="px-6 py-4">
                              <span className="text-gray-500 font-medium line-through">{override.defaultTime}</span>
                           </td>
                           <td className="px-6 py-4">
                              <span className="text-purple-400 font-bold bg-purple-500/10 px-3 py-1 rounded-lg border border-purple-500/20">{override.customTime}</span>
                           </td>
                           <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-3">
                                <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded">Ativo</span>
                                <button className="text-gray-500 hover:text-white"><PencilSquareIcon className="w-5 h-5"/></button>
                              </div>
                           </td>
                         </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
            </div>
         )}

         {activeTab === "ai" && (
            <div className="space-y-6 animate-in fade-in duration-300">
               <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <SparklesIcon className="w-6 h-6 text-purple-400" />
                    IA Customizada para {tenant.name}
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">Defina diretrizes e restrições específicas para o Co-Piloto e Bot de Suporte operarem com este cliente.</p>
               </div>

               <form onSubmit={handleSaveAI} className="space-y-8">
                  <div className="bg-[#0A0A0A] border border-gray-800 rounded-xl p-6">
                     <label className="block text-sm font-bold text-white mb-2">System Prompt Específico</label>
                     <p className="text-xs text-gray-500 mb-4">Isto será concatenado ao Prompt Global da plataforma. Use para dar contexto do contrato e comportamento esperado.</p>
                     <textarea 
                        value={tenantPrompt}
                        onChange={(e) => setTenantPrompt(e.target.value)}
                        rows={4}
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-sm text-white font-mono focus:ring-2 focus:ring-purple-500/50 outline-none transition-all resize-y"
                     />
                  </div>

                  <div className="bg-[#0A0A0A] border border-gray-800 rounded-xl p-6">
                     <h3 className="text-sm font-bold text-white mb-4">Permissões da IA para este Tenant</h3>
                     
                     <div className="space-y-4">
                        <label className="flex items-start gap-3 p-4 rounded-xl border border-gray-800 bg-[#111111] cursor-pointer hover:border-gray-700 transition-colors">
                           <input type="checkbox" defaultChecked className="mt-1 flex-shrink-0 w-4 h-4 text-purple-600 bg-gray-900 border-gray-700 rounded" />
                           <div>
                             <p className="text-sm font-semibold text-gray-300">Acesso à Base de Conhecimento Interna</p>
                             <p className="text-xs text-gray-500 mt-0.5">Permite que a IA responda clientes usando artigos restritos (Nível Técnico).</p>
                           </div>
                        </label>

                        <label className="flex items-start gap-3 p-4 rounded-xl border border-gray-800 bg-[#111111] cursor-pointer hover:border-gray-700 transition-colors">
                           <input type="checkbox" className="mt-1 flex-shrink-0 w-4 h-4 text-purple-600 bg-gray-900 border-gray-700 rounded" />
                           <div>
                             <p className="text-sm font-semibold text-gray-300">Ações de Faturamento</p>
                             <p className="text-xs text-gray-500 mt-0.5">Permite que a IA libere 2ª via de boletos ou faça prorrogação de mensalidade automaticamente.</p>
                           </div>
                        </label>
                        
                        <label className="flex items-start gap-3 p-4 rounded-xl border border-gray-800 bg-[#111111] cursor-pointer hover:border-gray-700 transition-colors">
                           <input type="checkbox" defaultChecked className="mt-1 flex-shrink-0 w-4 h-4 text-purple-600 bg-gray-900 border-gray-700 rounded" />
                           <div>
                             <p className="text-sm font-semibold text-gray-300">Escalonamento Autônomo (Override SLA)</p>
                             <p className="text-xs text-gray-500 mt-0.5">Permite que a IA marque a prioridade de um ticket deste cliente como "Urgente" sem aprovação humana.</p>
                           </div>
                        </label>
                     </div>
                  </div>

                  <div className="flex justify-end pt-2">
                     <button type="submit" className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold shadow-[0_0_15px_rgba(147,51,234,0.3)] transition-all">
                       Salvar IA do Tenant
                     </button>
                  </div>
               </form>
            </div>
         )}
      </div>

    </div>
  );
}
