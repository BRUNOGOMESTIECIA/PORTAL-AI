import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Clock, User, Tag, MessageSquare, Lock, Send, Sparkles, Star, ChevronDown, Lightbulb, Eye, CheckSquare, History } from 'lucide-react';

import { cn } from '../../../lib/utils';

function DiscreteExpandableWidget({
  title,
  subtitle,
  badge,
  icon: Icon,
  children
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  icon?: any;
  children: React.ReactNode;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  const isOpen = isHovered || isPinned;

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "rounded-2xl border transition-all duration-300 ease-out overflow-hidden shadow-sm",
        isOpen
          ? "border-purple-500/50 dark:border-purple-500/40 shadow-xl ring-1 ring-purple-500/20 bg-slate-900 text-white transform scale-[1.006]"
          : "border-slate-800 bg-slate-900/90 text-slate-200 opacity-95 hover:opacity-100"
      )}
    >
      <div 
        onClick={() => setIsPinned(!isPinned)}
        className="px-5 py-3.5 flex items-center justify-between cursor-pointer select-none border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-4 h-4 text-purple-400 shrink-0" />}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold tracking-wide uppercase text-slate-100">{title}</span>
              {badge && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && !isOpen && (
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <span className="text-[10px] font-medium hidden sm:inline text-slate-400">
            {isOpen ? (isPinned ? 'Fixado' : 'Passe o mouse ou clique para fixar') : 'Passe o mouse para expandir'}
          </span>
          {isOpen ? <ChevronDown className="w-4 h-4 rotate-180 transition-transform" /> : <ChevronDown className="w-4 h-4 animate-bounce text-purple-400" />}
        </div>
      </div>

      <div className={cn(
        "transition-all duration-300 ease-in-out",
        isOpen ? "max-h-[2000px] opacity-100 p-2" : "max-h-0 opacity-0 p-0 overflow-hidden"
      )}>
        {children}
      </div>
    </div>
  );
}

import { TicketStatus, TicketPriority, MOCK_CATALOG_ITEMS } from '../../../mocks/data';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { useAuth } from '../../../hooks/use-mock-auth';
import { useTickets } from '../../../hooks/use-tickets';
import { formatTicketProtocol } from '../../../lib/audit-logger';
import SlaCountdownBar from '../components/SlaCountdownBar';
import { TicketCcObserversWidget } from '../../../components/tickets/TicketCcObserversWidget';
import { TicketChecklistWidget } from '../../../components/tickets/TicketChecklistWidget';
import { TicketTimeTrackingWidget } from '../../../components/tickets/TicketTimeTrackingWidget';
import { TicketRelatedIncidentsWidget } from '../../../components/tickets/TicketRelatedIncidentsWidget';
import { TicketAuditLogTrailWidget } from '../../../components/tickets/TicketAuditLogTrailWidget';
import { TicketInternalNotesWithAiWidget } from '../../../components/tickets/TicketInternalNotesWithAiWidget';
import { AiPastTicketSolutionSuggesterWidget } from '../../../components/tickets/AiPastTicketSolutionSuggesterWidget';
import { AiImageErrorOcrWidget } from '../../../components/chat/AiImageErrorOcrWidget';
import { useOperationalShortcuts } from '../../../hooks/use-operational-shortcuts';

const STATUS_CONFIG: Record<TicketStatus, { label: string; color: string }> = {
  new: { label: 'Novo', color: 'bg-indigo-100 text-indigo-700' },
  open: { label: 'Aberto', color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'Em andamento', color: 'bg-amber-100 text-amber-700' },
  pending: { label: 'Pendente', color: 'bg-purple-100 text-purple-700' },
  resolved: { label: 'Resolvido', color: 'bg-green-100 text-green-700' },
  closed: { label: 'Fechado', color: 'bg-slate-100 text-slate-600' },
};

const PRIORITY_CONFIG: Record<TicketPriority, { label: string; color: string }> = {
  critical: { label: 'Crítico', color: 'text-red-600 bg-red-50' },
  high: { label: 'Alto', color: 'text-orange-600 bg-orange-50' },
  medium: { label: 'Médio', color: 'text-amber-600 bg-amber-50' },
  low: { label: 'Baixo', color: 'text-slate-500 bg-slate-50' },
};

export default function TicketDetailPage() {
  const { id } = useParams();
  const { hasPermission } = useAuth();
  const { tickets, updateTicket } = useTickets();
  const [commentText, setCommentText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [statusChangeRequest, setStatusChangeRequest] = useState<{ newStatus: TicketStatus } | null>(null);
  const [statusReason, setStatusReason] = useState('');
  
  const ticket = tickets.find((t: any) => {
    if (!id) return false;
    const cleanId = String(id).replaceAll('#', '').toLowerCase();
    const cleanTId = String(t.id || '').replaceAll('#', '').toLowerCase();
    const cleanNum = String(t.number || '').toLowerCase();
    const formattedProtocol = formatTicketProtocol(t.number || t.id).replaceAll('#', '').toLowerCase();
    
    return (
      cleanTId === cleanId ||
      cleanNum === cleanId ||
      formattedProtocol === cleanId ||
      cleanTId.endsWith(cleanId) ||
      (cleanNum !== '' && cleanId.endsWith(cleanNum))
    );
  });

  if (!ticket) {
    return (
      <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
        <p className="text-slate-700 dark:text-slate-300 font-bold text-base">Ticket não encontrado.</p>
        <p className="text-slate-400 text-xs mt-1">O protocolo pesquisado ({id}) não foi localizado no banco de dados ativo.</p>
        <Link to="/operacional/app/tickets" className="bg-blue-600 text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-blue-700 transition-all mt-4 inline-block shadow-sm">
          Voltar para a lista de tickets
        </Link>
      </div>
    );
  }

  const displayRequester = (ticket.requesterName && ticket.requesterName !== 'Desconhecido')
    ? ticket.requesterName
    : ((ticket as any).clientName || (ticket as any).authorName || (ticket.requesterEmail ? ticket.requesterEmail.split('@')[0] : 'Solicitante'));

  // ⌨️ Atalhos Operacionais Seguros (Item 093): Alt+R (Responder), Alt+F (Fechar), Alt+A (Atribuir)
  useOperationalShortcuts({
    onReply: () => {
      const replyArea = document.querySelector('textarea, input[type="text"]') as HTMLElement;
      if (replyArea) replyArea.focus();
    },
    onCloseTicket: () => {
      setStatusChangeRequest({ newStatus: 'closed' });
    },
    onAssign: () => {
      const assigneeSelect = document.querySelector('select') as HTMLElement;
      if (assigneeSelect) assigneeSelect.focus();
    },
  });

  const st = STATUS_CONFIG[ticket.status as TicketStatus] || { label: ticket.status, color: 'bg-slate-100' };
  const pri = PRIORITY_CONFIG[ticket.priority as TicketPriority] || { label: ticket.priority, color: 'text-slate-500 bg-slate-50' };
  const slaBreached = ticket.slaResolutionMet === false;

  return (
    <div className="space-y-5 max-w-4xl">
      <Link to="/operacional/app/tickets" className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
        <ChevronLeft className="h-4 w-4" /> Todos os tickets
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400">{formatTicketProtocol(ticket.number)}</span>
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${pri.color}`}>{pri.label}</span>
            {slaBreached && <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">SLA Vencido</span>}
          </div>
          <div className="flex gap-2">
            <select 
              value={ticket.status} 
              disabled={!hasPermission('tickets.update')}
              onChange={(e) => {
                if (e.target.value !== ticket.status) {
                  setStatusChangeRequest({ newStatus: e.target.value as TicketStatus });
                }
              }}
              className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-blue-400 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {Object.entries(STATUS_CONFIG).map(([k, v]) => {
                if (['resolved', 'closed'].includes(k) && !hasPermission('tickets.close')) return null;
                return <option key={k} value={k}>{v.label}</option>;
              })}
            </select>
          </div>
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-3">{ticket.title}</h1>

        {/* SLA Live Timer Banner */}
        <div className="mb-4">
          <SlaCountdownBar
            dueIsoString={ticket.slaResolutionDue}
            createdIsoString={ticket.createdAt}
            status={ticket.status}
            compact={false}
            showProgressBar={true}
          />
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-slate-100">
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Solicitante</p>
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-slate-400" />
              <p className="text-sm font-medium text-slate-700">{displayRequester}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Responsável</p>
            <p className="text-sm font-medium text-slate-700">{ticket.assigneeName ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Categoria (Catálogo)</p>
            <div className="flex flex-col gap-1.5">
              <select 
                value={ticket.category}
                onChange={(e) => updateTicket(ticket.id, { category: e.target.value, updatedAt: new Date().toISOString() })}
                disabled={!hasPermission('tickets.update')}
                className="text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 outline-none focus:border-blue-400 hover:bg-slate-100 cursor-pointer w-full max-w-[200px]"
              >
                {Array.from(new Set(MOCK_CATALOG_ITEMS.map(i => i.category))).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                {!MOCK_CATALOG_ITEMS.some(i => i.category === ticket.category) && (
                  <option value={ticket.category}>{ticket.category}</option>
                )}
                <option value="Outros">Outros</option>
              </select>
              <div className="flex items-center gap-1 text-[10px] text-blue-600 bg-blue-50/80 px-1.5 py-0.5 rounded w-max font-medium border border-blue-100" title="A inteligência artificial leu o relato do cliente e sugeriu esta categoria automaticamente.">
                <Sparkles className="w-2.5 h-2.5" /> Sugerido por IA
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Abertura</p>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <p className="text-sm font-medium text-slate-700">
                {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true, locale: ptBR })}
              </p>
            </div>
          </div>
        </div>

        {/* SLA */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className={`rounded-lg px-3 py-2 ${ticket.slaFirstResponseMet ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}>
            <p className="text-xs font-medium text-slate-500">1ª Resposta</p>
            <p className="text-sm font-semibold mt-0.5 text-slate-700">{format(new Date(ticket.slaFirstResponseDue), 'dd/MM HH:mm')}</p>
            <p className={`text-xs mt-0.5 ${ticket.slaFirstResponseMet ? 'text-green-600' : 'text-red-600'}`}>
              {ticket.slaFirstResponseMet === null ? 'Aguardando' : ticket.slaFirstResponseMet ? 'Cumprido' : 'Vencido'}
            </p>
          </div>
          <div className={`rounded-lg px-3 py-2 ${ticket.slaResolutionMet === true ? 'bg-green-50 border border-green-100' : ticket.slaResolutionMet === false ? 'bg-red-50 border border-red-100' : 'bg-slate-50 border border-slate-100'}`}>
            <p className="text-xs font-medium text-slate-500">Resolução</p>
            <p className="text-sm font-semibold mt-0.5 text-slate-700">{format(new Date(ticket.slaResolutionDue), 'dd/MM HH:mm')}</p>
            <p className={`text-xs mt-0.5 ${ticket.slaResolutionMet === true ? 'text-green-600' : ticket.slaResolutionMet === false ? 'text-red-600' : 'text-slate-500'}`}>
              {ticket.slaResolutionMet === null ? 'Em andamento' : ticket.slaResolutionMet ? 'Cumprido' : 'Vencido'}
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="mt-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Descrição</h3>
          <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-lg p-4">{ticket.description}</p>
        </div>

        {/* Tags */}
        {ticket.tags.length > 0 && (
          <div className="flex items-center gap-2 mt-4">
            <Tag className="h-3.5 w-3.5 text-slate-400" />
            {ticket.tags.map((tag: string) => (
              <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{tag}</span>
            ))}
          </div>
        )}

        {/* Avaliação CSAT do Cliente (Se o chamado tiver sido avaliado) */}
        {ticket.rating && (
          <div className="mt-5 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-slate-800 dark:text-slate-200 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="flex text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${star <= (ticket.rating || 0) ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.4)]' : 'text-slate-300 dark:text-slate-700'}`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
                  Avaliação do Cliente ({ticket.rating} de 5 Estrelas)
                </span>
              </div>
              {ticket.ratedAt && (
                <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                  Avaliado {formatDistanceToNow(new Date(ticket.ratedAt), { addSuffix: true, locale: ptBR })}
                </span>
              )}
            </div>
            {ticket.ratingComment && (
              <p className="text-xs text-slate-700 dark:text-slate-300 italic font-medium bg-white/70 dark:bg-slate-900/60 p-3 rounded-lg border border-amber-200/60 dark:border-amber-800/40 leading-relaxed">
                "{ticket.ratingComment}"
              </p>
            )}
          </div>
        )}

        {/* Checklist de Tarefas Internas no Ticket - Item 062 */}
        <div className="mt-5">
          <DiscreteExpandableWidget
            title="Checklist de Tarefas Internas"
            subtitle="Validação e execução de subtarefas técnicas de atendimento."
            badge="ITEM 062"
            icon={CheckSquare}
          >
            <TicketChecklistWidget
              ticketId={String(ticket.id)}
              protocolNumber={formatTicketProtocol(ticket.number || ticket.id)}
              items={(ticket as any).checklist}
              onUpdateChecklist={(newChecklist) => {
                updateTicket(ticket.id, { checklist: newChecklist } as any);
              }}
            />
          </DiscreteExpandableWidget>
        </div>


        {/* Incidentes Relacionados & Causa Raiz - Item 059 */}
        <div className="mt-5">
          <TicketRelatedIncidentsWidget
            ticketId={String(ticket.id)}
            protocolNumber={formatTicketProtocol(ticket.number || ticket.id)}
            isParent={!(ticket as any).parentTicketId}
            parentTicketId={(ticket as any).parentTicketId}
            parentProtocolNumber={(ticket as any).parentProtocolNumber}
            childTickets={(ticket as any).childTickets}
          />
        </div>

        {/* Apontamento de Horas (Time Tracking) - Item 063 */}
        <div className="mt-5">
          <TicketTimeTrackingWidget
            ticketId={String(ticket.id)}
            protocolNumber={formatTicketProtocol(ticket.number || ticket.id)}
            timeEntries={(ticket as any).timeEntries}
            onUpdateTimeEntries={(newEntries) => {
              updateTicket(ticket.id, { timeEntries: newEntries } as any);
            }}
          />
        </div>

        {/* Observadores em Cópia (CC) - Item 061 */}
        <div className="mt-5">
          <TicketCcObserversWidget
            ticketId={String(ticket.id)}
            protocolNumber={formatTicketProtocol(ticket.number || ticket.id)}
            ccEmails={(ticket as any).ccEmails || ['gestor@empresa.com.br']}
            onUpdateCcEmails={(newCcList) => {
              updateTicket(ticket.id, { ccEmails: newCcList } as any);
            }}
          />
        </div>

        {/* Sugestão Inteligente de Soluções Passadas por IA (RAG) - Item 071 */}
        <div className="mt-5">
          <DiscreteExpandableWidget
            title="Sugestão Inteligente de Soluções Passadas (IA RAG)"
            subtitle="A IA analisou chamados semelhantes resolvidos no passado para acelerar o diagnóstico."
            badge="ITEM 071"
            icon={Lightbulb}
          >
            <AiPastTicketSolutionSuggesterWidget
              ticketId={String(ticket.id)}
              protocolNumber={formatTicketProtocol(ticket.number || ticket.id)}
              ticketTitle={ticket.title}
            />
          </DiscreteExpandableWidget>
        </div>

        {/* Leitura de Prints & OCR de Código por IA - Item 073 */}
        <div className="mt-5">
          <DiscreteExpandableWidget
            title="Leitura de Prints & OCR de Código por IA"
            subtitle="Análise de Visão Computacional para identificar códigos de erro em capturas de tela."
            badge="ITEM 073"
            icon={Eye}
          >
            <AiImageErrorOcrWidget
              ticketId={String(ticket.id)}
              protocolNumber={formatTicketProtocol(ticket.number || ticket.id)}
            />
          </DiscreteExpandableWidget>
        </div>

        {/* Notas Internas Confidenciais & Copiloto IA (@ia) - Item 066 */}
        <div className="mt-5">
          <DiscreteExpandableWidget
            title="Notas Internas Confidenciais & Copiloto IA (@ia)"
            subtitle="Espaço invisível para o cliente com suporte do assistente autônomo N2."
            badge="ITEM 066"
            icon={Lock}
          >
            <TicketInternalNotesWithAiWidget
              ticketId={String(ticket.id)}
              protocolNumber={formatTicketProtocol(ticket.number || ticket.id)}
              notes={(ticket as any).internalNotes}
              onAddNote={(newNote) => {
                const prevNotes = (ticket as any).internalNotes || [];
                updateTicket(ticket.id, { internalNotes: [...prevNotes, newNote] } as any);
              }}
            />
          </DiscreteExpandableWidget>
        </div>


        {/* Trilha de Auditoria & Alterações de Campos (Audit Log do Ticket) - Item 060 */}
        <div className="mt-5">
          <DiscreteExpandableWidget
            title="Trilha de Auditoria & Alterações de Campos (Audit Log)"
            subtitle="Histórico imutável ISO 27001 de alterações e interações no chamado."
            badge="ITEM 060"
            icon={History}
          >
            <TicketAuditLogTrailWidget
              ticketId={String(ticket.id)}
              protocolNumber={formatTicketProtocol(ticket.number || ticket.id)}
              auditLogs={(ticket as any).auditLogs}
            />
          </DiscreteExpandableWidget>
        </div>

        {(ticket as any).rating && (
          <div className="mt-5 p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                <span className="text-xs font-bold text-amber-900">Avaliação CSAT do Cliente</span>
              </div>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={`w-3.5 h-3.5 ${n <= ((ticket as any).rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                  />
                ))}
                <span className="text-xs font-bold text-slate-800 ml-1">{(ticket as any).rating}.0</span>
              </div>
            </div>
            {(ticket as any).ratingComment && (
              <p className="text-xs text-slate-700 italic bg-white p-2.5 rounded-lg border border-amber-100 mt-1">
                "{(ticket as any).ratingComment}"
              </p>
            )}
          </div>
        )}
      </div>

      {/* Comments */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Comentários ({ticket.comments.length})
        </h2>

        {ticket.comments.length > 0 ? (
          <div className="space-y-3 mb-5">
            {ticket.comments.map((comment: any) => (
              <div key={comment.id} className={`rounded-xl p-4 ${comment.isInternal ? 'bg-amber-50 border border-amber-100' : 'bg-slate-50 border border-slate-100'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800">{comment.authorName}</span>
                    {comment.isInternal && (
                      <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">
                        <Lock className="h-2.5 w-2.5" /> Interno
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: ptBR })}
                  </span>
                </div>
                <p className="text-sm text-slate-700">{comment.body}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 mb-5">Nenhum comentário ainda.</p>
        )}

        {/* New comment */}
        <div className="border-t border-slate-100 pt-4">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => setIsInternal(false)}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${!isInternal ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Resposta ao cliente
            </button>
            <button
              onClick={() => setIsInternal(true)}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${isInternal ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              <Lock className="h-3 w-3" /> Nota interna
            </button>
          </div>
          <div className="relative">
            <textarea
              value={commentText} onChange={(e) => setCommentText(e.target.value)}
              placeholder={isInternal ? 'Adicionar nota interna (visível apenas para a equipe)...' : 'Escrever resposta ao cliente...'}
              rows={3}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-4 py-3 text-sm outline-none resize-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition"
            />
            <button
              onClick={() => {
                const newComment = {
                  id: `c${Date.now()}`,
                  authorName: 'Atendente Atual',
                  authorType: 'staff' as const,
                  body: commentText,
                  isInternal,
                  createdAt: new Date().toISOString()
                };
                updateTicket(ticket.id, {
                  comments: [...ticket.comments, newComment],
                  updatedAt: new Date().toISOString()
                });
                setCommentText('');
              }}
              disabled={!commentText.trim() || !hasPermission('tickets.update')}
              className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              <Send className="h-3 w-3" /> Enviar
            </button>
          </div>
        </div>
      </div>
      {/* Status Change Modal */}
      {statusChangeRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Confirmar Alteração de Status</h3>
              <p className="text-sm text-slate-600 mb-4">
                Você está alterando o status deste ticket para <strong className="text-slate-800">{STATUS_CONFIG[statusChangeRequest.newStatus].label}</strong>. 
                Por favor, informe o motivo desta alteração:
              </p>
              
              <textarea
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                placeholder="Motivo da alteração de status..."
                rows={3}
                autoFocus
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition mb-6"
              />
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setStatusChangeRequest(null);
                    setStatusReason('');
                  }}
                  className="px-4 py-2 rounded-lg font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  disabled={!statusReason.trim()}
                  onClick={() => {
                    const newComment = {
                      id: `c${Date.now()}`,
                      authorName: 'Atendente Atual',
                      authorType: 'staff' as const,
                      body: `Status alterado para ${STATUS_CONFIG[statusChangeRequest.newStatus].label}. Motivo: ${statusReason.trim()}`,
                      isInternal: true,
                      createdAt: new Date().toISOString()
                    };
                    
                    updateTicket(ticket.id, {
                      status: statusChangeRequest.newStatus,
                      comments: [...ticket.comments, newComment],
                      updatedAt: new Date().toISOString()
                    });
                    
                    toast.success('Status do ticket alterado com sucesso!');
                    setStatusChangeRequest(null);
                    setStatusReason('');
                  }}
                  className="px-4 py-2 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
                >
                  Confirmar Alteração
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
