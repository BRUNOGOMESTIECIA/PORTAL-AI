"use client";

import { useState } from "react";
import { BrandingForm } from "../../../components/settings/BrandingForm";
import { 
  BuildingOfficeIcon, 
  PaintBrushIcon, 
  ShieldCheckIcon,
  GlobeAltIcon,
  BellAlertIcon,
  EnvelopeIcon
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function PlatformSettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Configurações gerais atualizadas com sucesso!");
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Políticas de segurança aplicadas a todos os usuários.");
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-32">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">Configurações da Plataforma</h1>
        <p className="text-gray-400">Gerencie a identidade visual, segurança e os parâmetros globais do seu SaaS B2B.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
         {/* Sidebar menu */}
         <aside className="w-full md:w-64 flex-shrink-0 space-y-1">
            <button onClick={() => setActiveTab("general")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${activeTab === 'general' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
              <BuildingOfficeIcon className="w-5 h-5" />
              Geral & Localização
            </button>
            <button onClick={() => setActiveTab("branding")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${activeTab === 'branding' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
              <PaintBrushIcon className="w-5 h-5" />
              White-Label & Marca
            </button>
            <button onClick={() => setActiveTab("security")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${activeTab === 'security' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
              <ShieldCheckIcon className="w-5 h-5" />
              Segurança & Acesso
            </button>
            <button onClick={() => setActiveTab("notifications")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${activeTab === 'notifications' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
              <BellAlertIcon className="w-5 h-5" />
              Notificações do Sistema
            </button>
         </aside>

         {/* Content Area */}
         <div className="flex-1">
            {activeTab === 'general' && (
              <div className="bg-[#111111] border border-gray-800 rounded-2xl p-6 md:p-8 shadow-xl animate-in fade-in duration-300">
                <h2 className="text-xl font-bold text-white mb-6">Informações Globais</h2>
                <form onSubmit={handleSaveGeneral} className="space-y-6">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <div>
                       <label className="block text-sm font-bold text-gray-400 mb-1.5">Nome da Plataforma (Master)</label>
                       <input type="text" defaultValue="SaaS Control Plane" className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all" />
                     </div>
                     <div>
                       <label className="block text-sm font-bold text-gray-400 mb-1.5">E-mail de Resposta Padrão</label>
                       <input type="email" defaultValue="support@saascontrol.com" className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all" />
                     </div>
                   </div>

                   <hr className="border-gray-800" />
                   
                   <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><GlobeAltIcon className="w-6 h-6"/> Localização & Moeda</h2>
                   
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <div>
                       <label className="block text-sm font-bold text-gray-400 mb-1.5">Moeda Principal (Faturamento)</label>
                       <select className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all">
                         <option>BRL - Real Brasileiro (R$)</option>
                         <option>USD - Dólar Americano ($)</option>
                         <option>EUR - Euro (€)</option>
                       </select>
                     </div>
                     <div>
                       <label className="block text-sm font-bold text-gray-400 mb-1.5">Fuso Horário Padrão dos SLAs</label>
                       <select className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all">
                         <option>America/Sao_Paulo (GMT-3)</option>
                         <option>America/New_York (GMT-4)</option>
                         <option>Europe/London (GMT+1)</option>
                       </select>
                     </div>
                   </div>

                   <div className="pt-4 flex justify-end">
                     <button type="submit" className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold shadow-lg transition-all">
                       Salvar Configurações
                     </button>
                   </div>
                </form>
              </div>
            )}

            {activeTab === 'branding' && (
              <div className="animate-in fade-in duration-300">
                <BrandingForm isTenantScope={false} />
              </div>
            )}

            {activeTab === 'security' && (
              <div className="bg-[#111111] border border-gray-800 rounded-2xl p-6 md:p-8 shadow-xl animate-in fade-in duration-300">
                <h2 className="text-xl font-bold text-white mb-6">Políticas de Segurança (Master)</h2>
                <form onSubmit={handleSaveSecurity} className="space-y-6">
                   
                   <div className="flex items-start gap-4 p-4 border border-gray-800 rounded-xl bg-[#0A0A0A]">
                      <input type="checkbox" defaultChecked className="mt-1 w-5 h-5 text-purple-600 bg-gray-900 border-gray-700 rounded focus:ring-purple-500/50" />
                      <div>
                        <h4 className="text-white font-bold">Forçar 2FA (Autenticação em Dois Fatores)</h4>
                        <p className="text-sm text-gray-400 mt-1">Obriga todos os administradores e técnicos a utilizarem um aplicativo autenticador (ex: Google Authenticator) no próximo login.</p>
                      </div>
                   </div>

                   <div className="flex items-start gap-4 p-4 border border-gray-800 rounded-xl bg-[#0A0A0A]">
                      <input type="checkbox" defaultChecked className="mt-1 w-5 h-5 text-purple-600 bg-gray-900 border-gray-700 rounded focus:ring-purple-500/50" />
                      <div>
                        <h4 className="text-white font-bold">Sessão Expirável</h4>
                        <p className="text-sm text-gray-400 mt-1">Desconectar usuários inativos automaticamente após 24 horas.</p>
                      </div>
                   </div>

                   <div className="pt-4 flex justify-end">
                     <button type="submit" className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold shadow-lg transition-all flex items-center gap-2">
                       <ShieldCheckIcon className="w-5 h-5"/>
                       Aplicar Políticas
                     </button>
                   </div>
                </form>
              </div>
            )}

            {activeTab === 'notifications' && (
               <div className="bg-[#111111] border border-gray-800 rounded-2xl p-6 md:p-8 shadow-xl animate-in fade-in duration-300 flex flex-col items-center justify-center text-center h-64">
                 <EnvelopeIcon className="w-12 h-12 text-gray-600 mb-4" />
                 <h3 className="text-xl font-bold text-white">Integrações de E-mail</h3>
                 <p className="text-gray-400 mt-2 max-w-sm">
                   Configure as credenciais SMTP (SendGrid, AWS SES) para envio de faturas e notificações transacionais.
                 </p>
                 <button className="mt-6 px-6 py-2 border border-gray-700 text-white rounded-lg font-bold hover:bg-gray-800 transition-colors">
                   Configurar SMTP
                 </button>
               </div>
            )}
         </div>
      </div>
      
    </div>
  );
}
