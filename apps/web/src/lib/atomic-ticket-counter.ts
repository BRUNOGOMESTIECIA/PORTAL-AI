import { doc, runTransaction, increment } from 'firebase/firestore';
import { instaPassoDb } from './firebase';
import { logAuditEvent, formatTicketProtocol } from './audit-logger';

/**
 * Retorna o ano atual dinamicamente em tempo de execução
 */
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

/**
 * Gerador de Protocolo de Ticket Atômico no Firestore (#2026XXXX) (Item 017)
 * Utiliza Transação Firestore para garantir unicidade estrita e prevenir race conditions.
 */
export async function generateNextAtomicTicketProtocol(): Promise<{ number: number; formatted: string }> {
  const counterRef = doc(instaPassoDb, 'counters', 'tickets');
  const currentYear = new Date().getFullYear();

  try {
    const nextNumber = await runTransaction(instaPassoDb, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);

      let currentSeq = 1042; // Sequência base para 2026
      let storedYear = currentYear;

      if (counterDoc.exists()) {
        const data = counterDoc.data();
        if (data) {
          storedYear = data.year || currentYear;
          // Se o ano mudou (ex: virou 2027), reseta a sequência para 1000
          if (storedYear !== currentYear) {
            currentSeq = 1000;
          } else if (typeof data.currentSeq === 'number') {
            currentSeq = data.currentSeq;
          }
        }
      }

      const nextSeq = currentSeq + 1;

      transaction.set(
        counterRef,
        {
          currentSeq: nextSeq,
          year: currentYear,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      return nextSeq;
    });

    const formatted = formatTicketProtocol(nextNumber);

    logAuditEvent(
      'ATOMIC_TICKET_COUNTER_GENERATED',
      `Novo protocolo de ticket atômico gerado no Firestore: ${formatted} (Sequência ${nextNumber}).`
    );

    return { number: nextNumber, formatted };
  } catch (error) {
    console.warn('Fallback local para geração atômica de protocolo:', error);
    
    // BUG-03 FIX: Contador monotônico sequencial no localStorage para impedir duplicatas offline
    let fallbackSeq = 1043;
    try {
      const stored = localStorage.getItem('portal_atomic_ticket_counter_fallback');
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed >= 1043) {
          fallbackSeq = parsed + 1;
        }
      }
      localStorage.setItem('portal_atomic_ticket_counter_fallback', fallbackSeq.toString());
    } catch (e) {
      // Entropia de alta resolução caso localStorage esteja inacessível
      const entropy = Math.floor((performance.now() * 100) + (Date.now() % 1000));
      fallbackSeq = 1043 + (entropy % 8000);
    }

    const formatted = formatTicketProtocol(fallbackSeq);
    return { number: fallbackSeq, formatted };
  }
}
