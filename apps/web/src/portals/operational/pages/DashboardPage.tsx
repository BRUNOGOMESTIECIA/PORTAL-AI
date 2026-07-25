import React from 'react';
import { Link } from 'react-router-dom';
import { Ticket, MessageCircle, TrendingUp, AlertTriangle, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { MOCK_DASHBOARD_STATS, MOCK_STAFF } from '../../../mocks/data';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTickets } from '../../../hooks/use-tickets';
import { useChats } from '../../../hooks/use-chats';

function StatCard({ label, value, sub, icon: Icon, color }: { label: string; value: string | number; sub?: string; icon: React.ComponentType<{ className?: string }>; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new: { label: 'Novo', color: 'bg-indigo-100 text-indigo-700' },
  open: { label: 'Aberto', color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'Em andamento', color: 'bg-amber-100 text-amber-700' },
  pending: { label: 'Pendente', color: 'bg-purple-100 text-purple-700' },
  resolved: { label: 'Resolvido', color: 'bg-green-100 text-green-700' },
  closed: { label: 'Fechado', color: 'bg-slate-100 text-slate-600' },
};

const PRIORITY_COLORS: Record<string, string> = {
  critical: 'text-red-600', high: 'text-orange-500', medium: 'text-amber-500', low: 'text-slate-400',
};

export default function DashboardPage() {
  const { tickets, seedMockData: seedTickets } = useTickets();
  const { chats, seedMockData: seedChats } = useChats();
  
  const waitingChats = chats.filter((c) => c.status === 'waiting');
  const activeChats = chats.filter((c) => c.status === 'active');
  const recentTickets = tickets.filter((t) => !['closed'].includes(t.status)).slice(0, 6);
  
  const openTicketsCount = tickets.filter(t => !['closed', 'resolved'].includes(t.status)).length;
  const criticalTicketsCount = tickets.filter(t => ['critical', 'high'].includes(t.priority) && !['closed', 'resolved'].includes(t.status)).length;
  
  const ticketsByStatus = [
    { label: 'Novo', count: tickets.filter(t => t.status === 'new').length, color: '#6366f1' },
    { label: 'Aberto', count: tickets.filter(t => t.status === 'open').length, color: '#3b82f6' },
    { label: 'Em andamento', count: tickets.filter(t => t.status === 'in_progress').length, color: '#f59e0b' },
    { label: 'Pendente', count: tickets.filter(t => t.status === 'pending').length, color: '#8b5cf6' },
    { label: 'Resolvido', count: tickets.filter(t => t.status === 'resolved').length, color: '#22c55e' },
    { label: 'Fechado', count: tickets.filter(t => t.status === 'closed').length, color: '#6b7280' },
  ];

  const total = tickets.length || 1; // Evitar divisão por zero

  const recentActivity = [...tickets].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4).map(t => ({
    text: `${t.requesterName} abriu chamado #${t.number}`,
    time: formatDistanceToNow(new Date(t.createdAt), { addSuffix: true, locale: ptBR })
  }));

  const stats = {
    slaCompliance: 87,
    avgResolutionHours: 4.2
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Visão geral em tempo real</p>
        </div>
        <div className="flex gap-2">
          <button onClick={seedTickets} className="text-sm bg-slate-100 px-3 py-1.5 rounded-lg font-medium text-slate-700 hover:bg-slate-200">
            Carregar Tickets Teste
          </button>
          <button onClick={seedChats} className="text-sm bg-slate-100 px-3 py-1.5 rounded-lg font-medium text-slate-700 hover:bg-slate-200">
            Carregar Chats Teste
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Chamados abertos" value={openTicketsCount} sub="Todos os status ativos" icon={Ticket} color="bg-blue-50 text-blue-600" />
        <StatCard label="Críticos / Altos" value={criticalTicketsCount} sub="Requer atenção imediata" icon={AlertTriangle} color="bg-red-50 text-red-600" />
        <StatCard label="Chats na fila" value={waitingChats.length} sub={`${activeChats.length} em atendimento`} icon={MessageCircle} color="bg-emerald-50 text-emerald-600" />
        <StatCard label="SLA compliance" value={`${stats.slaCompliance}%`} sub={`Média: ${stats.avgResolutionHours}h resolução`} icon={TrendingUp} color="bg-violet-50 text-violet-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets by status chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Chamados por status</h2>
          <div className="space-y-3">
            {ticketsByStatus.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-600">{item.label}</span>
                  <span className="text-xs font-semibold text-slate-700">{item.count}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${(item.count / total) * 100}%`, backgroundColor: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat queue */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-700">Fila de chat</h2>
            <Link to="/operacional/app/chat" className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
              Ver fila <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          {waitingChats.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-sm">Nenhum chat em espera</div>
          ) : (
            <div className="space-y-2">
              {waitingChats.map((chat) => (
                <div key={chat.id} className="flex items-center justify-between rounded-lg bg-amber-50 border border-amber-100 px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{chat.clientName}</p>
                    <p className="text-xs text-slate-500">{chat.queue}</p>
                  </div>
                  <span className="text-xs font-semibold text-amber-700 flex-shrink-0 ml-2">
                    {chat.waitingMinutes} min
                  </span>
                </div>
              ))}
              {activeChats.map((chat) => (
                <div key={chat.id} className="flex items-center justify-between rounded-lg bg-green-50 border border-green-100 px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{chat.clientName}</p>
                    <p className="text-xs text-slate-500">{chat.agentName}</p>
                  </div>
                  <span className="text-xs font-semibold text-green-700 flex-shrink-0 ml-2">Ativo</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Atividade recente</h2>
          <div className="space-y-3">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="h-3 w-3 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-700">{item.text}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Online Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Atendentes Online
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {MOCK_STAFF.map(staff => (
              <div key={staff.id} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                <div className="flex flex-col min-w-0">
                  <span className="text-[13px] font-semibold text-slate-800 truncate" title={staff.name}>{staff.name}</span>
                  <span className="text-[10px] font-medium text-slate-500">{staff.role === 'Administrator' ? 'Admin' : staff.role === 'Technician' ? 'N2' : 'N1'}</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full shrink-0">Online</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Departamentos Online
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {['Comercial', 'Logística', 'Suporte N1', 'Suporte N2'].map(dept => (
              <div key={dept} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                <span className="text-[13px] font-semibold text-slate-800 truncate" title={dept}>{dept}</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full shrink-0">Online</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent tickets */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">Chamados recentes</h2>
          <Link to="/operacional/app/tickets" className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
            Ver todos <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="divide-y divide-slate-50">
          {recentTickets.map((ticket) => {
            const st = STATUS_LABELS[ticket.status];
            return (
              <Link key={ticket.id} to={`/operacional/app/tickets/${ticket.id}`} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition-colors group">
                <span className="text-xs font-mono text-slate-400 w-12 flex-shrink-0">#{ticket.number}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate group-hover:text-blue-700 transition-colors">{ticket.title}</p>
                  <p className="text-xs text-slate-400">{ticket.requesterName}</p>
                </div>
                <span className={`flex-shrink-0 hidden sm:inline-flex text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_COLORS[ticket.priority]}`}>
                  {ticket.priority === 'critical' ? '⬤ Crítico' : ticket.priority === 'high' ? '⬤ Alto' : ticket.priority === 'medium' ? '⬤ Médio' : '⬤ Baixo'}
                </span>
                <span className={`flex-shrink-0 text-xs font-medium px-2.5 py-0.5 rounded-full ${st?.color}`}>{st?.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
