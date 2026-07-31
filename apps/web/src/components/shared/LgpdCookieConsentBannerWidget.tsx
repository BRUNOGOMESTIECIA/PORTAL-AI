import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, Settings, Check, X, Lock, BarChart, Sliders } from 'lucide-react';
import { toast } from 'sonner';
import { logAuditEvent } from '../../lib/audit-logger';

export interface CookiePreferences {
  necessary: boolean; // Sempre true (HttpOnly, Secure, SameSite=Strict)
  analytics: boolean;
  preferences: boolean;
  consentedAt?: string;
}

const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  analytics: true,
  preferences: true,
};

export function LgpdCookieConsentBannerWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [prefs, setPrefs] = useState<CookiePreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    const saved = localStorage.getItem('lgpd_cookie_consent');
    if (!saved) {
      // Exibe o banner de consentimento no primeiro acesso
      const timer = setTimeout(() => setIsOpen(true), 800);
      return () => clearTimeout(timer);
    } else {
      try {
        setPrefs(JSON.parse(saved));
      } catch (err) {
        setIsOpen(true);
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const updated: CookiePreferences = {
      necessary: true,
      analytics: true,
      preferences: true,
      consentedAt: new Date().toISOString(),
    };
    saveConsent(updated);
    toast.success('🍪 Todos os cookies aceitos com sucesso! Suas preferências foram salvas.');
  };

  const handleRejectOptional = () => {
    const updated: CookiePreferences = {
      necessary: true,
      analytics: false,
      preferences: false,
      consentedAt: new Date().toISOString(),
    };
    saveConsent(updated);
    toast.info('🍪 Apenas os cookies estritamente necessários (Segurança & SSO) foram mantidos.');
  };

  const handleSaveCustom = () => {
    const updated: CookiePreferences = {
      ...prefs,
      necessary: true,
      consentedAt: new Date().toISOString(),
    };
    saveConsent(updated);
    toast.success('🍪 Preferências de cookies salvas com sucesso!');
  };

  const saveConsent = (updated: CookiePreferences) => {
    setPrefs(updated);
    localStorage.setItem('lgpd_cookie_consent', JSON.stringify(updated));
    setIsOpen(false);

    logAuditEvent(
      'LGPD_COOKIE_CONSENT_UPDATED',
      `Consentimento de cookies atualizado (Necessários: SIM | Analíticos: ${updated.analytics ? 'SIM' : 'NÃO'} | Preferências: ${updated.preferences ? 'SIM' : 'NÃO'}).`
    );
  };

  const handleReopenBanner = () => {
    setShowDetails(true);
    setIsOpen(true);
  };

  return (
    <>
      {/* Botão de Rodapé para Alterar Preferências a Qualquer Momento */}
      {!isOpen && (
        <button
          type="button"
          onClick={handleReopenBanner}
          className="fixed bottom-3 left-3 z-40 px-2.5 py-1 bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl text-[11px] font-bold shadow-lg flex items-center gap-1.5 cursor-pointer backdrop-blur-sm transition-all hover:scale-105"
          title="Gerenciar Preferências de Cookies LGPD"
        >
          <Cookie className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Cookies LGPD</span>
        </button>
      )}

      {/* Banner Floating de Consentimento */}
      {isOpen && (
        <div className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-xl z-50 bg-slate-900/95 border border-slate-700/90 rounded-3xl p-5 shadow-2xl text-slate-100 backdrop-blur-xl animate-in slide-in-from-bottom duration-300 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl">
                <Cookie className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
                  Gestão de Consentimento de Cookies (LGPD)
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                    Item 014
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Respeitamos sua privacidade (LGPD Art. 7º, I e IX).
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{showDetails ? 'Ocultar' : 'Personalizar'}</span>
            </button>
          </div>

          {/* Resumo da Mensagem */}
          <p className="text-xs text-slate-300 leading-relaxed">
            Utilizamos cookies essenciais criptografados para garantir a autenticação segura do SSO InstaPasso (<code className="text-amber-300 font-mono">HttpOnly, Secure, SameSite=Strict</code>) e cookies analíticos para otimizar sua experiência no portal.
          </p>

          {/* Painel Detalhado de Categorias */}
          {showDetails && (
            <div className="space-y-2.5 bg-slate-950 p-3.5 rounded-2xl border border-slate-800 animate-in fade-in duration-200 text-xs">
              {/* Categoria 1: Necessários */}
              <div className="flex items-center justify-between p-2 bg-slate-900/80 rounded-xl border border-slate-800">
                <div className="space-y-0.5 pr-2">
                  <span className="font-extrabold text-white flex items-center gap-1.5 text-[11px]">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    1. Cookies Necessários & SSO (Obrigatório)
                  </span>
                  <p className="text-[10px] text-slate-400">
                    Essenciais para a sessão, prevenção contra CSRF e autenticação segura.
                  </p>
                </div>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full shrink-0">
                  Sempre Ativo
                </span>
              </div>

              {/* Categoria 2: Analíticos */}
              <div className="flex items-center justify-between p-2 bg-slate-900/80 rounded-xl border border-slate-800">
                <div className="space-y-0.5 pr-2">
                  <span className="font-extrabold text-white flex items-center gap-1.5 text-[11px]">
                    <BarChart className="w-3.5 h-3.5 text-blue-400" />
                    2. Cookies Analíticos & Desempenho
                  </span>
                  <p className="text-[10px] text-slate-400">
                    Ajudam a medir o tempo de carregamento e o desempenho das requisições.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={prefs.analytics}
                    onChange={(e) => setPrefs({ ...prefs, analytics: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4.5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-blue-600" />
                </label>
              </div>

              {/* Categoria 3: Preferências */}
              <div className="flex items-center justify-between p-2 bg-slate-900/80 rounded-xl border border-slate-800">
                <div className="space-y-0.5 pr-2">
                  <span className="font-extrabold text-white flex items-center gap-1.5 text-[11px]">
                    <Settings className="w-3.5 h-3.5 text-purple-400" />
                    3. Preferências de Layout & Tema
                  </span>
                  <p className="text-[10px] text-slate-400">
                    Armazenam suas preferências de tema (Dark/Light) e densidade de tabela.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={prefs.preferences}
                    onChange={(e) => setPrefs({ ...prefs, preferences: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4.5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-purple-600" />
                </label>
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={handleRejectOptional}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Rejeitar Opcionais
            </button>

            {showDetails && (
              <button
                type="button"
                onClick={handleSaveCustom}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-xl transition-colors shadow-md cursor-pointer"
              >
                Salvar Escolha
              </button>
            )}

            <button
              type="button"
              onClick={handleAcceptAll}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Aceitar Todos os Cookies</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
