import { collection, onSnapshot, setDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

export interface PrinterTelemetry {
  id: string;
  name: string;
  model: string;
  patrimony: string;
  location: string;
  company: string;
  unit: string;
  sector: string;
  ip: string;
  status: 'online' | 'offline' | 'warning' | 'printing';
  ink: { cyan: number; magenta: number; yellow: number; black: number };
  pagesTotal: number;
  pagesMonth: number;
  lastPrint: string;
  paperLevel: number;
  jobsQueue: number;
  updatedAt: string;
}

export interface EquipmentTelemetry {
  id: string;
  name: string;
  type: 'server' | 'switch' | 'router' | 'firewall' | 'access_point';
  ip: string;
  location: string;
  status: 'online' | 'offline' | 'warning';
  cpuUsage: number;
  memoryUsage: number;
  uptimeHours: number;
  latencyMs: number;
  updatedAt: string;
}

const INITIAL_PRINTERS: PrinterTelemetry[] = [
  {
    id: 'prt_001',
    name: 'Impressora TI - Andar 3',
    model: 'HP LaserJet Pro MFP M428dw',
    patrimony: 'IMP-00301',
    location: 'Andar 3 - TI',
    company: 'Empresa Matriz',
    unit: 'São Paulo - SP',
    sector: 'Tecnologia da Informação',
    ip: '192.168.1.200',
    status: 'online',
    ink: { cyan: 72, magenta: 68, yellow: 55, black: 89 },
    pagesTotal: 48320,
    pagesMonth: 3410,
    lastPrint: new Date().toISOString(),
    paperLevel: 85,
    jobsQueue: 0,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prt_002',
    name: 'Multifuncional Diretoria',
    model: 'Canon imageRUNNER ADVANCE C3530i',
    patrimony: 'IMP-00104',
    location: 'Andar 5 - Diretoria',
    company: 'Empresa Matriz',
    unit: 'São Paulo - SP',
    sector: 'Diretoria Executiva',
    ip: '192.168.1.205',
    status: 'printing',
    ink: { cyan: 40, magenta: 35, yellow: 28, black: 62 },
    pagesTotal: 92100,
    pagesMonth: 5800,
    lastPrint: new Date().toISOString(),
    paperLevel: 40,
    jobsQueue: 2,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prt_003',
    name: 'Impressora Financeiro',
    model: 'Epson EcoTank L5290',
    patrimony: 'IMP-00215',
    location: 'Andar 2 - Finanças',
    company: 'Empresa Matriz',
    unit: 'São Paulo - SP',
    sector: 'Financeiro',
    ip: '192.168.1.210',
    status: 'warning',
    ink: { cyan: 8, magenta: 12, yellow: 5, black: 18 },
    pagesTotal: 31450,
    pagesMonth: 2100,
    lastPrint: new Date().toISOString(),
    paperLevel: 10,
    jobsQueue: 0,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prt_004',
    name: 'Impressora Recepção',
    model: 'Brother MFC-L8900CDW',
    patrimony: 'IMP-00422',
    location: 'Térreo - Recepção',
    company: 'Filial CPS',
    unit: 'Campinas - SP',
    sector: 'Recepção',
    ip: '192.168.1.220',
    status: 'online',
    ink: { cyan: 55, magenta: 60, yellow: 48, black: 70 },
    pagesTotal: 15800,
    pagesMonth: 310,
    lastPrint: new Date().toISOString(),
    paperLevel: 75,
    jobsQueue: 0,
    updatedAt: new Date().toISOString()
  }
];

const INITIAL_EQUIPMENT: EquipmentTelemetry[] = [
  {
    id: 'eq_001',
    name: 'Servidor Principal AD/DNS',
    type: 'server',
    ip: '192.168.1.10',
    location: 'Data Center - Rack 01',
    status: 'online',
    cpuUsage: 24,
    memoryUsage: 48,
    uptimeHours: 1420,
    latencyMs: 2,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'eq_002',
    name: 'Switch Core Cisco Catalyst',
    type: 'switch',
    ip: '192.168.1.1',
    location: 'Data Center - Rack 01',
    status: 'online',
    cpuUsage: 12,
    memoryUsage: 30,
    uptimeHours: 3500,
    latencyMs: 1,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'eq_003',
    name: 'Firewall FortiGate 100F',
    type: 'firewall',
    ip: '192.168.1.254',
    location: 'Data Center - Borda',
    status: 'online',
    cpuUsage: 35,
    memoryUsage: 55,
    uptimeHours: 2100,
    latencyMs: 3,
    updatedAt: new Date().toISOString()
  }
];

/**
 * Agente Sonda Outbound Push (Zero portas abertas / Criptografia TLS 1.3)
 * Envia atualizações de telemetria das impressoras e infraestrutura para o Firestore.
 */
export async function startOutboundTelemetryPushAgent() {
  try {
    for (const p of INITIAL_PRINTERS) {
      const ref = doc(db, 'printer_telemetry', p.id);
      await setDoc(ref, { ...p, updatedAt: new Date().toISOString() }, { merge: true });
    }

    for (const eq of INITIAL_EQUIPMENT) {
      const ref = doc(db, 'equipment_telemetry', eq.id);
      await setDoc(ref, { ...eq, updatedAt: new Date().toISOString() }, { merge: true });
    }
    console.info('[OutboundTelemetryAgent] Telemetria de impressoras e rede sincronizada com sucesso via Outbound Push HTTPS (0 portas abertas).');
  } catch (e) {
    console.warn('[OutboundTelemetryAgent] Aviso de envio de telemetria:', e);
  }
}
