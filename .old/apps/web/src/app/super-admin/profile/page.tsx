"use client";

import { useState } from "react";
import { 
  UserCircleIcon, 
  KeyIcon, 
  ComputerDesktopIcon, 
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  CheckBadgeIcon
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("general");
  const [name, setName] = useState("Plataforma Owner");
  const [email, setEmail] = useState("owner@saas.com");
  
  // Mocks for sessions
  const sessions = [
    { id: 1, device: "MacBook Pro - Safari", location: "São Paulo, SP", ip: "177.42.100.2", time: "Atual", active: true, icon: ComputerDesktopIcon },
    { id: 2, device: "iPhone 13 - Safari", location: "São Paulo, SP", ip: "177.42.100.2", time: "Ontem, 14:30", active: false, icon: DevicePhoneMobileIcon },
    { id: 3, device: "Windows 11 - Chrome", location: "Rio de Janeiro, RJ", ip: "189.10.55.12", time: "Há 3 dias", active: false, icon: ComputerDesktopIcon },
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Perfil atualizado com sucesso!");
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Senha alterada! Use a nova senha no próximo login.");
  };

  const handleRevokeSession = (id: number) => {
    toast.success("Sessão revogada com segurança.");
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-20">
      
      {/* Header */}
      <div className="mb-8 flex items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center font-bold text-white shadow-xl text-3xl border-4 border-[#050505]">
          {name.charAt(0)}
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Meu Perfil
            <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-xs font-bold border border-purple-500/20 uppercase tracking-wider flex items-center gap-1">
               <ShieldCheckIcon className="w-3.5 h-3.5" /> Super Admin
            </span>
          </h1>
          <p className="text-gray-400 mt-1">Gerencie suas informações pessoais, segurança e sessões ativas.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800 mb-8">
         <div className="flex gap-8">
            <button 
              onClick={() => setActiveTab("general")}
              className={`pb-4 text-sm font-bold transition-colors border-b-2 flex items-center gap-2 ${activeTab === "general" ? "border-purple-500 text-purple-400" : "border-transparent text-gray-500 hover:text-gray-300"}`}
            >
              <UserCircleIcon className="w-5 h-5" /> Informações Básicas
            </button>
            <button 
              onClick={() => setActiveTab("security")}
              className={`pb-4 text-sm font-bold transition-colors border-b-2 flex items-center gap-2 ${activeTab === "security" ? "border-purple-500 text-purple-400" : "border-transparent text-gray-500 hover:text-gray-300"}`}
            >
              <KeyIcon className="w-5 h-5" /> Senha e Segurança
            </button>
            <button 
              onClick={() => setActiveTab("sessions")}
              className={`pb-4 text-sm font-bold transition-colors border-b-2 flex items-center gap-2 ${activeTab === "sessions" ? "border-purple-500 text-purple-400" : "border-transparent text-gray-500 hover:text-gray-300"}`}
            >
              <ComputerDesktopIcon className="w-5 h-5" /> Sessões Ativas
            </button>
         </div>
      </div>

      <div className="bg-[#111111] border border-gray-800 rounded-2xl shadow-xl overflow-hidden min-h-[400px]">
        
        {/* General Tab */}
        {activeTab === "general" && (
          <div className="p-8 animate-in fade-in">
             <h2 className="text-xl font-bold text-white mb-6">Informações Pessoais</h2>
             <form onSubmit={handleSaveProfile} className="space-y-6 max-w-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="md:col-span-2">
                     <label className="block text-sm font-bold text-gray-400 mb-2">Nome Completo</label>
                     <input 
                       type="text" 
                       value={name}
                       onChange={(e) => setName(e.target.value)}
                       className="w-full bg-[#0A0A0A] border border-gray-800 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                     />
                   </div>
                   <div className="md:col-span-2">
                     <label className="block text-sm font-bold text-gray-400 mb-2">E-mail de Acesso</label>
                     <input 
                       type="email" 
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       className="w-full bg-[#0A0A0A] border border-gray-800 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                     />
                     <p className="text-xs text-gray-500 mt-2">Este e-mail é utilizado para login e recuperação de conta.</p>
                   </div>
                </div>
                
                <div className="pt-4 border-t border-gray-800 flex justify-end">
                  <button type="submit" className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold shadow-[0_0_15px_rgba(147,51,234,0.3)] transition-all">
                    Salvar Alterações
                  </button>
                </div>
             </form>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="p-8 animate-in fade-in">
             <h2 className="text-xl font-bold text-white mb-6">Alterar Senha</h2>
             <form onSubmit={handleSavePassword} className="space-y-6 max-w-xl">
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">Senha Atual</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full bg-[#0A0A0A] border border-gray-800 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">Nova Senha</label>
                  <input 
                    type="password" 
                    placeholder="Mínimo de 8 caracteres"
                    className="w-full bg-[#0A0A0A] border border-gray-800 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">Confirmar Nova Senha</label>
                  <input 
                    type="password" 
                    placeholder="Mínimo de 8 caracteres"
                    className="w-full bg-[#0A0A0A] border border-gray-800 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                  />
                </div>
                
                <div className="pt-4 border-t border-gray-800 flex justify-end">
                  <button type="submit" className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold transition-all border border-gray-700">
                    Atualizar Senha
                  </button>
                </div>
             </form>

             <div className="mt-12 pt-8 border-t border-gray-800">
               <h2 className="text-xl font-bold text-white mb-2">Autenticação em Dois Fatores (2FA)</h2>
               <p className="text-sm text-gray-400 mb-4">Adicione uma camada extra de segurança à sua conta de God Mode.</p>
               <button className="px-5 py-2.5 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-xl font-bold hover:bg-blue-500/20 transition-all">
                 Configurar 2FA (Em Breve)
               </button>
             </div>
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === "sessions" && (
          <div className="p-0 animate-in fade-in">
             <div className="p-8 border-b border-gray-800">
               <h2 className="text-xl font-bold text-white">Dispositivos Conectados</h2>
               <p className="text-sm text-gray-400 mt-1">Aqui estão os dispositivos que fizeram login na sua conta recentemente. Se você não reconhece algum, revogue o acesso imediatamente.</p>
             </div>

             <div className="divide-y divide-gray-800">
               {sessions.map(session => (
                 <div key={session.id} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400">
                         <session.icon className="w-6 h-6" />
                       </div>
                       <div>
                         <div className="flex items-center gap-2">
                            <h3 className="text-white font-bold">{session.device}</h3>
                            {session.active && (
                              <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-wider border border-green-500/20">
                                Esta Sessão
                              </span>
                            )}
                         </div>
                         <p className="text-sm text-gray-400 mt-0.5">{session.location} • {session.ip}</p>
                         <p className="text-xs text-gray-500 mt-1">{session.time}</p>
                       </div>
                    </div>
                    
                    {!session.active && (
                      <button 
                        onClick={() => handleRevokeSession(session.id)}
                        className="px-4 py-2 text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                      >
                        Revogar Acesso
                      </button>
                    )}
                 </div>
               ))}
             </div>
          </div>
        )}

      </div>

    </div>
  );
}
