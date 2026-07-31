import React, { useState } from 'react';
import { ShieldCheck, FileText, Lock, X, Printer, Cookie, ExternalLink, Scale, CheckCircle2 } from 'lucide-react';
import { useEscapeModal } from '../../hooks/use-escape-modal';
import { toast } from 'sonner';

export function CorporateFooterWidget() {
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | null>(null);

  useEscapeModal(!!activeModal, () => setActiveModal(null));

  const handlePrintLegal = () => {
    window.print();
    toast.success('Documento de Conformidade LGPD enviado para impressão.');
  };

  return (
    <>
      {/* ── RODAPÉ CORPORATIVO ── */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md py-4 px-6 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          {/* Direitos Reservados */}
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              © 2026 Portal ITSM & InstaPasso Governança.
            </span>
            <span className="hidden sm:inline text-slate-400">Todos os direitos reservados.</span>
          </div>

          {/* Links Legais LGPD */}
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <button
              type="button"
              onClick={() => setActiveModal('privacy')}
              className="hover:text-blue-600 dark:hover:text-blue-400 font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5 text-blue-500" />
              <span>Política de Privacidade (LGPD)</span>
            </button>

            <span className="text-slate-300 dark:text-slate-700">•</span>

            <button
              type="button"
              onClick={() => setActiveModal('terms')}
              className="hover:text-blue-600 dark:hover:text-blue-400 font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <Scale className="w-3.5 h-3.5 text-purple-500" />
              <span>Termos de Uso & SLA</span>
            </button>

            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>

            <span className="text-[10px] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-0.5 rounded-full font-mono font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-500" />
              ISO 27001 & LGPD Art. 7º
            </span>
          </div>
        </div>
      </footer>

      {/* ── MODAL DA POLÍTICA DE PRIVACIDADE LGPD ── */}
      {activeModal === 'privacy' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden text-slate-800 dark:text-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-200 dark:border-blue-800">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                    Política de Privacidade Corporativa (LGPD Lei nº 13.709/2018)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Governança e proteção dos dados pessoais de clientes e técnicos.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content Scrollable */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl space-y-1">
                <span className="font-extrabold text-blue-900 dark:text-blue-300 block">
                  Encarregado de Dados (DPO / Data Protection Officer):
                </span>
                <p className="text-[11px] text-blue-700 dark:text-blue-400 font-mono">
                  dpo@portal-itsm-empresa.com.br | Atendimento em conformidade com o Artigo 41 da LGPD.
                </p>
              </div>

              <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm pt-2">
                1. Base Legal e Finalidade do Tratamento (Art. 7º, I e IX)
              </h4>
              <p>
                Coletamos e armazenamos estritamente os dados necessários para o cumprimento de contrato de prestação de serviços de TI (SLA), incluindo nome, e-mail corporativo, endereço IP de conexão e histórico de tickets.
              </p>

              <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm pt-2">
                2. Direitos do Titular dos Dados (Art. 18 da LGPD)
              </h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Confirmação da existência de tratamento e acesso aos seus chamados abertos.</li>
                <li>Correção de dados incompletos, inexatos ou desatualizados.</li>
                <li>Anonimização de dados pessoais inativos após o encerramento do contrato (mantendo retenção legal de logs do Marco Civil da Internet por 6 meses).</li>
              </ul>

              <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm pt-2">
                3. Segurança da Informação e Criptografia
              </h4>
              <p>
                Todos os dados em trânsito são protegidos por TLS 1.3 (HTTPS) e backups em banco de dados Firestore são criptografados com cifra AES-256-GCM sob controle de acesso baseado em papéis (RBAC).
              </p>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrintLegal}
                className="px-3.5 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Política</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl text-xs transition-all shadow-md cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL DOS TERMOS DE USO ── */}
      {activeModal === 'terms' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden text-slate-800 dark:text-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 rounded-2xl border border-purple-200 dark:border-purple-800">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                    Termos de Uso do Portal & Compromisso de SLA
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Regras de utilização do sistema de chamados e atendimento corporativo.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content Scrollable */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                1. Escopo do Serviço de Atendimento ITSM
              </h4>
              <p>
                O Portal ITSM destina-se ao registro, acompanhamento e resolução de chamados de suporte técnico, gestão de acessos e monitoramento de equipamentos corporativos.
              </p>

              <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                2. Níveis de Serviço (SLA B2B)
              </h4>
              <p>
                Os prazos de resposta inicial e resolução são calculados em tempo real de acordo com a prioridade atribuída (Crítico: 1h / Alto: 4h / Médio: 12h / Baixo: 24h) com monitoramento contínuo da equipe N1/N2.
              </p>

              <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                3. Uso Aceitável e Segurança de Credenciais
              </h4>
              <p>
                As credenciais de acesso SSO InstaPasso são pessoais e intransferíveis. O usuário concorda em não compartilhar senhas e notificar a equipe de TI em caso de qualquer atividade suspeita.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-extrabold rounded-xl text-xs transition-all shadow-md cursor-pointer"
              >
                Ciente dos Termos
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
