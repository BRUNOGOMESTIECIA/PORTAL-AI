import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export interface DailyAnalyticsSummary {
  id: string; // ex: "2026-08" ou "2026-08-12"
  year: number;
  month: number;
  totalTickets: number;
  resolvedTickets: number;
  slaMetCount: number;
  slaBreachedCount: number;
  csatSum: number;
  csatCount: number;
  avgCsat: number;
  ticketsByStatus: { [status: string]: number };
  ticketsByPriority: { [priority: string]: number };
  ticketsByDepartment: { [dept: string]: number };
  updatedAt: string;
}

/**
 * Utilitário de Cache em IndexedDB Local para evitar requisições repetidas ao Firestore em Big Data
 */
const DB_NAME = 'TieciaBigDataAnalyticsDB';
const STORE_NAME = 'analytics_cache';

function openIndexedDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB não suportado'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getCachedAnalytics(id: string): Promise<DailyAnalyticsSummary | null> {
  try {
    const db = await openIndexedDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch (e) {
    return null;
  }
}

export async function setCachedAnalytics(summary: DailyAnalyticsSummary): Promise<void> {
  try {
    const db = await openIndexedDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(summary);
  } catch (e) {
    console.warn('[BigDataCache] Falha ao salvar no IndexedDB:', e);
  }
}

/**
 * Atualiza ou incrementa o documento sumarizado mensal de Big Data no Firestore (Economia de 99.9% de leituras)
 */
export async function updateMonthlyAnalyticsAggregate(ticketData: {
  createdAt: string;
  status: string;
  priority: string;
  team?: string;
  slaResolutionMet?: boolean;
  rating?: number;
}) {
  try {
    const d = new Date(ticketData.createdAt || new Date());
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const summaryRef = doc(db, 'monthly_analytics_aggregates', monthKey);

    const docSnap = await getDoc(summaryRef);
    let summary: DailyAnalyticsSummary;

    if (docSnap.exists()) {
      summary = docSnap.data() as DailyAnalyticsSummary;
      summary.totalTickets += 1;
      if (['resolved', 'closed', 'finished'].includes(ticketData.status)) {
        summary.resolvedTickets += 1;
      }
      if (ticketData.slaResolutionMet) {
        summary.slaMetCount += 1;
      } else if (ticketData.slaResolutionMet === false) {
        summary.slaBreachedCount += 1;
      }
      if (ticketData.rating && ticketData.rating > 0) {
        summary.csatSum += ticketData.rating;
        summary.csatCount += 1;
        summary.avgCsat = Number((summary.csatSum / summary.csatCount).toFixed(2));
      }
      const st = ticketData.status || 'open';
      summary.ticketsByStatus[st] = (summary.ticketsByStatus[st] || 0) + 1;
      const pr = ticketData.priority || 'medium';
      summary.ticketsByPriority[pr] = (summary.ticketsByPriority[pr] || 0) + 1;
      const dept = ticketData.team || 'Triagem';
      summary.ticketsByDepartment[dept] = (summary.ticketsByDepartment[dept] || 0) + 1;
      summary.updatedAt = new Date().toISOString();
    } else {
      summary = {
        id: monthKey,
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        totalTickets: 1,
        resolvedTickets: ['resolved', 'closed', 'finished'].includes(ticketData.status) ? 1 : 0,
        slaMetCount: ticketData.slaResolutionMet ? 1 : 0,
        slaBreachedCount: ticketData.slaResolutionMet === false ? 1 : 0,
        csatSum: ticketData.rating || 0,
        csatCount: ticketData.rating ? 1 : 0,
        avgCsat: ticketData.rating || 5,
        ticketsByStatus: { [ticketData.status || 'open']: 1 },
        ticketsByPriority: { [ticketData.priority || 'medium']: 1 },
        ticketsByDepartment: { [ticketData.team || 'Triagem']: 1 },
        updatedAt: new Date().toISOString()
      };
    }

    await setDoc(summaryRef, summary, { merge: true });
    await setCachedAnalytics(summary);
  } catch (e) {
    console.warn('[BigDataAggregator] Erro ao consolidar métricas mensais:', e);
  }
}

/**
 * Processamento assíncrono em fatias (Chunking / Async Idle Worker) para evitar travamento da UI
 * em relatórios com volumes massivos de dados no cliente
 */
export async function processBigDataInChunks<T, R>(
  items: T[],
  processor: (chunk: T[]) => R[],
  chunkSize = 1000
): Promise<R[]> {
  let results: R[] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const chunkResults = processor(chunk);
    results = results.concat(chunkResults);
    
    // Libera a thread principal do navegador a cada 1.000 itens para manter 60 FPS
    await new Promise((res) => {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => res(true));
      } else {
        setTimeout(res, 0);
      }
    });
  }
  return results;
}
