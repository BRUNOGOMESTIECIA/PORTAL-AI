import { format } from 'date-fns';

export interface SlaPauseInfo {
  isPaused: boolean;
  reason: 'weekend' | 'holiday' | 'after_hours' | null;
  label: string;
}

// Lista Padrão de Feriados Nacionais e Corporativos
export const DEFAULT_HOLIDAYS = [
  '2026-01-01', // Confraternização Universal
  '2026-04-21', // Tiradentes
  '2026-05-01', // Dia do Trabalho
  '2026-09-07', // Independência do Brasil
  '2026-10-12', // Nossa Sra. Aparecida
  '2026-11-02', // Finados
  '2026-11-15', // Proclamação da República
  '2026-12-25', // Natal
];

/**
 * Verifica se a contagem de SLA está pausada no momento atual (Item 121)
 * Considera Finais de Semana, Feriados e Fora do Horário Comercial (08:00 - 18:00).
 */
export function isSlaPausedNow(currentDate: Date = new Date()): SlaPauseInfo {
  const dayOfWeek = currentDate.getDay(); // 0 = Domingo, 6 = Sábado
  const dateStr = format(currentDate, 'yyyy-MM-dd');
  const hours = currentDate.getHours();

  // 1. Verificação de Final de Semana (Sábado e Domingo)
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return {
      isPaused: true,
      reason: 'weekend',
      label: '⏸️ SLA Pausado (Final de Semana)',
    };
  }

  // 2. Verificação de Feriado
  if (DEFAULT_HOLIDAYS.includes(dateStr)) {
    return {
      isPaused: true,
      reason: 'holiday',
      label: '⏸️ SLA Pausado (Feriado Nacional)',
    };
  }

  // 3. Verificação de Horário Fora do Expediente (Antes das 08:00 ou após as 18:00)
  if (hours < 8 || hours >= 18) {
    return {
      isPaused: true,
      reason: 'after_hours',
      label: '⏸️ SLA Pausado (Fora do Expediente 08h-18h)',
    };
  }

  return {
    isPaused: false,
    reason: null,
    label: '🟢 SLA Ativo (Horário Comercial)',
  };
}
