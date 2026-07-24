"use client";

import { useState } from "react";
import { SparklesIcon, AdjustmentsHorizontalIcon, CpuChipIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function AIEnginePage() {
  const [model, setModel] = useState("gpt-4o");
  const [tone, setTone] = useState("empathic");
  const [temperature, setTemperature] = useState(0.7);
  const [systemPrompt, setSystemPrompt] = useState("Você é um assistente virtual B2B focado em suporte técnico para software. Responda apenas com base na base de conhecimento.");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Configurações do Motor de IA atualizadas com sucesso!");
    }, 1200);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <SparklesIcon className="w-8 h-8 text-purple-500" />
          AI Engine Control
        </h1>
        <p className="text-gray-400 mt-2">Ajuste o comportamento do cérebro da plataforma de suporte.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="space-y-6">
            <div className="bg-[#111111] p-6 rounded-2xl border border-gray-800 shadow-xl">
               <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                 <CpuChipIcon className="w-5 h-5 text-gray-400" /> Modelo (LLM)
               </h2>
               <div className="space-y-3">
                 <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${model === 'gpt-4o' ? 'border-purple-500 bg-purple-500/10' : 'border-gray-800 bg-[#0A0A0A] hover:border-gray-600'}`}>
                   <input type="radio" name="model" value="gpt-4o" checked={model === 'gpt-4o'} onChange={() => setModel('gpt-4o')} className="hidden" />
                   <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${model === 'gpt-4o' ? 'border-purple-500' : 'border-gray-600'}`}>
                     {model === 'gpt-4o' && <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />}
                   </div>
                   <div>
                     <div className="text-sm font-bold text-white">OpenAI GPT-4o</div>
                     <div className="text-xs text-gray-500">Mais inteligente, ideal para contextos complexos.</div>
                   </div>
                 </label>
                 
                 <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${model === 'claude-3-5' ? 'border-purple-500 bg-purple-500/10' : 'border-gray-800 bg-[#0A0A0A] hover:border-gray-600'}`}>
                   <input type="radio" name="model" value="claude-3-5" checked={model === 'claude-3-5'} onChange={() => setModel('claude-3-5')} className="hidden" />
                   <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${model === 'claude-3-5' ? 'border-purple-500' : 'border-gray-600'}`}>
                     {model === 'claude-3-5' && <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />}
                   </div>
                   <div>
                     <div className="text-sm font-bold text-white">Anthropic Claude 3.5 Sonnet</div>
                     <div className="text-xs text-gray-500">Mais rápido, tom de voz humano natural.</div>
                   </div>
                 </label>
               </div>
            </div>

            <div className="bg-[#111111] p-6 rounded-2xl border border-gray-800 shadow-xl">
               <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                 <AdjustmentsHorizontalIcon className="w-5 h-5 text-gray-400" /> Criatividade (Temperature)
               </h2>
               <p className="text-xs text-gray-500 mb-4">Valores baixos tornam a IA mais robótica e exata. Valores altos a tornam mais criativa (risco de alucinação).</p>
               <input 
                 type="range" 
                 min="0" max="1" step="0.1" 
                 value={temperature} 
                 onChange={(e) => setTemperature(parseFloat(e.target.value))}
                 className="w-full accent-purple-500"
               />
               <div className="flex justify-between text-xs text-gray-400 font-bold mt-2">
                 <span>Exata (0.0)</span>
                 <span className="text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">{temperature.toFixed(1)}</span>
                 <span>Criativa (1.0)</span>
               </div>
            </div>
         </div>

         <div className="bg-[#111111] p-6 rounded-2xl border border-gray-800 shadow-xl flex flex-col">
            <h2 className="text-lg font-bold text-white mb-4">Tom de Voz & Persona</h2>
            <p className="text-sm text-gray-400 mb-6">Como o Co-Piloto e o bot de triagem devem se comunicar com os clientes?</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              {['formal', 'empathic', 'direct', 'fun'].map(t => (
                <button 
                  key={t}
                  onClick={() => setTone(t)}
                  className={`p-4 rounded-xl border text-sm font-bold transition-all ${tone === t ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'bg-[#0A0A0A] border-gray-800 text-gray-500 hover:text-white hover:border-gray-600'}`}
                >
                  {t === 'formal' && '💼 Corporativo / Formal'}
                  {t === 'empathic' && '❤️ Empático / Acolhedor'}
                  {t === 'direct' && '⚡ Direto / Técnico'}
                  {t === 'fun' && '🎉 Descontraído'}
                </button>
              ))}
            </div>

            <div className="mt-auto p-4 bg-[#0A0A0A] border border-gray-800 rounded-xl">
               <span className="text-[10px] font-black uppercase text-gray-600 tracking-widest mb-2 block">Prévia da Resposta</span>
               <p className="text-sm text-gray-300 italic">
                 {tone === 'formal' && 'Prezado cliente, informamos que o seu chamado foi escalonado para a equipe responsável. Solicitamos que aguarde nosso retorno.'}
                 {tone === 'empathic' && 'Olá! Entendo perfeitamente o seu problema e sinto muito pelo transtorno. Já passei seu caso com prioridade máxima para nossos especialistas. Vamos resolver isso juntos!'}
                 {tone === 'direct' && 'Recebido. Ticket escalado para engenharia de nível 2. Retornamos em breve.'}
                 {tone === 'fun' && 'E aí! Que chato esse bug, né? Mas não se preocupe, a cavalaria já está a caminho pra dar um jeito nisso! 🚀'}
               </p>
            </div>
         </div>
      </div>

      <div className="mt-8 bg-[#111111] p-6 rounded-2xl border border-gray-800 shadow-xl">
         <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            System Prompt Base
         </h2>
         <p className="text-sm text-gray-400 mb-4">
            Este prompt será injetado no contexto de todas as conversas entre a IA e os clientes. Use variáveis como <code className="text-purple-400">{"{{tenant_name}}"}</code> ou <code className="text-purple-400">{"{{ticket_context}}"}</code>.
         </p>
         <textarea 
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={4}
            className="w-full bg-[#0A0A0A] border border-gray-800 rounded-xl p-4 text-sm text-white font-mono focus:ring-2 focus:ring-purple-500/50 outline-none transition-all resize-y"
         />
      </div>
      
      <div className="mt-8 flex justify-end">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {isSaving ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : null}
          {isSaving ? "Salvando..." : "Salvar Configurações da IA"}
        </button>
      </div>
    </div>
  );
}
