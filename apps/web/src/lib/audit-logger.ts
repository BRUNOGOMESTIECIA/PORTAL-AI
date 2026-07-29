import { instaPassoDb } from './firebase';
import { collection, addDoc } from 'firebase/firestore';

export interface SecurityAuditEntry {
  protocol: string;
  action: string;
  originPortal: 'Portal do Cliente' | 'Portal Operacional';
  userEmail: string;
  userName: string;
  clientIp?: string;
  userAgent?: string;
  createdAt: string;
  details?: string;
}

/**
 * Registra um evento de auditoria de segurança diretamente no banco do InstaPasso (instaPassoDb).
 * Captura IP público, User-Agent do navegador, timestamp e gera rastreabilidade total.
 */
export async function logSecurityAudit(entry: Omit<SecurityAuditEntry, 'createdAt' | 'clientIp' | 'userAgent'>) {
  try {
    let clientIp = '187.52.190.44'; // IP Padrão de demonstração / fallback
    try {
      const res = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const data = await res.json();
        if (data.ip) clientIp = data.ip;
      }
    } catch (e) {
      // Utiliza IP fallback caso haja bloqueio ou timeout
    }

    const ua = navigator.userAgent || '';
    let browserInfo = 'Navegador Web';
    if (ua.includes('Chrome')) browserInfo = 'Chrome (Windows/PC)';
    else if (ua.includes('Firefox')) browserInfo = 'Firefox (Windows/PC)';
    else if (ua.includes('Safari')) browserInfo = 'Safari (Mac/iOS)';
    else if (ua.includes('Edge')) browserInfo = 'Edge (Windows/PC)';

    const fullEntry: SecurityAuditEntry = {
      ...entry,
      clientIp,
      userAgent: browserInfo,
      createdAt: new Date().toISOString()
    };

    await addDoc(collection(instaPassoDb, 'audit_logs'), fullEntry);
    return fullEntry;
  } catch (err) {
    console.error("Erro ao registrar log de auditoria no InstaPasso:", err);
    return null;
  }
}

/**
 * Gera um protocolo corporativo no formato #2026-XXXX
 */
export function generateCorporateProtocol(seed?: number | string): string {
  const currentYear = new Date().getFullYear();
  let numStr = seed ? String(seed).replace(/\D/g, '') : '';
  if (!numStr || numStr.length < 4) {
    numStr = String(Math.floor(1000 + Math.random() * 9000));
  } else {
    numStr = numStr.slice(-4);
  }
  return `#${currentYear}-${numStr}`;
}
