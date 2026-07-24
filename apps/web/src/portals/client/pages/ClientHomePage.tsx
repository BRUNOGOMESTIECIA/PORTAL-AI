import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Ticket, BookOpen, Send, X, ChevronDown, CheckCircle2, MessageCircle, AlertTriangle, Sparkles, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../../hooks/use-mock-auth';
import { useEscapeModal } from '../../../hooks/use-escape-modal';
import { MockClient, MOCK_KB_ARTICLES, MockKbArticle, MockTicket } from '../../../mocks/data';
import { useTickets } from '../../../hooks/use-tickets';
import { ArticleModal } from '../components/ArticleModal';
import { NewTicketModal } from '../components/NewTicketModal';

// ─── Prompt suggestions ───────────────────────────────────────────────────────
const PROMPT_SUGGESTIONS = [
  { label: 'Meu computador não está ligando', icon: '💻' },
  { label: 'Preciso de acesso a um sistema', icon: '🔑' },
  { label: 'Como resetar minha senha?', icon: '🔒' },
  { label: 'Impressora não está funcionando', icon: '🖨️' },
  { label: 'VPN não conecta', icon: '🌐' },
  { label: 'Solicitar novo equipamento', icon: '📦' },
];

// ─── AI Chat Modal ────────────────────────────────────────────────────────────

function AiChatModal({ initialPrompt, user, onClose }: { initialPrompt: string; user: MockClient; onClose: () => void }) {
  useEscapeModal(true, onClose);
  
  const userInitials = user.name?.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'U';
  const [messages, setMessages] = useState<{ id: string; role: 'user' | 'ai'; text: string; isTyping?: boolean }[]>([
    { id: '1', role: 'user', text: initialPrompt },
    { id: '2', role: 'ai', text: '', isTyping: true }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate AI typing delay for initial response
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setMessages((prev) => [
        prev[0], // user prompt
        {
          id: '2',
          role: 'ai',
          text: `Entendi que você precisa de ajuda com "${initialPrompt}". Pesquisei em nossa base de conhecimento e históricos recentes.\n\nPosso sugerir um artigo para resolver isso, ou se preferir, já posso abrir um chamado com a equipe responsável. O que prefere?`,
        }
      ]);
    }, 1500);
    return () => clearTimeout(timer);
  }, [initialPrompt]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput('');
    
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: 'user', text: userMsg },
      { id: (Date.now() + 1).toString(), role: 'ai', text: '', isTyping: true }
    ]);

    setTimeout(() => {
      setMessages((prev) => {
        const newArr = [...prev];
        newArr[newArr.length - 1] = {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          text: 'Perfeito. Estou abrindo o chamado agora com essas informações adicionais. A equipe de TI será notificada.',
        };
        return newArr;
      });
    }, 1200);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700/50 bg-white dark:bg-slate-800 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">Assistente Virtual</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">Respostas automáticas e triagem</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 transition-all duration-200 hover:-translate-y-[1.5px] active:translate-y-[0.5px] hover:shadow-md">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 dark:bg-slate-900/50">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center overflow-hidden ${m.role === 'user' ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white font-semibold text-xs' : 'bg-blue-100'}`}>
                  {m.role === 'user' ? (
                    user.avatarUrl ? <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" /> : userInitials
                  ) : (
                    <Sparkles className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                <div className={`rounded-2xl px-5 py-3.5 shadow-sm text-sm ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 rounded-tl-sm'}`}>
                  {m.isTyping ? (
                    <div className="flex gap-1.5 items-center h-5">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700/50 shrink-0">
          <div className="relative flex items-center group">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="w-full rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 py-3.5 pl-5 pr-14 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 hover:border-slate-300 dark:hover:border-slate-600"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white flex items-center justify-center transition-all duration-200 hover:-translate-y-[1.5px] active:translate-y-[0.5px] hover:shadow-md"
            >
              <Send className="h-4 w-4 ml-0.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Pending action card ──────────────────────────────────────────────────────
function PendingCard({ ticket }: { ticket: MockTicket }) {
  const lastPublicComment = [...ticket.comments]
    .filter((c) => !c.isInternal)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  return (
    <Link
      to={`/portal/tickets/${ticket.id}`}
      className="group flex flex-col gap-3 rounded-2xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 p-4 hover:border-amber-300 dark:hover:border-amber-500/40 hover:bg-amber-100/60 dark:hover:bg-amber-500/20 transition-all duration-200 hover:-translate-y-[1.5px] active:translate-y-[0.5px] hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-0.5 block">#{ticket.number}</span>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug group-hover:text-amber-900 dark:group-hover:text-amber-100">{ticket.title}</p>
        </div>
        <span className="shrink-0 flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/30 px-2 py-0.5 rounded-full whitespace-nowrap">
          <AlertTriangle className="h-3 w-3" />
          Aguarda você
        </span>
      </div>

      {lastPublicComment && (
        <div className="flex gap-2.5 bg-white dark:bg-slate-800/70 rounded-xl p-3 border border-amber-100 dark:border-amber-500/10">
          <MessageCircle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 whitespace-pre-line leading-relaxed">
            {lastPublicComment.body}
          </p>
        </div>
      )}

      <span className="self-end text-xs font-semibold text-amber-700 group-hover:underline">
        Responder →
      </span>
    </Link>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ClientHomePage() {
  const { user } = useAuth();
  const { tickets } = useTickets();
  const client = user as MockClient;
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState('');
  const [modalInitialTitle, setModalInitialTitle] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<MockKbArticle | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const firstName = client?.name?.split(' ')[0] ?? 'Usuário';

  const pendingTickets = tickets.filter(
    (t) => t.status === 'pending' && t.requesterId === client?.id,
  );

  const [isSearching, setIsSearching] = useState(false);
  const searchLower = search.toLowerCase().trim();
  const ticketResults = searchLower ? tickets.filter(t => t.title.toLowerCase().includes(searchLower) || String(t.number).toLowerCase().includes(searchLower)) : [];
  const articleResults = searchLower ? MOCK_KB_ARTICLES.filter(a => a.title.toLowerCase().includes(searchLower) || a.category.toLowerCase().includes(searchLower)) : [];
  const hasResults = ticketResults.length > 0 || articleResults.length > 0;

  function openModal(title = '') {
    setModalInitialTitle(title);
    setModalOpen(true);
  }

  function startAiChat(promptText: string) {
    if (!promptText.trim()) return;
    setAiInitialPrompt(promptText);
    setAiChatOpen(true);
  }

  function handleSuggestionClick(label: string) {
    setSearch(label);
    startAiChat(label);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    startAiChat(search);
  }

  return (
    <>
      {modalOpen && (
        <NewTicketModal
          initialTitle={modalInitialTitle}
          onClose={() => setModalOpen(false)}
        />
      )}

      {aiChatOpen && (
        <AiChatModal
          initialPrompt={aiInitialPrompt}
          user={client}
          onClose={() => setAiChatOpen(false)}
        />
      )}

      {selectedArticle && (
        <ArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />
      )}

      <div className="space-y-10">
        {/* Pending action banner */}
        {pendingTickets.length > 0 ? (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {pendingTickets.length === 1
                  ? 'Um chamado aguarda sua resposta'
                  : `${pendingTickets.length} chamados aguardam sua resposta`}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pendingTickets.map((t) => <PendingCard key={t.id} ticket={t} />)}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 rounded-2xl p-4 px-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Tudo em dia!</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Nenhuma pendência ou chamado aguardando sua resposta.</p>
              </div>
            </div>
          </div>
        )}

        {/* Hero */}
        <div className="text-center py-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-1">
            Olá, {firstName}!
          </h1>
          <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-6">Como posso ajudar você hoje?</p>

          {/* AI Search bar */}
          <div className="relative max-w-xl mx-auto z-20 group">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setIsSearching(true)}
                onBlur={() => setTimeout(() => setIsSearching(false), 200)}
                placeholder="Pesquise por solução, erro ou serviço..."
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-3.5 pl-12 pr-14 text-sm text-slate-900 dark:text-white shadow-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/40 hover:border-slate-300 dark:hover:border-slate-600"
              />
              <button
                type="submit"
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-xl ${ search.trim() ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-default' } transition-all duration-200 hover:-translate-y-[1.5px] active:translate-y-[0.5px] hover:shadow-md`}
                disabled={!search.trim()}
              >
                <Send className="h-3.5 w-3.5 ml-0.5" />
              </button>
            </form>

            {/* Predictive Results Dropdown */}
            {isSearching && search.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 text-left">
                {!hasResults ? (
                  <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
                    Nenhum resultado encontrado para "{search}". Pressione Enter para perguntar à IA.
                  </div>
                ) : (
                  <div className="max-h-80 overflow-y-auto p-2">
                    {articleResults.length > 0 && (
                      <div className="mb-2">
                        <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Base de Conhecimento</div>
                        {articleResults.slice(0, 3).map(a => (
                          <button 
                            key={a.id} 
                            onClick={() => { setSelectedArticle(a); setIsSearching(false); }}
                            className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors w-full text-left"
                          >
                            <BookOpen className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-snug">{a.title}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{a.category}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    {ticketResults.length > 0 && (
                      <div>
                        <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Meus Chamados</div>
                        {ticketResults.slice(0, 3).map(t => (
                          <Link key={t.id} to={`/portal/tickets/${t.id}`} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors w-full">
                            <Ticket className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-snug">#{t.number} - {t.title}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 text-blue-600 dark:text-blue-400 font-medium">Ver chamado</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Prompt suggestions */}
          <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-2xl mx-auto">
            {PROMPT_SUGGESTIONS.map((s) => (
              <button
                key={s.label}
                onClick={() => handleSuggestionClick(s.label)}
                className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-full shadow-sm transition-all"
              >
                <span>{s.icon}</span>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => openModal()}
            className="group flex items-center gap-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all duration-200 text-left hover:-translate-y-[1.5px] active:translate-y-[0.5px]"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 transition-colors flex-shrink-0">
              <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Abrir chamado</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Reporte um problema ou solicitação</p>
            </div>
          </button>

          <Link to="/portal/tickets" className="group flex items-center gap-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all duration-200 hover:-translate-y-[1.5px] active:translate-y-[0.5px]">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-colors flex-shrink-0">
              <Ticket className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Meus chamados</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Acompanhe suas solicitações</p>
            </div>
          </Link>

          <Link to="/portal/kb" className="group flex items-center gap-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-md transition-all duration-200 hover:-translate-y-[1.5px] active:translate-y-[0.5px]">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 transition-colors flex-shrink-0">
              <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Base de conhecimento</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Tutoriais e respostas rápidas</p>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
