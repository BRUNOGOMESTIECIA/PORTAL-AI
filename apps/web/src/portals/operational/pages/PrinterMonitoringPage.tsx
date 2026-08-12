import React, { useState, useEffect } from 'react';

import { Link } from 'react-router-dom';
import { Printer, AlertTriangle, CheckCircle2, RefreshCw, FileText, Search, X, ArrowLeft } from 'lucide-react';
import { cn } from '../../../lib/utils';

// ─── Mock Data ───────────────────────────────────────────────────────────────

/**
 * Interface que representa os dados monitorados de uma impressora de rede.
 * @property id Identificador único da impressora.
 * @property name Nome de exibição (geralmente indicando o setor).
 * @property model Modelo comercial do equipamento.
 * @property patrimony Código de controle de patrimônio interno.
 * @property location Localização física no prédio.
 * @property ip Endereço IP estático na rede.
 * @property status Estado atual (online, offline, com avisos ou imprimindo).
 * @property ink Níveis atuais de suprimentos/tinta (Ciano, Magenta, Amarelo, Preto).
 * @property pagesTotal Contador absoluto de páginas impressas na vida útil.
 * @property pagesMonth Contador de páginas impressas no mês atual (billing).
 * @property lastPrint Data e hora do último trabalho enviado/impresso.
 * @property paperLevel Nível estimado de papel nas bandejas (0-100%).
 * @property jobsQueue Quantidade de documentos aguardando na fila de impressão.
 * @property company Empresa ou filial responsável pela impressora.
 * @property unit Unidade física onde a impressora está instalada.
 * @property sector Setor principal que utiliza a impressora.
 */
interface Printer {
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
}

const MOCK_PRINTERS: Printer[] = [
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
    pagesMonth: 1240,
    lastPrint: '2026-07-17T11:55:00Z',
    paperLevel: 80,
    jobsQueue: 2,
  },
  {
    id: 'prt_002',
    name: 'Impressora RH - Andar 2',
    model: 'Canon PIXMA G7010',
    patrimony: 'IMP-00215',
    location: 'Andar 2 - RH',
    company: 'Empresa Matriz',
    unit: 'São Paulo - SP',
    sector: 'Recursos Humanos',
    ip: '192.168.1.205',
    status: 'printing',
    ink: { cyan: 45, magenta: 38, yellow: 22, black: 60 },
    pagesTotal: 22100,
    pagesMonth: 890,
    lastPrint: '2026-07-17T12:00:00Z',
    paperLevel: 45,
    jobsQueue: 5,
  },
  {
    id: 'prt_003',
    name: 'Impressora Comercial',
    model: 'Epson EcoTank L6270',
    patrimony: 'IMP-00188',
    location: 'Andar 1 - Comercial',
    company: 'Empresa Matriz',
    unit: 'São Paulo - SP',
    sector: 'Comercial',
    ip: '192.168.1.210',
    status: 'warning',
    ink: { cyan: 8, magenta: 12, yellow: 5, black: 18 },
    pagesTotal: 31450,
    pagesMonth: 2100,
    lastPrint: '2026-07-17T10:20:00Z',
    paperLevel: 10,
    jobsQueue: 0,
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
    status: 'offline',
    ink: { cyan: 55, magenta: 60, yellow: 48, black: 70 },
    pagesTotal: 15800,
    pagesMonth: 310,
    lastPrint: '2026-07-16T17:30:00Z',
    paperLevel: 0,
    jobsQueue: 0,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const statusCfg = {
  online:   { label: 'Online',      dot: 'bg-emerald-500', badge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' },
  printing: { label: 'Imprimindo',  dot: 'bg-blue-500 animate-pulse', badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' },
  warning:  { label: 'Atenção',     dot: 'bg-amber-500', badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' },
  offline:  { label: 'Offline',     dot: 'bg-slate-400', badge: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' },
};

/**
 * Componente visual de barra de progresso para os níveis de suprimentos (tinta).
 * @param label Nome da cor (ex: Ciano, Preto)
 * @param value Nível da tinta em porcentagem (0-100)
 * @param color Classe CSS Tailwind que define a cor de preenchimento da barra
 */
function InkBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-[10px] mb-0.5">
        <span className="text-slate-500">{label}</span>
        <span className={cn('font-bold', value < 15 ? 'text-rose-500' : 'text-slate-600 dark:text-slate-300')}>{value}%</span>
      </div>
      <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

/**
 * Componente Card que exibe o resumo de uma impressora na grid.
 * @param printer O objeto Printer contendo os dados.
 * @param selected Indica se este card é o que está atualmente selecionado/ativo.
 * @param onClick Callback executado quando o usuário clica no card.
 */
function PrinterCard({ printer, selected, onClick }: { printer: Printer; selected: boolean; onClick: () => void }) {
  const st = statusCfg[printer.status];
  const hasWarning = printer.ink.black < 15 || printer.ink.cyan < 15 || printer.paperLevel < 15;

  return (
    <button
      onClick={onClick}
      className={cn(
        'group w-full text-left rounded-2xl border p-5 transition-all duration-200',
        selected
          ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-md'
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-md hover:border-slate-300'
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', printer.status === 'offline' ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600')}>
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{printer.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{printer.model}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasWarning && <AlertTriangle className="w-4 h-4 text-amber-500" />}
          <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1.5', st.badge)}>
            <div className={cn('w-1.5 h-1.5 rounded-full', st.dot)} />{st.label}
          </span>
        </div>
      </div>

      {/* Ink levels */}
      <div className="space-y-1.5 mb-4">
        <InkBar label="Preto" value={printer.ink.black} color="bg-slate-800" />
        <InkBar label="Ciano" value={printer.ink.cyan} color="bg-cyan-500" />
        <InkBar label="Magenta" value={printer.ink.magenta} color="bg-pink-500" />
        <InkBar label="Amarelo" value={printer.ink.yellow} color="bg-yellow-400" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center bg-slate-50 dark:bg-slate-800/60 rounded-lg p-2">
          <p className="text-[10px] text-slate-400">Papel</p>
          <p className={cn('text-xs font-bold', printer.paperLevel < 15 ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300')}>{printer.paperLevel}%</p>
        </div>
        <div className="text-center bg-slate-50 dark:bg-slate-800/60 rounded-lg p-2">
          <p className="text-[10px] text-slate-400">Fila</p>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{printer.jobsQueue}</p>
        </div>
        <div className="text-center bg-slate-50 dark:bg-slate-800/60 rounded-lg p-2">
          <p className="text-[10px] text-slate-400">/mês</p>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{printer.pagesMonth.toLocaleString('pt-BR')}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
        <span>{printer.location} · {printer.ip}</span>
        <span className="text-slate-400">{new Date(printer.lastPrint).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

/**
 * Página Principal: Monitoramento de Impressoras.
 * Painel em tempo real para controle de parque de impressão, exibindo status 
 * operacionais, níveis de suprimentos, papel e fila de impressão.
 */
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { startOutboundTelemetryPushAgent } from '../../../lib/hardware-telemetry-push-agent';

export default function PrinterMonitoringPage() {
  const [printers, setPrinters] = useState<Printer[]>(MOCK_PRINTERS);
  const [selected, setSelected] = useState<string | null>('prt_001');

  useEffect(() => {
    // 1. Inicia o agente sonda de telemetria Outbound Push seguro (0 portas abertas)
    startOutboundTelemetryPushAgent();

    // 2. Escuta a coleção printer_telemetry no Firestore ao vivo
    const q = collection(db, 'printer_telemetry');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const livePrinters: Printer[] = [];
        snapshot.forEach((docSnap) => {
          livePrinters.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        setPrinters(livePrinters);
      }
    }, (err) => {
      console.warn('[PrinterMonitoring] Aviso de escuta Firestore:', err);
    });

    return () => unsubscribe();
  }, []);

  // Estado para busca textual (nome, modelo, etc.)
  const [search, setSearch] = useState('');
  
  // Estado para filtragem rápida por status operacionais
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'printing' | 'warning' | 'offline'>('all');

  // Encontra os dados completos da impressora atualmente selecionada
  const selectedPrinter = printers.find(p => p.id === selected) || printers[0];

  // Aplica filtro de busca de texto e botão de status
  const filtered = printers.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      p.name.toLowerCase().includes(q) ||
      p.model.toLowerCase().includes(q) ||
      p.patrimony.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.ip.includes(q);
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const online = MOCK_PRINTERS.filter(p => p.status === 'online' || p.status === 'printing').length;
  const warnings = MOCK_PRINTERS.filter(p => p.status === 'warning').length;
  const offline = MOCK_PRINTERS.filter(p => p.status === 'offline').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <Link to="/operacional/app/tools" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors w-fit">
          <ArrowLeft className="w-4 h-4" /> Voltar para Ferramentas
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Monitoramento de Impressoras</h1>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
                🛡️ Outbound Push Agente Ativo (0 Portas Abertas / TLS 1.3)
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {online} operacional(is) · {warnings} com alertas · {offline} offline
            </p>
          </div>
          <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4" /> Atualizar
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total de Impressoras', value: MOCK_PRINTERS.length, icon: Printer, color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/20' },
          { label: 'Operacionais', value: online, icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/20' },
          { label: 'Com Alertas', value: warnings, icon: AlertTriangle, color: 'text-amber-500 bg-amber-100 dark:bg-amber-900/20' },
          { label: 'Total de Páginas/Mês', value: MOCK_PRINTERS.reduce((a, p) => a + p.pagesMonth, 0).toLocaleString('pt-BR'), icon: FileText, color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/20' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', s.color)}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{s.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome, modelo, patrimônio, localização, IP..."
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-9 pr-9 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-blue-400 transition"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex gap-1 flex-shrink-0">
          {(['all', 'online', 'printing', 'warning', 'offline'] as const).map(s => (
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
              {s === 'all' ? 'Todas' : s === 'online' ? 'Online' : s === 'printing' ? 'Imprimindo' : s === 'warning' ? 'Atenção' : 'Offline'}
            </button>
          ))}
        </div>
      </div>

      {/* Printer Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-4 text-center py-12 text-slate-400">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhuma impressora encontrada para <strong>"{search}"</strong></p>
          </div>
        ) : filtered.map(printer => (
          <PrinterCard
            key={printer.id}
            printer={printer}
            selected={selected === printer.id}
            onClick={() => setSelected(selected === printer.id ? null : printer.id)}
          />
        ))}
      </div>

      {/* Selected detail */}
      {selectedPrinter && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            Detalhes: {selectedPrinter.name}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-sm">
            <div><p className="text-xs text-slate-400 mb-0.5">Empresa</p><p className="font-medium text-slate-700 dark:text-slate-300">{selectedPrinter.company}</p></div>
            <div><p className="text-xs text-slate-400 mb-0.5">Unidade</p><p className="font-medium text-slate-700 dark:text-slate-300">{selectedPrinter.unit}</p></div>
            <div><p className="text-xs text-slate-400 mb-0.5">Setor</p><p className="font-medium text-slate-700 dark:text-slate-300">{selectedPrinter.sector}</p></div>
            <div><p className="text-xs text-slate-400 mb-0.5">Localização</p><p className="font-medium text-slate-700 dark:text-slate-300">{selectedPrinter.location}</p></div>
            <div><p className="text-xs text-slate-400 mb-0.5">Modelo</p><p className="font-medium text-slate-700 dark:text-slate-300">{selectedPrinter.model}</p></div>
            <div><p className="text-xs text-slate-400 mb-0.5">Patrimônio</p><p className="font-medium text-slate-700 dark:text-slate-300">{selectedPrinter.patrimony}</p></div>
            <div><p className="text-xs text-slate-400 mb-0.5">IP</p><p className="font-medium text-slate-700 dark:text-slate-300">{selectedPrinter.ip}</p></div>
            <div><p className="text-xs text-slate-400 mb-0.5">Total de Páginas</p><p className="font-medium text-slate-700 dark:text-slate-300">{selectedPrinter.pagesTotal.toLocaleString('pt-BR')}</p></div>
            <div><p className="text-xs text-slate-400 mb-0.5">Último Trabalho</p><p className="font-medium text-slate-700 dark:text-slate-300">{new Date(selectedPrinter.lastPrint).toLocaleString('pt-BR')}</p></div>
          </div>
        </div>
      )}
    </div>
  );
}
