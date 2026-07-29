import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Filter, Plus, Search } from 'lucide-react';
import { apiGet } from '../../services/api';
import { cn, formatDate, priorityLabel, slaStatus, statusLabel } from '../../lib/utils';
import { TicketPriority, TicketStatus } from '@portal/shared';

interface Ticket {
  id: string;
  number: number;
  title: string;
  status: string;
  priority: string;
  requester_name: string;
  assignee_name: string | null;
  sla_first_response_due_at: string | null;
  sla_resolution_due_at: string | null;
  created_at: string;
}

export default function TicketsPage() {
  const [status, setStatus] = useState<string>('');
  const [priority, setPriority] = useState<string>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['tickets', { status, priority, page }],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), limit: '25' });
      if (status) params.set('status', status);
      if (priority) params.set('priority', priority);
      return apiGet<{ data: Ticket[]; meta: any }>(`/tickets?${params}`);
    },
  });

  const tickets = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tickets</h1>
        <Link
          to="/tickets/new"
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> Novo Ticket
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar tickets…"
            className="w-full rounded-md border border-input bg-background py-1.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="rounded-md border border-input bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Todos os status</option>
          {Object.values(TicketStatus).map((s) => (
            <option key={s} value={s}>{statusLabel(s)}</option>
          ))}
        </select>

        <select
          value={priority}
          onChange={(e) => { setPriority(e.target.value); setPage(1); }}
          className="rounded-md border border-input bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Todas as prioridades</option>
          {Object.values(TicketPriority).map((p) => (
            <option key={p} value={p}>{priorityLabel(p)}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">#</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Título</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Prioridade</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Solicitante</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Responsável</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">SLA</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Criado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-muted-foreground">Carregando…</td></tr>
            ) : tickets.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-muted-foreground">Nenhum ticket encontrado</td></tr>
            ) : tickets.map((ticket) => {
              const sla = slaStatus(ticket.sla_resolution_due_at);
              return (
                <tr key={ticket.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono text-muted-foreground">#{ticket.number}</td>
                  <td className="px-4 py-3">
                    <Link to={`/tickets/${ticket.id}`} className="text-sm font-medium hover:text-primary transition-colors line-clamp-1">
                      {ticket.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={ticket.priority} />
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{ticket.requester_name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{ticket.assignee_name ?? '–'}</td>
                  <td className="px-4 py-3">
                    {sla !== 'none' && (
                      <div className={cn(
                        'h-2 w-2 rounded-full',
                        sla === 'ok' ? 'bg-green-500' : sla === 'warning' ? 'bg-yellow-500' : 'bg-red-500',
                      )} />
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(ticket.created_at, 'dd/MM/yyyy')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{meta.total} tickets no total</span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-md border border-border px-3 py-1 hover:bg-accent disabled:opacity-50 transition-colors"
            >
              Anterior
            </button>
            <span className="flex items-center px-3">{page} / {meta.totalPages}</span>
            <button
              disabled={page === meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-md border border-border px-3 py-1 hover:bg-accent disabled:opacity-50 transition-colors"
            >
              Próximo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    open: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400',
    in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    pending: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
    resolved: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  };
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', styles[status] ?? 'bg-muted text-muted-foreground')}>
      {statusLabel(status)}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', `priority-${priority}`)}>
      {priorityLabel(priority)}
    </span>
  );
}
