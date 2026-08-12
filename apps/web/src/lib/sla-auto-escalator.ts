import { logAuditEvent, formatTicketProtocol } from './audit-logger';
import { toast } from 'sonner';
import { calculateElapsedBusinessMs, getBusinessHoursConfig } from './business-hours-sla';

export interface SlaEscalationStatus {
  ticketId: string;
  protocolNumber: string;
  consumedPercentage: number;
  isCritical90: boolean;
  isBreached: boolean;
  escalatedToN2: boolean;
  timeRemainingMinutes: number;
}

/**
 * Calcula a porcentagem consumida do SLA de resolução do ticket usando horas úteis
 */
export function calculateTicketSlaPercentage(createdAtIso: string, dueAtIso: string): SlaEscalationStatus {
  const config = getBusinessHoursConfig();
  const created = new Date(createdAtIso);
  const due = new Date(dueAtIso);
  const now = new Date();

  const totalDurationMs = calculateElapsedBusinessMs(created, due, config) || 1;
  const elapsedMs = calculateElapsedBusinessMs(created, now, config);

  if (totalDurationMs <= 1) {
    return {
      ticketId: '',
      protocolNumber: '',
      consumedPercentage: 100,
      isCritical90: true,
      isBreached: true,
      escalatedToN2: true,
      timeRemainingMinutes: 0,
    };
  }

  const percentage = Math.min(100, Math.max(0, Math.round((elapsedMs / totalDurationMs) * 100)));
  const remainingMs = totalDurationMs - elapsedMs;
  const remainingMins = Math.max(0, Math.round(remainingMs / 60000));
  const isBreached = remainingMs <= 0;
  const isCritical90 = percentage >= 90;

  return {
    ticketId: '',
    protocolNumber: '',
    consumedPercentage: percentage,
    isCritical90,
    isBreached,
    escalatedToN2: isCritical90 || isBreached,
    timeRemainingMinutes: remainingMins,
  };
}

/**
 * Executa o escalonamento automático para equipe N2 caso o ticket atinja 90% do SLA
 */
export function triggerSlaAutoEscalationN2(ticketId: string, protocolNumber: string, percentage: number) {
  const formattedProtocol = formatTicketProtocol(protocolNumber);

  logAuditEvent(
    'SLA_AUTO_ESCALATED_N2',
    `🚨 [ALERT SLA 90%] Ticket ${formattedProtocol} atingiu ${percentage}% do tempo limite de SLA. Escalonamento automático acionado para a Fila N2 / Supervisão.`
  );

  toast.error(`🚨 [ESCALONAMENTO N2 ATIVO] Ticket ${formattedProtocol} atingiu ${percentage}% do SLA! Transferido para o N2.`, {
    duration: 6000,
  });
}
