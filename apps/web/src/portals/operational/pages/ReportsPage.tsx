import React, { useState } from 'react';
import { MOCK_DASHBOARD_STATS, MOCK_TICKETS } from '../../../mocks/data';
import { Download, Filter, Calendar, Users, Globe, Building2, Activity, Folder, AlertTriangle, Star } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

import { exportTicketsToExcel, generateExecutivePdfReport } from '../../../lib/export-utils';
import { useTickets } from '../../../hooks/use-tickets';
import { formatTicketProtocol } from '../../../lib/audit-logger';
import { StaffLeaderboardWidget } from '../components/StaffLeaderboardWidget';

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#6366f1', '#ef4444', '#8b5cf6'];

export default function ReportsPage() {
  const { tickets } = useTickets();
  const stats = MOCK_DASHBOARD_STATS;
  const total = stats.ticketsByStatus.reduce((s, t) => s + t.count, 0);
  const resolved = MOCK_TICKETS.filter((t) => ['resolved', 'closed'].includes(t.status)).length;

  // Filtros simulados com Período Personalizado
  const [period, setPeriod] = useState('Últimos 30 dias');
  const [customStartDate, setCustomStartDate] = useState('2026-01-01');
  const [customEndDate, setCustomEndDate] = useState(new Date().toISOString().slice(0, 10));

  const [team, setTeam] = useState('Todas as Equipes');
  const [source, setSource] = useState('Todos os Canais');
  const [client, setClient] = useState('Todos os Clientes');
  const [status, setStatus] = useState('Todos os Status');
  const [category, setCategory] = useState('Todas as Categorias');
  const [priority, setPriority] = useState('Todas as Prioridades');

  const activePeriodLabel = period === 'Personalizado'
    ? `${customStartDate} até ${customEndDate}`
    : period;

  // Filtragem dinâmica de tickets
  const filteredTickets = tickets.filter((t) => {
    if (period === 'Personalizado') {
      const ticketDate = new Date(t.createdAt).getTime();
      const start = new Date(customStartDate).getTime();
      const end = new Date(customEndDate + 'T23:59:59').getTime();
      if (ticketDate < start || ticketDate > end) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* ─── HEADER & FILTERS ─── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="flex-shrink-0">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Dashboard de Desempenho</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Visão consolidada da operação de atendimento</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar flex-wrap sm:flex-nowrap">
          {/* Período */}
          <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 shrink-0">
            <Calendar className="w-4 h-4 text-slate-400 mr-2" />
            <select 
              value={period} onChange={(e) => setPeriod(e.target.value)}
              className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
            >
              <option>Hoje</option>
              <option>Últimos 7 dias</option>
              <option>Últimos 30 dias</option>
              <option>Este Ano</option>
              <option value="Personalizado">📅 Período Personalizado</option>
            </select>
          </div>

          {/* Seletores de Data Inicial e Final quando Período = Personalizado */}
          {period === 'Personalizado' && (
            <div className="flex items-center gap-2 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 rounded-lg px-3 py-1.5 shrink-0 animate-in fade-in duration-150">
              <label className="text-xs font-bold text-blue-700 dark:text-blue-300">De:</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 rounded-md px-2 py-1 outline-none"
              />
              <label className="text-xs font-bold text-blue-700 dark:text-blue-300">Até:</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 rounded-md px-2 py-1 outline-none"
              />
            </div>
          )}

          <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 shrink-0">
            <Building2 className="w-4 h-4 text-slate-400 mr-2" />
            <select 
              value={client} onChange={(e) => setClient(e.target.value)}
              className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
            >
              <option>Todos os Clientes</option>
              <option>Acme Corp</option>
              <option>Stark Ind.</option>
              <option>Wayne Ent.</option>
            </select>
          </div>
          
          <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 shrink-0">
            <Users className="w-4 h-4 text-slate-400 mr-2" />
            <select 
              value={team} onChange={(e) => setTeam(e.target.value)}
              className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
            >
              <option>Todas as Equipes</option>
              <option>Suporte N1</option>
              <option>Suporte N2</option>
              <option>Infraestrutura</option>
            </select>
          </div>

          <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 shrink-0">
            <Activity className="w-4 h-4 text-slate-400 mr-2" />
            <select 
              value={status} onChange={(e) => setStatus(e.target.value)}
              className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
            >
              <option>Todos os Status</option>
              <option>Abertos</option>
              <option>Em Andamento</option>
              <option>Resolvidos</option>
            </select>
          </div>

          <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 shrink-0">
            <Folder className="w-4 h-4 text-slate-400 mr-2" />
            <select 
              value={category} onChange={(e) => setCategory(e.target.value)}
              className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
            >
              <option>Todas as Categorias</option>
              <option>Hardware</option>
              <option>Software</option>
              <option>Acesso e Segurança</option>
              <option>Redes</option>
            </select>
          </div>

          <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 shrink-0">
            <AlertTriangle className="w-4 h-4 text-slate-400 mr-2" />
            <select 
              value={priority} onChange={(e) => setPriority(e.target.value)}
              className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
            >
              <option>Todas as Prioridades</option>
              <option>Crítico</option>
              <option>Alto</option>
              <option>Médio</option>
              <option>Baixo</option>
            </select>
          </div>

          <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 shrink-0">
            <Globe className="w-4 h-4 text-slate-400 mr-2" />
            <select 
              value={source} onChange={(e) => setSource(e.target.value)}
              className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
            >
              <option>Todos os Canais</option>
              <option>Portal</option>
              <option>E-mail</option>
              <option>Chat</option>
            </select>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => exportTicketsToExcel(filteredTickets.length > 0 ? filteredTickets : tickets, activePeriodLabel)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-3.5 py-2 rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4" /> Excel (.xlsx)
            </button>

            <button
              onClick={() => generateExecutivePdfReport(stats, activePeriodLabel)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3.5 py-2 rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4" /> Relatório PDF
            </button>
          </div>
        </div>
      </div>

      {/* ─── KPIS PREMIUM ─── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Volumetria Total</p>
          <div className="flex items-end gap-2">
            <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{total}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">chamados</p>
          </div>
          <div className="mt-3 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 inline-block px-2 py-1 rounded font-medium">
            ↑ 12% vs. período anterior
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">SLA 1ª Resposta</p>
          <div className="flex items-end gap-2">
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.slaFirstResponse}%</p>
          </div>
          <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Tempo médio: <strong className="text-slate-700 dark:text-slate-300">{stats.avgFirstResponseMinutes} min</strong>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">SLA Resolução</p>
          <div className="flex items-end gap-2">
            <p className="text-3xl font-bold text-violet-600 dark:text-violet-400">{stats.slaCompliance}%</p>
          </div>
          <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Tempo médio: <strong className="text-slate-700 dark:text-slate-300">{stats.avgResolutionHours}h</strong>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Backlog</p>
          <div className="flex items-end gap-2">
            <p className="text-3xl font-bold text-amber-500 dark:text-amber-400">{stats.openTickets}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">abertos</p>
          </div>
          <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            <strong className="text-red-500">{stats.criticalTickets}</strong> críticos na fila
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Satisfação (CSAT)</p>
          <div className="flex items-end gap-2">
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.csat}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">/ 10</p>
          </div>
          <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Baseado em <strong className="text-slate-700 dark:text-slate-300">{stats.csatReviews}</strong> avaliações
          </div>
        </div>
      </div>

      {/* ─── CHARTS ROW 1 ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gráfico de Evolução */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-6">Tendência de Tickets</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorNovos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorResolvidos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Area type="monotone" name="Abertos" dataKey="novos" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorNovos)" activeDot={{ r: 6, strokeWidth: 0 }} />
                <Area type="monotone" name="Resolvidos" dataKey="resolvidos" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorResolvidos)" activeDot={{ r: 6, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Origem */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">Origem dos Tickets</h2>
          <div className="flex-1 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.ticketsBySource}
                  cx="50%" cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {stats.ticketsBySource.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  itemStyle={{ color: '#1e293b', fontWeight: 500 }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                />
                <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* ─── CHARTS ROW 2 ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gráfico de Status */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-6">Volume por Status</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.ticketsByStatus} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis dataKey="label" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#475569', fontWeight: 500 }} width={100} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" name="Chamados" radius={[0, 6, 6, 0]} barSize={24}>
                  {stats.ticketsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Ofensores */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">Top Ofensores (Categorias)</h2>
          <div className="flex-1 space-y-4">
            {stats.topOffenders.map((offender, index) => {
              const max = Math.max(...stats.topOffenders.map(o => o.count));
              const percent = (offender.count / max) * 100;
              
              return (
                <div key={offender.name} className="flex items-center gap-4 group">
                  <span className="text-sm font-bold text-slate-400 w-4">{index + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition-colors">{offender.name}</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{offender.count}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${percent}%` }} 
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <button className="mt-6 w-full py-2.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 rounded-xl transition-colors">
            Ver Relatório Completo
          </button>
        </div>

      </div>

      {/* Tabela de Pesquisas de Satisfação CSAT Recebidas */}
      {(() => {
        const liveRated = tickets.filter(t => (t as any).rating);
        const ratedList = liveRated.length > 0 ? liveRated : MOCK_TICKETS.filter(t => (t as any).rating);
        const avgScore = ratedList.length > 0
          ? (ratedList.reduce((sum, t) => sum + ((t as any).rating || 5), 0) / ratedList.length).toFixed(1)
          : '5.0';

        return (
          <div className="space-y-6">
            {/* Widget Leaderboard de Produtividade dos Atendentes (Item 081) */}
            <StaffLeaderboardWidget />

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Pesquisas de Satisfação Recebidas (CSAT)</h2>
                  <p className="text-xs text-slate-400">Avaliações em estrelas e feedbacks escritos pelos solicitantes</p>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/50 px-3 py-1 rounded-lg">
                Média Atual: {avgScore} ★
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
                    <th className="py-2.5 px-3">Protocolo</th>
                    <th className="py-2.5 px-3">Solicitante</th>
                    <th className="py-2.5 px-3">Avaliação CSAT</th>
                    <th className="py-2.5 px-3">Comentário Escrito</th>
                    <th className="py-2.5 px-3 text-right">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {ratedList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">
                        Nenhuma avaliação por estrelas registrada no momento.
                      </td>
                    </tr>
                  ) : (
                    ratedList.map((t) => {
                      const score = (t as any).rating || 5;
                      const comment = (t as any).ratingComment;
                      return (
                        <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                            {formatTicketProtocol(t.number || t.id)}
                          </td>
                          <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200">
                            {t.requesterName}
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((n) => (
                                <Star
                                  key={n}
                                  className={`w-3.5 h-3.5 ${n <= score ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'}`}
                                />
                              ))}
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">{score}.0</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-slate-600 dark:text-slate-300 max-w-md">
                            {comment ? (
                              <span className="italic">"{comment}"</span>
                            ) : (
                              <span className="text-slate-400 italic">Sem comentário por escrito</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right text-slate-400">
                            {(t as any).ratedAt ? new Date((t as any).ratedAt).toLocaleDateString('pt-BR') : 'Hoje'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
      })()}
    </div>
  );
}
