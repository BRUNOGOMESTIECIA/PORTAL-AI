"use client";

import { 
  InboxStackIcon, 
  ArrowTrendingUpIcon, 
  BoltIcon, 
  ClockIcon,
  StarIcon,
  ArrowTrendingDownIcon,
  CpuChipIcon,
  UsersIcon,
  BuildingOfficeIcon,
  SparklesIcon,
  DocumentTextIcon,
  TagIcon,
  BanknotesIcon,
  ChatBubbleLeftRightIcon,
  ShieldExclamationIcon,
  MagnifyingGlassIcon,
  PresentationChartLineIcon
} from "@heroicons/react/24/outline";
import { DateRangePicker } from "../../../components/ui/DateRangePicker";

export default function AnalyticsPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto pb-32">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">Métricas Operacionais</h1>
          <p className="text-gray-400">Acompanhe a eficiência do Suporte Técnico e o uso da Inteligência Artificial.</p>
        </div>
        <div className="flex gap-2">
          <DateRangePicker />
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#111111] border border-gray-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
               <InboxStackIcon className="w-5 h-5 text-blue-400" />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded-md border border-red-500/20">
              <ArrowTrendingUpIcon className="w-3 h-3" /> +12%
            </span>
          </div>
          <p className="text-sm font-bold text-gray-500 mb-1">Volume de Tickets</p>
          <p className="text-3xl font-black text-white">4.892 <span className="text-sm font-medium text-gray-500">abertos</span></p>
        </div>

        <div className="bg-[#111111] border border-gray-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
               <CpuChipIcon className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded-md border border-green-500/20">
              <ArrowTrendingUpIcon className="w-3 h-3" /> +45%
            </span>
          </div>
          <p className="text-sm font-bold text-gray-500 mb-1">Impacto da IA</p>
          <div className="flex flex-col gap-1">
            <p className="text-2xl font-black text-white leading-none">1.2k <span className="text-xs font-bold text-indigo-400 uppercase tracking-wide">Resolvidos s/ humanos</span></p>
            <p className="text-xs font-medium text-gray-500">12.4 Milhões de tokens</p>
          </div>
        </div>

        <div className="bg-[#111111] border border-gray-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
               <ClockIcon className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
              <ArrowTrendingDownIcon className="w-3 h-3" /> -45 min
            </span>
          </div>
          <p className="text-sm font-bold text-gray-500 mb-1">Tempo Médio (SLA)</p>
          <p className="text-3xl font-black text-white">2h 15m</p>
        </div>

        <div className="bg-[#111111] border border-gray-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
               <StarIcon className="w-5 h-5 text-yellow-500" />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
              <ArrowTrendingUpIcon className="w-3 h-3" /> +0.2
            </span>
          </div>
          <p className="text-sm font-bold text-gray-500 mb-1">NPS (Satisfação)</p>
          <p className="text-3xl font-black text-white">78 <span className="text-sm font-medium text-gray-500">Excelente</span></p>
        </div>
      </div>

      {/* Main Chart (Tickets vs AI Resolutions) */}
      <div className="mb-6 bg-[#111111] border border-gray-800 rounded-2xl p-8 shadow-xl">
         <div className="flex justify-between items-center mb-8">
           <div>
             <h3 className="text-lg font-bold text-white">Volume de Tickets vs Deflexão por IA</h3>
             <p className="text-sm text-gray-400 mt-1">Como a Base de Conhecimento Inteligente está reduzindo a carga dos técnicos humanos.</p>
           </div>
           <div className="flex gap-4">
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                 <span className="text-xs font-bold text-gray-400">Total de Tickets</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>
                 <span className="text-xs font-bold text-gray-400">Resolvidos pela IA</span>
              </div>
           </div>
         </div>
         
         {/* Pure CSS Mock Chart */}
         <div className="relative h-64 w-full flex items-end justify-between gap-4 pt-10">
            {/* Horizontal Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
               <div className="w-full border-t border-gray-800/50"></div>
               <div className="w-full border-t border-gray-800/50"></div>
               <div className="w-full border-t border-gray-800/50"></div>
               <div className="w-full border-t border-gray-800/50"></div>
               <div className="w-full border-t border-gray-800/50"></div>
            </div>

            {/* Mock Data: [TotalHeight, AIHeight] */}
            {[[40, 5], [55, 10], [45, 15], [60, 25], [75, 40], [65, 45], [80, 50], [95, 65], [85, 65], [70, 60]].map(([total, ai], i) => (
              <div key={i} className="relative flex flex-col items-center flex-1 h-full justify-end group">
                 {/* Tooltip */}
                 <div className="absolute -top-16 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-gray-700 p-3 rounded-lg flex flex-col gap-1 z-10 shadow-xl pointer-events-none min-w-[120px]">
                    <div className="flex justify-between text-xs font-bold">
                       <span className="text-blue-400">Tickets</span>
                       <span className="text-white">{total * 12}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold">
                       <span className="text-indigo-400">IA</span>
                       <span className="text-white">{ai * 12}</span>
                    </div>
                 </div>
                 
                 {/* Stacked Bar container */}
                 <div style={{ height: `${total}%` }} className="w-full max-w-[40px] flex flex-col justify-end relative">
                    {/* Background Bar (Total Tickets) */}
                    <div className="absolute inset-0 bg-blue-500/20 rounded-t-sm border-t-2 border-blue-500/50 group-hover:bg-blue-500/30 transition-all" />
                    
                    {/* Foreground Bar (AI Resolutions) */}
                    <div 
                      style={{ height: `${(ai / total) * 100}%` }} 
                      className="w-full bg-gradient-to-t from-indigo-900 to-indigo-500 rounded-t-sm border-t-2 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)] z-10"
                    />
                 </div>
                 
                 <span className="text-[10px] font-bold text-gray-500 mt-3">Sem. {i+1}</span>
              </div>
            ))}
         </div>
      </div>

      {/* Secção de Inteligência Artificial Avançada */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
         {/* FRT (First Response Time) */}
         <div className="bg-[#111111] border border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
           <div>
             <div className="flex items-center gap-2 text-gray-400 mb-4">
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Primeira Resposta (FRT)</span>
             </div>
             <p className="text-sm text-gray-500 mb-6">Tempo de espera do cliente até ser atendido.</p>
           </div>
           <div className="space-y-4">
             <div className="flex justify-between items-end border-b border-gray-800 pb-3">
                <span className="text-sm font-bold text-indigo-400 flex items-center gap-1"><SparklesIcon className="w-4 h-4" /> Via IA</span>
                <span className="text-2xl font-black text-white">0s <span className="text-xs text-gray-500 font-medium">Instantâneo</span></span>
             </div>
             <div className="flex justify-between items-end pb-2">
                <span className="text-sm font-bold text-gray-400">Via Humano</span>
                <span className="text-2xl font-black text-white">12m <span className="text-xs text-gray-500 font-medium">Média</span></span>
             </div>
           </div>
         </div>

         {/* Deflection Rate & ROI */}
         <div className="bg-[#111111] border border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
           <div>
             <div className="flex items-center gap-2 text-gray-400 mb-4">
                <ShieldExclamationIcon className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Taxa de Deflexão (KB)</span>
             </div>
             <p className="text-sm text-gray-500 mb-4">Sessões em que o usuário achou um artigo e desistiu de abrir um ticket.</p>
           </div>
           <div>
             <div className="flex items-end gap-3 mb-2">
               <span className="text-4xl font-black text-emerald-400">34%</span>
               <span className="text-sm font-bold text-emerald-500/50 mb-1">+5% vs anterior</span>
             </div>
             <div className="bg-gray-900 rounded-xl p-3 border border-gray-800 mt-4 flex items-start gap-3">
               <BanknotesIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
               <div>
                 <p className="text-xs font-bold text-gray-300">ROI Operacional de IA</p>
                 <p className="text-[10px] text-gray-500 mt-1">Custo Nuvem: <span className="text-red-400">R$ 240,00</span></p>
                 <p className="text-[10px] text-gray-500">Horas Técnicas Salvas: <span className="text-green-400">140 horas</span></p>
               </div>
             </div>
           </div>
         </div>

         {/* Trending Issues */}
         <div className="bg-[#111111] border border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col">
           <div className="flex items-center gap-2 text-gray-400 mb-4">
              <TagIcon className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Tópicos em Alta</span>
           </div>
           <p className="text-sm text-gray-500 mb-4">Assuntos mais reportados pela IA hoje.</p>
           
           <div className="flex-1 flex flex-col gap-3 justify-center">
              {[
                { name: "Falha Integração API", perc: 42, color: "bg-red-500" },
                { name: "Dúvida de Faturamento", perc: 28, color: "bg-yellow-500" },
                { name: "Reset de Senha", perc: 15, color: "bg-blue-500" },
                { name: "Outros", perc: 15, color: "bg-gray-600" },
              ].map((topic, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs font-bold text-gray-300 mb-1">
                    <span>{topic.name}</span>
                    <span>{topic.perc}%</span>
                  </div>
                  <div className="w-full bg-gray-900 rounded-full h-1.5">
                    <div className={`${topic.color} h-1.5 rounded-full`} style={{ width: `${topic.perc}%` }}></div>
                  </div>
                </div>
              ))}
           </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Knowledge Base Top Articles */}
        <div className="bg-[#111111] border border-gray-800 rounded-2xl p-6 shadow-xl lg:col-span-2">
           <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5 text-gray-400" /> Artigos Mais Eficazes (Base de Conhecimento)
             </h3>
             <span className="text-xs text-gray-500 font-medium">Quais documentos a IA mais usa para matar tickets</span>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: "Como configurar Webhooks na API v2", hits: 845, helpful: "98%" },
                { title: "Resolução: Erro 500 ao importar CSV", hits: 612, helpful: "92%" },
                { title: "Passo a passo para Upgrade de Plano", hits: 430, helpful: "85%" },
                { title: "Autenticação SSO com Google Workspace", hits: 390, helpful: "99%" },
              ].map((art, i) => (
                <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-[#0A0A0A] border border-gray-800 hover:border-gray-700 transition-colors">
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center text-gray-500">
                       <MagnifyingGlassIcon className="w-4 h-4" />
                     </div>
                     <div>
                       <p className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-xs">{art.title}</p>
                       <p className="text-xs text-indigo-400 mt-1 font-bold">{art.hits} <span className="text-gray-600 font-medium text-[10px] uppercase">usos pela IA</span></p>
                     </div>
                   </div>
                   <div className="text-right">
                     <p className="text-xs text-gray-500 font-bold mb-1">Útil</p>
                     <p className="text-sm font-black text-green-400">{art.helpful}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Clients Ranking */}
        <div className="bg-[#111111] border border-gray-800 rounded-2xl p-6 shadow-xl">
           <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BuildingOfficeIcon className="w-5 h-5 text-gray-400" /> Clientes com Maior Demanda
             </h3>
           </div>
           <div className="space-y-4">
              {[
                { name: "Acme Corporation", tickets: 1205, tokens: "4.5M", health: "red" },
                { name: "Global Industries", tickets: 840, tokens: "2.1M", health: "yellow" },
                { name: "TechNova Solutions", tickets: 620, tokens: "5.2M", health: "green" }, // Usa muita IA e pouco ticket = bom
                { name: "Stark Enterprises", tickets: 450, tokens: "1.8M", health: "green" },
              ].map((client, i) => (
                <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-[#0A0A0A] border border-gray-800 hover:border-gray-700 transition-colors">
                   <div className="flex items-center gap-4">
                     <span className="text-xs font-black text-gray-600">0{i+1}</span>
                     <div>
                       <p className="text-sm font-bold text-white">{client.name}</p>
                       <p className="text-xs text-gray-500 mt-1">{client.tickets} tickets neste mês</p>
                     </div>
                   </div>
                   <div className="text-right">
                     <p className="text-sm font-black text-indigo-400">{client.tokens} <span className="text-[10px] font-bold text-gray-600">TOKENS IA</span></p>
                     <p className={`text-[10px] font-bold mt-1 uppercase tracking-wider ${client.health === 'green' ? 'text-green-500' : client.health === 'red' ? 'text-red-500' : 'text-yellow-500'}`}>
                       {client.health === 'green' ? 'Eficiente' : client.health === 'red' ? 'Alto Custo Ops' : 'Atenção'}
                     </p>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Technicians Leaderboard */}
        <div className="bg-[#111111] border border-gray-800 rounded-2xl p-6 shadow-xl">
           <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UsersIcon className="w-5 h-5 text-gray-400" /> Desempenho da Equipe (Técnicos)
             </h3>
           </div>
           <div className="space-y-4">
              {[
                { name: "Julia Souza", solved: 342, nps: 98, level: "Senior" },
                { name: "Marcos Andrade", solved: 298, nps: 95, level: "Pleno" },
                { name: "Roberto Silva", solved: 240, nps: 88, level: "Senior" },
                { name: "Ana Beatriz", solved: 185, nps: 92, level: "Junior" },
              ].map((tech, i) => (
                <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-[#0A0A0A] border border-gray-800 hover:border-gray-700 transition-colors">
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center font-bold text-white border border-gray-700">
                       {tech.name.split(' ').map(n=>n[0]).join('')}
                     </div>
                     <div>
                       <p className="text-sm font-bold text-white">{tech.name}</p>
                       <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">{tech.level}</p>
                     </div>
                   </div>
                   <div className="flex gap-6 text-right">
                     <div>
                       <p className="text-xs text-gray-500 font-bold mb-1">Resolvidos</p>
                       <p className="text-sm font-black text-white">{tech.solved}</p>
                     </div>
                     <div>
                       <p className="text-xs text-gray-500 font-bold mb-1">CSAT</p>
                       <p className="text-sm font-black text-yellow-500 flex items-center justify-end gap-1">
                         {tech.nps}% <StarIcon className="w-3 h-3 fill-current" />
                       </p>
                     </div>
                   </div>
                </div>
              ))}
           </div>
        </div>

      </div>

      {/* Uso de Sistema - Gráfico Contínuo */}
      <div className="bg-[#111111] border border-gray-800 rounded-2xl p-8 shadow-xl mb-6">
         <div className="flex justify-between items-center mb-8">
           <div>
             <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <PresentationChartLineIcon className="w-5 h-5 text-purple-400" /> Mapa de Picos de Acesso (24h)
             </h3>
             <p className="text-sm text-gray-400 mt-1">Identifique o horário de maior atividade dos usuários e consumo de infraestrutura.</p>
           </div>
           <div className="flex gap-4">
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]"></div>
                 <span className="text-xs font-bold text-gray-400">Pico Crítico (14:00 - 16:00)</span>
              </div>
           </div>
         </div>
         
         <div className="w-full h-48 relative flex items-end">
             {/* Eixo Vertical (Labels) */}
             <div className="absolute left-0 inset-y-0 w-10 flex flex-col justify-between text-[10px] text-gray-600 font-bold">
                 <span>10k</span>
                 <span>5k</span>
                 <span>0</span>
             </div>

             {/* SVG Area Chart */}
             <div className="absolute inset-0 left-12 right-4 bottom-6 border-b border-l border-gray-800/50">
                 {/* Linhas de Grade Horizontais */}
                 <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                     <div className="w-full border-t border-gray-700"></div>
                     <div className="w-full border-t border-gray-700"></div>
                 </div>

                 {/* O Gráfico SVG real */}
                 <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <defs>
                       <linearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="0%" stopColor="rgba(168, 85, 247, 0.4)" />
                         <stop offset="100%" stopColor="rgba(168, 85, 247, 0.0)" />
                       </linearGradient>
                       <linearGradient id="gradientLine" x1="0" y1="0" x2="1" y2="0">
                         <stop offset="0%" stopColor="#3B82F6" />
                         <stop offset="50%" stopColor="#A855F7" />
                         <stop offset="100%" stopColor="#EC4899" />
                       </linearGradient>
                    </defs>
                    
                    {/* Path da Área (Preenchimento) */}
                    <path 
                      d="M0,90 Q5,90 10,85 T25,75 T40,40 T55,10 T70,30 T85,75 T100,85 L100,100 L0,100 Z" 
                      fill="url(#gradientArea)" 
                    />
                    
                    {/* Path da Linha */}
                    <path 
                      d="M0,90 Q5,90 10,85 T25,75 T40,40 T55,10 T70,30 T85,75 T100,85" 
                      fill="none" 
                      stroke="url(#gradientLine)" 
                      strokeWidth="3" 
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]"
                    />
                 </svg>

                 {/* Zonas de Interatividade Invisíveis (24h) */}
                 <div className="absolute inset-0 flex">
                    {[
                      1.2, 0.8, 0.5, 0.3, 0.2, 0.5, 1.5, 3.2, 5.8, 7.5, 8.1, 7.8, 6.5, 7.2, 9.2, 8.8, 6.5, 4.2, 3.8, 4.5, 5.2, 3.8, 2.5, 1.8
                    ].map((val, h) => (
                      <div key={h} className="flex-1 h-full group relative cursor-pointer">
                         {/* Linha tracejada que aparece no hover */}
                         <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-purple-500/0 border-l border-dashed border-purple-400/0 group-hover:border-purple-400 group-hover:bg-purple-500/30 transition-all z-20"></div>
                         
                         {/* Tooltip */}
                         <div className="absolute top-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-purple-500/50 px-3 py-2 rounded-lg text-white text-xs whitespace-nowrap shadow-[0_0_15px_rgba(168,85,247,0.3)] z-30 pointer-events-none flex flex-col items-center">
                            <span className="font-bold text-purple-400">{val}k chamados</span>
                            <span className="text-[10px] text-gray-500">{String(h).padStart(2, '0')}:00h</span>
                         </div>
                      </div>
                    ))}
                 </div>
             </div>

             {/* Eixo Horizontal (Horas) */}
             <div className="absolute left-12 right-4 bottom-0 h-6 flex justify-between items-end text-[10px] font-bold text-gray-500">
                <span>00:00</span>
                <span>04:00</span>
                <span>08:00</span>
                <span>12:00</span>
                <span>16:00</span>
                <span>20:00</span>
                <span>23:59</span>
             </div>
         </div>
      </div>

    </div>
  );
}
