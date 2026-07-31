import React, { useState, useEffect } from 'react';
import { Tv, X, Maximize2, Minimize2, RefreshCw, ShieldCheck, Star, Clock, AlertTriangle, Activity, CheckCircle2 } from 'lucide-react';
import { useEscapeModal } from '../../hooks/use-escape-modal';
import { toast } from 'sonner';
import { logAuditEvent, formatTicketProtocol } from '../../lib/audit-logger';

interface TvDashboardPresentationModeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MOCK_NOC_TICKETS = [
  { id: 't1', number: '20261042', title: 'Queda de Conexão na Filial São Paulo', priority: 'critical', requester: 'Carlos Silva', time: 'Há 4 min', status: 'Em andamento' },
  { id: 't2', number: '20261041', title: 'Lentidão no Banco de Dados PostgreSQL', priority: 'high', requester: 'Mariana Lima', time: 'Há 12 min', status: 'Novo' },
  { id: 't3', number: '20261040', title: 'Erro de Autenticação no Gateway SSO', priority: 'high', requester: 'Roberto Santos', time: 'Há 18 min', status: 'Em andamento' },
  { id: 't4', number: '20261039', title: 'Solicitação de Acesso VPN Corporativa', priority: 'medium', requester: 'Fernanda Rocha', time: 'Há 25 min', status: 'Pendente' },
];

export function TvDashboardPresentationModeModal({ isOpen, onClose }: TvDashboardPresentationModeModalProps) {
  useEscapeModal(isOpen, onClose);
  const [timeString, setTimeString] = useState('');
  const [refreshCountdown, setRefreshCountdown] = useState(30);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Live Clock
  useEffect(() => {
    if (!isOpen) return;

    logAuditEvent('TV_PRESENTATION_MODE_STARTED', 'Modo TV / Apresentação NOC iniciado em tela cheia.');
    toast.success('📺 Modo TV NOC iniciado! Pressione ESC para sair.');

    const updateClock = () => {
      setTimeString(new Date().toLocaleTimeString('pt-BR'));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Countdown timer for auto refresh
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          toast.info('🔄 Dados do NOC atualizados ao vivo!');
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#060a12] text-slate-100 flex flex-col justify-between p-6 overflow-hidden animate-in fade-in duration-300">
      {/* ── BARRA SUPERIOR DO MONITOR NOC ── */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-600/20 text-red-400 border border-red-500/30 rounded-2xl animate-pulse">
            <Tv className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h1 className="text-lg font-black tracking-wider uppercase text-white">
                Painel de Monitoramento NOC / Suporte AO VIVO
              </h1>
              <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                Item 095
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Modo TV em Alta Visibilidade para Monitores e Videowall da Operação
            </p>
          </div>
        </div>

        {/* Relógio em Destaque & Ações */}
        <div className="flex items-center gap-5">
          <div className="text-right hidden md:block">
            <span className="text-2xl font-black font-mono text-emerald-400 tracking-widest">
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

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-red-600/30 flex items-center gap-2 cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>Sair do Modo TV (Esc)</span>
          </button>
        </div>
      </div>

      {/* ── GRADE PRINCIPAL DE METRICAS NOC ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 my-5 flex-1 min-h-0">
        {/* KPI 1: Volumetria Ativa */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Chamados em Fila / Ativos</span>
            <Activity className="w-5 h-5 text-blue-400" />
          </div>
          <div className="my-4">
            <span className="text-6xl font-black text-white tracking-tight">42</span>
            <span className="text-xs text-blue-400 font-bold block mt-1">
              ⚡ 12 atribuídos a Suporte N1
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full w-[65%]" />
          </div>
        </div>

        {/* KPI 2: Cumprimento de SLA */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Cumprimento de SLA</span>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="my-4">
            <span className="text-6xl font-black text-emerald-400 tracking-tight">98.4%</span>
            <span className="text-xs text-emerald-300 font-bold block mt-1">
              🟢 Meta de 95.0% Superada
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-[98%]" />
          </div>
        </div>

        {/* KPI 3: Satisfação CSAT */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Média de CSAT</span>
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
          </div>
          <div className="my-4">
            <span className="text-6xl font-black text-amber-300 tracking-tight">4.93</span>
            <div className="flex items-center gap-1 mt-1 text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
          </div>
          <span className="text-xs text-amber-400 font-semibold">98.4% de avaliações 5 estrelas</span>
        </div>

        {/* KPI 4: Tempo Médio de Resolução */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Tempo Médio (TMA)</span>
            <Clock className="w-5 h-5 text-purple-400" />
          </div>
          <div className="my-4">
            <span className="text-6xl font-black text-purple-300 tracking-tight">14m</span>
            <span className="text-xs text-purple-400 font-bold block mt-1">
              ⚡ Atendimento Ultra-rápido N1
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full w-[80%]" />
          </div>
        </div>
      </div>

      {/* ── PAINEL DE INCIDENTES AO VIVO NOC ── */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 animate-bounce" />
            Feed de Chamados Críticos & Incidentes ao Vivo (TV NOC Stream)
          </h3>
          <span className="text-xs text-slate-400 font-mono">4 Incidentes em Foco</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {MOCK_NOC_TICKETS.map((t) => (
            <div
              key={t.id}
              className={`p-3.5 rounded-2xl border transition-all space-y-2 ${
                t.priority === 'critical'
                  ? 'bg-rose-950/40 border-rose-600/60 shadow-lg shadow-rose-950/50'
                  : 'bg-slate-950 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-blue-400">
                  {formatTicketProtocol(t.number)}
                </span>
                <span
                  className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                    t.priority === 'critical'
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {t.priority}
                </span>
              </div>
              <p className="text-xs font-extrabold text-white line-clamp-1">{t.title}</p>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                <span>{t.requester}</span>
                <span className="font-semibold">{t.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
