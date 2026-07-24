import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle, Clock, MessageCircle, Ticket } from 'lucide-react';
import { apiGet } from '../../services/api';
import { useAuth } from '../../hooks/use-auth';
import { AiSearchBar } from '../../components/ai/AiSearchBar';
import { formatDate } from '../../lib/utils';

interface TicketSummary {
  byStatus: Array<{ status: string; count: string }>;
  byPriority: Array<{ priority: string; count: string }>;
  avgResolutionHours: string | null;
  csat: { avg_score: string | null; responses: string };
}

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: summary } = useQuery<TicketSummary>({
    queryKey: ['reports', 'tickets'],
    queryFn: () => apiGet('/reports/tickets'),
  });

  const { data: sla } = useQuery({
    queryKey: ['reports', 'sla'],
    queryFn: () => apiGet('/reports/sla'),
  });

  const openCount = summary?.byStatus.find((s) => s.status === 'open')?.count ?? '–';
  const inProgressCount = summary?.byStatus.find((s) => s.status === 'in_progress')?.count ?? '–';
  const criticalCount = summary?.byPriority.find((p) => p.priority === 'critical')?.count ?? '–';

  const slaData = Array.isArray(sla) ? sla[0] : sla;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Olá, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-muted-foreground">{formatDate(new Date())}</p>
      </div>

      {/* AI Search Bar central */}
      <div className="mx-auto max-w-2xl">
        <AiSearchBar />
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Ticket className="h-5 w-5 text-blue-500" />}
          label="Abertos"
          value={openCount}
          color="blue"
        />
        <StatCard
          icon={<Clock className="h-5 w-5 text-yellow-500" />}
          label="Em Andamento"
          value={inProgressCount}
          color="yellow"
        />
        <StatCard
          icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
          label="Críticos"
          value={criticalCount}
          color="red"
        />
        <StatCard
          icon={<CheckCircle className="h-5 w-5 text-green-500" />}
          label="CSAT Médio"
          value={slaData?.avg_score ? `${parseFloat(slaData.avg_score).toFixed(1)}/5` : '–'}
          color="green"
        />
      </div>

      {/* SLA Summary */}
      {slaData && (
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Conformidade SLA — Últimos 30 dias</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <SlaBar
              label="Tempo de Resposta"
              met={parseInt(slaData.response_met ?? '0')}
              total={parseInt(slaData.total_measured ?? '0')}
            />
            <SlaBar
              label="Tempo de Resolução"
              met={parseInt(slaData.resolution_met ?? '0')}
              total={parseInt(slaData.total_measured ?? '0')}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: string; color: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <div className={`rounded-full bg-${color}-100 dark:bg-${color}-900/20 p-2`}>{icon}</div>
      </div>
      <div className="mt-4">
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

function SlaBar({ label, met, total }: { label: string; met: number; total: number }) {
  const pct = total > 0 ? Math.round((met / total) * 100) : 0;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium">{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${pct >= 90 ? 'bg-green-500' : pct >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{met}/{total} chamados dentro do SLA</p>
    </div>
  );
}
