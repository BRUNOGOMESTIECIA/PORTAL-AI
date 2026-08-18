import { doc, getDoc, setDoc, updateDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { instaPassoDb } from './firebase';
import { logAuditEvent } from './audit-logger';

export interface TvPairingRequest {
  code: string; // Ex: '834192'
  formattedCode: string; // Ex: '834-192'
  status: 'PENDING' | 'AUTHORIZED' | 'REJECTED';
  deviceToken?: string;
  deviceName?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  authorizedAt?: string;
  authorizedBy?: string;
  authorizedByEmail?: string;
  expiresAt: string;
}

export interface TvAuthorizedDevice {
  deviceId: string;
  deviceToken: string;
  deviceName: string;
  pairedCode: string;
  authorizedBy: string;
  authorizedByEmail: string;
  authorizedAt: string;
  lastActiveAt: string;
}

const TV_DEVICE_TOKEN_KEY = 'portal_tv_display_device_token';
const TV_DEVICE_NAME_KEY = 'portal_tv_display_device_name';

/**
 * Retorna o token do dispositivo de exibição salvo no navegador da TV.
 */
export function getSavedTvDeviceToken(): string | null {
  try {
    return localStorage.getItem(TV_DEVICE_TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Salva o token permanente do dispositivo de exibição no navegador da TV.
 */
export function saveTvDeviceToken(deviceToken: string, deviceName: string = 'Smart TV Videowall NOC'): void {
  try {
    localStorage.setItem(TV_DEVICE_TOKEN_KEY, deviceToken);
    localStorage.setItem(TV_DEVICE_NAME_KEY, deviceName);
  } catch (e) {
    console.warn('[TvAuth] Erro ao salvar token local:', e);
  }
}

/**
 * Remove o pareamento da TV deste navegador.
 */
export function clearTvDeviceToken(): void {
  try {
    localStorage.removeItem(TV_DEVICE_TOKEN_KEY);
    localStorage.removeItem(TV_DEVICE_NAME_KEY);
  } catch {}
}

/**
 * Gera um código de pareamento de 6 dígitos aleatório (ex: 834192 -> 834-192)
 */
export function generatePairingCode(): { code: string; formattedCode: string } {
  const num = Math.floor(100000 + Math.random() * 900000);
  const code = String(num);
  const formattedCode = `${code.slice(0, 3)}-${code.slice(3)}`;
  return { code, formattedCode };
}

/**
 * Inicia uma nova solicitação de pareamento para a Smart TV no Firestore.
 */
export async function createTvPairingRequest(code: string, formattedCode: string): Promise<TvPairingRequest> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 15 * 60 * 1000).toISOString(); // 15 min expiração

  const requestData: TvPairingRequest = {
    code,
    formattedCode,
    status: 'PENDING',
    userAgent: navigator.userAgent || 'Smart TV Browser',
    createdAt: now.toISOString(),
    expiresAt,
  };

  const reqRef = doc(instaPassoDb, 'tv_pairing_requests', code);
  await setDoc(reqRef, requestData);

  return requestData;
}

/**
 * Escuta em tempo real a aprovação do pareamento da TV pelo administrador.
 */
export function listenTvPairingStatus(
  code: string,
  onAuthorized: (data: TvPairingRequest) => void,
  onRejected?: () => void
): () => void {
  const reqRef = doc(instaPassoDb, 'tv_pairing_requests', code);

  const unsubscribe = onSnapshot(reqRef, (snap) => {
    if (snap.exists()) {
      const data = snap.data() as TvPairingRequest;
      if (data.status === 'AUTHORIZED' && data.deviceToken) {
        saveTvDeviceToken(data.deviceToken, data.deviceName || 'Smart TV Videowall NOC');
        onAuthorized(data);
      } else if (data.status === 'REJECTED') {
        if (onRejected) onRejected();
      }
    }
  });

  return unsubscribe;
}

/**
 * Autoriza uma Smart TV a partir do celular ou computador do técnico/administrador.
 */
export async function authorizeTvDevice(
  code: string,
  adminUser: { name: string; email: string },
  customDeviceName: string = 'Smart TV Videowall NOC (Sala de Operações)'
): Promise<{ success: boolean; deviceToken: string; message: string }> {
  const cleanCode = code.replace(/\D/g, '');
  const reqRef = doc(instaPassoDb, 'tv_pairing_requests', cleanCode);
  const snap = await getDoc(reqRef);

  if (!snap.exists()) {
    throw new Error('Código de pareamento não encontrado ou expirado. Verifique o código exibido na TV.');
  }

  const reqData = snap.data() as TvPairingRequest;
  if (reqData.status === 'AUTHORIZED') {
    return {
      success: true,
      deviceToken: reqData.deviceToken || '',
      message: 'Esta Smart TV já foi autorizada anteriormente e está conectada.',
    };
  }

  const secureEntropy = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID().replace(/-/g, '')
    : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const deviceToken = `tv_sec_${Date.now()}_${secureEntropy}`;
  const deviceId = `device_tv_${cleanCode}`;
  const nowIso = new Date().toISOString();

  // 1. Atualiza a solicitação para AUTHORIZED
  await updateDoc(reqRef, {
    status: 'AUTHORIZED',
    deviceToken,
    deviceName: customDeviceName,
    authorizedAt: nowIso,
    authorizedBy: adminUser.name,
    authorizedByEmail: adminUser.email,
  });

  // 2. Registra o dispositivo na lista de dispositivos permanentes
  const devRef = doc(instaPassoDb, 'tv_authorized_devices', deviceId);
  const deviceRecord: TvAuthorizedDevice = {
    deviceId,
    deviceToken,
    deviceName: customDeviceName,
    pairedCode: cleanCode,
    authorizedBy: adminUser.name,
    authorizedByEmail: adminUser.email,
    authorizedAt: nowIso,
    lastActiveAt: nowIso,
  };
  await setDoc(devRef, deviceRecord);

  // 3. Log de Auditoria ISO 27001 com identificação do operador real
  await logAuditEvent(
    'TV_DEVICE_PAIRED_AUTHORIZED',
    `📺 [SMART TV NOC] Dispositivo '${customDeviceName}' (Código ${cleanCode}) autorizado com sucesso por ${adminUser.name} (${adminUser.email}). Exibição 24/7 liberada.`,
    { email: adminUser.email, name: adminUser.name, originPortal: 'Portal Operacional' }
  );

  return {
    success: true,
    deviceToken,
    message: `Smart TV autorizada com sucesso! A tela da TV já foi desbloqueada.`,
  };
}
