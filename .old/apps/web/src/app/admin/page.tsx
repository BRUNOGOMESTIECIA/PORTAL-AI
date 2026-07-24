"use client";

import { ChartBarIcon, DocumentTextIcon, TicketIcon, SparklesIcon } from "@heroicons/react/24/outline";

export default function AdminDashboard() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Visão Geral</h1>
        <p className="text-gray-400 mt-2">Bem-vindo ao seu portal de atendimento. Veja como a IA está ajudando sua operação.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#111111] border border-gray-800 p-6 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <SparklesIcon className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-gray-400 font-semibold uppercase tracking-wider text-xs">Deflexão de IA</h3>
          </div>
          <p className="text-4xl font-black text-white">74%</p>
          <p className="text-xs text-green-400 mt-2 font-medium">+12% comparado ao mês passado</p>
        </div>

        <div className="bg-[#111111] border border-gray-800 p-6 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <TicketIcon className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-gray-400 font-semibold uppercase tracking-wider text-xs">Tickets Abertos</h3>
          </div>
          <p className="text-4xl font-black text-white">42</p>
          <p className="text-xs text-red-400 mt-2 font-medium">-5 resolvidos hoje</p>
        </div>

        <div className="bg-[#111111] border border-gray-800 p-6 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
              <DocumentTextIcon className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-gray-400 font-semibold uppercase tracking-wider text-xs">Base de Dados</h3>
          </div>
          <p className="text-4xl font-black text-white">128</p>
          <p className="text-xs text-gray-500 mt-2 font-medium">Arquivos PDF sincronizados</p>
        </div>

        <div className="bg-[#111111] border border-gray-800 p-6 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <ChartBarIcon className="w-6 h-6 text-orange-400" />
            </div>
            <h3 className="text-gray-400 font-semibold uppercase tracking-wider text-xs">Tempo de Resposta</h3>
          </div>
          <p className="text-4xl font-black text-white">2.4m</p>
          <p className="text-xs text-green-400 mt-2 font-medium">Melhoria de 30% com IA</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="bg-[#111111] rounded-2xl shadow-xl border border-gray-800 p-6 min-h-[300px] flex flex-col items-center justify-center relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/10 to-transparent pointer-events-none" />
           <p className="text-gray-500 font-medium mb-2">Gráfico: Tickets Criados vs Resolvidos</p>
           <div className="w-full h-40 bg-gray-900/50 rounded-xl border border-gray-800 flex items-center justify-center">
             <span className="text-xs text-gray-600">[Placeholder Gráfico Recharts]</span>
           </div>
        </div>

        <div className="bg-[#111111] rounded-2xl shadow-xl border border-gray-800 p-6">
           <h3 className="text-lg font-bold text-white mb-4">Tickets Recentes</h3>
           <div className="space-y-3">
             {[1,2,3,4].map(i => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-800">
                   <div>
                     <p className="text-sm font-semibold text-gray-200">Dúvida sobre fatura de Abril</p>
                     <p className="text-xs text-gray-500">João Silva • Há 2 horas</p>
                   </div>
                   <span className="px-2 py-1 text-[10px] font-bold uppercase rounded-md bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                     Pendente
                   </span>
                </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}
