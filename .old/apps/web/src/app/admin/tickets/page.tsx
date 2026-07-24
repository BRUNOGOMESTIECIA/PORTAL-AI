"use client";

import { useState } from "react";
import { TicketIcon, ClockIcon, CheckCircleIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";

export default function TicketsPage() {
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  const tickets = [
    { id: "T-104", title: "Erro na integração com pagamento", customer: "Alice Gomes", status: "Aberto", priority: "Alta", time: "Há 1 hora", description: "O cliente final está tentando passar o cartão no checkout, mas a API retorna timeout." },
    { id: "T-105", title: "Dúvida sobre configuração de envio", customer: "Carlos Souza", status: "Pendente", priority: "Média", time: "Há 3 horas", description: "Como faço para configurar o frete grátis apenas para a região sul do país?" },
    { id: "T-106", title: "Como resetar minha senha?", customer: "Fernanda Costa", status: "Resolvido", priority: "Baixa", time: "Ontem", description: "Esqueci minha senha e o e-mail de recuperação não chega." },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-[calc(100vh-140px)] flex flex-col">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Inbox de Tickets</h1>
          <p className="text-gray-400 mt-2">Arraste os cards para gerenciar as solicitações da sua equipe.</p>
        </div>
      </div>

      <div className="flex gap-6 flex-1 overflow-x-auto pb-4 custom-scrollbar">
        {/* Coluna: Aberto */}
        <div className="w-80 flex-shrink-0 flex flex-col bg-[#0A0A0A] rounded-2xl border border-gray-800 p-4">
          <div className="flex items-center justify-between mb-4 px-2 border-b border-gray-800/50 pb-3">
             <h3 className="font-bold text-white flex items-center gap-2">
               <TicketIcon className="w-5 h-5 text-red-400" /> Novos / Abertos
             </h3>
             <span className="bg-red-500/10 text-red-400 text-xs font-bold px-2.5 py-1 rounded-full border border-red-500/20">1</span>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar">
            {tickets.filter(t => t.status === "Aberto").map(t => (
               <div key={t.id} onClick={() => setSelectedTicket(t)} className="bg-[#111111] border border-gray-800 p-5 rounded-2xl cursor-pointer hover:border-red-500/50 hover:shadow-[0_0_15px_rgba(239,68,68,0.1)] transition-all">
                 <div className="flex justify-between items-start mb-3">
                   <span className="text-xs font-mono font-bold text-gray-500 bg-gray-900 px-2 py-1 rounded">{t.id}</span>
                   <span className="text-[10px] uppercase font-black tracking-wider text-red-400 bg-red-500/10 px-2 py-1 rounded-md border border-red-500/20">{t.priority}</span>
                 </div>
                 <h4 className="text-sm font-bold text-white mb-2 leading-snug">{t.title}</h4>
                 <p className="text-xs text-gray-500 mb-4 line-clamp-2 leading-relaxed">{t.description}</p>
                 <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-800/60">
                   <div className="flex items-center gap-2">
                     <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">{t.customer.charAt(0)}</div>
                     <span className="text-xs font-semibold text-gray-400">{t.customer}</span>
                   </div>
                   <span className="text-[10px] font-medium text-gray-500">{t.time}</span>
                 </div>
               </div>
            ))}
          </div>
        </div>

        {/* Coluna: Pendente */}
        <div className="w-80 flex-shrink-0 flex flex-col bg-[#0A0A0A] rounded-2xl border border-gray-800 p-4">
          <div className="flex items-center justify-between mb-4 px-2 border-b border-gray-800/50 pb-3">
             <h3 className="font-bold text-white flex items-center gap-2">
               <ClockIcon className="w-5 h-5 text-yellow-400" /> Em Andamento
             </h3>
             <span className="bg-yellow-500/10 text-yellow-400 text-xs font-bold px-2.5 py-1 rounded-full border border-yellow-500/20">1</span>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar">
            {tickets.filter(t => t.status === "Pendente").map(t => (
               <div key={t.id} onClick={() => setSelectedTicket(t)} className="bg-[#111111] border border-gray-800 p-5 rounded-2xl cursor-pointer hover:border-yellow-500/50 hover:shadow-[0_0_15px_rgba(234,179,8,0.1)] transition-all">
                 <div className="flex justify-between items-start mb-3">
                   <span className="text-xs font-mono font-bold text-gray-500 bg-gray-900 px-2 py-1 rounded">{t.id}</span>
                   <span className="text-[10px] uppercase font-black tracking-wider text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-md border border-yellow-500/20">{t.priority}</span>
                 </div>
                 <h4 className="text-sm font-bold text-white mb-2 leading-snug">{t.title}</h4>
                 <p className="text-xs text-gray-500 mb-4 line-clamp-2 leading-relaxed">{t.description}</p>
                 <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-800/60">
                   <div className="flex items-center gap-2">
                     <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">{t.customer.charAt(0)}</div>
                     <span className="text-xs font-semibold text-gray-400">{t.customer}</span>
                   </div>
                   <span className="text-[10px] font-medium text-gray-500">{t.time}</span>
                 </div>
               </div>
            ))}
          </div>
        </div>

        {/* Coluna: Resolvido */}
        <div className="w-80 flex-shrink-0 flex flex-col bg-[#0A0A0A] rounded-2xl border border-gray-800 p-4">
          <div className="flex items-center justify-between mb-4 px-2 border-b border-gray-800/50 pb-3">
             <h3 className="font-bold text-white flex items-center gap-2">
               <CheckCircleIcon className="w-5 h-5 text-green-400" /> Resolvidos
             </h3>
             <span className="bg-green-500/10 text-green-400 text-xs font-bold px-2.5 py-1 rounded-full border border-green-500/20">1</span>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar opacity-60 hover:opacity-100 transition-opacity">
            {tickets.filter(t => t.status === "Resolvido").map(t => (
               <div key={t.id} onClick={() => setSelectedTicket(t)} className="bg-[#111111] border border-gray-800 p-5 rounded-2xl cursor-pointer hover:border-green-500/50 transition-all">
                 <div className="flex justify-between items-start mb-3">
                   <span className="text-xs font-mono font-bold text-gray-500 bg-gray-900 px-2 py-1 rounded">{t.id}</span>
                 </div>
                 <h4 className="text-sm font-bold text-gray-400 mb-2 leading-snug line-through">{t.title}</h4>
                 <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-800/60">
                   <div className="flex items-center gap-2">
                     <span className="text-xs font-semibold text-gray-500">{t.customer}</span>
                   </div>
                 </div>
               </div>
            ))}
          </div>
        </div>
      </div>

      {selectedTicket && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#111111] border border-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
             <div className="px-6 py-5 border-b border-gray-800 flex justify-between items-center bg-[#0A0A0A]">
               <div className="flex items-center gap-3">
                 <span className="text-xs font-mono font-bold text-gray-500 bg-gray-900 px-2 py-1 rounded">{selectedTicket.id}</span>
                 <h2 className="text-lg font-bold text-white">{selectedTicket.title}</h2>
               </div>
               <button onClick={() => setSelectedTicket(null)} className="text-gray-500 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
               </button>
             </div>
             
             <div className="flex-1 p-6 overflow-y-auto bg-[#050505]">
                {/* Info Bar */}
                <div className="flex flex-wrap gap-4 mb-8 bg-gray-900 border border-gray-800 rounded-xl p-4">
                   <div>
                     <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Solicitante</p>
                     <p className="text-sm text-gray-200 font-semibold">{selectedTicket.customer}</p>
                   </div>
                   <div className="w-px h-8 bg-gray-800" />
                   <div>
                     <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Status</p>
                     <p className={`text-sm font-semibold ${selectedTicket.status === 'Aberto' ? 'text-red-400' : selectedTicket.status === 'Pendente' ? 'text-yellow-400' : 'text-green-400'}`}>
                       {selectedTicket.status}
                     </p>
                   </div>
                   <div className="w-px h-8 bg-gray-800" />
                   <div>
                     <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Prioridade</p>
                     <p className="text-sm text-gray-200 font-semibold">{selectedTicket.priority}</p>
                   </div>
                   <div className="w-px h-8 bg-gray-800" />
                   <div>
                     <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Aberto em</p>
                     <p className="text-sm text-gray-200 font-semibold">{selectedTicket.time}</p>
                   </div>
                </div>

                {/* Descrição / Chat */}
                <h3 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2">
                  <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-400" />
                  Histórico do Chamado
                </h3>
                
                <div className="space-y-4">
                   <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 ml-8 relative">
                      <div className="absolute -left-12 top-2 w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                        {selectedTicket.customer.charAt(0)}
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-gray-200 text-sm">{selectedTicket.customer}</span>
                        <span className="text-xs text-gray-500">{selectedTicket.time}</span>
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{selectedTicket.description}</p>
                   </div>

                   {/* Mock Resposta IA */}
                   <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-5 mr-8 relative">
                      <div className="absolute -right-12 top-2 w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-xs font-bold text-white shadow-sm shadow-blue-500/20">
                        IA
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-blue-400 text-sm">Assistente Inteligente</span>
                        <span className="text-xs text-blue-500/50">Lido</span>
                      </div>
                      <p className="text-sm text-blue-100/70 leading-relaxed">
                        Olá {selectedTicket.customer.split(' ')[0]}, vi que você está com problemas. Baseado na nossa base de conhecimento, você pode tentar limpar o cache do navegador ou atualizar as configurações na aba "Geral". Isso resolveu o seu problema?
                      </p>
                   </div>
                </div>
             </div>
             
             {/* Reply Box */}
             <div className="px-6 py-4 border-t border-gray-800 bg-[#0A0A0A]">
                <textarea 
                  placeholder="Digite sua resposta..." 
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-sm min-h-[80px] resize-none"
                />
                <div className="flex justify-end gap-3 mt-3">
                  <button className="px-5 py-2.5 rounded-xl font-bold text-white bg-gray-800 hover:bg-gray-700 transition-colors">Fechar Chamado</button>
                  <button className="px-5 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all">Enviar Resposta</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
