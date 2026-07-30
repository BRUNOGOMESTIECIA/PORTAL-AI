import React from 'react';
import { Clock, Users, ShieldAlert, Sparkles, MessageCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface QueuePositionWidgetProps {
  queueName?: string;
  position?: number;
  estimatedMinutes?: number;
  activeAgentsCount?: number;
  ticketProtocol?: string;
  onCancelQueue?: () => void;
}

export function QueuePositionWidget({
  queueName = 'Atendimento N1 Operacional',
  position = 2,
  estimatedMinutes = 3,
  activeAgentsCount = 4,
  ticketProtocol = '#20261048',
  onCancelQueue
}: QueuePositionWidgetProps) {
  return (
    <div className="bg-gradient-to-br from-blue-900/90 via-slate-900 to-indigo-950 text-white rounded-2xl p-4 border border-blue-500/30 shadow-xl space-y-3 animate-in fade-in zoom-in-95 duration-200">
      
      {/* Topo: Header com Ping Pulsante */}
      <div className="flex items-center justify-between border-b border-blue-500/20 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">
            Fila de Atendimento ao Vivo
          </span>
        </div>
        <span className="text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-md">
          {ticketProtocol}
        </span>
      </div>

      {/* Posição Visual Grande */}
      <div className="grid grid-cols-2 gap-3 items-center bg-black/30 rounded-xl p-3 border border-white/5">
        <div className="text-center border-r border-white/10 pr-2">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">Sua Posição</p>
          <div className="flex items-baseline justify-center gap-1 mt-0.5">
            <span className="text-3xl font-black text-emerald-400 tracking-tight">{position}º</span>
            <span className="text-xs font-bold text-slate-300">lugar</span>
          </div>
        </div>

        <div className="text-center pl-2">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">Tempo Estimado</p>
          <div className="flex items-baseline justify-center gap-1 mt-0.5">
            <span className="text-3xl font-black text-blue-400 tracking-tight">~{estimatedMinutes}</span>
            <span className="text-xs font-bold text-slate-300">min</span>
          </div>
        </div>
      </div>

      {/* Status da Equipe de Suporte */}
      <div className="flex items-center justify-between text-xs text-slate-300 px-1">
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-blue-400" />
          <span>Fila: <strong className="text-white">{queueName}</strong></span>
        </div>
        <span className="text-emerald-400 font-bold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
          {activeAgentsCount} Técnicos On-line
        </span>
      </div>

      {/* Barra de Progresso Animada */}
      <div className="space-y-1">
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-400 to-emerald-400 rounded-full animate-pulse transition-all duration-500"
            style={{ width: `${Math.max(15, 100 - (position * 25))}%` }}
          />
        </div>
        <p className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1 pt-0.5">
          <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
          Conectando ao próximo operador N1 disponível...
        </p>
      </div>

      {/* Sugestão da Base de Conhecimento enquanto espera */}
      <div className="bg-blue-950/60 rounded-xl p-2.5 border border-blue-500/20 text-xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span className="text-blue-200 text-[11px]">Enquanto aguarda, pesquise na Base de Conhecimento!</span>
        </div>
        <Link 
          to="/app/kb" 
          className="text-[10px] font-bold bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all flex-shrink-0"
        >
          Ir para KB <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

    </div>
  );
}
