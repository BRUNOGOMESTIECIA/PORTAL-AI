"use client";

import { useState, useRef, useEffect } from "react";
import { 
  ArrowLeftIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  PaperClipIcon, 
  PaperAirplaneIcon,
  SparklesIcon,
  UserIcon,
  BuildingOfficeIcon,
  TagIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function TicketWorkspacePage({ params }: { params: { id: string } }) {
  const [replyMessage, setReplyMessage] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("copilot"); // 'copilot' or 'details'
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // MOCK DATA
  const ticket = {
    id: params.id || "TCK-1092",
    title: "Erro ao exportar faturas em PDF",
    status: "OPEN",
    priority: "HIGH",
    createdAt: "Hoje, 14:32",
    sla: "2h 15m restantes",
    tenant: { name: "Stark Enterprises", plan: "Enterprise", mrr: "$14.500" },
    user: { name: "Tony Stark", email: "tony@stark.com", role: "CEO" },
    tags: ["billing", "bug", "pdf-export"],
  };

  const [history, setHistory] = useState([
    {
      id: 1,
      sender: "Tony Stark",
      type: "client",
      time: "14:32",
      content: "O sistema está travando toda vez que tento exportar o faturamento mensal consolidado. Preciso disso urgente para a reunião do conselho."
    },
    {
      id: 2,
      sender: "AI Triage",
      type: "system",
      time: "14:33",
      content: "Ticket classificado como ALTA PRIORIDADE devido a [palavras-chave: urgente, conselho, faturamento]. Atribuído ao esquadrão Financeiro/Tech."
    }
  ]);

  const generateAiReply = () => {
    setIsAiGenerating(true);
    setTimeout(() => {
      setReplyMessage("Olá Tony, tudo bem?\n\nIdentificamos uma pequena instabilidade no microsserviço de geração de PDFs devido a uma atualização no motor de renderização. Nossa equipe de engenharia já atuou no caso e a exportação deve estar normalizada.\n\nPoderia tentar gerar a fatura novamente e me confirmar se funcionou?\n\nFico no aguardo, abraço!");
      setIsAiGenerating(false);
      toast.success("Rascunho gerado pela IA");
    }, 1500);
  };

  const router = useRouter();

  const handleResolve = () => {
    toast.success("Ticket resolvido com sucesso!");
    router.push("/super-admin/tickets");
  };

  const handleSend = () => {
    if (!replyMessage.trim()) return;
    const newMsg = {
      id: Date.now(),
      sender: "Equipe de Suporte",
      type: "agent",
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      content: replyMessage
    };
    setHistory([...history, newMsg]);
    setReplyMessage("");
    toast.success("Mensagem enviada");
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  return (
    <div className="flex h-[calc(100vh-5rem)] -m-10 bg-[#0A0A0A] overflow-hidden">
      
      {/* Esquerda: Chat / Timeline (Flex 1) */}
      <div className="flex-1 flex flex-col border-r border-gray-800 relative z-10">
        
        {/* Header do Ticket */}
        <div className="h-20 border-b border-gray-800 bg-[#111111] flex items-center justify-between px-6 flex-shrink-0">
           <div className="flex items-center gap-4">
              <Link href="/super-admin/tickets" className="p-2 bg-gray-900 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
                 <ArrowLeftIcon className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-3">
                  {ticket.title}
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-500/20 text-red-400 border border-red-500/30 uppercase tracking-widest">{ticket.priority}</span>
                </h1>
                <p className="text-xs text-gray-500 font-medium">Ticket #{ticket.id} • Aberto por {ticket.user.name} em {ticket.createdAt}</p>
              </div>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <ClockIcon className="w-4 h-4 text-orange-400" />
                <span className="text-xs font-bold text-orange-400">SLA: {ticket.sla}</span>
              </div>
              <button 
                onClick={handleResolve}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2"
              >
                <CheckCircleIcon className="w-5 h-5" />
                Resolver
              </button>
           </div>
        </div>

        {/* Corpo do Chat */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[#050505]">
           {history.map((msg) => (
             <div key={msg.id} className={`flex ${msg.type === 'system' ? 'justify-center' : 'justify-start'}`}>
               {msg.type === 'system' ? (
                  <div className="max-w-2xl text-center">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-purple-400">
                      <SparklesIcon className="w-3 h-3" /> {msg.content}
                    </span>
                  </div>
               ) : (
                 <div className="flex gap-4 max-w-3xl">
                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 font-bold uppercase flex-shrink-0">
                      {msg.sender.charAt(0)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                         <span className="text-sm font-bold text-white">{msg.sender}</span>
                         <span className="text-xs font-medium text-gray-600">{msg.time}</span>
                      </div>
                      <div className="p-4 rounded-2xl rounded-tl-sm bg-[#111111] border border-gray-800 text-sm text-gray-300 leading-relaxed shadow-sm">
                         {msg.content}
                      </div>
                    </div>
                 </div>
               )}
             </div>
           ))}
           <div ref={messagesEndRef} />
        </div>

        {/* Editor de Resposta */}
        <div className="p-4 border-t border-gray-800 bg-[#111111] flex-shrink-0">
           <div className="bg-[#050505] border border-gray-800 rounded-2xl focus-within:border-purple-500/50 transition-colors overflow-hidden flex flex-col">
              <textarea 
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Escreva sua resposta ou deixe a IA sugerir..."
                className="w-full bg-transparent p-4 text-sm text-white placeholder-gray-600 resize-none outline-none min-h-[100px] custom-scrollbar"
              />
              <div className="bg-[#0A0A0A] border-t border-gray-800 p-2 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-500 hover:text-white transition-colors rounded-lg hover:bg-gray-800">
                       <PaperClipIcon className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={generateAiReply}
                      className="p-2 text-purple-500 hover:text-white transition-colors rounded-lg hover:bg-purple-500/20 flex items-center gap-2 text-sm font-bold"
                    >
                       <SparklesIcon className={`w-5 h-5 ${isAiGenerating ? 'animate-pulse' : ''}`} />
                       <span className="hidden sm:inline">Escrever com IA</span>
                    </button>
                 </div>
                 <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 font-medium hidden md:inline">Ctrl + Enter para enviar</span>
                    <button 
                       onClick={handleSend}
                       className="px-6 py-2 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors shadow-lg flex items-center gap-2"
                    >
                       Enviar <PaperAirplaneIcon className="w-4 h-4" />
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Direita: Painel de Contexto & IA (Largura Fixa) */}
      <div className="w-96 bg-[#111111] flex flex-col flex-shrink-0 z-20 shadow-2xl">
         
         {/* Tabs Right Panel */}
         <div className="flex p-2 gap-2 border-b border-gray-800 bg-[#0A0A0A]">
            <button 
              onClick={() => setActiveTab('copilot')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${activeTab === 'copilot' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'text-gray-500 hover:bg-gray-900'}`}
            >
              <SparklesIcon className="w-4 h-4" /> Co-Piloto IA
            </button>
            <button 
              onClick={() => setActiveTab('details')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${activeTab === 'details' ? 'bg-gray-800 text-white border border-gray-700' : 'text-gray-500 hover:bg-gray-900'}`}
            >
              <UserIcon className="w-4 h-4" /> Detalhes
            </button>
         </div>

         {/* Painel Content */}
         <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            
            {activeTab === 'copilot' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="p-4 rounded-2xl bg-gradient-to-b from-purple-900/20 to-[#0A0A0A] border border-purple-500/20">
                  <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                    <SparklesIcon className="w-4 h-4 text-purple-400" />
                    Sugestão de Resposta
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed mb-4">
                    Com base no histórico e em <span className="text-purple-400">3 artigos</span> da base de conhecimento, criei este rascunho:
                  </p>
                  
                  <div className="bg-[#050505] p-3 rounded-xl border border-gray-800 text-xs text-gray-300 font-medium mb-3 relative group">
                    Olá Tony, tudo bem? Identificamos uma pequena instabilidade no microsserviço de geração de PDFs...
                    <button 
                      onClick={() => {
                        setReplyMessage("Olá Tony, tudo bem?\n\nIdentificamos uma pequena instabilidade no microsserviço de geração de PDFs devido a uma atualização no motor de renderização. Nossa equipe de engenharia já atuou no caso e a exportação deve estar normalizada.\n\nPoderia tentar gerar a fatura novamente e me confirmar se funcionou?\n\nFico no aguardo, abraço!");
                        toast.success("Rascunho aplicado");
                      }}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl text-white font-bold backdrop-blur-sm"
                    >
                      Usar Rascunho
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                     <button className="p-1.5 bg-gray-800 rounded hover:bg-gray-700 text-gray-400"><ArrowPathIcon className="w-3 h-3"/></button>
                     <button className="p-1.5 bg-gray-800 rounded hover:bg-gray-700 text-green-400"><HandThumbUpIcon className="w-3 h-3"/></button>
                     <button className="p-1.5 bg-gray-800 rounded hover:bg-gray-700 text-red-400"><HandThumbDownIcon className="w-3 h-3"/></button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#0A0A0A] border border-gray-800">
                   <h3 className="text-sm font-bold text-white mb-4">Análise de Sentimento</h3>
                   <div className="flex items-center gap-3">
                      <div className="text-2xl">😡</div>
                      <div>
                        <div className="text-xs font-bold text-red-400">Frustrado / Urgente</div>
                        <div className="text-[10px] text-gray-500">Cliente demonstrou estresse no tom.</div>
                      </div>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'details' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                
                {/* User Card */}
                <div>
                  <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3">Solicitante</h3>
                  <div className="flex items-center gap-3">
                     <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                       {ticket.user.name.charAt(0)}
                     </div>
                     <div>
                       <div className="text-sm font-bold text-white">{ticket.user.name}</div>
                       <div className="text-xs text-gray-500">{ticket.user.email}</div>
                       <div className="text-[10px] font-semibold text-blue-400 mt-1">{ticket.user.role}</div>
                     </div>
                  </div>
                </div>

                <hr className="border-gray-800" />

                {/* Tenant Card */}
                <div>
                  <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <BuildingOfficeIcon className="w-3 h-3" /> Empresa (Tenant)
                  </h3>
                  <div className="p-3 rounded-xl bg-[#0A0A0A] border border-gray-800">
                    <div className="text-sm font-bold text-white mb-1">{ticket.tenant.name}</div>
                    <div className="flex justify-between items-center text-xs mt-3">
                      <span className="text-gray-500">Plano</span>
                      <span className="font-bold text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded">{ticket.tenant.plan}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs mt-2">
                      <span className="text-gray-500">MRR</span>
                      <span className="font-bold text-green-400">{ticket.tenant.mrr}</span>
                    </div>
                  </div>
                </div>

                <hr className="border-gray-800" />

                {/* Tags */}
                <div>
                  <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <TagIcon className="w-3 h-3" /> Tags do Ticket
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {ticket.tags.map(tag => (
                      <span key={tag} className="text-xs font-semibold px-2.5 py-1 bg-gray-800 text-gray-300 rounded-lg border border-gray-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            )}
         </div>

      </div>
    </div>
  );
}
