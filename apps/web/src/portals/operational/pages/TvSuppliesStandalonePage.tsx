import React, { useState, useEffect, useMemo } from 'react';
import { 
  Package, RefreshCw, AlertTriangle, CheckCircle2, Truck, 
  Maximize2, Minimize2, Tv, Copy, Check, ArrowRightLeft, 
  Box, Printer, Laptop, ShieldCheck, Clock, Layers
} from 'lucide-react';
import { toast } from 'sonner';
import { logAuditEvent, formatTicketProtocol } from '../../../lib/audit-logger';
import { useTickets } from '../../../hooks/use-tickets';
import { auth } from '../../../lib/firebase';
import { signInAnonymously } from 'firebase/auth';
import { Link } from 'react-router-dom';

interface SupplyItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  unit: string;
  status: 'ok' | 'low' | 'critical';
}

interface EquipmentExchange {
  id: string;
  protocol: string;
  requester: string;
  department: string;
  oldEquipment: string;
  newEquipment: string;
  reason: string;
  status: 'pending' | 'preparing' | 'in_transit' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
}

const DEFAULT_SUPPLIES: SupplyItem[] = [
  { id: 'sup1', name: 'Toner HP W1105A (105A) Preto', category: 'Impressão', currentStock: 2, minStock: 5, unit: 'unid', status: 'critical' },
  { id: 'sup2', name: 'Toner Brother TN-1060', category: 'Impressão', currentStock: 4, minStock: 4, unit: 'unid', status: 'low' },
  { id: 'sup3', name: 'Mouse USB Óptico Dell MS116', category: 'Periféricos', currentStock: 12, minStock: 6, unit: 'unid', status: 'ok' },
  { id: 'sup4', name: 'Teclado USB Dell KB216', category: 'Periféricos', currentStock: 9, minStock: 5, unit: 'unid', status: 'ok' },
  { id: 'sup5', name: 'Cabo de Rede Patch Cord Cat6 2.5m', category: 'Redes', currentStock: 18, minStock: 10, unit: 'unid', status: 'ok' },
  { id: 'sup6', name: 'Fonte Notebook Dell 65W Original', category: 'Acessórios', currentStock: 3, minStock: 5, unit: 'unid', status: 'low' },
  { id: 'sup7', name: 'SSD Kingston 480GB SATA III', category: 'Armazenamento', currentStock: 5, minStock: 4, unit: 'unid', status: 'ok' },
  { id: 'sup8', name: 'Nobreak 1200VA SMS Bivolt', category: 'Energia', currentStock: 1, minStock: 3, unit: 'unid', status: 'critical' }
];

const DEFAULT_EXCHANGES: EquipmentExchange[] = [
  {
    id: 'exc1',
    protocol: 'TR-20268841',
    requester: 'Fernanda Lima',
    department: 'Diretoria Financeira',
    oldEquipment: 'Dell Inspiron 14 (i5 8ª Geração)',
    newEquipment: 'Dell Latitude 3440 (i7 13ª Geração / 16GB)',
    reason: 'Upgrade de performance e fim de ciclo de vida (4 anos)',
    status: 'in_transit',
    priority: 'urgent',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: 'exc2',
    protocol: 'TR-20268842',
    requester: 'Rodrigo Alves',
    department: 'Operações / Logística',
    oldEquipment: 'Monitor Samsung 21.5" LCD (Flicker)',
    newEquipment: 'Monitor Dell 24" IPS FHD P2422H',
    reason: 'Tela apresentando linhas verticais e instabilidade',
    status: 'preparing',
    priority: 'high',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'exc3',
    protocol: 'TR-20268843',
    requester: 'Camila Duarte',
    department: 'Recursos Humanos',
    oldEquipment: 'Teclado/Mouse Genérico',
    newEquipment: 'Kit Teclado + Mouse Logitech MK235 Wireless',
    reason: 'Teclas com falha de acionamento',
    status: 'pending',
    priority: 'medium',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString()
  },
  {
    id: 'exc4',
    protocol: 'TR-20268844',
    requester: 'Marcos Vinicius',
    department: 'Suporte Técnico',
    oldEquipment: 'Leitor Biométrico USB (Danificado)',
    newEquipment: 'Leitor Biométrico Digital Persona U.are.U',
    reason: 'Falha física de leitura de impressão digital',
    status: 'completed',
    priority: 'high',
    createdAt: new Date(Date.now() - 3600000 * 14).toISOString()
  }
];

export default function TvSuppliesStandalonePage() {
  const { tickets } = useTickets();

  const [timeString, setTimeString] = useState('');
  const [refreshCountdown, setRefreshCountdown] = useState(30);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Conexão anônima segura Firebase
  useEffect(() => {
    if (auth && !auth.currentUser) {
      signInAnonymously(auth).catch(() => {});
    }
  }, []);

  // Relógio em tempo real
  useEffect(() => {
    logAuditEvent('TV_SUPPLIES_MODE_STARTED', 'Modo TV Suprimentos e Equipamentos acessado.');
    const updateClock = () => {
      setTimeString(new Date().toLocaleTimeString('pt-BR'));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Contador de Refresh
  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshCountdown((prev) => (prev <= 1 ? 30 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const copyTvLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Link da Mesa de Suprimentos copiado!');
    setTimeout(() => setCopied(false), 3000);
  };

  // ─── CÁLCULOS EM TEMPO REAL ───
  // Filtra tickets de hardware/suprimentos/trocas
  const hardwareTickets = useMemo(() => {
    return tickets.filter((t) => {
      const txt = `${t.title} ${t.category} ${t.description}`.toLowerCase();
      return (
        txt.includes('hardware') ||
        txt.includes('suprimento') ||
        txt.includes('troca') ||
        txt.includes('equipamento') ||
        txt.includes('toner') ||
        txt.includes('impressora') ||
        txt.includes('monitor') ||
        txt.includes('mouse') ||
        txt.includes('teclado') ||
        txt.includes('notebook')
      );
    });
  }, [tickets]);

  // Contagem de Trocas e Pedidos
  const activeExchangesCount = DEFAULT_EXCHANGES.filter((e) => e.status !== 'completed').length;
  const inTransitCount = DEFAULT_EXCHANGES.filter((e) => e.status === 'in_transit').length;
  const preparingCount = DEFAULT_EXCHANGES.filter((e) => e.status === 'preparing').length;

  const totalSuppliesOrders = 14 + hardwareTickets.length;
  const criticalStockItems = DEFAULT_SUPPLIES.filter((s) => s.status === 'critical').length;
  const lowStockItems = DEFAULT_SUPPLIES.filter((s) => s.status === 'low').length;
  const healthyStockPct = Math.round(
    ((DEFAULT_SUPPLIES.length - criticalStockItems) / DEFAULT_SUPPLIES.length) * 100
  );

  // SLA Logístico de Entrega (Meta 24h/48h)
  const logisticsSlaPct = 94;

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#050811] text-slate-100 flex flex-col justify-between p-6 overflow-hidden select-none">
      {/* ── BARRA SUPERIOR ── */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-2xl animate-pulse">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              <h1 className="text-lg font-black tracking-wider uppercase text-white">
                PAINEL DE SUPRIMENTOS, EQUIPAMENTOS & ESTOQUE
              </h1>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                MESA DE ATIVOS NOC
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Monitoramento em Alta Visibilidade de Trocas, Pedidos de Peças e Níveis de Estoque
            </p>
          </div>
        </div>

        {/* Alternador de Dashboards & Ações */}
        <div className="flex items-center gap-3">
          <Link
            to="/tv"
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-950/60 hover:bg-blue-900/80 text-blue-300 border border-blue-800/60 text-xs font-bold rounded-xl transition-all"
            title="Ir para o Dashboard Geral de Chamados"
          >
            <Tv className="w-3.5 h-3.5 text-blue-400" />
            <span>Ver NOC Chamados</span>
          </Link>

          <button
            type="button"
            onClick={copyTvLink}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all border border-slate-700 cursor-pointer"
            title="Copiar Link Direto para Smart TV"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
            <span>{copied ? 'Copiado!' : 'Copiar Link TV'}</span>
          </button>

          <div className="text-right hidden md:block pl-2 border-l border-slate-800">
            <span className="text-2xl font-black font-mono text-amber-400 tracking-widest">
              {timeString}
            </span>
            <span className="text-[10px] text-slate-400 block font-semibold">
              🔄 Atualização em {refreshCountdown}s
            </span>
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"
            title="Alternar Tela Cheia"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── GRID DOS 4 CARDS PRINCIPAIS ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 my-auto">
        {/* CARD 1: Trocas & Substituições */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-6 shadow-xl flex flex-col justify-between h-72 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl" />
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-black uppercase tracking-wider text-slate-300">
              TROCAS DE EQUIPAMENTOS
            </span>
            <ArrowRightLeft className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="text-6xl font-black text-white tracking-tight">
              {activeExchangesCount}
            </div>
            <p className="text-xs font-semibold text-blue-400 mt-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              {inTransitCount} a caminho • {preparingCount} em preparação
            </p>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full transition-all duration-1000" style={{ width: '75%' }} />
          </div>
        </div>

        {/* CARD 2: Pedidos de Suprimentos */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-6 shadow-xl flex flex-col justify-between h-72 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl" />
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-black uppercase tracking-wider text-slate-300">
              PEDIDOS DE SUPRIMENTOS
            </span>
            <Box className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="text-6xl font-black text-white tracking-tight">
              {totalSuppliesOrders}
            </div>
            <p className="text-xs font-semibold text-amber-400 mt-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Toners, periféricos e insumos do mês
            </p>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full transition-all duration-1000" style={{ width: '85%' }} />
          </div>
        </div>

        {/* CARD 3: Nível de Estoque Crítico */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-6 shadow-xl flex flex-col justify-between h-72 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl" />
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-black uppercase tracking-wider text-slate-300">
              ESTOQUE CRÍTICO / REPOSIÇÃO
            </span>
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <div className="text-6xl font-black text-red-400 tracking-tight flex items-baseline gap-2">
              {criticalStockItems}
              <span className="text-sm font-bold text-slate-400 uppercase">Itens</span>
            </div>
            <p className="text-xs font-semibold text-slate-300 mt-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              {lowStockItems} itens próximos do limite mínimo
            </p>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                criticalStockItems > 0 ? 'bg-red-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${healthyStockPct}%` }}
            />
          </div>
        </div>

        {/* CARD 4: SLA de Logística e Entrega */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-6 shadow-xl flex flex-col justify-between h-72 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl" />
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-black uppercase tracking-wider text-slate-300">
              SLA DE ENTREGA / LOGÍSTICA
            </span>
            <Truck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="text-6xl font-black text-emerald-400 tracking-tight">
              {logisticsSlaPct}%
            </div>
            <p className="text-xs font-semibold text-emerald-400/90 mt-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Tempo médio de expedição: 4h 12m
            </p>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: `${logisticsSlaPct}%` }} />
          </div>
        </div>
      </div>

      {/* ── FEED INFERIOR DE TROCAS & REQUISIÇÕES AO VIVO ── */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
            <h2 className="text-xs font-black tracking-wider uppercase text-slate-200">
              FEED DE TROCAS & PEDIDOS DE EQUIPAMENTOS EM ANDAMENTO (MESA NOC STREAM)
            </h2>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            {DEFAULT_EXCHANGES.length} Registros Ativos
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {DEFAULT_EXCHANGES.map((exc) => {
            const statusConfig = {
              pending: { label: 'PENDENTE', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
              preparing: { label: 'PREPARANDO', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
              in_transit: { label: 'A CAMINHO', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
              completed: { label: 'ENTREGUE', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' }
            }[exc.status];

            return (
              <div
                key={exc.id}
                className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col justify-between hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-mono font-black text-amber-400">
                      {exc.protocol}
                    </span>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-100 truncate" title={exc.newEquipment}>
                    {exc.newEquipment}
                  </h3>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    Substitui: {exc.oldEquipment}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[9px] text-slate-500 border-t border-slate-900 pt-2 mt-2 font-medium">
                  <span className="truncate max-w-[120px] text-slate-400">{exc.requester} ({exc.department.split(' ')[0]})</span>
                  <span>{new Date(exc.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
