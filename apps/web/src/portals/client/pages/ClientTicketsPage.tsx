import React, { useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Plus, ChevronLeft, ChevronRight, Clock, MessageSquare,
  GitBranch, CheckCircle2, XCircle, AlertCircle, Send,
  UserCheck, Inbox, X, Star, GitMerge, ChevronDown, Paperclip, Search
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { NewTicketModal } from '../components/NewTicketModal';
import { z } from 'zod';
import { useAuth } from '../../../hooks/use-mock-auth';
import { useEscapeModal } from '../../../hooks/use-escape-modal';
import { MockClient, MockTicket, TicketStatus, TicketPriority } from '../../../mocks/data';
import { useTickets } from '../../../hooks/use-tickets';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<TicketStatus, { label: string; dot: string; text: string; bg: string }> = {
  new:         { label: 'Novo',         dot: 'bg-indigo-500', text: 'text-indigo-700', bg: 'bg-indigo-50' },
  open:        { label: 'Aberto',       dot: 'bg-blue-500',   text: 'text-blue-700',   bg: 'bg-blue-50' },
  in_progress: { label: 'Em andamento', dot: 'bg-amber-500',  text: 'text-amber-700',  bg: 'bg-amber-50' },
  pending:     { label: 'Pendente',     dot: 'bg-purple-500', text: 'text-purple-700', bg: 'bg-purple-50' },
  resolved:    { label: 'Resolvido',    dot: 'bg-green-500',  text: 'text-green-700',  bg: 'bg-green-50' },
  closed:      { label: 'Fechado',      dot: 'bg-slate-400',  text: 'text-slate-600 dark:text-slate-400 dark:text-slate-500',  bg: 'bg-slate-100 dark:bg-slate-800' },
};

const PRIORITY_CFG: Record<TicketPriority, { label: string; color: string; border: string; badge: string }> = {
  critical: { label: 'Crítico', color: 'text-red-600',    border: 'border-l-red-400',    badge: 'bg-red-50 text-red-700 ring-1 ring-red-200' },
  high:     { label: 'Alto',    color: 'text-orange-600', border: 'border-l-orange-400', badge: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200' },
  medium:   { label: 'Médio',   color: 'text-amber-600',  border: 'border-l-amber-300',  badge: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
  low:      { label: 'Baixo',   color: 'text-slate-500 dark:text-slate-400 dark:text-slate-500',  border: 'border-l-slate-300',  badge: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 dark:text-slate-500 ring-1 ring-slate-200' },
};

type FilterStatus = TicketStatus | 'all' | 'active' | 'done';

const FILTER_OPTIONS: { key: FilterStatus; label: string }[] = [
  { key: 'all',      label: 'Todos' },
  { key: 'active',   label: 'Ativos' },
  { key: 'pending',  label: 'Pendentes' },
  { key: 'resolved', label: 'Resolvidos' },
  { key: 'closed',   label: 'Fechados' },
];

const TICKET_TYPES       = ['Incidente', 'Solicitação', 'Dúvida'];
const TICKET_CATEGORIES  = [
  'Hardware', 'Software', 'Acesso e Permissões', 'Rede e Conectividade',
  'Impressoras e Periféricos', 'E-mail e Comunicação', 'Sistema Operacional', 'Outros',
];

const TICKET_SUBCATEGORIES: Record<string, string[]> = {
  'Hardware': ['Computador/Notebook', 'Monitor', 'Teclado/Mouse', 'Telefone', 'Outro'],
  'Software': ['ERP', 'CRM', 'Pacote Office', 'Software Específico', 'Outro'],
  'Acesso e Permissões': ['Criação de Usuário', 'Desbloqueio de Senha', 'Alteração de Permissão', 'Outro'],
  'Rede e Conectividade': ['Internet Lenta', 'Sem Conexão', 'Acesso Remoto/VPN', 'Outro'],
  'Impressoras e Periféricos': ['Não Imprime', 'Atolamento de Papel', 'Falta de Toner', 'Scanner', 'Outro'],
  'E-mail e Comunicação': ['Não Recebe/Envia', 'Configuração no Celular', 'Spam', 'Outro'],
  'Sistema Operacional': ['Lentidão', 'Tela Azul', 'Atualização', 'Outro'],
  'Outros': ['Dúvida Geral', 'Solicitação Diversa', 'Outro']
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface TreeNode     { ticket: MockTicket; children: TreeNode[] }
interface FilteredNode { ticket: MockTicket; children: FilteredNode[]; dimmed: boolean }

function buildTree(tickets: MockTicket[]): TreeNode[] {
  const byId       = new Map(tickets.map((t) => [t.id, t]));
  const childrenOf = new Map<string, MockTicket[]>();
  const roots: MockTicket[] = [];
  for (const t of tickets) {
    const pid = t.parentTicketId;
    if (pid && byId.has(pid)) {
      if (!childrenOf.has(pid)) childrenOf.set(pid, []);
      childrenOf.get(pid)!.push(t);
    } else {
      roots.push(t);
    }
  }
  function makeNode(t: MockTicket): TreeNode {
    return { ticket: t, children: (childrenOf.get(t.id) ?? []).map(makeNode) };
  }
  return roots.map(makeNode);
}

function nodeMatchesFilter(ticket: MockTicket, filter: FilterStatus): boolean {
  if (filter === 'all')    return true;
  if (filter === 'active') return ['new', 'open', 'in_progress', 'pending'].includes(ticket.status);
  if (filter === 'done')   return ['resolved', 'closed'].includes(ticket.status);
  return ticket.status === filter;
}

function applyFilter(nodes: TreeNode[], filter: FilterStatus): FilteredNode[] {
  return nodes.flatMap((node) => {
    const filteredChildren = applyFilter(node.children, filter);
    const selfMatches      = nodeMatchesFilter(node.ticket, filter);
    if (!selfMatches && filteredChildren.length === 0) return [];
    return [{ ticket: node.ticket, children: filteredChildren, dimmed: !selfMatches }];
  });
}

function getAncestors(ticketId: string, all: MockTicket[]): MockTicket[] {
  const byId   = new Map(all.map((t) => [t.id, t]));
  const ticket = byId.get(ticketId);
  if (!ticket?.parentTicketId) return [];
  const parent = byId.get(ticket.parentTicketId);
  if (!parent) return [];
  return [...getAncestors(parent.id, all), parent];
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

interface TimelineEvent {
  id: string;
  type: 'opened' | 'assigned' | 'comment' | 'resolved' | 'closed';
  actor: string;
  actorType: 'user' | 'staff' | 'system';
  content?: string;
  timestamp: string;
}

function buildTimeline(ticket: MockTicket): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  events.push({ id: 'ev-opened', type: 'opened', actor: ticket.requesterName, actorType: 'user', timestamp: ticket.createdAt });
  if (ticket.assigneeName && ticket.updatedAt !== ticket.createdAt) {
    events.push({ id: 'ev-assigned', type: 'assigned', actor: 'Sistema', actorType: 'system', content: ticket.assigneeName, timestamp: ticket.updatedAt });
  }
  for (const c of ticket.comments.filter((c) => !c.isInternal)) {
    events.push({ id: c.id, type: 'comment', actor: c.authorName, actorType: c.authorType, content: c.body, timestamp: c.createdAt });
  }
  if ((ticket.status === 'resolved' || ticket.status === 'closed') && ticket.closedAt) {
    events.push({ id: 'ev-done', type: ticket.status as 'resolved' | 'closed', actor: ticket.assigneeName ?? 'Equipe', actorType: 'staff', timestamp: ticket.closedAt });
  }
  return events
    .filter((e) => !(e.type === 'assigned' && e.timestamp === ticket.createdAt))
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

// ─── Modal: Fechar chamado ────────────────────────────────────────────────────

function CloseTicketModal({ ticket, onClose, onConfirm }: { ticket: MockTicket; onClose: () => void; onConfirm: (reason: string) => void }) {
  useEscapeModal(true, onClose);
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-700/50">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">Fechar chamado</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">#{ticket.number} — {ticket.title}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 transition-all duration-200 hover:-translate-y-[1.5px] active:translate-y-[0.5px] hover:shadow-md">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400 dark:text-slate-500">
            Tem certeza que deseja fechar este chamado? Esta ação não pode ser desfeita diretamente.
          </p>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-1.5">
              Motivo <span className="text-slate-400 dark:text-slate-500 font-normal">(opcional)</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Problema resolvido por conta própria, não é mais necessário..."
              rows={3}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-4 py-3 text-sm placeholder:text-slate-400 dark:text-slate-500 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:bg-slate-800 rounded-xl transition-all duration-200 hover:-translate-y-[1.5px] active:translate-y-[0.5px] hover:shadow-md">
              Cancelar
            </button>
            <button
              onClick={() => onConfirm(reason)}
              className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Fechar chamado
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Modal: Avaliar atendimento ───────────────────────────────────────────────

function RatingModal({ ticket, onClose, onConfirm }: { ticket: MockTicket; onClose: () => void; onConfirm: (score: number, comment: string) => void }) {
  useEscapeModal(true, onClose);
  const [score, setScore]     = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');

  const labels = ['', 'Muito ruim', 'Ruim', 'Regular', 'Bom', 'Excelente'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-700/50">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">Avaliar atendimento</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">#{ticket.number} — {ticket.title}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 transition-all duration-200 hover:-translate-y-[1.5px] active:translate-y-[0.5px] hover:shadow-md">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 text-center">Como você avalia o atendimento?</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setScore(n)}
                  onMouseEnter={() => setHovered(n)}
                  onMouseLeave={() => setHovered(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-9 w-9 transition-colors ${
                      n <= (hovered || score)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            {(hovered || score) > 0 && (
              <p className="text-center text-xs font-medium text-amber-600 mt-2">
                {labels[hovered || score]}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-1.5">
              Comentário <span className="text-slate-400 dark:text-slate-500 font-normal">(opcional)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Conte como foi sua experiência..."
              rows={3}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-4 py-3 text-sm placeholder:text-slate-400 dark:text-slate-500 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition resize-none"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:bg-slate-800 rounded-xl transition-all duration-200 hover:-translate-y-[1.5px] active:translate-y-[0.5px] hover:shadow-md">
              Agora não
            </button>
            <button
              onClick={() => onConfirm(score, comment)}
              disabled={score === 0}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Enviar avaliação
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Modal: Abrir sub-chamado ─────────────────────────────────────────────────

function ChildTicketModal({ parent, onClose, onConfirm }: { parent: MockTicket; onClose: () => void; onConfirm: () => void }) {
  useEscapeModal(true, onClose);
  const [title, setTitle]             = useState('');
  const [type, setType]               = useState(TICKET_TYPES[0]);
  const [category, setCategory]       = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [description, setDescription]   = useState('');
  const [submitted, setSubmitted]     = useState(false);
  const canSubmit = title.trim().length > 0 && description.trim().length > 0 && category !== '';

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
    setSubcategory(''); // Reset subcategory when category changes
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-7 w-7 text-green-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-2">Sub-chamado aberto!</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-6">
            Vinculado ao chamado <span className="font-semibold">#{parent.number}</span>.
          </p>
          <button onClick={onConfirm} className="text-sm font-medium text-blue-600 hover:underline">
            Fechar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-700/50">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">Abrir sub-chamado</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
              <GitMerge className="h-3 w-3" /> Vinculado ao #{parent.number}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 transition-all duration-200 hover:-translate-y-[1.5px] active:translate-y-[0.5px] hover:shadow-md">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); if (canSubmit) setSubmitted(true); }} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Título <span className="text-red-500">*</span></label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Descreva o problema em poucas palavras"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 hover:border-slate-300 dark:hover:border-slate-600 transition-all placeholder-slate-400 shadow-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Tipo</label>
              <div className="relative group">
                <select value={type} onChange={(e) => setType(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 hover:border-slate-300 dark:hover:border-slate-600 transition-all pr-10 text-slate-700 dark:text-slate-300 shadow-sm font-medium cursor-pointer">
                  {TICKET_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 group-hover:text-blue-500 transition-colors pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Categoria <span className="text-red-500">*</span></label>
              <div className="relative group">
                <select value={category} onChange={handleCategoryChange}
                  className={`w-full appearance-none rounded-xl border px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 hover:border-slate-300 dark:hover:border-slate-600 transition-all pr-10 shadow-sm cursor-pointer font-medium
                    ${!category ? 'border-amber-200 bg-amber-50/30 text-amber-600' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                  <option value="" disabled className="text-slate-400 dark:text-slate-500">Selecione...</option>
                  {TICKET_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown className={`absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors pointer-events-none ${!category ? 'text-amber-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-blue-500'}`} />
              </div>
            </div>
          </div>

          {category && TICKET_SUBCATEGORIES[category] && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Subcategoria</label>
              <div className="relative group">
                <select value={subcategory} onChange={(e) => setSubcategory(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 hover:border-slate-300 dark:hover:border-slate-600 transition-all pr-10 text-slate-700 dark:text-slate-300 shadow-sm font-medium cursor-pointer">
                  <option value="" className="text-slate-400 dark:text-slate-500">Selecione uma opção (opcional)</option>
                  {TICKET_SUBCATEGORIES[category].map((sc) => <option key={sc} value={sc}>{sc}</option>)}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 group-hover:text-blue-500 transition-colors pointer-events-none" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Descrição <span className="text-red-500">*</span></label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva com detalhes..."
              rows={4}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm outline-none resize-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 hover:border-slate-300 dark:hover:border-slate-600 transition-all placeholder-slate-400 shadow-sm"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:bg-slate-800 rounded-xl transition-all duration-200 hover:-translate-y-[1.5px] active:translate-y-[0.5px] hover:shadow-md">Cancelar</button>
            <button type="submit" disabled={!canSubmit} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white text-sm font-semibold rounded-xl shadow-md disabled:shadow-none transition-all duration-200 hover:-translate-y-[1.5px] active:translate-y-[0.5px] hover:shadow-md">
              <Send className="h-4 w-4" /> Abrir sub-chamado
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function StatCard({ value, label, color, active, onClick }: { value: number; label: string; color: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border shadow-sm px-5 py-4 flex items-center gap-3 ${active ? 'border-blue-400 bg-blue-50 ring-2 ring-blue-100' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:bg-slate-900/50' } transition-all duration-200 hover:-translate-y-[1.5px] active:translate-y-[0.5px] hover:shadow-md`}
    >
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
      <span className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 leading-tight">{label}</span>
    </button>
  );
}

function SlaRow({ label, due, met }: { label: string; due: string; met: boolean | null }) {
  if (met === true)
    return (
      <div className="flex items-center justify-between py-2">
        <span className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">{label}</span>
        <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
          <CheckCircle2 className="h-3.5 w-3.5" /> Cumprido
        </span>
      </div>
    );
  if (met === false)
    return (
      <div className="flex items-center justify-between py-2">
        <span className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">{label}</span>
        <span className="flex items-center gap-1 text-xs font-medium text-red-600">
          <XCircle className="h-3.5 w-3.5" /> Vencido
        </span>
      </div>
    );
  const dueDate = new Date(due);
  const overdue = isPast(dueDate);
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">{label}</span>
      <span className={`flex items-center gap-1 text-xs font-medium ${overdue ? 'text-red-600' : 'text-amber-600'}`}>
        {overdue ? <XCircle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
        {format(dueDate, "d MMM, HH:mm", { locale: ptBR })}
      </span>
    </div>
  );
}

// ─── List-view card ───────────────────────────────────────────────────────────

type CardAction =
  | { type: 'close';       ticket: MockTicket }
  | { type: 'rate';        ticket: MockTicket }
  | { type: 'child';       ticket: MockTicket };

function TicketCard({
  ticket, depth = 0, dimmed = false,
  onAction,
}: {
  ticket: MockTicket; depth?: number; dimmed?: boolean;
  onAction: (a: CardAction) => void;
}) {
  const navigate        = useNavigate();
  const s               = STATUS_CFG[ticket.status];
  const p               = PRIORITY_CFG[ticket.priority];
  const publicComments  = ticket.comments.filter((c) => !c.isInternal).length;
  const isActive        = ['new', 'open', 'in_progress', 'pending'].includes(ticket.status);
  const isDone          = ticket.status === 'resolved' || ticket.status === 'closed';

  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 border-l-4 ${p.border} shadow-sm transition-all
                  ${depth > 0 ? 'py-3 px-4' : 'py-4 px-5'}
                  ${dimmed ? 'opacity-50' : ''}`}
    >
      {/* Clickable area → detail */}
      <button
        onClick={() => navigate(`/portal/tickets/${ticket.id}`)}
        className="w-full text-left group"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1.5 text-xs text-slate-400 dark:text-slate-500 flex-wrap">
              <span className="font-mono font-semibold text-slate-500 dark:text-slate-400 dark:text-slate-500">#{ticket.number}</span>
              <span className="text-slate-300">·</span>
              <span>{ticket.type}</span>
              <span className="text-slate-300">·</span>
              <span>{ticket.category}</span>
              {depth > 0 && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">
                  <GitBranch className="h-2.5 w-2.5" /> Sub-chamado
                </span>
              )}
            </div>
            <p className={`font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-700 transition-colors leading-snug mb-2.5 ${depth > 0 ? 'text-xs' : 'text-sm'}`}>
              {ticket.title}
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.badge}`}>{p.label}</span>
              {ticket.assigneeName ? (
                <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                  <UserCheck className="h-3 w-3" /> {ticket.assigneeName}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-amber-500 font-medium">
                  <AlertCircle className="h-3 w-3" /> Aguardando atribuição
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true, locale: ptBR })}
              </span>
              {publicComments > 0 && (
                <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                  <MessageSquare className="h-3 w-3" /> {publicComments}
                </span>
              )}
            </div>
          </div>
          <div className={`flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-full ${s.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
            <span className={`text-xs font-medium whitespace-nowrap ${s.text}`}>{s.label}</span>
          </div>
        </div>
      </button>

      {/* Actions */}
      {(isActive || isDone) && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50">
          {isActive && (
            <button
              onClick={() => onAction({ type: 'close', ticket })}
              className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors font-medium"
            >
              Fechar chamado
            </button>
          )}
          {isDone && (
            <>
              <button
                onClick={() => onAction({ type: 'rate', ticket })}
                className="flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 px-3 py-1.5 rounded-lg transition-colors font-medium"
              >
                <Star className="h-3 w-3" /> Avaliar
              </button>
              <button
                onClick={() => onAction({ type: 'child', ticket })}
                className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors font-medium"
              >
                <GitMerge className="h-3 w-3" /> Abrir sub-chamado
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function TicketTree({ node, depth = 0, onAction }: { node: FilteredNode; depth?: number; onAction: (a: CardAction) => void }) {
  return (
    <div>
      <TicketCard ticket={node.ticket} depth={depth} dimmed={node.dimmed} onAction={onAction} />
      {node.children.length > 0 && (
        <div className="ml-6 pl-4 mt-2 border-l-2 border-slate-100 dark:border-slate-700/50 space-y-2">
          {node.children.map((child) => (
            <TicketTree key={child.ticket.id} node={child} depth={depth + 1} onAction={onAction} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ClientTicketsPage() {
  const { user }  = useAuth();
  const { tickets, updateTicket } = useTickets();
  const { id }    = useParams();
  const location  = useLocation();
  const navigate  = useNavigate();
  const client    = user as MockClient;

  const [filter, setFilter] = useState<FilterStatus>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [reply,  setReply]  = useState('');
  const [replyAttachments, setReplyAttachments] = useState<File[]>([]);

  // Modal state
  const [closingTicket, setClosingTicket]   = useState<MockTicket | null>(null);
  const [ratingTicket,  setRatingTicket]    = useState<MockTicket | null>(null);
  const [childTicket,   setChildTicket]     = useState<MockTicket | null>(null);
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(() => {
    return new URLSearchParams(location.search).get('new') === '1';
  });

  // Clean query param from URL gracefully
  React.useEffect(() => {
    if (isNewTicketOpen) {
      const sp = new URLSearchParams(location.search);
      if (sp.has('new')) {
        sp.delete('new');
        navigate({ search: sp.toString() }, { replace: true });
      }
    }
  }, [isNewTicketOpen, location.search, navigate]);

  const myTickets = tickets.filter((t) => t.requesterId === client?.id);
  const tree      = buildTree(myTickets);
  let filtered  = applyFilter(tree, filter);
  
  if (searchFilter.trim()) {
    const q = searchFilter.toLowerCase();
    const matches = (t: MockTicket) => t.title.toLowerCase().includes(q) || String(t.number).toLowerCase().includes(q);
    
    function filterBySearch(nodes: FilteredNode[]): FilteredNode[] {
      return nodes.flatMap(node => {
        const filteredChildren = filterBySearch(node.children);
        const selfMatches = matches(node.ticket);
        if (!selfMatches && filteredChildren.length === 0) return [];
        return [{ ...node, children: filteredChildren, dimmed: !selfMatches && filter === 'all' }];
      });
    }
    filtered = filterBySearch(filtered);
  }

  const countOf   = (f: FilterStatus) => myTickets.filter((t) => nodeMatchesFilter(t, f)).length;

  function handleAction(a: CardAction) {
    if (a.type === 'close') setClosingTicket(a.ticket);
    if (a.type === 'rate')  setRatingTicket(a.ticket);
    if (a.type === 'child') setChildTicket(a.ticket);
  }

  function handleCloseConfirm(_reason: string) {
    setClosingTicket(null);
    toast.success('Chamado fechado com sucesso.');
  }

  function handleRatingConfirm(_score: number, _comment: string) {
    setRatingTicket(null);
    toast.success('Avaliação enviada. Obrigado pelo feedback!');
  }

  function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim() && replyAttachments.length === 0) return;
    toast.success('Resposta enviada.');
    setReply('');
    setReplyAttachments([]);
  }

  const handleReplyFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setReplyAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };
  
  const removeReplyFile = (index: number) => {
    setReplyAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const selected = id ? tickets.find((t) => t.id === id) : null;

  // ── DETAIL VIEW ──────────────────────────────────────────────────────────────
  if (selected) {
    const s              = STATUS_CFG[selected.status];
    const p              = PRIORITY_CFG[selected.priority];
    const selectedTicket = id ? tickets.find((t: MockTicket) => String(t.number) === id || t.id === id) : null;
    const parentTicket = null;
    const childrenTickets = [];
    const ancestors      = getAncestors(selected.id, tickets);
    const directChildren = tickets.filter((t) => t.parentTicketId === selected.id);
    const timeline       = buildTimeline(selected);
    const isDone         = selected.status === 'resolved' || selected.status === 'closed';
    const isActive       = ['new', 'open', 'in_progress', 'pending'].includes(selected.status);

    return (
      <>
        {closingTicket && (
          <CloseTicketModal ticket={closingTicket} onClose={() => setClosingTicket(null)} onConfirm={handleCloseConfirm} />
        )}
        {ratingTicket && (
          <RatingModal ticket={ratingTicket} onClose={() => setRatingTicket(null)} onConfirm={handleRatingConfirm} />
        )}
        {childTicket && (
          <ChildTicketModal parent={childTicket} onClose={() => setChildTicket(null)} onConfirm={() => setChildTicket(null)} />
        )}

        <div className="space-y-4 pb-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1 text-sm flex-wrap">
            <Link to="/portal/tickets" className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium transition-all duration-200 hover:-translate-y-[1.5px] active:translate-y-[0.5px] hover:shadow-md">
              <ChevronLeft className="h-4 w-4 shrink-0" /> Meus chamados
            </Link>
            {ancestors.map((anc) => (
              <React.Fragment key={anc.id}>
                <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                <Link to={`/portal/tickets/${anc.id}`} className="text-blue-600 hover:underline truncate max-w-[160px]">
                  #{anc.number}
                </Link>
              </React.Fragment>
            ))}
          </nav>

          {/* Header card */}
          <div className={`bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 border-l-4 ${p.border} shadow-sm px-6 py-5`}>
            <div className="flex items-center gap-2 mb-2 text-xs text-slate-400 dark:text-slate-500 flex-wrap">
              <span className="font-mono font-semibold text-slate-500 dark:text-slate-400 dark:text-slate-500">#{selected.number}</span>
              <span className="text-slate-300">·</span>
              <span>{selected.type}</span>
              <span className="text-slate-300">·</span>
              <span>{selected.category}</span>
              {selected.parentTicketId && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">
                  <GitBranch className="h-2.5 w-2.5" /> Sub-chamado
                </span>
              )}
            </div>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-50 leading-snug">{selected.title}</h1>
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                  {s.label}
                </span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${p.badge}`}>{p.label}</span>
                {/* Inline actions */}
                {isActive && (
                  <button
                    onClick={() => setClosingTicket(selected)}
                    className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 px-3 py-1.5 rounded-lg font-medium border border-red-200 dark:border-red-500/30 transition-all duration-200 hover:-translate-y-[1.5px] active:translate-y-[0.5px] hover:shadow-md"
                  >
                    Fechar chamado
                  </button>
                )}
                {isDone && (
                  <>
                    <button
                      onClick={() => setRatingTicket(selected)}
                      className="flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 px-3 py-1.5 rounded-lg transition-colors font-medium border border-amber-200"
                    >
                      <Star className="h-3 w-3" /> Avaliar
                    </button>
                    <button
                      onClick={() => setChildTicket(selected)}
                      className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors font-medium border border-slate-200 dark:border-slate-700"
                    >
                      <GitMerge className="h-3 w-3" /> Sub-chamado
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Two-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_272px] gap-4 items-start">

            {/* LEFT */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm px-6 py-5">
                <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-3">Descrição</h2>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{selected.description}</p>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm px-6 py-5">
                <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-6">Linha do tempo</h2>
                <div className="space-y-6">
                  {timeline.map((ev, i) => {
                    const isSystem = ev.actorType === 'system';
                    const initials = ev.actor.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
                    const avatarCls =
                      ev.type === 'opened'   ? 'bg-blue-100 text-blue-600' :
                      ev.type === 'resolved' || ev.type === 'closed' ? 'bg-green-100 text-green-600' :
                      isSystem               ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400' :
                      ev.actorType === 'staff' ? 'bg-violet-100 text-violet-700' :
                      'bg-blue-100 text-blue-600';

                    const isUserComment = ev.type === 'comment' && ev.actorType === 'user';
                    const isStaffComment = ev.type === 'comment' && ev.actorType === 'staff';
                    const isComment = isUserComment || isStaffComment;

                    if (isComment) {
                      return (
                        <div key={ev.id} className={`flex ${isUserComment ? 'justify-end' : 'justify-start'}`}>
                          <div className={`flex gap-3 max-w-[85%] ${isUserComment ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${avatarCls}`}>
                              {initials}
                            </div>
                            <div className={`rounded-2xl px-5 py-3.5 shadow-sm text-sm ${isUserComment ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-sm'}`}>
                              <div className={`flex items-baseline gap-2 mb-1 flex-wrap ${isUserComment ? 'justify-end' : ''}`}>
                                <span className={`text-xs font-semibold ${isUserComment ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>{ev.actor}</span>
                                <span className={`text-[10px] ${isUserComment ? 'text-blue-200' : 'text-slate-400 dark:text-slate-500'}`}>
                                  {formatDistanceToNow(new Date(ev.timestamp), { addSuffix: true, locale: ptBR })}
                                </span>
                              </div>
                              <div className="whitespace-pre-wrap leading-relaxed">
                                {ev.content}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={ev.id} className="flex justify-center">
                        <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 rounded-full px-4 py-1.5 flex items-center gap-2 max-w-full">
                          <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">
                            {format(new Date(ev.timestamp), "dd MMM, HH:mm", { locale: ptBR })}
                          </span>
                          <span className="text-slate-300 dark:text-slate-600 shrink-0">·</span>
                          <div className="text-xs text-slate-600 dark:text-slate-400 truncate">
                            {ev.type === 'opened' && <span><span className="font-medium text-slate-700 dark:text-slate-300">{ev.actor}</span> abriu o chamado</span>}
                            {ev.type === 'assigned' && <span>Atribuído a <span className="font-medium text-slate-700 dark:text-slate-300">{ev.content}</span></span>}
                            {(ev.type === 'resolved' || ev.type === 'closed') && (
                              <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> Chamado {ev.type === 'resolved' ? 'resolvido' : 'fechado'}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {!isDone && (
                  <form onSubmit={handleReply} className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-700/50 space-y-3">
                    <textarea
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder="Adicione uma informação ou responda à equipe..."
                      rows={3}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-4 py-3 text-sm placeholder:text-slate-400 dark:text-slate-500 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition resize-none"
                    />
                    
                    {replyAttachments.length > 0 && (
                      <div className="flex flex-wrap gap-3 pt-2 pb-2">
                        {replyAttachments.map((file, i) => {
                          const isImage = file.type.startsWith('image/');
                          const previewUrl = isImage ? URL.createObjectURL(file) : null;
                          return (
                            <div key={i} className="relative group rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800 shrink-0">
                              {isImage ? (
                                <img src={previewUrl!} alt="preview" className="h-16 w-16 object-cover" />
                              ) : (
                                <div className="h-16 w-16 flex items-center justify-center">
                                  <Paperclip className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                                </div>
                              )}
                              <button type="button" onClick={() => removeReplyFile(i)} className="absolute top-1 right-1 bg-black/60 hover:bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer">
                        <Paperclip className="h-4 w-4" /> Anexar imagens
                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleReplyFileChange} />
                      </label>
                      <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all duration-200 hover:-translate-y-[1.5px] active:translate-y-[0.5px] hover:shadow-md">
                        <Send className="h-3.5 w-3.5" /> Enviar
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* RIGHT */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm px-5 py-4 divide-y divide-slate-50">
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">Status</span>
                  <span className={`flex items-center gap-1.5 text-xs font-medium ${s.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                    {s.label}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">Prioridade</span>
                  <span className={`text-xs font-semibold ${p.color}`}>{p.label}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">Responsável</span>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{selected.assigneeName ?? '—'}</span>
                </div>
                {selected.team && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">Equipe</span>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{selected.team}</span>
                  </div>
                )}
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">Aberto em</span>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {format(new Date(selected.createdAt), "dd/MM/yy HH:mm", { locale: ptBR })}
                  </span>
                </div>
                {selected.closedAt && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">Fechado em</span>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      {format(new Date(selected.closedAt), "dd/MM/yy HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">Origem</span>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 capitalize">{selected.source}</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm px-5 py-4">
                <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">SLA</h3>
                <div className="divide-y divide-slate-50">
                  <SlaRow label="1ª resposta" due={selected.slaFirstResponseDue} met={selected.slaFirstResponseMet} />
                  <SlaRow label="Resolução"   due={selected.slaResolutionDue}    met={selected.slaResolutionMet} />
                </div>
              </div>

              {selected.tags.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm px-5 py-4">
                  <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTicket?.tags?.map((tag: string, i: number) => (
                      <span key={tag} className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 dark:text-slate-500">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {directChildren.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm px-5 py-4">
                  <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <GitBranch className="h-3.5 w-3.5" />
                    Sub-chamados
                    <span className="ml-auto text-xs font-normal bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full text-slate-500 dark:text-slate-400 dark:text-slate-500">
                      {directChildren.length}
                    </span>
                  </h3>
                  <div className="space-y-1.5">
                    {directChildren.map((child) => {
                      const cs = STATUS_CFG[child.status];
                      return (
                        <Link key={child.id} to={`/portal/tickets/${child.id}`}
                          className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700/50 hover:border-blue-200 hover:bg-blue-50/40 group transition-all duration-200 hover:-translate-y-[1.5px] active:translate-y-[0.5px] hover:shadow-md">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cs.dot}`} />
                          <span className="text-xs font-mono text-slate-400 dark:text-slate-500 shrink-0">#{child.number}</span>
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-700 truncate flex-1">{child.title}</span>
                          <ChevronRight className="h-3 w-3 text-slate-300 shrink-0" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── LIST VIEW ─────────────────────────────────────────────────────────────────
  const openCount    = myTickets.filter((t) => ['new', 'open', 'in_progress'].includes(t.status)).length;
  const pendingCount = myTickets.filter((t) => t.status === 'pending').length;
  const doneCount    = myTickets.filter((t) => ['resolved', 'closed'].includes(t.status)).length;

  return (
    <>
      {closingTicket && (
        <CloseTicketModal ticket={closingTicket} onClose={() => setClosingTicket(null)} onConfirm={handleCloseConfirm} />
      )}
      {ratingTicket && (
        <RatingModal ticket={ratingTicket} onClose={() => setRatingTicket(null)} onConfirm={handleRatingConfirm} />
      )}
      {childTicket && (
        <ChildTicketModal parent={childTicket} onClose={() => setChildTicket(null)} onConfirm={() => setChildTicket(null)} />
      )}
      {isNewTicketOpen && (
        <NewTicketModal onClose={() => setIsNewTicketOpen(false)} onConfirm={() => setIsNewTicketOpen(false)} />
      )}

      <div className="space-y-6 pb-10">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">Meus chamados</h1>
          <button 
            onClick={() => setIsNewTicketOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" /> Novo chamado
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <StatCard value={openCount}    label="Em aberto"  color="text-blue-600"   active={filter === 'active'} onClick={() => setFilter(filter === 'active' ? 'all' : 'active')} />
          <StatCard value={pendingCount} label="Pendentes"  color="text-purple-600" active={filter === 'pending'} onClick={() => setFilter(filter === 'pending' ? 'all' : 'pending')} />
          <StatCard value={doneCount}    label="Concluídos" color="text-green-600"  active={filter === 'done'}   onClick={() => setFilter(filter === 'done' ? 'all' : 'done')} />
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          <div className="relative group mr-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              placeholder="Buscar por #ID ou título..."
              className="pl-9 pr-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 transition-all w-64 shadow-sm"
            />
          </div>
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setFilter(opt.key)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === opt.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-900/50'
              }`}
            >
              {opt.label}
              {opt.key !== 'all' && (
                <span className={`ml-1.5 text-xs ${filter === opt.key ? 'opacity-75' : 'opacity-50'}`}>
                  ({countOf(opt.key)})
                </span>
              )}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <Inbox className="h-10 w-10 text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500">Nenhum chamado encontrado</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Tente outro filtro ou abra um novo chamado.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((node) => (
              <TicketTree key={node.ticket.id} node={node} onAction={handleAction} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
