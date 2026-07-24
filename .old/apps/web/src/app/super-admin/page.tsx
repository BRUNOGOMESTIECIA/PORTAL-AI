"use client";

import { 
  UsersIcon, 
  BuildingOfficeIcon, 
  CurrencyDollarIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  ChatBubbleLeftRightIcon
} from "@heroicons/react/24/outline";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

const dataMRR = [
  { name: 'Jan', mrr: 4000 },
  { name: 'Fev', mrr: 3000 },
  { name: 'Mar', mrr: 5000 },
  { name: 'Abr', mrr: 7000 },
  { name: 'Mai', mrr: 6500 },
  { name: 'Jun', mrr: 9000 },
  { name: 'Jul', mrr: 12500 },
];

const dataAI = [
  { name: 'Seg', ai: 40, human: 60 },
  { name: 'Ter', ai: 45, human: 55 },
  { name: 'Qua', ai: 55, human: 45 },
  { name: 'Qui', ai: 60, human: 40 },
  { name: 'Sex', ai: 70, human: 30 },
  { name: 'Sab', ai: 85, human: 15 },
  { name: 'Dom', ai: 90, human: 10 },
];

export default function SuperAdminDashboard() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto pb-20">
      
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          Visão Global da Plataforma
          <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-xs font-bold border border-purple-500/20 uppercase tracking-wider flex items-center gap-1">
             <SparklesIcon className="w-3.5 h-3.5" /> IA Engine Online
          </span>
        </h1>
        <p className="text-gray-400 mt-2">Métricas gerais, faturamento e eficiência da Inteligência Artificial nos tenants.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
         {/* Card 1 */}
         <div className="bg-[#111111] border border-gray-800 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-[40px] rounded-full pointer-events-none group-hover:bg-green-500/10 transition-colors" />
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                 <CurrencyDollarIcon className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-xs font-bold text-green-400 flex items-center gap-1">
                 <ArrowTrendingUpIcon className="w-3 h-3" /> +12.5%
              </span>
            </div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">MRR Atual</p>
            <h3 className="text-3xl font-black text-white">$ 12.500,00</h3>
         </div>

         {/* Card 2 */}
         <div className="bg-[#111111] border border-gray-800 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[40px] rounded-full pointer-events-none group-hover:bg-blue-500/10 transition-colors" />
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                 <BuildingOfficeIcon className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-xs font-bold text-blue-400 flex items-center gap-1">
                 <ArrowTrendingUpIcon className="w-3 h-3" /> +2
              </span>
            </div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Tenants Ativos</p>
            <h3 className="text-3xl font-black text-white">48</h3>
         </div>

         {/* Card 3 */}
         <div className="bg-[#111111] border border-gray-800 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-[40px] rounded-full pointer-events-none group-hover:bg-purple-500/10 transition-colors" />
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                 <SparklesIcon className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-xs font-bold text-purple-400 flex items-center gap-1">
                 <ArrowTrendingUpIcon className="w-3 h-3" /> +18%
              </span>
            </div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Deflection Rate (IA)</p>
            <h3 className="text-3xl font-black text-white">72.4%</h3>
         </div>

         {/* Card 4 */}
         <div className="bg-[#111111] border border-gray-800 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-[40px] rounded-full pointer-events-none group-hover:bg-orange-500/10 transition-colors" />
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                 <ChatBubbleLeftRightIcon className="w-5 h-5 text-orange-400" />
              </div>
            </div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Tickets (24h)</p>
            <h3 className="text-3xl font-black text-white">1.042</h3>
         </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         
         {/* Chart 1: MRR Growth */}
         <div className="bg-[#111111] border border-gray-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">Crescimento de Receita (MRR)</h3>
            <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={dataMRR} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                   <defs>
                     <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                       <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <XAxis dataKey="name" stroke="#374151" fontSize={12} tickLine={false} axisLine={false} />
                   <YAxis stroke="#374151" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                   <Tooltip 
                     contentStyle={{ backgroundColor: '#111111', borderColor: '#374151', borderRadius: '12px', color: '#fff' }}
                     itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                   />
                   <Area type="monotone" dataKey="mrr" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorMrr)" />
                 </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Chart 2: AI vs Human */}
         <div className="bg-[#111111] border border-gray-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center justify-between">
               Taxa de Resolução: IA vs Humanos
               <span className="text-xs font-bold text-gray-500 bg-gray-900 px-2 py-1 rounded-lg">Últimos 7 dias</span>
            </h3>
            <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={dataAI} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                   <XAxis dataKey="name" stroke="#374151" fontSize={12} tickLine={false} axisLine={false} />
                   <YAxis stroke="#374151" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                   <Tooltip 
                     contentStyle={{ backgroundColor: '#111111', borderColor: '#374151', borderRadius: '12px', color: '#fff' }}
                     cursor={{ fill: '#ffffff05' }}
                   />
                   <Bar dataKey="ai" stackId="a" fill="#a855f7" radius={[0, 0, 4, 4]} name="Resolvido pela IA" />
                   <Bar dataKey="human" stackId="a" fill="#374151" radius={[4, 4, 0, 0]} name="Resolvido por Humanos" />
                 </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

      </div>

    </div>
  );
}
