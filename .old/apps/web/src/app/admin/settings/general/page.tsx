"use client";

import { useState } from "react";
import { BuildingOfficeIcon, GlobeAltIcon, PaintBrushIcon } from "@heroicons/react/24/outline";

export default function GeneralSettingsPage() {
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => setSaving(false), 800); // mock save
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Configurações Gerais</h1>
          <p className="text-gray-500 mt-1">Gerencie os dados da sua organização e preferências do painel.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <form onSubmit={handleSave}>
          <div className="p-8 space-y-10">
            
            {/* Section 1 */}
            <div>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <BuildingOfficeIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Perfil da Empresa</h2>
                  <p className="text-sm text-gray-500">Dados públicos do seu tenant.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome da Empresa</label>
                  <input type="text" defaultValue="Acme Corp" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email de Suporte</label>
                  <input type="email" defaultValue="ajuda@acme.com" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Logo</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400">
                      Logo
                    </div>
                    <button type="button" className="px-4 py-2 bg-white border border-gray-200 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                      Fazer Upload
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <GlobeAltIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Localização & Idioma</h2>
                  <p className="text-sm text-gray-500">Preferências regionais para exibição de dados.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Fuso Horário</label>
                  <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all">
                    <option>America/Sao_Paulo (GMT-3)</option>
                    <option>America/New_York (EST)</option>
                    <option>Europe/London (GMT)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Idioma Padrão</label>
                  <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all">
                    <option>Português (BR)</option>
                    <option>English (US)</option>
                    <option>Español</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="p-2 bg-pink-50 text-pink-600 rounded-lg">
                  <PaintBrushIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Personalidade da IA</h2>
                  <p className="text-sm text-gray-500">Como o bot deve se portar ao responder clientes.</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tom de Voz</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <label className="relative flex cursor-pointer rounded-xl border border-blue-600 bg-blue-50/50 p-4 shadow-sm focus:outline-none">
                    <input type="radio" name="tone" value="friendly" className="sr-only" defaultChecked />
                    <span className="flex flex-1">
                      <span className="flex flex-col">
                        <span className="block text-sm font-bold text-blue-900">Amigável</span>
                        <span className="mt-1 flex items-center text-xs text-blue-700">Usa emojis, tom próximo e informal.</span>
                      </span>
                    </span>
                    <CheckBadgeIcon className="h-5 w-5 text-blue-600" />
                  </label>
                  
                  <label className="relative flex cursor-pointer rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:bg-gray-50">
                    <input type="radio" name="tone" value="professional" className="sr-only" />
                    <span className="flex flex-1">
                      <span className="flex flex-col">
                        <span className="block text-sm font-bold text-gray-900">Profissional</span>
                        <span className="mt-1 flex items-center text-xs text-gray-500">Direto, formal e focado na solução.</span>
                      </span>
                    </span>
                  </label>
                  
                  <label className="relative flex cursor-pointer rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:bg-gray-50">
                    <input type="radio" name="tone" value="technical" className="sr-only" />
                    <span className="flex flex-1">
                      <span className="flex flex-col">
                        <span className="block text-sm font-bold text-gray-900">Técnico</span>
                        <span className="mt-1 flex items-center text-xs text-gray-500">Focado em detalhes e passos lógicos.</span>
                      </span>
                    </span>
                  </label>
                </div>
              </div>
            </div>

          </div>

          <div className="px-8 py-5 bg-gray-50/80 border-t border-gray-100 flex items-center justify-end gap-3">
            <button type="button" className="px-5 py-2.5 rounded-xl font-medium text-gray-700 hover:bg-gray-200 transition-colors">
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={saving}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold shadow-md hover:bg-blue-700 hover:shadow-lg transition-all disabled:opacity-70 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Salvando...
                </>
              ) : "Salvar Configurações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
import { CheckBadgeIcon } from "@heroicons/react/24/solid";
