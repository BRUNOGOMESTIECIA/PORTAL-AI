import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Cpu, Monitor, Smartphone, Battery,
  Clock, MapPin, User, RefreshCw, ArrowLeft, Activity, AlertTriangle,
  CheckCircle2, Shield, Search, X
} from 'lucide-react';
import { cn } from '../../../lib/utils';

// ─── Mock Data ───────────────────────────────────────────────────────────────

/**
 * Interface que define a estrutura de dados de um equipamento (dispositivo).
 * @property id Identificador único do dispositivo.
 * @property type Categoria do dispositivo (smartphone, notebook ou desktop).
 * @property name Nome de exibição do dispositivo.
 * @property model Modelo comercial do aparelho.
 * @property serial Número de série do fabricante.
 * @property patrimony Código de patrimônio interno da empresa.
 * @property imei Número do IMEI (aplicável para smartphones).
 * @property os Sistema Operacional do dispositivo.
 * @property osVersion Versão atual do Sistema Operacional.
 * @property status Estado atual do dispositivo na rede.
 * @property battery Nível de bateria (0-100), opcional para desktops.
 * @property storage Dados de armazenamento interno (usado e total em GB).
 * @property ram Dados de memória RAM (usado e total em GB).
 * @property user Nome do colaborador vinculado ao dispositivo.
 * @property company Empresa proprietária ou gestora do dispositivo.
 * @property unit Unidade ou filial do equipamento.
 * @property sector Setor ou departamento ao qual o dispositivo pertence.
 * @property location Localização física ou filial do dispositivo.
 * @property lastSeen Último momento de sincronização (ISO 8601).
 * @property uptime Tempo contínuo em que o dispositivo está ligado.
 * @property ip Endereço IP do dispositivo na rede.
 * @property mac Endereço MAC da interface de rede.
 * @property cpuUsage Uso de CPU atual em porcentagem (0-100).
 * @property temperature Temperatura atual do hardware, opcional.
 * @property antivirus Status do antivírus instalado.
 * @property encryptionEnabled Indica se a criptografia de disco está ativa.
 */
export interface MockDevice {
  id: string;
  type: 'smartphone' | 'notebook' | 'desktop';
  name: string;
  model: string;
  serial: string;
  patrimony: string;
  imei?: string;
  os: string;
  osVersion: string;
  status: 'online' | 'offline' | 'warning';
  battery?: number;
  storage: { used: number; total: number };
  ram: { used: number; total: number };
  user: string;
  company: string;
  unit: string;
  sector: string;
  location: string;
  lastSeen: string;
  uptime: string;
  ip: string;
  mac: string;
  cpuUsage: number;
  temperature?: number;
  antivirus: 'ok' | 'outdated' | 'inactive';
  encryptionEnabled: boolean;
}

export const MOCK_DEVICES: MockDevice[] = [
  {
    id: 'dev_cel_001',
    type: 'smartphone',
    name: 'Smartphone Corporativo',
    model: 'Samsung Galaxy S21',
    serial: '357123048765432',
    patrimony: 'CEL-00456',
    imei: '357123048765432',
    os: 'Android',
    osVersion: '13.0',
    status: 'online',
    battery: 78,
    storage: { used: 38, total: 128 },
    ram: { used: 3.2, total: 8 },
    user: 'André Carvalho',
    company: 'Empresa Matriz',
    unit: 'São Paulo - SP',
    sector: 'Comercial',
    location: 'São Paulo - SP',
    lastSeen: '2026-07-17T11:58:00Z',
    uptime: '3d 14h 22m',
    ip: '192.168.1.105',
    mac: 'A4:70:D6:88:12:BC',
    cpuUsage: 24,
    temperature: 38,
    antivirus: 'ok',
    encryptionEnabled: true,
  },
  {
    id: 'dev_nb_001',
    type: 'notebook',
    name: 'Notebook Corporativo',
    model: 'Dell Latitude 5420',
    serial: '5F8Y2L3',
    patrimony: 'NTB-10234',
    os: 'Windows',
    osVersion: '11 Pro 23H2',
    status: 'online',
    battery: 54,
    storage: { used: 210, total: 512 },
    ram: { used: 10.4, total: 16 },
    user: 'André Carvalho',
    company: 'Empresa Matriz',
    unit: 'São Paulo - SP',
    sector: 'Comercial',
    location: 'São Paulo - SP',
    lastSeen: '2026-07-17T11:55:00Z',
    uptime: '1d 6h 41m',
    ip: '192.168.1.108',
    mac: 'B8:27:EB:44:3A:1F',
    cpuUsage: 61,
    temperature: 56,
    antivirus: 'ok',
    encryptionEnabled: true,
  },
  {
    id: 'dev_nb_002',
    type: 'notebook',
    name: 'Notebook Filial CPS',
    model: 'Lenovo ThinkPad E15',
    serial: 'R9KL22M4',
    patrimony: 'NTB-10102',
    os: 'Windows',
    osVersion: '11 Pro 22H2',
    status: 'warning',
    battery: 12,
    storage: { used: 480, total: 512 },
    ram: { used: 14.8, total: 16 },
    user: 'Paulo Silva',
    company: 'Filial CPS',
    unit: 'Campinas - SP',
    sector: 'Logística',
    location: 'Campinas - SP',
    lastSeen: '2026-07-17T10:30:00Z',
    uptime: '12h 03m',
    ip: '192.168.2.44',
    mac: 'DC:A6:32:11:44:BB',
    cpuUsage: 89,
    temperature: 78,
    antivirus: 'outdated',
    encryptionEnabled: false,
  },
  {
    id: 'dev_cel_002',
    type: 'smartphone',
    name: 'iPhone Corporativo',
    model: 'Apple iPhone 14',
    serial: 'DNPXQ2HXNW',
    patrimony: 'CEL-00512',
    imei: '352048104856279',
    os: 'iOS',
    osVersion: '17.4.1',
    status: 'offline',
    battery: 0,
    storage: { used: 60, total: 128 },
    ram: { used: 0, total: 6 },
    user: 'Juliana Ferreira',
    company: 'Empresa Matriz',
    unit: 'Rio de Janeiro - RJ',
    sector: 'Diretoria',
    location: 'Última: Rio de Janeiro - RJ',
    lastSeen: '2026-07-16T18:22:00Z',
    uptime: '-',
    ip: '-',
    mac: 'F8:FF:C2:22:4A:90',
    cpuUsage: 0,
    antivirus: 'ok',
    encryptionEnabled: true,
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const statusConfig = {
  online:  { label: 'Online',  dot: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', badge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' },
  offline: { label: 'Offline', dot: 'bg-slate-400',   text: 'text-slate-500 dark:text-slate-400',     badge: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' },
  warning: { label: 'Atenção', dot: 'bg-amber-500',   text: 'text-amber-600 dark:text-amber-400',     badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' },
};

const DeviceIcon = ({ type, className }: { type: MockDevice['type'], className?: string }) => {
  if (type === 'smartphone') return <Smartphone className={className} />;
  return <Monitor className={className} />;
};

function GaugeBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

/**
 * Componente que exibe um pequeno card numérico para mostrar propriedades do dispositivo.
 * @param label Rótulo do campo (ex: Usuário, Localização)
 * @param value Valor principal a ser exibido
 * @param sub Sub-texto opcional para informação adicional
 */
function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-200 dark:border-slate-800">
      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{value}</p>
      {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

/**
 * Componente de painel de detalhes do dispositivo.
 * Exibe todas as métricas detalhadas (CPU, RAM, Disco, Alertas) de um único dispositivo.
 * @param device Objeto MockDevice contendo as informações a serem exibidas.
 * @param onBack Função de callback executada ao clicar em "Voltar" (para deselecionar).
 */
function DeviceDetail({ device, onBack }: { device: MockDevice; onBack: () => void }) {
  const st = statusConfig[device.status];
  const batteryColor = device.battery != null
    ? device.battery > 40 ? 'bg-emerald-500' : device.battery > 15 ? 'bg-amber-500' : 'bg-rose-500'
    : 'bg-slate-400';
  const storPct = Math.round((device.storage.used / device.storage.total) * 100);
  const storColor = storPct > 90 ? 'bg-rose-500' : storPct > 70 ? 'bg-amber-500' : 'bg-blue-500';
  const ramPct = Math.round((device.ram.used / device.ram.total) * 100);
  const ramColor = ramPct > 85 ? 'bg-rose-500' : ramPct > 65 ? 'bg-amber-500' : 'bg-emerald-500';
  const cpuColor = device.cpuUsage > 85 ? 'bg-rose-500' : device.cpuUsage > 60 ? 'bg-amber-500' : 'bg-blue-500';

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', device.type === 'smartphone' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600')}>
              <DeviceIcon type={device.type} className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{device.name}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{device.model} · {device.patrimony}</p>
            </div>
            <span className={cn('ml-auto px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5', st.badge)}>
              <div className={cn('w-1.5 h-1.5 rounded-full', st.dot)} />
              {st.label}
            </span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {device.status === 'warning' && (
        <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
            {!device.encryptionEnabled && <p>• Criptografia de disco <strong>desativada</strong></p>}
            {device.antivirus === 'outdated' && <p>• Antivírus <strong>desatualizado</strong></p>}
            {(device.battery ?? 100) < 15 && <p>• Bateria crítica: <strong>{device.battery}%</strong></p>}
            {(device.temperature ?? 0) > 75 && <p>• Temperatura elevada: <strong>{device.temperature}°C</strong></p>}
            {device.storage.used / device.storage.total > 0.9 && <p>• Armazenamento crítico: <strong>{storPct}% usado</strong></p>}
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2"><Activity className="w-4 h-4 text-blue-500" /> Performance em Tempo Real</h3>
        
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500">CPU</span>
              <span className={cn('font-bold', device.cpuUsage > 85 ? 'text-rose-500' : device.cpuUsage > 60 ? 'text-amber-500' : 'text-slate-700 dark:text-slate-300')}>{device.cpuUsage}%</span>
            </div>
            <GaugeBar value={device.cpuUsage} max={100} color={cpuColor} />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500">RAM</span>
              <span className={cn('font-bold', ramPct > 85 ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300')}>{device.ram.used}GB / {device.ram.total}GB ({ramPct}%)</span>
            </div>
            <GaugeBar value={device.ram.used} max={device.ram.total} color={ramColor} />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500">Armazenamento</span>
              <span className={cn('font-bold', storPct > 90 ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300')}>{device.storage.used}GB / {device.storage.total}GB ({storPct}%)</span>
            </div>
            <GaugeBar value={device.storage.used} max={device.storage.total} color={storColor} />
          </div>
          {device.battery != null && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500">Bateria</span>
                <span className={cn('font-bold', (device.battery) < 15 ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300')}>{device.battery}%</span>
              </div>
              <GaugeBar value={device.battery} max={100} color={batteryColor} />
            </div>
          )}
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Usuário" value={device.user} />
        <Stat label="Empresa" value={device.company} />
        <Stat label="Unidade" value={device.unit} />
        <Stat label="Setor" value={device.sector} />
        <Stat label="Localização" value={device.location} />
        <Stat label="Sistema" value={device.os} sub={device.osVersion} />
        <Stat label="Uptime" value={device.uptime} />
        <Stat label="IP" value={device.ip} />
        <Stat label="MAC" value={device.mac} />
        {device.imei && <Stat label="IMEI" value={device.imei} />}
        {device.temperature != null && (
          <Stat label="Temperatura" value={<span className={device.temperature > 75 ? 'text-rose-500' : ''}>{device.temperature}°C</span>} />
        )}
      </div>

      {/* Security */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2"><Shield className="w-4 h-4 text-purple-500" /> Segurança</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Criptografia de Disco</span>
            {device.encryptionEnabled
              ? <span className="flex items-center gap-1 text-emerald-600 font-bold"><CheckCircle2 className="w-3.5 h-3.5" />Ativada</span>
              : <span className="flex items-center gap-1 text-rose-600 font-bold"><AlertTriangle className="w-3.5 h-3.5" />Desativada</span>}
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Antivírus</span>
            {device.antivirus === 'ok'
              ? <span className="flex items-center gap-1 text-emerald-600 font-bold"><CheckCircle2 className="w-3.5 h-3.5" />Atualizado</span>
              : device.antivirus === 'outdated'
              ? <span className="flex items-center gap-1 text-amber-600 font-bold"><AlertTriangle className="w-3.5 h-3.5" />Desatualizado</span>
              : <span className="flex items-center gap-1 text-rose-600 font-bold"><AlertTriangle className="w-3.5 h-3.5" />Inativo</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

/**
 * Página Principal: Monitoramento de Equipamentos.
 * Exibe uma listagem filtrável de todos os dispositivos corporativos, 
 * junto com seu estado atual e alertas. 
 * Também renderiza um painel lateral quando um dispositivo é selecionado.
 */
export default function EquipmentMonitoringPage() {
  const { deviceId } = useParams<{ deviceId?: string }>();
  const navigate = useNavigate();
  
  const [devices, setDevices] = useState<MockDevice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // States de Filtro
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline' | 'warning'>('all');

  useEffect(() => {
    fetch('/api/v1/assets/devices')
      .then(res => res.json())
      .then(data => {
        setDevices(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch devices, using mock for presentation:', err);
        setDevices([
          { 
            id: 'dev-1', type: 'notebook', name: 'MacBook Pro 14"', status: 'online', model: 'Apple M2 Pro', user: 'André Carvalho', patrimony: 'NT-0098', ip: '192.168.1.5', location: 'São Paulo - SP', lastSeen: 'Agora',
            mac: '00:1B:44:11:3A:B7', os: 'macOS', osVersion: 'Sonoma 14.4', serial: 'C02XYZ1234', company: 'Empresa Matriz', sector: 'Comercial', unit: 'São Paulo - SP',
            cpuUsage: 25, battery: 100, temperature: 45, antivirus: 'ok', encryptionEnabled: true,
            storage: { used: 250, total: 512 }, ram: { used: 12, total: 16 }
          },
          { 
            id: 'dev-2', type: 'smartphone', name: 'iPhone 13 Corp', status: 'online', model: 'Apple 128GB', user: 'André Carvalho', patrimony: 'SM-0142', ip: '10.0.0.42', location: 'São Paulo - SP', lastSeen: 'Há 5 min', battery: 82,
            mac: 'F8:FF:C2:22:4A:90', os: 'iOS', osVersion: '17.4.1', serial: 'DNPXQ2HXNW', imei: '352048104856279', company: 'Empresa Matriz', sector: 'Comercial', unit: 'São Paulo - SP',
            cpuUsage: 10, temperature: 30, antivirus: 'ok', encryptionEnabled: true,
            storage: { used: 60, total: 128 }, ram: { used: 3, total: 4 }
          },
          { 
            id: 'dev-3', type: 'desktop', name: 'Workstation Dell', status: 'offline', model: 'OptiPlex 7090', user: 'Mariana Ribeiro', patrimony: 'DS-0120', ip: '192.168.1.102', location: 'Rio de Janeiro - RJ', lastSeen: 'Há 2 dias',
            mac: '00:1A:2B:3C:4D:5E', os: 'Windows 11 Pro', osVersion: '23H2', serial: 'DELL-XYZ987', company: 'Empresa Matriz', sector: 'Logística', unit: 'Rio de Janeiro - RJ',
            cpuUsage: 0, temperature: 0, antivirus: 'ok', encryptionEnabled: true,
            storage: { used: 800, total: 1000 }, ram: { used: 0, total: 32 }
          },
          { 
            id: 'dev-4', type: 'notebook', name: 'ThinkPad T14', status: 'warning', model: 'Lenovo T14 Gen 2', user: 'Paulo Silva', patrimony: 'NT-0155', ip: '192.168.2.14', location: 'Belo Horizonte - MG', lastSeen: 'Há 10 min', battery: 15,
            mac: '00:1C:42:5B:6A:7C', os: 'Windows 11 Pro', osVersion: '22H2', serial: 'LEN-ABC1234', company: 'Empresa Matriz', sector: 'TI', unit: 'Belo Horizonte - MG',
            cpuUsage: 88, temperature: 78, antivirus: 'outdated', encryptionEnabled: false,
            storage: { used: 480, total: 512 }, ram: { used: 14, total: 16 }
          }
        ] as any);
        setIsLoading(false);
      });
  }, []);

  const selectedDevice = deviceId ? devices.find((d) => d.id === deviceId) : null;

  // Filtragem dinâmica (busca + status)
  const filtered = devices.filter((d) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      d.name.toLowerCase().includes(q) ||
      d.model.toLowerCase().includes(q) ||
      d.patrimony.toLowerCase().includes(q) ||
      d.user.toLowerCase().includes(q) ||
      (d.imei ?? '').includes(q) ||
      d.ip.includes(q);
    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <Link to="/operacional/app/tools" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors w-fit">
          <ArrowLeft className="w-4 h-4" /> Voltar para Ferramentas
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Monitoramento de Equipamentos</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {devices.filter(d => d.status === 'online').length} online · {devices.filter(d => d.status === 'warning').length} com alertas · {devices.filter(d => d.status === 'offline').length} offline
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Atualizar
          </button>
        </div>
      </div>

      {/* Search + Filters */}
      {!selectedDevice && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nome, modelo, patrimônio, usuário, IP..."
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-9 pr-9 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-blue-400 transition"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex gap-1 flex-shrink-0">
            {(['all', 'online', 'offline', 'warning'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  'px-3 py-2 rounded-lg text-xs font-semibold transition-colors',
                  statusFilter === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                )}
              >
                {s === 'all' ? 'Todos' : s === 'online' ? 'Online' : s === 'offline' ? 'Offline' : 'Atenção'}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-6">
        {/* Device List */}
        <div className={cn('space-y-3 flex-shrink-0', selectedDevice ? 'w-72' : 'w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 space-y-0')}>
          {filtered.length === 0 ? (
            <div className="col-span-4 text-center py-12 text-slate-400">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhum equipamento encontrado para <strong>"{search}"</strong></p>
            </div>
          ) : filtered.map(device => {
            const st = statusConfig[device.status];
            return (
              <button
                key={device.id}
                onClick={() => navigate(device.id === deviceId ? '/operacional/app/tools/equipment' : `/operacional/app/tools/equipment/${device.id}`)}
                className={cn(
                  'group text-left w-full rounded-2xl border p-4 transition-all duration-200',
                  selectedDevice
                    ? 'flex items-center gap-3'
                    : 'flex flex-col gap-3',
                  device.id === deviceId
                    ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700'
                )}
              >
                <div className={cn('rounded-xl flex items-center justify-center flex-shrink-0',
                  selectedDevice ? 'w-9 h-9' : 'w-12 h-12',
                  device.type === 'smartphone' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                )}>
                  <DeviceIcon type={device.type} className={selectedDevice ? 'w-4 h-4' : 'w-6 h-6'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{device.name}</p>
                    <span className={cn('w-2 h-2 rounded-full flex-shrink-0', st.dot)} />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{device.model}</p>
                  {!selectedDevice && (
                    <>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{device.patrimony} · {device.user}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', st.badge)}>{st.label}</span>
                        {device.battery != null && (
                          <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                            <Battery className="w-3 h-3" />{device.battery}%
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Detail Panel */}
        {selectedDevice && (
          <div className="flex-1 min-w-0">
            <DeviceDetail device={selectedDevice} onBack={() => navigate('/operacional/app/tools/equipment')} />
          </div>
        )}
      </div>
    </div>
  );
}
