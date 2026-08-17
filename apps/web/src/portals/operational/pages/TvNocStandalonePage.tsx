import React, { useState, useEffect, useMemo } from 'react';
import { Tv, Maximize2, Minimize2, ShieldCheck, Star, AlertTriangle, Activity, MessageCircle, Copy, Check, Package, Trophy, User } from 'lucide-react';
import { toast } from 'sonner';
import { logAuditEvent, formatTicketProtocol } from '../../../lib/audit-logger';
import { useTickets } from '../../../hooks/use-tickets';
import { useChats } from '../../../hooks/use-chats';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MOCK_TICKETS, MOCK_CHATS } from '../../../mocks/data';
import { auth } from '../../../lib/firebase';
import { signInAnonymously } from 'firebase/auth';

interface TopAgent {
  id: string;
  rank: number;
  name: string;
  avatarUrl: string;
  csat: number;
  resolvedTickets: number;
}

export default function TvNocStandalonePage() {
  const { tickets } = useTickets();
  const { chats } = useChats();

  const [timeString, setTimeString] = useState('');
  const [refreshCountdown, setRefreshCountdown] = useState(30);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Autenticação transparente para o Monitor NOC Smart TV
  useEffect(() => {
    if (auth && !auth.currentUser) {
      signInAnonymously(auth).catch(() => {});
    }
  }, []);

  // Live Clock
  useEffect(() => {
    logAuditEvent('TV_PRESENTATION_MODE_STARTED', 'Modo TV / Apresentação NOC acessado via link direto TV.');
    
    const updateClock = () => {
      setTimeString(new Date().toLocaleTimeString('pt-BR'));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);

    return () => clearInterval(interval);
  }, []);

  // Countdown timer para atualização automática
  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          return 30;
        }
        return prev - 1;
      });
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
    toast.success('Link do Painel TV NOC copiado!');
    setTimeout(() => setCopied(false), 3000);
  };

  // ─── CÁLCULOS REAIS EM TEMPO REAL ───
  const isTicketOverdue = (t: any) => {
    if (t.slaResolutionMet === false) return true;
    if (['resolved', 'closed'].includes(t.status)) return false;
    if (t.slaResolutionDue && new Date(t.slaResolutionDue).getTime() < Date.now()) return true;
    return false;
  };

  const openTickets = tickets.filter((t) => !['closed', 'resolved'].includes(t.status));
  const openTicketsCount = openTickets.length;
  const n1TicketsCount = openTickets.filter((t) => !t.team || t.team === 'N1' || t.team === 'Suporte N1').length;

  const slaResMetCount = tickets.filter((t) => !isTicketOverdue(t)).length;
  const realSlaPct = tickets.length > 0 ? Math.round((slaResMetCount / tickets.length) * 100) : 100;

  // CSAT real e cálculo do Top 5 Atendentes
  const ratedTickets = tickets.filter((t: any) => t.csatRating && t.csatRating > 0);
  const csatScore = ratedTickets.length > 0
    ? (ratedTickets.reduce((acc: number, t: any) => acc + (t.csatRating || 5), 0) / ratedTickets.length).toFixed(2)
    : '5.00';

  // Ranking 100% REAL dos atendentes calculado diretamente dos chamados do Firestore
  const topAgents = useMemo(() => {
    const agentMap: Record<string, { name: string; avatarUrl: string; ratings: number[]; resolvedCount: number; totalCount: number }> = {};

    tickets.forEach((t: any) => {
      const name = t.assignedToName || t.operatorName || (typeof t.assignedTo === 'string' && t.assignedTo.trim().length > 1 ? t.assignedTo : null);
      if (name) {
        if (!agentMap[name]) {
          agentMap[name] = { 
            name, 
            avatarUrl: t.assignedToPhoto || t.operatorPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0284c7&color=ffffff&bold=true`,
            ratings: [], 
            resolvedCount: 0,
            totalCount: 0 
          };
        }
        agentMap[name].totalCount += 1;
        if (['resolved', 'closed'].includes(t.status)) {
          agentMap[name].resolvedCount += 1;
        }
        if (t.csatRating && t.csatRating > 0) {
          agentMap[name].ratings.push(t.csatRating);
        }
      }
    });

    const realRanked = Object.values(agentMap)
      .map((op, idx) => {
        const avg = op.ratings.length > 0
          ? op.ratings.reduce((a, b) => a + b, 0) / op.ratings.length
          : 5.0;
        return {
          id: `real-op-${idx}`,
          rank: 0,
          name: op.name,
          avatarUrl: op.avatarUrl,
          csat: avg,
          resolvedTickets: op.resolvedCount || op.totalCount,
        };
      })
      .sort((a, b) => b.csat - a.csat || b.resolvedTickets - a.resolvedTickets);

    return realRanked.slice(0, 5).map((ag, i) => ({ ...ag, rank: i + 1 }));
  }, [tickets]);

  // Fila de Chat
  const waitingChatsCount = (chats as any[]).filter((c: any) => c.status === 'waiting').length;
  const activeChatsCount = (chats as any[]).filter((c: any) => c.status === 'active' || c.status === 'in_progress').length;

  // Stream de Incidentes & Chamados Críticos
  const nocStreamTickets = [...tickets]
    .sort((a, b) => {
      const aOverdue = isTicketOverdue(a) ? 1 : 0;
      const bOverdue = isTicketOverdue(b) ? 1 : 0;
      if (aOverdue !== bOverdue) return bOverdue - aOverdue;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, 4);

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#060a12] text-slate-100 flex flex-col justify-between p-6 overflow-hidden select-none">
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
                PAINEL DE MONITORAMENTO NOC / SUPORTE AO VIVO
              </h1>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                SMART TV DASHBOARD
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Modo TV em Alta Visibilidade para Monitores e Videowall da Operação
            </p>
          </div>
        </div>

        {/* Relógio em Destaque & Ações */}
        <div className="flex items-center gap-3">
          <a
            href="/tv-suprimentos"
            className="flex items-center gap-2 px-3 py-1.5 bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-800/60 text-xs font-bold rounded-xl transition-all"
            title="Ir para o Dashboard de Suprimentos e Equipamentos"
          >
            <Package className="w-3.5 h-3.5 text-amber-400" />
            <span>Ver Suprimentos & Trocas</span>
          </a>

          <button
            type="button"
            onClick={copyTvLink}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all border border-slate-700 cursor-pointer"
            title="Copiar Link Direto para Smart TV"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-blue-400" />}
            <span>{copied ? 'Link Copiado!' : 'Copiar Link Smart TV'}</span>
          </button>

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
            title="Alternar Tela Cheia (F11)"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── GRADE PRINCIPAL DE METRICAS NOC ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 my-5 flex-1 min-h-0">
        {/* KPI 1: Volumetria Ativa Real */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Chamados em Fila / Ativos</span>
            <Activity className="w-5 h-5 text-blue-400" />
          </div>
          <div className="my-4">
            <span className="text-6xl font-black text-white tracking-tight">{openTicketsCount}</span>
            <span className="text-xs text-blue-400 font-bold block mt-1">
              ⚡ {n1TicketsCount} atribuídos a Suporte N1
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${Math.min(100, Math.max(10, openTicketsCount * 15))}%` }} />
          </div>
        </div>

        {/* KPI 2: Cumprimento de SLA Real */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Cumprimento de SLA</span>
            <ShieldCheck className={`w-5 h-5 ${realSlaPct >= 90 ? 'text-emerald-400' : 'text-amber-400'}`} />
          </div>
          <div className="my-4">
            <span className={`text-6xl font-black tracking-tight ${realSlaPct >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {realSlaPct}%
            </span>
            <span className={`text-xs font-bold block mt-1 ${realSlaPct >= 90 ? 'text-emerald-300' : 'text-amber-300'}`}>
              {realSlaPct >= 90 ? '🟢 Meta de 90% Alcançada' : '🔴 Atenção ao Cumprimento de SLA'}
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-500 ${realSlaPct >= 90 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${realSlaPct}%` }} />
          </div>
        </div>

        {/* KPI 3: TOP 5 ATENDENTES & AVALIAÇÕES (CSAT) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 shadow-2xl flex flex-col justify-between backdrop-blur-md relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            <span className="flex items-center gap-1.5 text-amber-300">
              <Trophy className="w-4 h-4 text-amber-400" />
              TOP 5 ATENDENTES
            </span>
            <span className="text-[10px] font-black font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
              {csatScore} ⭐
            </span>
          </div>

          {/* Lista 100% REAL dos Atendentes extraídos dos chamados do banco (Firestore) */}
          {topAgents.length === 0 ? (
            <div className="my-auto py-4 text-center space-y-1.5">
              <User className="w-7 h-7 text-slate-600 mx-auto" />
              <p className="text-[11px] font-bold text-slate-300">SEM ATENDENTES ATRIBUÍDOS AINDA</p>
              <p className="text-[9px] text-slate-500 max-w-[200px] mx-auto leading-relaxed">
                Os atendentes aparecerão aqui no Top 5 conforme forem vinculados aos chamados no Firestore.
              </p>
            </div>
          ) : (
            <div className="space-y-1 my-1">
              {topAgents.map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center justify-between bg-slate-950/70 border border-slate-800/80 rounded-xl px-2 py-1 hover:border-amber-500/30 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Rank Badge (#1 Dourado) */}
                    <span className={`text-[9px] font-black font-mono px-1.5 py-0.5 rounded ${
                      agent.rank === 1
                        ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      #{agent.rank}
                    </span>

                    {/* Foto do Atendente */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={agent.avatarUrl}
                        alt={agent.name}
                        className="w-6 h-6 rounded-full object-cover border border-slate-700 shadow-sm"
                      />
                      <span className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full bg-emerald-400 border border-slate-950" />
                    </div>

                    {/* Nome do Atendente */}
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold text-slate-100 block truncate" title={agent.name}>
                        {agent.name}
                      </span>
                    </div>
                  </div>

                  {/* Avaliação CSAT & Chamados */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-[9px] text-slate-400 font-medium">
                      {agent.resolvedTickets} res.
                    </span>
                    <div className="flex items-center gap-0.5 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-md">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-[10px] font-black font-mono text-amber-300">
                        {agent.csat.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-[9px] text-amber-400/90 font-medium border-t border-slate-800/80 pt-1 mt-0.5">
            <span>Média da Equipe: {csatScore} / 5.0</span>
            <span>{ratedTickets.length > 0 ? `${ratedTickets.length} avaliações` : `${topAgents.length} Atendentes Reais`}</span>
          </div>
        </div>

        {/* KPI 4: Fila de Chat ao Vivo */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Fila de Chat ao Vivo</span>
            <MessageCircle className="w-5 h-5 text-purple-400" />
          </div>
          <div className="my-4">
            <span className="text-6xl font-black text-purple-300 tracking-tight">{waitingChatsCount + activeChatsCount}</span>
            <span className="text-xs text-purple-400 font-bold block mt-1">
              💬 {waitingChatsCount} aguardando • {activeChatsCount} em atendimento
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full w-[75%]" />
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
          <span className="text-xs text-slate-400 font-mono">{nocStreamTickets.length} Chamados Principais</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {nocStreamTickets.length === 0 ? (
            <div className="col-span-4 p-4 text-center text-xs text-slate-400">
              Nenhum chamado pendente no momento. Operação 100% normal! 🎉
            </div>
          ) : (
            nocStreamTickets.map((t) => {
              const isOverdue = isTicketOverdue(t);
              const formattedNum = formatTicketProtocol(t.number || t.id);
              let timeAgo = 'Recente';
              try {
                timeAgo = formatDistanceToNow(new Date(t.createdAt), { addSuffix: true, locale: ptBR });
              } catch (e) {}

              return (
                <div
                  key={t.id}
                  className={`p-3.5 rounded-2xl border transition-all space-y-2 ${
                    isOverdue || t.priority === 'critical'
                      ? 'bg-rose-950/40 border-rose-600/60 shadow-lg shadow-rose-950/50'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-blue-400">
                      {formattedNum}
                    </span>
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        isOverdue || t.priority === 'critical'
                          ? 'bg-rose-500 text-white animate-pulse'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {isOverdue ? 'ESTOURADO' : t.priority || 'NORMAL'}
                    </span>
                  </div>
                  <p className="text-xs font-extrabold text-white line-clamp-1">{t.title}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                    <span className="truncate max-w-[120px]">{(t as any).requesterName || (t as any).requester || t.requesterId || 'Solicitante'}</span>
                    <span className="font-semibold">{timeAgo}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
