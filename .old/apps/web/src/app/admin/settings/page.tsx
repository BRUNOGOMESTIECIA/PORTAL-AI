"use client";

import { BuildingOfficeIcon, KeyIcon } from "@heroicons/react/24/outline";

export default function SettingsPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Configurações Gerais</h1>
        <p className="text-gray-400 mt-2">Gerencie os detalhes da sua empresa e chaves de API.</p>
      </div>

      <div className="space-y-6">
        {/* Perfil da Empresa */}
        <div className="bg-[#111111] rounded-2xl shadow-xl border border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-800 flex items-center gap-3 bg-[#0A0A0A]">
            <BuildingOfficeIcon className="w-6 h-6 text-blue-400" />
            <h2 className="text-lg font-bold text-white">Perfil da Empresa</h2>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-1.5">Nome Fantasia</label>
              <input type="text" defaultValue="Acme Corporation" className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all font-medium" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-1.5">Subdomínio (Slug)</label>
              <input type="text" disabled defaultValue="acme-corp" className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed font-mono text-sm" />
              <p className="text-xs text-gray-500 mt-2">O subdomínio não pode ser alterado após a criação.</p>
            </div>
            
            <div className="pt-4 flex justify-end">
               <button className="px-6 py-2.5 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-700 transition-all">
                 Salvar Perfil
               </button>
            </div>
          </div>
        </div>

        {/* Chaves de API */}
        <div className="bg-[#111111] rounded-2xl shadow-xl border border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-800 flex items-center gap-3 bg-[#0A0A0A]">
            <KeyIcon className="w-6 h-6 text-purple-400" />
            <h2 className="text-lg font-bold text-white">Configurações de IA (API Keys)</h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-400 mb-6">
              Você pode inserir sua própria chave da OpenAI (ChatGPT) para processar seus PDFs. Se deixado em branco, utilizaremos a chave padrão do seu plano e os limites serão aplicados.
            </p>
            
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-1.5">OpenAI API Key (Opcional)</label>
              <input type="password" placeholder="sk-..." className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500/50 outline-none transition-all font-mono text-sm" />
            </div>

            <div className="mt-6 pt-6 border-t border-gray-800 flex justify-end">
               <button className="px-6 py-2.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.4)] transition-all">
                 Salvar Chaves
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
