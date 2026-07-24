"use client";

import Link from "next/link";
import { ArrowLeftIcon, HandThumbUpIcon, HandThumbDownIcon, DocumentTextIcon, CalendarIcon } from "@heroicons/react/24/outline";

const TENANT_CONFIGS: Record<string, any> = {
  "tnt_stark": {
    name: "Stark Enterprises",
    logoText: "STARK",
    colorHex: "#EF4444", 
    colorGlow: "rgba(239, 68, 68, 0.4)",
  },
  "default": {
    name: "Global Tech",
    logoText: "GLOBAL",
    colorHex: "#A855F7", 
    colorGlow: "rgba(168, 85, 247, 0.4)",
  }
};

export default function ArticlePage({ params }: { params: { tenantId: string, id: string } }) {
  const config = TENANT_CONFIGS[params.tenantId] || TENANT_CONFIGS["default"];

  // Mocking the article content
  const article = {
    title: params.tenantId === "tnt_stark" && params.id === "1" ? "Reator Arc não liga" : "Redefinição de senha e Segurança",
    content: `
      <p>Se você está enfrentando problemas para iniciar o sistema principal, siga o procedimento de diagnóstico nível 1 recomendado pelo time de engenharia de suporte.</p>
      
      <h3>1. Verificação de Energia</h3>
      <p>Antes de tudo, certifique-se de que os cabos de alimentação secundários não estão isolados. Uma falha de software muitas vezes é, na verdade, um cabo de fibra óptica mal conectado.</p>
      
      <h3>2. Reset de Fábrica</h3>
      <p>Caso a reinicialização padrão não funcione, você precisará limpar o cache de inicialização. Acesse o painel lateral da máquina, pressione e segure o botão de override por 15 segundos. O LED de status deverá piscar em azul.</p>
      
      <div class="bg-gray-900 border border-gray-800 rounded-xl p-4 my-6">
         <code class="text-sm text-green-400 font-mono">
           > sudo systemctl restart core-engine<br/>
           > tail -f /var/log/syslog
         </code>
      </div>
      
      <p>Se após executar os testes o equipamento continuar inoperante, abra um chamado com a tag <strong>#hardware-failure</strong> para priorização máxima pela nossa IA de triagem.</p>
    `,
    author: "Equipe de Engenharia",
    date: "14 de Maio, 2026",
    readTime: "3 min"
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#050505]" style={{ '--theme-primary': config.colorHex, '--theme-glow': config.colorGlow } as React.CSSProperties}>
      
      {/* Header Simplificado */}
      <header className="h-20 border-b border-gray-800 bg-[#0A0A0A]/80 backdrop-blur-md sticky top-0 z-50 px-6 sm:px-10 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <Link 
               href={`/help-center/${params.tenantId}`}
               className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
               <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
               <div 
                 className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-xs shadow-lg"
                 style={{ backgroundColor: 'var(--theme-primary)', boxShadow: `0 0 10px var(--theme-glow)` }}
               >
                 {config.logoText.charAt(0)}
               </div>
               <span className="text-lg font-bold text-white tracking-tight hidden sm:block">{config.name} <span className="text-gray-500 font-medium">Support</span></span>
            </div>
         </div>
         <button 
           className="px-5 py-2 rounded-xl text-sm font-bold text-white transition-all shadow-lg hover:brightness-110"
           style={{ backgroundColor: 'var(--theme-primary)', boxShadow: `0 0 15px var(--theme-glow)` }}
         >
           Abrir Chamado
         </button>
      </header>

      {/* Hero do Artigo */}
      <div className="bg-[#0A0A0A] border-b border-gray-800 py-12 px-6">
         <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-6">
               <Link href={`/help-center/${params.tenantId}`} className="hover:text-white transition-colors">Base de Conhecimento</Link>
               <span>/</span>
               <span className="text-white">Diagnóstico de Falhas</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-6 leading-tight">
               {article.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-gray-500">
               <div className="flex items-center gap-1.5"><DocumentTextIcon className="w-4 h-4"/> {article.author}</div>
               <div className="flex items-center gap-1.5"><CalendarIcon className="w-4 h-4"/> {article.date}</div>
               <div className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded-md">{article.readTime} de leitura</div>
            </div>
         </div>
      </div>

      {/* Corpo do Artigo */}
      <main className="flex-1 py-12 px-6">
         <div className="max-w-3xl mx-auto flex flex-col md:flex-row gap-12">
            
            {/* Conteúdo Rico */}
            <article className="flex-1 text-gray-300 leading-relaxed space-y-4 article-content" dangerouslySetInnerHTML={{ __html: article.content }}>
            </article>

            {/* Painel Lateral (Feedback) */}
            <aside className="w-full md:w-64 flex-shrink-0">
               <div className="sticky top-28 p-6 rounded-2xl bg-[#0A0A0A] border border-gray-800">
                  <h3 className="text-sm font-bold text-white mb-4">Este artigo foi útil?</h3>
                  <div className="flex gap-2">
                     <button className="flex-1 py-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-green-400 hover:border-green-500/50 hover:bg-green-500/10 transition-colors flex items-center justify-center gap-2 font-bold text-sm">
                        <HandThumbUpIcon className="w-4 h-4" /> Sim
                     </button>
                     <button className="flex-1 py-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-red-400 hover:border-red-500/50 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2 font-bold text-sm">
                        <HandThumbDownIcon className="w-4 h-4" /> Não
                     </button>
                  </div>
               </div>
            </aside>
         </div>
      </main>
      
      {/* Inject custom styles just for the article HTML content */}
      <style dangerouslySetInnerHTML={{__html: `
        .article-content h3 { font-size: 1.25rem; font-weight: 800; color: white; margin-top: 2rem; margin-bottom: 0.75rem; }
        .article-content p { margin-bottom: 1rem; }
        .article-content strong { color: white; }
      `}} />
    </div>
  );
}
