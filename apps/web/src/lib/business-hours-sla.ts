import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { instaPassoDb } from './firebase';

export interface BusinessScheduleDay {
  dayIndex: number; // 0 = Domingo, 1 = Segunda ... 6 = Sábado
  dayName: string;
  active: boolean;
  startHour: number;
  endHour: number;
}

export interface BusinessHoursConfig {
  autoCollapseChatOutsideHours: boolean;
  schedule: BusinessScheduleDay[];
  holidays: string[];
}

export const DEFAULT_BUSINESS_SCHEDULE: BusinessScheduleDay[] = [
  { dayIndex: 0, dayName: 'Domingo',  active: false, startHour: 8, endHour: 18 },
  { dayIndex: 1, dayName: 'Segunda',  active: true,  startHour: 8, endHour: 18 },
  { dayIndex: 2, dayName: 'Terça',    active: true,  startHour: 8, endHour: 18 },
  { dayIndex: 3, dayName: 'Quarta',   active: true,  startHour: 8, endHour: 18 },
  { dayIndex: 4, dayName: 'Quinta',   active: true,  startHour: 8, endHour: 18 },
  { dayIndex: 5, dayName: 'Sexta',    active: true,  startHour: 8, endHour: 18 },
  { dayIndex: 6, dayName: 'Sábado',   active: true,  startHour: 9, endHour: 13 },
];

export const STORAGE_KEY_BUSINESS_HOURS = 'portal_business_hours_config';

/**
 * BUG-10 FIX: Gera feriados nacionais fixos dinamicamente para qualquer ano (YYYY-MM-DD)
 */
export function getDefaultHolidaysForYear(year: number = new Date().getFullYear()): string[] {
  const fixedMmDd = [
    '01-01', // Confraternização Universal
    '04-21', // Tiradentes
    '05-01', // Dia do Trabalho
    '09-07', // Independência do Brasil
    '10-12', // Nossa Senhora Aparecida
    '11-02', // Finados
    '11-15', // Proclamação da República
    '11-20', // Dia da Consciência Negra
    '12-25', // Natal
  ];

  const years = [year - 1, year, year + 1];
  const list: string[] = [];
  years.forEach((y) => {
    fixedMmDd.forEach((mmdd) => {
      list.push(`${y}-${mmdd}`);
    });
  });
  return list;
}

/**
 * BUG-10 FIX: Verifica se uma data YYYY-MM-DD é feriado (compara YYYY-MM-DD ou sufixo MM-DD)
 */
export function isHolidayDate(dateStr: string, holidays: string[]): boolean {
  if (!holidays || holidays.length === 0) return false;
  if (holidays.includes(dateStr)) return true;
  const mmdd = dateStr.length >= 10 ? dateStr.substring(5) : dateStr;
  return holidays.some((h) => h.endsWith(mmdd));
}

export function getBusinessHoursConfig(): BusinessHoursConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BUSINESS_HOURS);
    if (raw) return JSON.parse(raw);
  } catch (e) {}

  return {
    autoCollapseChatOutsideHours: true,
    schedule: DEFAULT_BUSINESS_SCHEDULE,
    holidays: getDefaultHolidaysForYear(),
  };
}

/**
 * BUG-09 FIX: Salva no localStorage + Firestore para sincronização global entre todos os clientes/operadores
 */
export async function saveBusinessHoursConfig(config: BusinessHoursConfig): Promise<void> {
  try {
    localStorage.setItem(STORAGE_KEY_BUSINESS_HOURS, JSON.stringify(config));
    
    // Sincronização em aba local (BroadcastChannel)
    const channel = new BroadcastChannel('config_sync_fallback');
    channel.postMessage({ type: 'SYNC_BUSINESS_HOURS', payload: config });
    channel.close();

    // BUG-09 FIX: Persistência no Firestore
    const docRef = doc(instaPassoDb, 'settings', 'business_hours');
    await setDoc(docRef, { ...config, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (e) {
    console.warn('[BusinessHours] Erro ao salvar configuração:', e);
  }
}

/**
 * BUG-09 FIX: Hook reativo com listener em tempo real (Firestore onSnapshot) + BroadcastChannel
 */
export function useBusinessHours() {
  const [config, setConfig] = useState<BusinessHoursConfig>(getBusinessHoursConfig());

  useEffect(() => {
    const channel = new BroadcastChannel('config_sync_fallback');
    channel.onmessage = (event) => {
      if (event.data?.type === 'SYNC_BUSINESS_HOURS') {
        setConfig(event.data.payload);
      }
    };

    let unsubFirestore: (() => void) | null = null;
    try {
      const docRef = doc(instaPassoDb, 'settings', 'business_hours');
      unsubFirestore = onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as BusinessHoursConfig;
          if (data && Array.isArray(data.schedule)) {
            const mergedConfig: BusinessHoursConfig = {
              autoCollapseChatOutsideHours: data.autoCollapseChatOutsideHours ?? true,
              schedule: data.schedule,
              holidays: Array.isArray(data.holidays) && data.holidays.length > 0 ? data.holidays : getDefaultHolidaysForYear(),
            };
            setConfig(mergedConfig);
            try {
              localStorage.setItem(STORAGE_KEY_BUSINESS_HOURS, JSON.stringify(mergedConfig));
            } catch (e) {}
          }
        }
      });
    } catch (e) {}

    return () => {
      channel.close();
      if (unsubFirestore) unsubFirestore();
    };
  }, []);

  return config;
}

export interface SlaPauseInfo {
  isPaused: boolean;
  reason: 'weekend' | 'holiday' | 'after_hours' | null;
  label: string;
}

/**
 * Verifica se o momento atual está fora do horário comercial configurado
 */
export function isSlaPausedNow(currentDate: Date = new Date()): SlaPauseInfo {
  const config = getBusinessHoursConfig();
  const dayOfWeek = currentDate.getDay();
  const dateStr = format(currentDate, 'yyyy-MM-dd');
  const hours = currentDate.getHours();

  // 1. Verificação de Feriado (BUG-10 FIX: checa via isHolidayDate)
  if (isHolidayDate(dateStr, config.holidays)) {
    return {
      isPaused: true,
      reason: 'holiday',
      label: '⏸️ SLA Pausado (Feriado Cadastrado)',
    };
  }

  // 2. Verificação do Dia da Semana
  const dayConfig = config.schedule.find((s) => s.dayIndex === dayOfWeek);
  if (!dayConfig || !dayConfig.active) {
    return {
      isPaused: true,
      reason: 'weekend',
      label: `⏸️ SLA Pausado (${dayOfWeek === 0 || dayOfWeek === 6 ? 'Final de Semana' : 'Dia Inativo'})`,
    };
  }

  // 3. Verificação de Horário (Início e Fim)
  if (hours < dayConfig.startHour || hours >= dayConfig.endHour) {
    return {
      isPaused: true,
      reason: 'after_hours',
      label: `⏸️ SLA Pausado (Fora do Expediente ${String(dayConfig.startHour).padStart(2, '0')}h-${String(dayConfig.endHour).padStart(2, '0')}h)`,
    };
  }

  return {
    isPaused: false,
    reason: null,
    label: '🟢 SLA Ativo (Horário Comercial)',
  };
}

/**
 * Calcula exatamente quantos milissegundos úteis se passaram entre duas datas, 
 * ignorando períodos inativos (finais de semana, feriados e fora do expediente).
 */
export function calculateElapsedBusinessMs(
  startIso: string | Date,
  endIso: string | Date,
  config: BusinessHoursConfig
): number {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  if (end <= start) return 0;
  
  let currentMs = start;
  let elapsedMs = 0;
  
  // Limite de segurança para evitar loop infinito
  let safetyCounter = 0;
  
  while (currentMs < end && safetyCounter < 1000) {
    safetyCounter++;
    const d = new Date(currentMs);
    const dateStr = format(d, 'yyyy-MM-dd');
    const dayOfWeek = d.getDay();
    
    // Próximo dia à meia noite
    const nextDayD = new Date(d);
    nextDayD.setDate(d.getDate() + 1);
    nextDayD.setHours(0, 0, 0, 0);
    const nextDay = nextDayD.getTime();
    
    const tickEnd = Math.min(nextDay, end);
    
    // Feriado? Pula o dia todo. (BUG-10 FIX: usa isHolidayDate)
    if (isHolidayDate(dateStr, config.holidays)) {
      currentMs = tickEnd;
      continue;
    }
    
    // Dia inativo? Pula o dia todo.
    const dayConfig = config.schedule.find(s => s.dayIndex === dayOfWeek);
    if (!dayConfig || !dayConfig.active) {
      currentMs = tickEnd;
      continue;
    }
    
    // Calcula as bordas do horário comercial deste dia específico
    const businessStartD = new Date(d);
    businessStartD.setHours(dayConfig.startHour, 0, 0, 0);
    const businessStartMs = businessStartD.getTime();
    
    const businessEndD = new Date(d);
    businessEndD.setHours(dayConfig.endHour, 0, 0, 0);
    const businessEndMs = businessEndD.getTime();
    
    // Intersecção do [currentMs, tickEnd] com [businessStartMs, businessEndMs]
    const intersectStart = Math.max(currentMs, businessStartMs);
    const intersectEnd = Math.min(tickEnd, businessEndMs);
    
    if (intersectEnd > intersectStart) {
      elapsedMs += (intersectEnd - intersectStart);
    }
    
    currentMs = tickEnd;
  }
  
  return elapsedMs;
}

/**
 * Calcula a data exata de vencimento (due date) de um SLA baseada na 
 * data de início e na duração em milissegundos úteis permitidos.
 */
export function calculateSlaDueDate(
  startIso: string | Date,
  allowedDurationMs: number,
  config: BusinessHoursConfig
): Date {
  const start = new Date(startIso).getTime();
  let currentMs = start;
  let remainingMs = allowedDurationMs;
  
  // Se não há duração, vence agora
  if (remainingMs <= 0) return new Date(start);
  
  let safetyCounter = 0;
  
  while (remainingMs > 0 && safetyCounter < 1000) {
    safetyCounter++;
    const d = new Date(currentMs);
    const dateStr = format(d, 'yyyy-MM-dd');
    const dayOfWeek = d.getDay();
    
    const nextDayD = new Date(d);
    nextDayD.setDate(d.getDate() + 1);
    nextDayD.setHours(0, 0, 0, 0);
    const nextDay = nextDayD.getTime();
    
    // Feriado (BUG-10 FIX: usa isHolidayDate)
    if (isHolidayDate(dateStr, config.holidays)) {
      currentMs = nextDay;
      continue;
    }
    
    // Dia Inativo
    const dayConfig = config.schedule.find(s => s.dayIndex === dayOfWeek);
    if (!dayConfig || !dayConfig.active) {
      currentMs = nextDay;
      continue;
    }
    
    const businessStartD = new Date(d);
    businessStartD.setHours(dayConfig.startHour, 0, 0, 0);
    const businessStartMs = businessStartD.getTime();
    
    const businessEndD = new Date(d);
    businessEndD.setHours(dayConfig.endHour, 0, 0, 0);
    const businessEndMs = businessEndD.getTime();
    
    // Se o currentMs já passou do final do expediente, pular para o dia seguinte
    if (currentMs >= businessEndMs) {
      currentMs = nextDay;
      continue;
    }
    
    // Se o currentMs for antes do expediente, avançar para o início do expediente
    if (currentMs < businessStartMs) {
      currentMs = businessStartMs;
    }
    
    // Tempo disponível no dia atual a partir de currentMs
    const availableMsToday = businessEndMs - currentMs;
    
    if (availableMsToday > 0) {
      if (remainingMs <= availableMsToday) {
        // Encontramos o fim
        currentMs += remainingMs;
        remainingMs = 0;
        break;
      } else {
        // Consome tudo hoje e avança pro dia seguinte
        remainingMs -= availableMsToday;
        currentMs = nextDay;
      }
    } else {
      currentMs = nextDay;
    }
  }
  
  return new Date(currentMs);
}
