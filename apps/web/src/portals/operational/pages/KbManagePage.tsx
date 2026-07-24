import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Eye, ThumbsUp, BookOpen, Edit2, Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import { MOCK_KB_ARTICLES } from '../../../mocks/data';
import { useEscapeModal } from '../../../hooks/use-escape-modal';
import { useAuth } from '../../../hooks/use-mock-auth';

const STATUS_CONFIG = {
  published: { label: 'Publicado', color: 'bg-green-100 text-green-700' },
  draft: { label: 'Rascunho', color: 'bg-slate-100 text-slate-600' },
  pending_review: { label: 'Em revisão', color: 'bg-amber-100 text-amber-700' },
};

// ─── Gemini AI Integration ───────────────────────────────────────────────────
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY ?? '';

async function askGemini(question: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('VITE_GEMINI_API_KEY não configurada.');
  }
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Você é um assistente técnico de TI especializado em suporte corporativo e service desk. 
Responda de forma clara, objetiva e em português, com passos numerados quando necessário.
Pergunta: ${question}`,
              },
            ],
          },
        ],
        generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
      }),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `Erro HTTP ${res.status}`);
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Sem resposta.';
}

// ─── Gemini Answer Panel ─────────────────────────────────────────────────────
function GeminiPanel({ query }: { query: string }) {
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [asked, setAsked] = useState(false);
  
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  const handleAsk = async () => {
    setLoading(true);
    setError(null);
    setAsked(true);
    try {
      const result = await askGemini(query);
      setAnswer(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 rounded-2xl border border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/30 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-blue-100 dark:border-blue-800/50">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm flex-shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-blue-900 dark:text-blue-200">
            Nenhum artigo encontrado — perguntar ao Gemini AI
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400 truncate">
            "{query}"
          </p>
        </div>
        {!asked && (
          <button
            onClick={handleAsk}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm flex-shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Consultar IA
          </button>
        )}
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        {!asked && (
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Não encontramos artigos correspondentes. Clique em <strong>Consultar IA</strong> para obter uma resposta gerada pelo Gemini com base no seu contexto de TI.
          </p>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Consultando Gemini AI...</p>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-4">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-rose-700 dark:text-rose-400">Erro ao consultar Gemini</p>
              <p className="text-xs text-rose-600 dark:text-rose-500 mt-1">{error}</p>
              {error.includes('VITE_GEMINI_API_KEY') && (
                <p className="text-xs text-rose-500 mt-2">
                  Configure a variável <code className="bg-rose-100 dark:bg-rose-900/40 px-1 rounded">VITE_GEMINI_API_KEY</code> no arquivo <code className="bg-rose-100 dark:bg-rose-900/40 px-1 rounded">.env</code> do projeto.
                </p>
              )}
              <button
                onClick={handleAsk}
                className="mt-3 text-xs font-semibold text-rose-600 dark:text-rose-400 underline"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        )}

        {answer && !loading && (
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">Resposta do Gemini AI</p>
              </div>
              {hasPermission('kb.write') && (
                <button
                  onClick={() => navigate('/operacional/app/kb/new', { state: { title: query, content: answer } })}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700/50 shadow-sm transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Incluir na Base
                </button>
              )}
            </div>
            <div className="prose prose-sm max-w-none text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap rounded-xl bg-white dark:bg-slate-900/60 border border-blue-100 dark:border-blue-900/40 p-4 text-sm">
              {answer}
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-2">
              Gerado pelo Gemini AI · Pode conter imprecisões. Verifique antes de aplicar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function KbManagePage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'pending_review'>('all');
  
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  useEscapeModal(isNewModalOpen, () => setIsNewModalOpen(false));

  const filtered = MOCK_KB_ARTICLES.filter((a) => {
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const noResults = search.trim().length >= 3 && filtered.length === 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Base de Conhecimento</h1>
          <p className="text-sm text-slate-500 mt-0.5">{MOCK_KB_ARTICLES.length} artigos</p>
        </div>
        {hasPermission('kb.write') && (
          <button 
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" /> Novo artigo
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar artigos... (sem resultados? o Gemini AI irá responder!)"
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-400 transition text-slate-800 dark:text-slate-200"
          />
        </div>
        <div className="flex gap-1">
          {(['all','published','draft','pending_review'] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'}`}>
              {s === 'all' ? 'Todos' : STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Articles list */}
      {filtered.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {filtered.map((article) => {
              const st = STATUS_CONFIG[article.status];
              return (
                <div 
                  key={article.id} 
                  onClick={() => navigate(`/operacional/app/kb/${article.id}`)}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{article.title}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-slate-400">{article.category}</span>
                      <span className="text-xs text-slate-300">·</span>
                      <span className="text-xs text-slate-400">{article.author}</span>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{article.views}</span>
                    <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" />{article.helpfulVotes}</span>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${st.color}`}>{st.label}</span>
                  {hasPermission('kb.write') && (
                    <button className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                      <Edit2 className="h-3.5 w-3.5 text-slate-500" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No results → Gemini AI panel */}
      {noResults && <GeminiPanel query={search.trim()} />}

      {/* Empty state when no search */}
      {!noResults && filtered.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhum artigo encontrado.</p>
        </div>
      )}

      {/* ─── MODAL NOVO ARTIGO ─── */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm shadow-xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Criar Artigo</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Dê um título inicial ao seu artigo. Você poderá alterar tudo no editor.
            </p>
            
            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Título Inicial</label>
              <input
                autoFocus
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newTitle.trim()) {
                    navigate('/operacional/app/kb/new', { state: { title: newTitle } });
                  }
                }}
                placeholder="Ex: Como configurar a VPN..."
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => {
                  setIsNewModalOpen(false);
                  setNewTitle('');
                }}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => navigate('/operacional/app/kb/new', { state: { title: newTitle } })}
                disabled={!newTitle.trim()}
                className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors shadow-sm"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
