import React, { useState, useEffect } from 'react';
import { Compass, ChevronRight, ChevronLeft, CheckCircle2, X, Sparkles, Search, MessageCircle, Clock, Bot, BarChart3, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { logAuditEvent } from '../../lib/audit-logger';

export interface TourStep {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  badge: string;
  highlightText: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Barra de Busca Global (Ctrl + K)',
    subtitle: 'Pesquisa instantânea em todo o portal',
    description: 'Pressione Ctrl + K a qualquer momento para buscar protocolos (#2026XXXX), nomes de clientes, tickets e artigos da Base de Conhecimento.',
    icon: Search,
    badge: 'Atalho Ctrl + K',
    highlightText: '🔍 Busca Rápida de Tickets e Clientes',
  },
  {
    title: 'Fila de Chat ao Vivo & Transbordo',
    subtitle: 'Atendimento simultâneo em tempo real',
    description: 'Gerencie múltiplos atendimentos em tempo real, visualize a posição na fila e envie figurinhas, arquivos e respostas rápidas com o atalho "/".',
    icon: MessageCircle,
    badge: 'Chat Multicanal',
    highlightText: '💬 Atendimento ao Vivo e Filas',
  },
  {
    title: 'Cronômetro Visual de SLA',
    subtitle: 'Temporizador dinâmico com alertas coloridos',
    description: 'Acompanhe a contagem regressiva em tempo real dos seus chamados. O sistema avisa automaticamente quando o SLA atingir 90% para evitar estouro.',
    icon: Clock,
    badge: 'Controle de SLA',
    highlightText: '🟢 🟡 🔴 SLA em Tempo Real',
  },
  {
    title: 'Copiloto de IA (@ia no Comentário)',
    subtitle: 'Assistente técnico confidencial para a equipe',
    description: 'Digite @ia ou @copilot dentro da caixa de nota interna confidencial para pedir auxílio técnico, resumos de erros e sugestões da KB sem o cliente ver.',
    icon: Bot,
    badge: 'Inteligência Artificial',
    highlightText: '🤖 Copiloto IA Confidencial',
  },
  {
    title: 'Relatórios Executivos & CSAT',
    subtitle: 'Laudos em PDF, Excel e Imagem HD',
    description: 'Acompanhe o índice de satisfação dos clientes (CSAT 1 a 5 estrelas), leaderboard dos atendentes e exporte relatórios executivos prontos para impressão.',
    icon: BarChart3,
    badge: 'Métricas & Governança',
    highlightText: '📊 Relatórios em PDF & Excel',
  },
];

interface OnboardingTourWidgetProps {
  userId?: string;
  autoStart?: boolean;
}

export function OnboardingTourWidget({ userId = 'user_default', autoStart = false }: OnboardingTourWidgetProps) {
  const storageKey = `itsm_onboarding_completed_${userId}`;
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const hasCompleted = localStorage.getItem(storageKey);
    if (!hasCompleted && autoStart) {
      // Auto inicia no primeiro acesso
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [storageKey, autoStart]);

  const currentStep = TOUR_STEPS[currentStepIndex];
  const StepIcon = currentStep.icon;

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(storageKey, 'true');
    setIsOpen(false);
    logAuditEvent('ONBOARDING_TOUR_COMPLETED', `Usuário concluiu o Tour Guiado no primeiro acesso (${TOUR_STEPS.length} passos).`);
    toast.success('🎉 Tour Guiado concluído! Você pode iniciá-lo novamente a qualquer momento no menu de ajuda.');
  };

  const handleSkip = () => {
    localStorage.setItem(storageKey, 'true');
    setIsOpen(false);
    toast.info('Tour guiado pulado. Clique em "❓ Tutorial" no topo para rever.');
  };

  const handleManualStart = () => {
    setCurrentStepIndex(0);
    setIsOpen(true);
  };

  return (
    <>
      {/* Botão de Disparo Manual na Header / Barra */}
      <button
        type="button"
        onClick={handleManualStart}
        className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 font-bold text-xs rounded-xl transition-all border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
        title="Iniciar Tutorial Guiado no Primeiro Acesso (Item 090)"
      >
        <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
        <span className="hidden sm:inline">Tutorial Guiado</span>
      </button>

      {/* Modal / Popover Spotlight do Tour */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl w-full max-w-xl text-slate-100 overflow-hidden flex flex-col space-y-5 p-6 relative">
            {/* Header do Passo */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-2xl">
                  <Compass className="w-6 h-6 animate-spin-slow" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                    Passo {currentStepIndex + 1} de {TOUR_STEPS.length}
                  </span>
                  <h3 className="text-base font-extrabold text-white mt-1">
                    {currentStep.title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSkip}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Pular Tutorial"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo do Passo */}
            <div className="space-y-4 py-2">
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center gap-2.5 text-sm font-bold text-amber-300">
                  <StepIcon className="w-5 h-5 text-amber-400" />
                  <span>{currentStep.highlightText}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {currentStep.description}
                </p>
              </div>

              {/* Indicador de Progresso em Pontos */}
              <div className="flex items-center justify-center gap-1.5 pt-2">
                {TOUR_STEPS.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentStepIndex
                        ? 'w-6 bg-blue-500'
                        : 'w-2 bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Footer de Navegação */}
            <div className="flex items-center justify-between border-t border-slate-800 pt-4">
              <button
                type="button"
                onClick={handleSkip}
                className="text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer px-2 py-1"
              >
                Pular Tour
              </button>

              <div className="flex items-center gap-2">
                {currentStepIndex > 0 && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" /> Anterior
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>
                    {currentStepIndex === TOUR_STEPS.length - 1 ? 'Concluir Tutorial' : 'Próximo'}
                  </span>
                  {currentStepIndex === TOUR_STEPS.length - 1 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
