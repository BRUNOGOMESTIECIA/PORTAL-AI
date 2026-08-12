import React, { useState } from 'react';
import { generateAiHandoverSummary, AiHandoverSummaryResult } from '../../../lib/ai-ticket-summarizer';
import { Sparkles, Copy, Check, RefreshCw, ArrowRightLeft } from 'lucide-react';
import { toast } from 'sonner';

interface AiHandoverSummaryWidgetProps {
  title: string;
  messages: any[];
  compact?: boolean;
}

export function AiHandoverSummaryWidget({ title, messages, compact = false }: AiHandoverSummaryWidgetProps) {
  const [summary, setSummary] = useState<AiHandoverSummaryResult>(() => generateAiHandoverSummary(title, messages));
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleRegenerate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSummary(generateAiHandoverSummary(title, messages));
    toast.success('Resumo de Troca de Turno reatualizado pela IA!');
  };

  const handleCopy = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const textToCopy = `📝 RESUMO DE TROCA DE TURNO (IA COPILOTO):\n\n` +
      summary.bulletPoints.map(b => `${b.icon} ${b.title}:\n${b.text}`).join('\n\n');
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success('Resumo copiado para a área de transferência!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-slate-100 rounded-2xl border border-indigo-500/30 p-4 shadow-xl space-y-3 transition-all duration-300">
      {/* Cabeçalho do Card */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center justify-between cursor-pointer group ${isExpanded ? 'border-b border-indigo-500/20 pb-2.5' : ''}`}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 group-hover:bg-indigo-600/40 transition-colors">
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-indigo-200 uppercase tracking-wider flex items-center gap-1.5 group-hover:text-indigo-100 transition-colors">
              Resumo de Troca de Turno (IA)
            </h4>
            <p className="text-[10px] text-slate-400 group-hover:text-slate-300 transition-colors">
              Síntese gerada às {summary.generatedAt}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {isExpanded && (
            <button
              onClick={handleRegenerate}
              title="Atualizar Resumo IA"
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={handleCopy}
            title="Copiar Resumo"
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Conteúdo Expansível */}
      {isExpanded && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200 space-y-3">
          {/* 3 Tópicos Executivos */}
          <div className="space-y-2.5">
            {summary.bulletPoints.map((item, index) => (
              <div key={index} className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 space-y-1">
                <p className="text-[11px] font-bold text-indigo-300 flex items-center gap-1.5">
                  <span>{item.icon}</span>
                  <span>{item.title}</span>
                </p>
                <p className="text-xs text-slate-200 leading-relaxed font-medium pl-5">
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          {/* Rodapé com botão de copiar formatado */}
          <button
            onClick={handleCopy}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            Copiar Resumo para Transbordo de Turno
          </button>
        </div>
      )}
    </div>
  );
}
