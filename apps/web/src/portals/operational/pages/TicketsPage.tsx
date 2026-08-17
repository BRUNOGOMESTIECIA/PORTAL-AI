import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Users, Clock, Building2, LayoutGrid, List, Kanban as KanbanIcon, AlertTriangle } from 'lucide-react';
import { TicketStatus, TicketPriority, MockTicket, MOCK_CLIENTS } from '../../../mocks/data';
import { formatDistanceToNow, isAfter, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TicketsFilterBar, TicketFilters } from '../components/TicketsFilterBar';
import { NewManualTicketModal } from '../components/NewManualTicketModal';
import SlaCountdownBar from '../components/SlaCountdownBar';
import { useAuth } from '../../../hooks/use-mock-auth';
import { useTickets } from '../../../hooks/use-tickets';
import { useTableDensity, DENSITY_CONFIGS } from '../../../hooks/use-table-density';
import { TableDensitySelector } from '../components/TableDensitySelector';

import { formatTicketProtocol } from '../../../lib/audit-logger';

const STATUS_CONFIG: Record<TicketStatus, { label: string; color: string }> = {
  new:         { label: 'Novo',          color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
  open:        { label: 'Aberto',        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  in_progress: { label: 'Em andamento',  color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  pending:     { label: 'Pendente',      color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  resolved:    { label: 'Resolvido',     color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  closed:      { label: 'Fechado',       color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
};

const PRIORITY_CONFIG: Record<TicketPriority, { label: string; dot: string }> = {
  critical: { label: 'Crítico', dot: 'bg-red-500' },
  high:     { label: 'Alto',    dot: 'bg-orange-500' },
  medium:   { label: 'Médio',   dot: 'bg-amber-400' },
  low:      { label: 'Baixo',   dot: 'bg-slate-300 dark:bg-slate-600' },
};

// Cores por empresa (hash simples)
const COMPANY_COLORS = [
  { bg: 'bg-blue-50 dark:bg-blue-900/20',   border: 'border-blue-200 dark:border-blue-800',   icon: 'text-blue-600 dark:text-blue-400',   iconBg: 'bg-blue-100 dark:bg-blue-900/40' },
  { bg: 'bg-violet-50 dark:bg-violet-900/20', border: 'border-violet-200 dark:border-violet-800', icon: 'text-violet-600 dark:text-violet-400', iconBg: 'bg-violet-100 dark:bg-violet-900/40' },
  { bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', icon: 'text-emerald-600 dark:text-emerald-400', iconBg: 'bg-emerald-100 dark:bg-emerald-900/40' },
  { bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800', icon: 'text-orange-600 dark:text-orange-400', iconBg: 'bg-orange-100 dark:bg-orange-900/40' },
];

function getCompany(ticket: MockTicket) {
  return MOCK_CLIENTS.find(c => c.name === ticket.requesterName)?.company ?? 'Desconhecida';
}

function getTicketRouteParam(ticket: MockTicket): string {
  if (ticket.number) return String(ticket.number);
  return String(ticket.id).replace(/^[#/]+/, '');
}

type StatusFilterType = 'all' | 'active' | 'unresolved' | TicketStatus;
type GroupMode = 'team' | 'client';

export default function TicketsPage() {
  const navigate = useNavigate();
  const { tickets, updateTicket } = useTickets();
  const { user, hasPermission } = useAuth();
  const [searchParams] = useSearchParams();
  const urlPriority = searchParams.get('priority');
  
  const [statusFilter, setStatusFilter]         = useState<StatusFilterType>('active');
  const [groupMode, setGroupMode]               = useState<GroupMode>('team');
  const [viewLayout, setViewLayout]             = useState<'kanban' | 'table'>('kanban');
  const { density, setDensity, config: densityConfig } = useTableDensity();
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [advancedFilters, setAdvancedFilters]   = useState<TicketFilters>({
    search: '', company: [], team: [], department: [], costCenter: [], requesterName: [], assigneeName: [], period: []
  });

  // ── Filtragem ────────────────────────────────────────────────────────────────
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const searchLower = advancedFilters.search.toLowerCase().trim();
      const cleanSearchDigits = searchLower.replace(/\D/g, '');

      // Se houver busca digitada pelo usuário, abrimos para buscar em todos os status (não oculta resolvidos)
      const matchStatusTab = searchLower
        ? true
        : statusFilter === 'all'
          ? true
          : statusFilter === 'active'
            ? ['new', 'open', 'in_progress', 'pending'].includes(t.status)
            : statusFilter === 'unresolved'
              ? ['new', 'open', 'in_progress', 'pending'].includes(t.status)
              : statusFilter === 'new'
                ? t.status === 'new'
                : statusFilter === 'in_progress'
                  ? ['in_progress', 'open', 'pending'].includes(t.status)
                  : statusFilter === 'resolved'
                    ? ['resolved', 'closed'].includes(t.status)
                    : t.status === statusFilter;

      const formattedProtocol = formatTicketProtocol(t.number || t.id).toLowerCase();
      const ticketNumStr = String(t.number || t.id || '').toLowerCase();
      const titleStr = String(t.title || '').toLowerCase();
      const descStr = String(t.description || '').toLowerCase();
      const reqStr = String(t.requesterName || '').toLowerCase();
      const teamStr = String(t.team || '').toLowerCase();
      const catStr = String(t.category || '').toLowerCase();

      const matchSearch = !searchLower ||
        titleStr.includes(searchLower) ||
        descStr.includes(searchLower) ||
        reqStr.includes(searchLower) ||
        teamStr.includes(searchLower) ||
        catStr.includes(searchLower) ||
        formattedProtocol.includes(searchLower) ||
        ticketNumStr.includes(searchLower) ||
        (cleanSearchDigits.length > 2 && ticketNumStr.includes(cleanSearchDigits));

      const companyName = getCompany(t);
      const matchCompany   = advancedFilters.company.length === 0 || advancedFilters.company.includes(companyName);
      const tTeamValue     = t.team === null ? 'unassigned' : t.team;
      const matchTeam      = advancedFilters.team.length === 0 || advancedFilters.team.includes(tTeamValue);
      
      // OBS-07: Filtro por Departamento e Centro de Custo
      const tDept = (t as any).department || 'TI';
      const tCostCenter = (t as any).costCenter || 'CC-1001';
      const matchDepartment = !advancedFilters.department || advancedFilters.department.length === 0 || advancedFilters.department.includes(tDept);
      const matchCostCenter = !advancedFilters.costCenter || advancedFilters.costCenter.length === 0 || advancedFilters.costCenter.includes(tCostCenter);

      const matchRequester = advancedFilters.requesterName.length === 0 || advancedFilters.requesterName.includes(t.requesterName);
      const tAssigneeValue = t.assigneeName === null ? 'unassigned' : t.assigneeName;
      const matchAssignee  = advancedFilters.assigneeName.length === 0 || advancedFilters.assigneeName.includes(tAssigneeValue);

      let matchPeriod = true;
      if (advancedFilters.period.length > 0) {
        const ticketDate = new Date(t.createdAt);
        const now = new Date();
        matchPeriod = advancedFilters.period.some(p => {
          if (p === 'today')  return isAfter(ticketDate, subDays(now, 1));
          if (p === '7days')  return isAfter(ticketDate, subDays(now, 7));
          if (p === '30days') return isAfter(ticketDate, subDays(now, 30));
          return true;
        });
      }

      let matchUrlPriority = true;
      if (urlPriority) {
        if (urlPriority === 'high') {
          matchUrlPriority = t.priority === 'high' || t.priority === 'critical';
        } else {
          matchUrlPriority = t.priority === urlPriority;
        }
      }

      return matchStatusTab && matchSearch && matchCompany && matchTeam && matchDepartment && matchCostCenter && matchRequester && matchAssignee && matchPeriod && matchUrlPriority;
    });
  }, [statusFilter, advancedFilters, urlPriority]);

  // ── Agrupamento por Mesa ──────────────────────────────────────────────────────
  const groupedByTeam = useMemo(() => {
    const groups: Record<string, MockTicket[]> = {};
    filteredTickets.forEach(t => {
      const key = t.team || 'Triagem / Sem Mesa';
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    });
    const sortedKeys = Object.keys(groups).sort((a, b) => {
      if (a === 'Triagem / Sem Mesa') return -1;
      if (b === 'Triagem / Sem Mesa') return 1;
      return a.localeCompare(b);
    });
    return { groups, sortedKeys };
  }, [filteredTickets]);

  // ── Agrupamento por Cliente (empresa) ────────────────────────────────────────
  const groupedByClient = useMemo(() => {
    const groups: Record<string, MockTicket[]> = {};
    filteredTickets.forEach(t => {
      const key = getCompany(t);
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    });
    const sortedKeys = Object.keys(groups).sort((a, b) => {
      if (a === 'Desconhecida') return 1;
      if (b === 'Desconhecida') return -1;
      return a.localeCompare(b);
    });
    // Atribui uma cor estável por empresa
    const colorMap: Record<string, typeof COMPANY_COLORS[0]> = {};
    sortedKeys.forEach((key, i) => { colorMap[key] = COMPANY_COLORS[i % COMPANY_COLORS.length]; });
    return { groups, sortedKeys, colorMap };
  }, [filteredTickets]);

  // ── Contagens por aba ──────────────────────────────────────────────────────────
  const counts = {
    all:         tickets.length,
    active:      tickets.filter(t => ['new','open','in_progress','pending'].includes(t.status)).length,
    unresolved:  tickets.filter(t => ['new','open','in_progress','pending'].includes(t.status)).length,
    new:         tickets.filter(t => t.status === 'new').length,
    in_progress: tickets.filter(t => ['in_progress','open','pending'].includes(t.status)).length,
    resolved:    tickets.filter(t => ['resolved','closed'].includes(t.status)).length,
  };

  const statusTabs: { key: StatusFilterType; label: string; count: number }[] = [
    { key: 'active',      label: 'Ativos',          count: counts.active },
    { key: 'all',         label: 'Todos',           count: counts.all },
    { key: 'unresolved',  label: 'Não Resolvidos',  count: counts.unresolved },
    { key: 'new',         label: 'Novos',           count: counts.new },
    { key: 'in_progress', label: 'Em andamento',    count: counts.in_progress },
    { key: 'resolved',    label: 'Resolvidos',      count: counts.resolved },
  ];

  // ── Tabela de tickets ────────────────────────────────────────────────────────
  const TicketTable = ({ tickets, showCompany = false }: { tickets: MockTicket[]; showCompany?: boolean }) => (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className={`w-full ${densityConfig.text}`}>
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <th className={`text-left ${densityConfig.py} text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-20`}>Ticket</th>
              <th className={`text-left ${densityConfig.py} text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider`}>Título</th>
              <th className={`text-left ${densityConfig.py} text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell`}>Solicitante</th>
              {showCompany && (
                <th className={`text-left ${densityConfig.py} text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell`}>Mesa</th>
              )}
              {!showCompany && (
                <th className={`text-left ${densityConfig.py} text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell`}>Empresa</th>
              )}
              <th className={`text-left ${densityConfig.py} text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell`}>Responsável</th>
              <th className={`text-left ${densityConfig.py} text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider`}>Prioridade</th>
              <th className={`text-left ${densityConfig.py} text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider`}>Status</th>
              <th className={`text-left ${densityConfig.py} text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell`}>SLA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {tickets.map((ticket) => {
              const st  = STATUS_CONFIG[ticket.status];
              const pri = PRIORITY_CONFIG[ticket.priority];
              return (
                <tr 
                  key={ticket.id} 
                  onClick={() => navigate(`/operacional/app/tickets/${getTicketRouteParam(ticket)}`)}
                  className="hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                >
                  <td className={`${densityConfig.py} font-mono text-xs text-blue-600 dark:text-blue-400 font-bold whitespace-nowrap`}>{formatTicketProtocol(ticket.number)}</td>
                  <td className={`${densityConfig.py}`}>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                      {ticket.title}
                    </span>
                  </td>
                  <td className={`${densityConfig.py} text-slate-600 dark:text-slate-300 hidden sm:table-cell font-medium`}>{ticket.requesterName}</td>
                  {showCompany ? (
                    <td className={`${densityConfig.py} hidden md:table-cell`}>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{ticket.team ?? <span className="text-slate-300 dark:text-slate-600">Triagem</span>}</span>
                    </td>
                  ) : (
                    <td className={`${densityConfig.py} hidden md:table-cell`}>
                      <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">{getCompany(ticket)}</span>
                    </td>
                  )}
                  <td className={`${densityConfig.py} text-slate-500 dark:text-slate-400 hidden lg:table-cell`}>
                    {ticket.assigneeName || (ticket as any).assignedToName ? (
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{ticket.assigneeName || (ticket as any).assignedToName}</span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded text-[10px] border border-amber-200 dark:border-amber-800">
                        Sem Atendente
                      </span>
                    )}
                  </td>
                  <td className={`${densityConfig.py}`}>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${pri.dot}`} />
                      <span className="text-slate-600 dark:text-slate-300 text-xs font-medium">{pri.label}</span>
                    </div>
                  </td>
                  <td className={`${densityConfig.py}`}>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide ${st.color}`}>{st.label}</span>
                  </td>
                  <td className={`${densityConfig.py} text-xs hidden sm:table-cell`}>
                    <SlaCountdownBar 
                      dueIsoString={ticket.slaResolutionDue} 
                      createdIsoString={ticket.createdAt} 
                      status={ticket.status} 
                      compact={true} 
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
  const TicketKanbanGrid = ({ tickets, showCompany = false }: { tickets: MockTicket[]; showCompany?: boolean }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {tickets.map((ticket) => {
        const st  = STATUS_CONFIG[ticket.status];
        const pri = PRIORITY_CONFIG[ticket.priority];
        return (
          <Link
            key={ticket.id}
            to={`/operacional/app/tickets/${getTicketRouteParam(ticket)}`}
            className="group flex flex-col justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 space-y-3 cursor-pointer block text-left"
          >
            {/* Top Bar: Protocol + Status Badge */}
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md">
                {formatTicketProtocol(ticket.number)}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide ${st.color}`}>
                {st.label}
              </span>
            </div>

            {/* Title & Solicitante / Atendente */}
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm line-clamp-2 leading-snug">
                {ticket.title}
              </h3>
              <div className="flex items-center justify-between mt-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="truncate font-medium flex items-center gap-1" title={`Solicitante: ${ticket.requesterName}`}>
                  <span>👤</span> <span className="truncate">{ticket.requesterName}</span>
                </span>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <div className={`w-2 h-2 rounded-full ${pri.dot}`} />
                  <span className="text-[11px] font-semibold">{pri.label}</span>
                </div>
              </div>

              {/* Responsável / Atendente */}
              <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800/60 text-[11px]">
                <span className="text-slate-500 dark:text-slate-400 truncate max-w-[70%]">
                  🎧 Atendente: <strong className="text-slate-800 dark:text-slate-200 font-bold">{ticket.assigneeName || (ticket as any).assignedToName || 'Não atribuído'}</strong>
                </span>
                {hasPermission('tickets.update') && (!ticket.assigneeName && !(ticket as any).assignedToName) && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const activeAgentName = user?.name || (user?.email ? user.email.split('@')[0] : 'Atendente');
                      updateTicket(ticket.id, {
                        assigneeName: activeAgentName,
                        assignedTo: activeAgentName,
                        status: ticket.status === 'new' ? 'in_progress' : ticket.status,
                        updatedAt: new Date().toISOString()
                      });
                    }}
                    className="text-[10px] font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 hover:bg-blue-200 px-2 py-0.5 rounded-full transition-all shrink-0"
                    title="Atribuir este chamado ao seu usuário"
                  >
                    + Assumir
                  </button>
                )}
              </div>
            </div>

            {/* SLA Real-Time Timer & Dynamic Progress Bar */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <SlaCountdownBar
                dueIsoString={ticket.slaResolutionDue}
                createdIsoString={ticket.createdAt}
                status={ticket.status}
                compact={false}
                showProgressBar={true}
              />
            </div>
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6 pb-12">

      {/* ── Cabeçalho ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Board de Tickets</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Gestão de escalonamentos e filas especializadas</p>
        </div>
        {hasPermission('tickets.create') && (
          <button
            onClick={() => setShowNewTicketModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:-translate-y-[1px] hover:shadow-md active:translate-y-px"
          >
            <Plus className="h-4 w-4" /> Novo Ticket Manual
          </button>
        )}
      </div>

      {/* ── Filtros avançados ──────────────────────────────────────────────────── */}
      <TicketsFilterBar filters={advancedFilters} onChange={setAdvancedFilters} tickets={tickets} />

      {/* ── Abas de status + toggle de agrupamento ────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Abas de status */}
        <div className="flex gap-2 flex-wrap">
          {statusTabs.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setStatusFilter(opt.key)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                statusFilter === opt.key
                  ? 'bg-slate-800 text-white dark:bg-blue-600 dark:text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {opt.label}
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                statusFilter === opt.key
                  ? 'bg-slate-600 text-slate-100 dark:bg-blue-500 dark:text-white'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
              }`}>
                {opt.count}
              </span>
            </button>
          ))}
        </div>

        {/* Seletores de Agrupamento e Layout */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Layout: Cartões SLA vs Tabela */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            <button
              onClick={() => setViewLayout('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                viewLayout === 'kanban'
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <KanbanIcon className="w-3.5 h-3.5 text-blue-500" /> Cartões SLA
            </button>
            <button
              onClick={() => setViewLayout('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                viewLayout === 'table'
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <List className="w-3.5 h-3.5 text-slate-400" /> Tabela
            </button>
          </div>

          {/* Seletor de Densidade de Tabela (Item 131) */}
          <TableDensitySelector density={density} onDensityChange={setDensity} />

          {/* Agrupar por Mesa vs Cliente */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 flex-shrink-0">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2">
              <LayoutGrid className="inline w-3 h-3 mr-0.5 -mt-0.5" />Agrupar:
            </span>
            <button
              onClick={() => setGroupMode('team')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                groupMode === 'team'
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Users className="w-3 h-3" /> Mesa
            </button>
            <button
              onClick={() => setGroupMode('client')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                groupMode === 'client'
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Building2 className="w-3 h-3" /> Cliente
            </button>
          </div>
        </div>
      </div>

      {/* ── Board ──────────────────────────────────────────────────────────────── */}
      <div className="space-y-8">
        {filteredTickets.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400 font-medium">Nenhum ticket encontrado com os filtros atuais.</p>
          </div>

        ) : groupMode === 'team' ? (
          // ── Agrupado por Mesa ─────────────────────────────────────────────────
          groupedByTeam.sortedKeys.map((teamName) => (
            <div key={teamName} className="space-y-3">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
                <Users className="w-4 h-4 text-slate-400" />
                Mesa: {teamName}
                <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] px-2 py-0.5 rounded-full ml-1">
                  {groupedByTeam.groups[teamName].length} tickets
                </span>
              </h2>
              {viewLayout === 'kanban' ? (
                <TicketKanbanGrid tickets={groupedByTeam.groups[teamName]} showCompany={false} />
              ) : (
                <TicketTable tickets={groupedByTeam.groups[teamName]} showCompany={false} />
              )}
            </div>
          ))

        ) : (
          // ── Agrupado por Cliente (empresa) ────────────────────────────────────
          groupedByClient.sortedKeys.map((companyName) => {
            const col     = groupedByClient.colorMap[companyName];
            const tickets = groupedByClient.groups[companyName];
            return (
              <div key={companyName} className="space-y-3">
                {/* Cabeçalho do cliente */}
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${col.bg} ${col.border}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${col.iconBg}`}>
                    <Building2 className={`w-4 h-4 ${col.icon}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{companyName}</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
                      {' · '}
                      {tickets.filter(t => ['new','open','in_progress','pending'].includes(t.status)).length} ativo{tickets.filter(t => ['new','open','in_progress','pending'].includes(t.status)).length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {/* Badges de prioridade crítica/alta */}
                  <div className="flex gap-1.5 flex-shrink-0">
                    {tickets.filter(t => t.priority === 'critical').length > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        {tickets.filter(t => t.priority === 'critical').length} crítico{tickets.filter(t => t.priority === 'critical').length !== 1 ? 's' : ''}
                      </span>
                    )}
                    {tickets.filter(t => t.priority === 'high').length > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                        {tickets.filter(t => t.priority === 'high').length} alto{tickets.filter(t => t.priority === 'high').length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
                {viewLayout === 'kanban' ? (
                  <TicketKanbanGrid tickets={tickets} showCompany={true} />
                ) : (
                  <TicketTable tickets={tickets} showCompany={true} />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── Modal ──────────────────────────────────────────────────────────────── */}
      {showNewTicketModal && (
        <NewManualTicketModal onClose={() => setShowNewTicketModal(false)} />
      )}
    </div>
  );
}
