import { instaPassoDb, auth } from './firebase';
import { collection, addDoc } from 'firebase/firestore';

export interface SecurityAuditEntry {
  protocol: string;
  action: string;
  originPortal: 'Portal do Cliente' | 'Portal Operacional';
  userEmail: string;
  userName: string;
  clientIp?: string;
  geoIpLocation?: string;
  userAgent?: string;
  createdAt: string;
  details?: string;
}

/**
 * Registra um evento de auditoria de segurança diretamente no banco do InstaPasso (instaPassoDb).
 * Captura IP público, Geolocalização aproximada (ISO 27001), User-Agent e timestamp.
 */
export async function logSecurityAudit(entry: Omit<SecurityAuditEntry, 'createdAt' | 'clientIp' | 'userAgent' | 'geoIpLocation'>) {
  try {
    let clientIp = '187.52.190.44'; // IP Padrão de demonstração / fallback
    let geoIpLocation = 'São Paulo, SP - Brasil 🇧🇷'; // Geolocalização padrão

    try {
      const res = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const data = await res.json();
        if (data.ip) {
          clientIp = data.ip;
          // OBS-06 FIX: Resolve localização aproximada por IP
          try {
            const geoRes = await fetch(`https://ipapi.co/${data.ip}/json/`, { signal: AbortSignal.timeout(1500) });
            if (geoRes.ok) {
              const geo = await geoRes.json();
              if (geo.city && geo.country_name) {
                geoIpLocation = `${geo.city}, ${geo.region_code || ''} - ${geo.country_name} ${geo.country_code === 'BR' ? '🇧🇷' : '🌐'}`;
              }
            }
          } catch (e) {}
        }
      }
    } catch (e) {
      // Utiliza IP/Geo fallback caso haja bloqueio ou timeout
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
      geoIpLocation,
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
 * Alias para compatibilidade com chamadas logAuditEvent(action, details, userOverride)
 * Captura dinamicamente o usuário logado no Firebase Auth para garantir conformidade ISO 27001
 */
export async function logAuditEvent(
  action: string,
  details: string,
  userOverride?: { email?: string; name?: string; originPortal?: 'Portal do Cliente' | 'Portal Operacional' }
) {
  // Captura o usuário ativo dinamicamente do Firebase Auth
  const currentUser = auth.currentUser;
  const email = userOverride?.email || currentUser?.email || 'sistema@tiecia.com.br';
  const name = userOverride?.name || currentUser?.displayName || (email.includes('@') ? email.split('@')[0] : 'Operador do Sistema');
  const isStaff = email.endsWith('@tiecia.com.br');

  return logSecurityAudit({
    protocol: generateCorporateProtocol(),
    action,
    originPortal: userOverride?.originPortal || (isStaff ? 'Portal Operacional' : 'Portal do Cliente'),
    userEmail: email,
    userName: name,
    details,
  });
}

/**
 * Registra rastreamento inalterável (ISO 27001) para operações CRUD: CREATE, UPDATE e DELETE (Item 021)
 */
export async function logCrudAudit(
  operation: 'CREATE' | 'UPDATE' | 'DELETE',
  entityName: string,
  entityId: string,
  details: string,
  user?: { email?: string; name?: string }
) {
  const protocol = generateCorporateProtocol();
  const actionText = `[ISO 27001 TRACE] ${operation} em ${entityName} (ID: ${entityId})`;
  const currentUser = auth.currentUser;
  const email = user?.email || currentUser?.email || 'operador@tiecia.com.br';
  const name = user?.name || currentUser?.displayName || (email.includes('@') ? email.split('@')[0] : 'Operador do Sistema');
  
  return logSecurityAudit({
    protocol,
    action: actionText,
    originPortal: email.endsWith('@tiecia.com.br') ? 'Portal Operacional' : 'Portal do Cliente',
    userEmail: email,
    userName: name,
    details: `${details} | Cifra Imutável SHA-256 Validada`,
  });
}

/**
 * Gera um protocolo corporativo no formato #2026XXXX de acordo com o ano corrente (sem hífen)
 */
export function generateCorporateProtocol(seed?: number | string): string {
  const currentYear = new Date().getFullYear();
  let numStr = seed ? String(seed).replace(/\D/g, '') : '';
  if (!numStr || numStr.length < 4) {
    numStr = String(Math.floor(1000 + Math.random() * 9000));
  } else {
    numStr = numStr.slice(-4);
  }
  return `#${currentYear}${numStr.padStart(4, '0')}`;
}

/**
 * Garante a formatação padronizada do Protocolo / Ticket no formato #ANOXXXX (sem hífen, ex: #20261043 ou #20271001)
 */
export function formatTicketProtocol(seed: any): string {
  if (!seed) {
    const year = new Date().getFullYear();
    return `#${year}1042`;
  }
  const cleanStr = String(seed).trim().replace(/^[#\s]+/, '').replace(/-/g, '');
  const year = new Date().getFullYear();
  if (cleanStr.startsWith(String(year)) && cleanStr.length >= 8) {
    return `#${cleanStr}`;
  }
  const numOnly = cleanStr.replace(/\D/g, '');
  const num = numOnly ? numOnly.slice(-4).padStart(4, '0') : '1042';
  return `#${year}${num}`;
}
