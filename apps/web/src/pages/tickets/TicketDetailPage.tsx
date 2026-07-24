import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../services/api';
import { formatDate, priorityLabel, statusLabel, slaStatus } from '../../lib/utils';
import { cn } from '../../lib/utils';

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => apiGet<any>(`/tickets/${id}`),
    enabled: !!id,
  });

  if (isLoading) return <div className="flex h-48 items-center justify-center text-muted-foreground">Carregando…</div>;
  if (!ticket) return <div className="flex h-48 items-center justify-center text-muted-foreground">Chamado não encontrado</div>;

  const sla = slaStatus(ticket.sla_resolution_due_at);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <span>Chamado #{ticket.number}</span>
            <span>•</span>
            <span>{ticket.type_name ?? 'Incidente'}</span>
          </div>
          <h1 className="text-2xl font-bold">{ticket.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-sm font-medium', `priority-${ticket.priority}`)}>
            {priorityLabel(ticket.priority)}
          </span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-3 font-semibold">Descrição</h2>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ticket.description || 'Sem descrição'}</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-4 space-y-3">
            <InfoRow label="Status" value={statusLabel(ticket.status)} />
            <InfoRow label="Solicitante" value={ticket.requester_name} />
            <InfoRow label="Responsável" value={ticket.assignee_name ?? 'Não atribuído'} />
            <InfoRow label="Política SLA" value={ticket.sla_policy_name ?? '–'} />
            {ticket.sla_resolution_due_at && (
              <InfoRow
                label="Vencimento SLA"
                value={formatDate(ticket.sla_resolution_due_at)}
                valueClass={sla === 'breach' ? 'text-destructive' : sla === 'warning' ? 'text-yellow-600' : undefined}
              />
            )}
            <InfoRow label="Criado em" value={formatDate(ticket.created_at)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className={cn('mt-0.5 text-sm', valueClass)}>{value}</dd>
    </div>
  );
}
