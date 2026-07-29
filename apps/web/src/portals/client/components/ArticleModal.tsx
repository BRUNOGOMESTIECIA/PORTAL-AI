import React, { useState } from 'react';
import { BookOpen, Calendar, ChevronRight, MessageCircle, Ticket, ThumbsDown, ThumbsUp, User, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MockKbArticle } from '../../../mocks/data';
import { useEscapeModal } from '../../../hooks/use-escape-modal';

export function ArticleModal({ 
  article, 
  onClose 
}: { 
  article: MockKbArticle; 
  onClose: () => void;
}) {
  const [feedbackState, setFeedbackState] = useState<'idle' | 'yes' | 'no' | 'submitted'>('idle');

  const handleClose = () => {
    setFeedbackState('idle');
    onClose();
  };

  useEscapeModal(true, handleClose);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
      <div 
        className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900/30">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-4 font-medium">
            <Link to="/portal" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3 opacity-50" />
            <button onClick={handleClose} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Base de Conhecimento</button>
            <ChevronRight className="h-3 w-3 opacity-50" />
            <span className="text-slate-700 dark:text-slate-300">{article.category}</span>
          </div>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 pr-4">{article.title}</h2>
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1.5 flex-wrap">
                  <span className="font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-full">{article.category}</span>
                  <span className="flex items-center gap-1"><User className="h-3 w-3"/> {article.author}</span>
                  {article.publishedAt && (
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3"/> {new Date(article.publishedAt).toLocaleDateString('pt-BR')}</span>
                  )}
                </div>
              </div>
            </div>
            <button 
              onClick={handleClose}
              className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 rounded-full shrink-0 transition-all duration-200 hover:-translate-y-[1.5px] active:translate-y-[0.5px] hover:shadow-md"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 scroll-smooth">
            <p className="text-lg text-slate-600 dark:text-slate-400 dark:text-slate-500 font-medium mb-8 leading-relaxed border-l-4 border-blue-500 pl-4">
              {article.excerpt}
            </p>
            <div className="prose prose-slate prose-blue max-w-none text-slate-700 dark:text-slate-300 leading-loose">
              {article.content.split('\n\n').map((paragraph, idx) => {
                if (paragraph.startsWith('## ')) {
                  const headingText = paragraph.replace('## ', '');
                  const headingId = `heading-${headingText.toLowerCase().replace(/\s+/g, '-')}`;
                  return <h3 id={headingId} key={idx} className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-8 mb-4">{headingText}</h3>;
                }
                if (paragraph.startsWith('1. ') || paragraph.startsWith('- ')) {
                  return (
                    <div key={idx} className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5 border border-slate-100 dark:border-slate-700/50 my-4">
                      {paragraph.split('\n').map((line, i) => (
                        <div key={i} className="flex gap-3 mb-2 last:mb-0">
                          <span className="text-blue-600 font-bold select-none">{line.split(' ')[0]}</span>
                          <span>{line.substring(line.indexOf(' ') + 1)}</span>
                        </div>
                      ))}
                    </div>
                  );
                }
                return <p key={idx} className="mb-4">{paragraph}</p>;
              })}
            </div>
          </div>

          {/* Sidebar TOC */}
          <div className="hidden lg:block w-72 border-l border-slate-100 dark:border-slate-700/50 p-6 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/20">
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-5 flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5" /> Neste artigo
            </h4>
            <ul className="space-y-3.5 text-sm">
              {article.content.split('\n\n')
                .filter(p => p.startsWith('## '))
                .map((p, idx) => {
                  const headingText = p.replace('## ', '');
                  const headingId = `heading-${headingText.toLowerCase().replace(/\s+/g, '-')}`;
                  return (
                    <li key={idx}>
                      <a 
                        href={`#${headingId}`} 
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById(headingId)?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors block line-clamp-2"
                      >
                        {headingText}
                      </a>
                    </li>
                  );
                })}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {feedbackState === 'idle' && (
            <>
              <span className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">Este artigo foi útil?</span>
              <div className="flex gap-3">
                <button 
                  onClick={() => setFeedbackState('yes')}
                  className="flex flex-1 sm:flex-none justify-center items-center gap-2 px-5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-500/30 shadow-sm transition-all duration-200 hover:-translate-y-[1.5px] active:translate-y-[0.5px] hover:shadow-md"
                >
                  <ThumbsUp className="h-4 w-4" /> Sim
                </button>
                <button 
                  onClick={() => setFeedbackState('no')}
                  className="flex flex-1 sm:flex-none justify-center items-center gap-2 px-5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-500/30 shadow-sm transition-all duration-200 hover:-translate-y-[1.5px] active:translate-y-[0.5px] hover:shadow-md"
                >
                  <ThumbsDown className="h-4 w-4" /> Não
                </button>
              </div>
            </>
          )}

          {feedbackState === 'yes' && (
            <div className="w-full flex items-center justify-center py-2">
              <span className="text-sm font-medium text-emerald-600 flex items-center gap-2">
                <ThumbsUp className="h-4 w-4" /> Obrigado pelo seu feedback!
              </span>
            </div>
          )}

          {feedbackState === 'no' && (
            <div className="w-full flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Por que o artigo não ajudou? (opcional)</label>
                <textarea 
                  placeholder="Descreva o que faltou ou o que estava confuso..."
                  className="w-full rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm text-slate-800 dark:text-slate-200 outline-none resize-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 transition placeholder-slate-400 dark:placeholder-slate-500"
                  rows={2}
                />
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <p className="text-sm text-slate-500 dark:text-slate-400">Ainda precisa de ajuda?</p>
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <button 
                    onClick={() => setFeedbackState('submitted')}
                    className="flex-1 sm:flex-none px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-xl transition-all duration-200 hover:-translate-y-[1.5px] active:translate-y-[0.5px] hover:shadow-md"
                  >
                    Apenas enviar feedback
                  </button>
                  <Link 
                    to="/portal/tickets?new=1"
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-all duration-200 hover:-translate-y-[1.5px] active:translate-y-[0.5px] hover:shadow-md"
                  >
                    <Ticket className="h-4 w-4" /> Abrir ticket
                  </Link>
                </div>
              </div>
            </div>
          )}

          {feedbackState === 'submitted' && (
            <div className="w-full flex items-center justify-center py-2 animate-in fade-in zoom-in duration-300">
              <span className="text-sm font-medium text-emerald-600 flex items-center gap-2">
                <ThumbsUp className="h-4 w-4" /> Feedback enviado. Agradecemos por nos ajudar a melhorar!
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
