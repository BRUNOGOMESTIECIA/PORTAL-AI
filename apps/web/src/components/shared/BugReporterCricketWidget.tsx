import React, { useState } from 'react';
import { Bug, X, Send, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { useTickets } from '../../hooks/use-tickets';
import { useAuth } from '../../hooks/use-mock-auth';
import { toast } from 'sonner';
import { useEscapeModal } from '../../hooks/use-escape-modal';

export function BugReporterCricketWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('grilo_bug_reporter_dismissed') === 'true';
    }
    return false;
  });
  const [bugDescription, setBugDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { createTicket } = useTickets();
  const { user } = useAuth();

  useEscapeModal(isOpen, () => setIsOpen(false));

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('grilo_bug_reporter_dismissed', 'true');
    }
  };

  const maxChars = 500;
  const remainingChars = maxChars - bugDescription.length;

  const handleSubmitBug = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bugDescription.trim()) {
      toast.error('Por favor, descreva o bug encontrado antes de enviar.');
      return;
    }

    setIsSubmitting(true);
    try {
      const currentUrl = window.location.href;
      const browserInfo = navigator.userAgent;
      const nextNumber = 20261000 + Math.floor(Math.random() * 8999);
      const ticketId = `bug-${Date.now()}`;
      const nowIso = new Date().toISOString();

      const newTicket: any = {
        id: ticketId,
        number: nextNumber,
        title: `[BUG REPORT] ${bugDescription.slice(0, 45)}...`,
        description: bugDescription.trim(),
        status: 'new',
        priority: 'high',
        category: 'Incidente',
        type: 'Incidente',
        team: 'Bug Engenheiros',
        requesterId: user?.id || 'req_bug_reporter',
        requesterName: user?.name || 'Solicitante Anônimo',
        requesterEmail: user?.email || 'bug@insta-passo.com',
        companyName: (user as any)?.companyName || 'InstaPasso Governança',
        companySlug: (user as any)?.companySlug || 'instapasso',
        createdAt: nowIso,
        updatedAt: nowIso,
        comments: [
          {
            id: `c_bug_${Date.now()}`,
            body: `🦗 **METADADOS TÉCNICOS DO AMBIENTE (CAPTURADOS PELO GRILO)**\n• **Mesa de Destino:** Bug Engenheiros\n• **Página de Origem:** ${currentUrl}\n• **Navegador:** ${browserInfo}\n• **Usuário:** ${user?.name || 'Solicitante Anônimo'} (${user?.email || 'Sem e-mail'})\n• **Data/Hora:** ${new Date().toLocaleString('pt-BR')}`,
            senderName: 'Grilo Bug Reporter',
            senderType: 'system',
            createdAt: nowIso,
          }
        ]
      };

      await createTicket(newTicket);

      setIsSuccess(true);
      toast.success('🐛 Bug enviado com sucesso para a mesa Bug Engenheiros!');
      setTimeout(() => {
        setIsSuccess(false);
        setIsOpen(false);
        setBugDescription('');
      }, 2000);
    } catch (error) {
      console.error('Erro ao registrar bug:', error);
      toast.error('Ocorreu um erro ao enviar o bug. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isDismissed) {
    return null;
  }

  return (
    <>
      {/* ── BOTÃO FLUTUANTE DO GRILO (BUG REPORTER) ── */}
      <div className="fixed bottom-5 right-5 z-40 flex items-center gap-1.5 animate-in fade-in slide-in-from-bottom-5 duration-300">
        <div className="relative group">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs px-3.5 py-2.5 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all cursor-pointer border border-amber-300/40"
          >
            <span className="text-base animate-bounce">🦗</span>
            <span className="tracking-wide">Relatar Bug</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          </button>
        </div>

        {/* Botão de fechar/minimizar */}
        <button
          type="button"
          onClick={handleDismiss}
          className="p-1.5 bg-slate-800/90 hover:bg-slate-900 text-slate-400 hover:text-white rounded-full border border-slate-700 shadow-md transition-colors cursor-pointer"
          title="Minimizar Grilo"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── MODAL DE ENVIO DO BUG ── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Cabeçalho */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-2xl">
                  <span className="text-xl">🦗</span>
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    Relatar um Bug / Problema Técnico
                  </h3>
                  <p className="text-xs text-slate-400">
                    Sua mensagem será enviada direto para a mesa <strong className="text-amber-400">Bug Engenheiros</strong>.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo Form */}
            {isSuccess ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30 animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-lg font-bold text-white">Bug Reportado com Sucesso! 🎉</h4>
                <p className="text-xs text-slate-300 max-w-sm mx-auto">
                  A equipe da mesa <strong className="text-amber-400">Bug Engenheiros</strong> foi notificada e já iniciou a análise técnica.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitBug} className="p-6 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Descrição do Bug / Comportamento Inesperado <span className="text-red-400">*</span>
                    </label>
                    <span
                      className={`text-xs font-mono font-bold ${
                        remainingChars < 50 ? 'text-red-400 font-black' : 'text-slate-400'
                      }`}
                    >
                      {bugDescription.length} / {maxChars}
                    </span>
                  </div>
                  <textarea
                    rows={5}
                    maxLength={maxChars}
                    placeholder="Descreva o que aconteceu de errado (máximo 500 caracteres)..."
                    value={bugDescription}
                    onChange={(e) => setBugDescription(e.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-4 text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 text-slate-100 placeholder-slate-500 resize-none transition-all"
                    autoFocus
                  />
                </div>

                <div className="p-3 bg-amber-950/30 border border-amber-500/20 rounded-xl text-[11px] text-amber-300 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>
                    Metadados da página atual e navegador serão incluídos automaticamente no chamado para agilizar o diagnóstico dos engenheiros.
                  </span>
                </div>

                {/* Rodapé Ações */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !bugDescription.trim()}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 text-xs font-black rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Enviando...' : 'Enviar para Bug Engenheiros'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
