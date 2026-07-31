import React, { useState } from 'react';
import { Palette, Image as ImageIcon, Sparkles, Eye, Check, RefreshCw, Building2 } from 'lucide-react';
import { toast } from 'sonner';

export interface CompanyThemeConfig {
  primaryColor: string;
  accentColor: string;
  logoUrl?: string;
  customTitle?: string;
}

interface CompanyWhiteLabelCustomizerWidgetProps {
  companyName: string;
  companySlug: string;
  initialTheme?: CompanyThemeConfig;
  onSaveTheme?: (theme: CompanyThemeConfig) => void;
}

const PRESET_PALETTES = [
  { label: 'Azul Corporativo (Padrão)', primary: '#2563eb', accent: '#3b82f6' },
  { label: 'Roxo Tech / Inovação', primary: '#7c3aed', accent: '#a855f7' },
  { label: 'Verde Esmeralda S.A.', primary: '#059669', accent: '#10b981' },
  { label: 'Laranja Energia & Logística', primary: '#ea580c', accent: '#f97316' },
  { label: 'Grafite Premium Dark', primary: '#1e293b', accent: '#475569' },
  { label: 'Vermelho Rubro Financeiro', primary: '#dc2626', accent: '#ef4444' },
];

export function CompanyWhiteLabelCustomizerWidget({
  companyName,
  companySlug,
  initialTheme = {
    primaryColor: '#2563eb',
    accentColor: '#3b82f6',
    logoUrl: '',
    customTitle: `Portal de Atendimento - ${companyName || 'Cliente'}`,
  },
  onSaveTheme,
}: CompanyWhiteLabelCustomizerWidgetProps) {
  const [theme, setTheme] = useState<CompanyThemeConfig>(() => {
    const saved = localStorage.getItem(`whitelabel_theme_${companySlug}`);
    return saved ? JSON.parse(saved) : initialTheme;
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleApplyPreset = (primary: string, accent: string) => {
    const updated = { ...theme, primaryColor: primary, accentColor: accent };
    setTheme(updated);
    toast.success('Paleta de cores selecionada!');
  };

  const handleSave = () => {
    localStorage.setItem(`whitelabel_theme_${companySlug}`, JSON.stringify(theme));
    if (onSaveTheme) onSaveTheme(theme);

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
    toast.success(`Configurações White-Label da empresa "${companyName || companySlug}" salvas com sucesso!`);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 space-y-6 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-2xl shadow-lg shadow-purple-600/30">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              Personalização White-Label por Empresa
              <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                Item 088
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Selecione as cores da marca e a logo do cliente para personalização no InstaPasso.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-extrabold rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center gap-1.5 cursor-pointer"
        >
          {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
          {savedSuccess ? 'Cores Aplicadas!' : 'Salvar Personalização White-Label'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário de Cores e Logo */}
        <div className="space-y-4">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-purple-400" /> Cores da Identidade Visual
          </h4>

          {/* Paletas Pré-definidas */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400">Paletas Recomendadas:</label>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_PALETTES.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleApplyPreset(preset.primary, preset.accent)}
                  className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left text-xs font-semibold text-slate-300 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="truncate pr-1 text-[11px]">{preset.label}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-700 shadow-xs" style={{ backgroundColor: preset.primary }} />
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-700 shadow-xs" style={{ backgroundColor: preset.accent }} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Color Pickers Customizados */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 block">Cor Primária do Portal:</label>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-2 rounded-xl">
                <input
                  type="color"
                  value={theme.primaryColor}
                  onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={theme.primaryColor}
                  onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                  className="w-full bg-transparent font-mono text-xs text-white outline-none font-bold uppercase"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 block">Cor de Destaque / Botões:</label>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-2 rounded-xl">
                <input
                  type="color"
                  value={theme.accentColor}
                  onChange={(e) => setTheme({ ...theme, accentColor: e.target.value })}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={theme.accentColor}
                  onChange={(e) => setTheme({ ...theme, accentColor: e.target.value })}
                  className="w-full bg-transparent font-mono text-xs text-white outline-none font-bold uppercase"
                />
              </div>
            </div>
          </div>

          {/* URL da Logo e Título */}
          <div className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1 flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-blue-400" /> URL da Logo Corporativa do Cliente:
              </label>
              <input
                type="text"
                value={theme.logoUrl || ''}
                onChange={(e) => setTheme({ ...theme, logoUrl: e.target.value })}
                placeholder="https://suaempresa.com.br/logo.png"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Título Personalizado no Cabeçalho:</label>
              <input
                type="text"
                value={theme.customTitle || ''}
                onChange={(e) => setTheme({ ...theme, customTitle: e.target.value })}
                placeholder="Portal de Suporte VIP - TechCorp"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-slate-200 outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Simulador de Preview do Portal em Tempo Real */}
        <div className="space-y-2 flex flex-col">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-emerald-400" /> Pré-Visualização do Portal do Cliente (Live Preview)
          </h4>

          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-inner">
            {/* Simulação de Header do Portal do Cliente */}
            <div
              className="p-3.5 rounded-xl text-white shadow-md flex items-center justify-between transition-all"
              style={{ backgroundColor: theme.primaryColor }}
            >
              <div className="flex items-center gap-2.5">
                {theme.logoUrl ? (
                  <img src={theme.logoUrl} alt="Logo Cliente" className="h-7 max-w-[120px] object-contain rounded" />
                ) : (
                  <div className="p-1.5 bg-white/20 rounded-lg">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                )}
                <div>
                  <span className="text-xs font-black tracking-wide block">
                    {theme.customTitle || companyName || 'Portal do Cliente White-Label'}
                  </span>
                  <span className="text-[10px] opacity-80 font-mono">@{companySlug || 'empresa'}</span>
                </div>
              </div>

              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                SSO InstaPasso
              </span>
            </div>

            {/* Simulação de Botão de Ação Primário com Cor de Destaque */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2.5">
              <span className="text-xs font-bold text-slate-300 block">Abrir Novo Chamado de Suporte:</span>
              <button
                type="button"
                className="w-full py-2 text-xs font-extrabold text-white rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                style={{ backgroundColor: theme.accentColor }}
              >
                <span>➕ Criar Ticket Personalizado</span>
              </button>
            </div>

            {/* Badge demonstrativo */}
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-purple-400 block">
                ✓ Branding Aplicado:
              </span>
              <p className="text-[11px] leading-relaxed text-slate-300">
                Os colaboradores da empresa <strong className="text-white">{companyName || 'cadastrada'}</strong> visualizarão o portal com a logo e paleta de cores primária e secundária configuradas acima.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
