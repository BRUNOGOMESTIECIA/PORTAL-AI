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

import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Dispara ALERTA de emergência para a equipe N2/Supervisão caso o ticket/chat atinja 90% do SLA,
 * SEM transferir o chamado de fila (mantém o atendimento no N1 original).
 */
export async function triggerSlaAutoEscalationN2(ticketId: string, protocolNumber: string, percentage: number, chatId?: string) {
  const formattedProtocol = formatTicketProtocol(protocolNumber || ticketId);

  // Registra a marcação de alerta N2 no Firestore sem alterar a equipe/atendente responsável
  try {
    if (ticketId) {
      const ticketRef = doc(db, 'tickets', ticketId);
      await updateDoc(ticketRef, {
        slaWarningN2: true,
        updatedAt: new Date().toISOString()
      });
    }
  } catch (e) {
    console.warn('[AutoEscalator] Erro ao registrar marcação de alerta no Firestore:', e);
  }

  logAuditEvent(
    'SLA_ALERT_NOTIFIED_N2',
    `🔔 [ALERTA SLA N2] Ticket ${formattedProtocol} atingiu ${percentage}% do limite de SLA. Notificação emitida para a equipe N2/Supervisão para apoio ao N1.`
  );

  toast.error(`🔔 [ALERTA DE SLA - EQUIPE N2 NOTIFICADA] Chamado ${formattedProtocol} atingiu ${percentage}% do SLA! Notificação emitida para o N2 acompanhar.`, {
    duration: 8000,
  });
}
