"use client";

import { useState } from "react";
import Link from "next/link";
import { MagnifyingGlassIcon, BookOpenIcon, TicketIcon, ArrowRightIcon, ChatBubbleLeftRightIcon, XMarkIcon, PaperClipIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

// Mock das configurações de White-Label por Tenant
const TENANT_CONFIGS: Record<string, any> = {
  "tnt_stark": {
    name: "Stark Enterprises",
    logoText: "STARK",
    colorHex: "#EF4444", // Red
    colorGlow: "rgba(239, 68, 68, 0.4)",
    welcomeMsg: "Como podemos ajudar sua armadura hoje?",
    faqs: [
      { id: 1, title: "Reator Arc não liga" },
      { id: 2, title: "Atualização do firmware Mark XLII" },
      { id: 3, title: "Reparo de propulsores repulsores" }
    ]
  },
  "tnt_wayne": {
    name: "Wayne Enterprises",
    logoText: "WAYNE",
    colorHex: "#EAB308", // Yellow
    colorGlow: "rgba(234, 179, 8, 0.4)",
    welcomeMsg: "Suporte corporativo e tático",
    faqs: [
      { id: 1, title: "Problemas com o sistema sonar" },
      { id: 2, title: "Solicitar novo cabo de Kevlar" },
      { id: 3, title: "Acesso aos servidores da Batcaverna" }
    ]
  },
  "default": {
    name: "Global Tech",
    logoText: "GLOBAL",
    colorHex: "#A855F7", // Purple
    colorGlow: "rgba(168, 85, 247, 0.4)",
    welcomeMsg: "Olá! Como podemos te ajudar hoje?",
    faqs: [
      { id: 1, title: "Redefinição de senha" },
      { id: 2, title: "Como configurar minha conta" },
      { id: 3, title: "Dúvidas sobre faturamento" }
    ]
  }
};

export default function HelpCenterPage({ params }: { params: { tenantId: string } }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Extrai o tenant ou cai no default
  const config = TENANT_CONFIGS[params.tenantId] || TENANT_CONFIGS["default"];

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    toast.loading(`Buscando por "${searchQuery}"...`, { duration: 2000 });
  };

  const handleOpenTicket = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ '--theme-primary': config.colorHex, '--theme-glow': config.colorGlow } as React.CSSProperties}>
      
      {/* Header Público */}
      <header className="h-20 border-b border-gray-800 bg-[#0A0A0A]/80 backdrop-blur-md sticky top-0 z-50 px-6 sm:px-10 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white shadow-lg"
              style={{ backgroundColor: 'var(--theme-primary)', boxShadow: `0 0 20px var(--theme-glow)` }}
            >
              {config.logoText.charAt(0)}
            </div>
            <span className="text-xl font-bold text-white tracking-tight">{config.name} <span className="text-gray-500 font-medium">Support</span></span>
         </div>
         <div className="flex items-center gap-4">
            <button className="text-sm font-semibold text-gray-400 hover:text-white transition-colors hidden sm:block">Meus Tickets</button>
            <button 
              onClick={handleOpenTicket}
              className="px-5 py-2 rounded-xl text-sm font-bold text-white transition-all shadow-lg hover:brightness-110"
              style={{ backgroundColor: 'var(--theme-primary)', boxShadow: `0 0 15px var(--theme-glow)` }}
            >
              Abrir Chamado
            </button>
         </div>
      </header>

      {/* Hero Section / Busca */}
      <section className="relative py-24 px-6 overflow-hidden flex flex-col items-center justify-center border-b border-gray-800">
         {/* Background Glow */}
         <div 
           className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] blur-[150px] rounded-[100%] pointer-events-none opacity-40"
           style={{ backgroundColor: 'var(--theme-primary)' }}
         />
         
         <div className="relative z-10 w-full max-w-3xl text-center">
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight mb-6">
              {config.welcomeMsg}
            </h1>
            <p className="text-lg text-gray-400 mb-10">
              Nossa Inteligência Artificial e nossa equipe de especialistas estão prontos para resolver seu problema.
            </p>

            <div className="relative group w-full">
               <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                 <MagnifyingGlassIcon className="h-6 w-6 text-gray-400 group-focus-within:text-white transition-colors" />
               </div>
               <input
                 type="text"
                 className="block w-full pl-14 pr-6 py-5 bg-[#111111]/80 backdrop-blur-xl border border-gray-700 text-white rounded-2xl text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all shadow-2xl"
                 style={{ '--tw-ring-color': 'var(--theme-primary)' } as React.CSSProperties}
                 placeholder="Busque por artigos, erros ou dicas..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
               <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button 
                    onClick={handleSearch}
                    className="p-2.5 rounded-xl text-white shadow-md hover:brightness-110 transition-all flex items-center gap-2"
                    style={{ backgroundColor: 'var(--theme-primary)' }}
                  >
                    <span className="hidden sm:inline text-sm font-bold">Buscar</span>
                    <ArrowRightIcon className="w-5 h-5" />
                  </button>
               </div>
            </div>
         </div>
      </section>

      {/* Main Content (Categories & FAQs) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-10 grid grid-cols-1 md:grid-cols-3 gap-10">
         
         {/* FAQ column */}
         <div className="md:col-span-2 space-y-8">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <BookOpenIcon className="w-6 h-6" style={{ color: 'var(--theme-primary)' }} />
              Tópicos Frequentes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {config.faqs.map((faq: any) => (
                <Link href={`/help-center/${params.tenantId}/article/${faq.id}`} key={faq.id} className="p-6 rounded-2xl bg-[#111111] border border-gray-800 hover:border-gray-700 hover:bg-gray-900/50 transition-all cursor-pointer group block">
                   <h3 className="text-gray-200 font-semibold mb-2 group-hover:text-white">{faq.title}</h3>
                   <p className="text-sm text-gray-500">Escrito pela equipe de suporte • 2 min de leitura</p>
                </Link>
              ))}
              <div className="p-6 rounded-2xl bg-[#0A0A0A] border border-gray-800 border-dashed hover:border-gray-600 transition-all cursor-pointer flex items-center justify-center">
                 <span className="text-gray-400 font-bold text-sm">Ver todos os 42 artigos &rarr;</span>
              </div>
            </div>
         </div>

         {/* Support Action column */}
         <div className="space-y-6">
            <div className="p-8 rounded-3xl bg-gradient-to-b from-[#111111] to-[#0A0A0A] border border-gray-800 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-20 pointer-events-none" style={{ backgroundColor: 'var(--theme-primary)' }} />
               
               <TicketIcon className="w-10 h-10 mb-6" style={{ color: 'var(--theme-primary)' }} />
               <h3 className="text-xl font-bold text-white mb-3">Ainda precisa de ajuda?</h3>
               <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                 Abra um ticket detalhado. Nossa IA fará a triagem inicial e em minutos um especialista assumirá o caso.
               </p>
               <button 
                 onClick={handleOpenTicket}
                 className="w-full py-4 rounded-xl text-sm font-bold text-white transition-all shadow-lg hover:brightness-110 flex items-center justify-center gap-2"
                 style={{ backgroundColor: 'var(--theme-primary)', boxShadow: `0 0 20px var(--theme-glow)` }}
               >
                 <ChatBubbleLeftRightIcon className="w-5 h-5" />
                 Falar com Suporte
               </button>
            </div>
         </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 text-center text-gray-600 text-sm">
         <p>Powered by <strong className="text-gray-400">SaaS Control Plane</strong></p>
      </footer>

      {/* Mega-Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-3xl bg-[#111111] border border-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-gray-800 bg-[#0A0A0A] flex items-center justify-between sticky top-0 z-10">
               <div>
                 <h2 className="text-2xl font-black text-white">Abrir Novo Chamado</h2>
                 <p className="text-sm text-gray-500 mt-1">Preencha os detalhes abaixo para que nossa equipe técnica possa investigar.</p>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-500 hover:text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors">
                  <XMarkIcon className="w-6 h-6" />
               </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-6">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-300">Tipo de Problema</label>
                    <select className="w-full bg-[#050505] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500">
                       <option>Bug no Sistema</option>
                       <option>Dúvida Financeira</option>
                       <option>Dúvida Técnica</option>
                       <option>Outros</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-300">Urgência</label>
                    <select className="w-full bg-[#050505] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500">
                       <option>Normal (Pode esperar 48h)</option>
                       <option>Alta (Atrapalha muito meu fluxo)</option>
                       <option>Urgente (Sistema parado)</option>
                    </select>
                 </div>
               </div>

               <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-300">Assunto Resumido</label>
                  <input type="text" placeholder="Ex: Erro ao tentar exportar relatório em PDF" className="w-full bg-[#050505] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 placeholder-gray-700" />
               </div>

               <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-300">Descrição Detalhada</label>
                  <textarea rows={5} placeholder="Descreva o passo a passo do que você estava tentando fazer e o que aconteceu..." className="w-full bg-[#050505] border border-gray-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-purple-500 placeholder-gray-700 resize-none custom-scrollbar"></textarea>
               </div>

               {/* Dropzone mock */}
               <div className="border-2 border-dashed border-gray-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-[#0A0A0A]/50 hover:bg-[#0A0A0A] hover:border-gray-700 transition-colors cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center mb-4">
                     <PaperClipIcon className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-sm font-bold text-gray-300">Arraste prints ou logs de erro aqui</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, PDF ou TXT (Máx 10MB)</p>
               </div>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-5 border-t border-gray-800 bg-[#0A0A0A] flex items-center justify-end gap-4 sticky bottom-0 z-10">
               <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-400 hover:text-white transition-colors">
                  Cancelar
               </button>
               <button 
                 onClick={() => {
                   setIsModalOpen(false);
                   toast.success("Chamado aberto com sucesso! Número: TK-1055");
                 }} 
                 className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-lg hover:brightness-110 flex items-center gap-2"
                 style={{ backgroundColor: 'var(--theme-primary)', boxShadow: `0 0 15px var(--theme-glow)` }}
               >
                  Enviar Chamado
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
