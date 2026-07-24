"use client";

import { useState } from "react";
import { BoltIcon, PlusIcon, MegaphoneIcon, RocketLaunchIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function AutomationsPage() {
  const [activeTab, setActiveTab] = useState("automations");
  const [broadcastMsg, setBroadcastMsg] = useState("");

  const [automations, setAutomations] = useState([
    { id: 1, name: "Escalation Vip", trigger: "Quando ticket de 'Enterprise' for criado", action: "Atribuir a 'Técnico Senior' e marcar como Prioridade Alta", status: true },
    { id: 2, name: "Auto-Close Inativos", trigger: "Quando status='Aguardando' por mais de 5 dias", action: "Mudar status para 'Resolvido' e enviar email final", status: true },
    { id: 3, name: "Alerta de Faturamento", trigger: "Quando tag contiver 'billing'", action: "Adicionar 'Alice Gomes' como observador", status: false }
  ]);

  const handleToggle = (id: number) => {
    setAutomations(prev => prev.map(a => a.id === id ? { ...a, status: !a.status } : a));
    toast.success("Status do workflow atualizado");
  };

  const handleBroadcast = () => {
    if (!broadcastMsg) {
      toast.error("Digite uma mensagem para o broadcast");
      return;
    }
    toast.success("Broadcast disparado para todos os tenants!");
    setBroadcastMsg("");
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto pb-10">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
             <BoltIcon className="w-8 h-8 text-yellow-500" />
             Automações & Broadcasts
          </h1>
          <p className="text-gray-400 mt-2">Motor de regras (Workflows) e central de avisos globais.</p>
        </div>
        <button 
          onClick={() => toast("Abertura do Workflow Builder em breve!", { icon: "🚧" })}
          className="px-5 py-2.5 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors shadow-lg flex items-center gap-2"
        >
           <PlusIcon className="w-5 h-5" /> Nova Regra
        </button>
      </div>

      <div className="flex gap-4 border-b border-gray-800 mb-8">
         <button 
           onClick={() => setActiveTab('automations')}
           className={`pb-4 px-2 font-bold text-sm border-b-2 transition-colors ${activeTab === 'automations' ? 'border-yellow-500 text-yellow-400' : 'border-transparent text-gray-500 hover:text-white'}`}
         >
           Workflows de Triagem
         </button>
         <button 
           onClick={() => setActiveTab('broadcast')}
           className={`pb-4 px-2 font-bold text-sm border-b-2 transition-colors ${activeTab === 'broadcast' ? 'border-yellow-500 text-yellow-400' : 'border-transparent text-gray-500 hover:text-white'}`}
         >
           Alertas Globais (Broadcast)
         </button>
      </div>

      {activeTab === 'automations' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {automations.map(auto => (
            <div key={auto.id} className={`p-6 rounded-2xl border ${auto.status ? 'bg-[#111111] border-gray-800' : 'bg-[#050505] border-gray-800/50 opacity-60'} flex flex-col h-full shadow-lg transition-colors`}>
               <div className="flex justify-between items-start mb-4">
                 <div className="p-2 rounded-lg bg-gray-800 text-gray-300">
                    <RocketLaunchIcon className="w-5 h-5" />
                 </div>
                 <div 
                    onClick={() => handleToggle(auto.id)}
                    className={`w-10 h-5 rounded-full flex items-center p-0.5 cursor-pointer transition-colors ${auto.status ? 'bg-green-500' : 'bg-gray-700'}`}
                 >
                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${auto.status ? 'translate-x-5' : 'translate-x-0'}`} />
                 </div>
               </div>
               <h3 className="text-white font-bold mb-4">{auto.name}</h3>
               <div className="mt-auto space-y-3 text-sm">
                 <div className="p-3 bg-[#0A0A0A] rounded-lg border border-gray-800/50">
                   <span className="text-[10px] font-black text-gray-500 uppercase block mb-1">Gatilho (IF)</span>
                   <span className="text-gray-300 font-medium">{auto.trigger}</span>
                 </div>
                 <div className="p-3 bg-[#0A0A0A] rounded-lg border border-gray-800/50">
                   <span className="text-[10px] font-black text-yellow-500 uppercase block mb-1">Ação (THEN)</span>
                   <span className="text-gray-300 font-medium">{auto.action}</span>
                 </div>
               </div>
            </div>
          ))}
          
          <div 
            onClick={() => toast("Abertura do Workflow Builder em breve!", { icon: "🚧" })}
            className="p-6 rounded-2xl border border-dashed border-gray-700 bg-transparent flex flex-col items-center justify-center text-center cursor-pointer hover:border-yellow-500/50 hover:bg-yellow-500/5 transition-all group min-h-[280px]"
          >
             <div className="w-12 h-12 rounded-full bg-gray-800 text-gray-400 flex items-center justify-center mb-3 group-hover:bg-yellow-500 group-hover:text-black transition-colors">
               <PlusIcon className="w-6 h-6" />
             </div>
             <h3 className="text-white font-bold mb-1">Criar Workflow</h3>
             <p className="text-xs text-gray-500">Automatize tarefas repetitivas e triagem de tickets.</p>
          </div>
        </div>
      )}

      {activeTab === 'broadcast' && (
        <div className="flex flex-col md:flex-row gap-8">
           <div className="flex-1 bg-[#111111] border border-gray-800 rounded-2xl p-6 shadow-xl">
             <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
               <MegaphoneIcon className="w-5 h-5 text-purple-400" />
               Novo Broadcast Global
             </h2>
             <div className="space-y-4">
               <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Mensagem</label>
                 <input 
                   type="text" 
                   value={broadcastMsg}
                   onChange={e => setBroadcastMsg(e.target.value)}
                   className="w-full bg-[#0A0A0A] border border-gray-800 text-white p-3 rounded-xl focus:border-purple-500 outline-none" 
                   placeholder="Ex: O sistema entrará em manutenção à meia noite." 
                 />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tipo de Alerta</label>
                   <select className="w-full bg-[#0A0A0A] border border-gray-800 text-white p-3 rounded-xl outline-none">
                     <option value="info">Informativo (Azul)</option>
                     <option value="warn">Aviso (Amarelo)</option>
                     <option value="critical">Crítico (Vermelho)</option>
                   </select>
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Visibilidade</label>
                   <select className="w-full bg-[#0A0A0A] border border-gray-800 text-white p-3 rounded-xl outline-none">
                     <option value="all">Todos os Clientes (Tenants)</option>
                     <option value="tech">Apenas Técnicos</option>
                   </select>
                 </div>
               </div>
               <button 
                 onClick={handleBroadcast}
                 className="w-full mt-4 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
               >
                 <MegaphoneIcon className="w-5 h-5" /> Disparar Aviso Agora
               </button>
             </div>
           </div>
           
           <div className="w-full md:w-80">
              <div className="bg-[#050505] border border-gray-800 rounded-2xl p-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-4">Avisos Ativos (Live)</h3>
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                   <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 animate-pulse shrink-0" />
                   <div>
                     <p className="text-sm font-bold text-red-400 leading-snug">Instabilidade no provedor de SMS.</p>
                     <p className="text-[10px] text-gray-500 mt-1">Exibindo para Todos • Desde 14:00</p>
                   </div>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
