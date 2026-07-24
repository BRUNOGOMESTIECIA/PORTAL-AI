"use client";

import { useState, useRef, useEffect } from "react";
import { 
  PaperAirplaneIcon,
  SparklesIcon,
  BuildingOfficeIcon,
  ClockIcon,
  CheckBadgeIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

type Message = {
  id: number;
  sender: "customer" | "ai" | "agent";
  name: string;
  content: string;
  time: string;
};

type ChatSession = {
  id: string;
  customerName: string;
  customerEmail: string;
  tenantName: string;
  tenantPlan: string;
  mrr: string;
  status: "active" | "waiting" | "resolved";
  queueStatus: "entrada" | "meus" | "em_atendimento" | "finalizado";
  assignee: string | null;
  sentiment: string;
  sentimentEmoji: string;
  sla: string;
  isViolatingSLA: boolean;
  messages: Message[];
  aiSuggestion?: string;
};

export default function LiveInboxPage() {
  const [activeChatId, setActiveChatId] = useState<string>("CHAT-1045");
  const [replyText, setReplyText] = useState("");
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showKbModal, setShowKbModal] = useState(false);
  const [filterTab, setFilterTab] = useState<"entrada" | "meus" | "em_atendimento" | "finalizado">("meus");
  const [userRole, setUserRole] = useState<"admin" | "tecnico">("admin");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // MOCK DATA
  const [chats, setChats] = useState<ChatSession[]>([
    {
      id: "CHAT-1045",
      customerName: "Tony Stark",
      customerEmail: "tony@stark.com",
      tenantName: "Stark Enterprises",
      tenantPlan: "Enterprise",
      mrr: "$14.500",
      status: "active",
      queueStatus: "meus",
      assignee: "Você",
      sentiment: "Frustrado",
      sentimentEmoji: "😡",
      sla: "Vence em 1h",
      isViolatingSLA: true,
      aiSuggestion: "Olá Tony! A equipe de engenharia já identificou que a falha no webhook foi causada por um timeout na sua provedora de cloud. Já aplicamos um bypass temporário. Pode confirmar se os pagamentos voltaram a cair?",
      messages: [
        { id: 1, sender: "customer", name: "Tony Stark", time: "09:30", content: "A API de pagamentos está retornando erro 500 no webhook. Isso está parando nosso faturamento! Urgente!" },
        { id: 2, sender: "ai", name: "Copilot Triagem", time: "09:31", content: "Ticket classificado como URGENTE. Notificando suporte nível 2 imediatamente." }
      ]
    },
    {
      id: "CHAT-1046",
      customerName: "Bruce Wayne",
      customerEmail: "bruce@wayne.corp",
      tenantName: "Wayne Corp",
      tenantPlan: "Pro",
      mrr: "$5.000",
      status: "waiting",
      queueStatus: "entrada",
      assignee: null,
      sentiment: "Neutro",
      sentimentEmoji: "😐",
      sla: "Vence em 4h",
      isViolatingSLA: false,
      aiSuggestion: "Olá Bruce! Sim, é possível adicionar mais 5 assentos na sua conta Pro. Quer que eu gere a fatura proporcional para esses novos usuários agora mesmo?",
      messages: [
        { id: 1, sender: "customer", name: "Bruce Wayne", time: "10:15", content: "Olá, queria saber se posso adicionar mais 5 assentos no meu plano atual ou se preciso fazer upgrade para o Enterprise." }
      ]
    },
    {
      id: "CHAT-1040",
      customerName: "Clark Kent",
      customerEmail: "clark@dailyplanet.com",
      tenantName: "Daily Planet",
      tenantPlan: "Basic",
      mrr: "$500",
      status: "resolved",
      queueStatus: "finalizado",
      assignee: "Você",
      sentiment: "Feliz",
      sentimentEmoji: "😀",
      sla: "Resolvido",
      isViolatingSLA: false,
      messages: [
        { id: 1, sender: "customer", name: "Clark Kent", time: "08:10", content: "Muito obrigado! O problema com as notificações foi resolvido." },
        { id: 2, sender: "agent", name: "Você", time: "08:12", content: "Fico feliz em ajudar, Clark. Se precisar de mais alguma coisa, estamos à disposição." }
      ]
    }
  ]);

  const filteredChats = chats.filter(c => c.queueStatus === filterTab);
  const activeChat = chats.find(c => c.id === activeChatId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages]);

  const handleSendManualReply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!replyText.trim() || !activeChat) return;
    
    addMessageToActiveChat({
      id: Date.now(),
      sender: "agent",
      name: "Você",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: replyText
    });
    setReplyText("");
  };

  const handleAcceptAISuggestion = () => {
    if (!activeChat || !activeChat.aiSuggestion) return;
    addMessageToActiveChat({
      id: Date.now(),
      sender: "agent",
      name: "Você (Via IA)",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: activeChat.aiSuggestion
    });
    
    // Clear suggestion after use
    setChats(chats.map(c => c.id === activeChat.id ? { ...c, aiSuggestion: undefined } : c));
    toast.success("Resposta enviada rapidamente!", { icon: "🚀" });
  };

  const addMessageToActiveChat = (msg: Message) => {
    setChats(chats.map(c => 
      c.id === activeChatId 
        ? { ...c, messages: [...c.messages, msg] } 
        : c
    ));
  };

  const handleCloseChat = () => {
    toast.success("Chat arquivado. Resumo enviado para o histórico do cliente.");
    setShowCheckoutModal(false);
    // Move to resolved
    setChats(chats.map(c => c.id === activeChatId ? { ...c, queueStatus: "finalizado", status: "resolved", sla: "Resolvido", isViolatingSLA: false } : c));
    
    // Find next available active chat
    const nextChat = chats.find(c => c.id !== activeChatId && c.queueStatus === "meus");
    setActiveChatId(nextChat ? nextChat.id : "");
  };

  const handleAssumirAtendimento = () => {
    if (!activeChat) return;
    setChats(chats.map(c => c.id === activeChatId ? { ...c, queueStatus: "meus", status: "active", assignee: "Você" } : c));
    toast.success("Atendimento assumido! O tempo de resposta já está correndo.");
    setFilterTab("meus");
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] bg-[#050505] overflow-hidden text-sm">
      
      {/* ------------------------------------------------------------- */}
      {/* COLUNA 1: Fila de Conversas (Inbox)                             */}
      {/* ------------------------------------------------------------- */}
      <div className="w-80 bg-[#0A0A0A] border-r border-gray-800 flex flex-col flex-shrink-0 z-20">
        <div className="h-16 px-4 border-b border-gray-800 flex items-center justify-between bg-gray-950">
          <h2 className="font-bold text-white flex items-center gap-2">
             <ChatBubbleLeftRightIcon className="w-5 h-5 text-purple-400" />
             Live Inbox
          </h2>
          <button 
             onClick={() => setUserRole(userRole === "admin" ? "tecnico" : "admin")}
             className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-[10px] font-bold px-2 py-0.5 rounded border border-gray-700 transition-colors"
             title="Clique para simular outro tipo de usuário"
          >
             Modo: {userRole === "admin" ? "Admin" : "Técnico"}
          </button>
        </div>
        
        <div className="p-3 border-b border-gray-800">
           <div className="relative mb-3">
             <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
             <input type="text" placeholder="Buscar chats..." className="w-full bg-[#111111] border border-gray-800 rounded-lg pl-9 pr-3 py-2 text-white text-xs outline-none focus:border-purple-500/50" />
           </div>
           
           {/* Tab Filters */}
           <div className="flex bg-[#111111] border border-gray-800 rounded-lg p-1 gap-1 overflow-x-auto custom-scrollbar">
             <button onClick={() => setFilterTab("entrada")} className={`flex-1 py-1.5 px-2 text-[10px] font-bold rounded-md uppercase tracking-wider transition-colors whitespace-nowrap ${filterTab === "entrada" ? "bg-purple-600 text-white shadow" : "text-gray-500 hover:text-gray-300"}`}>
               Entrada
             </button>
             <button onClick={() => setFilterTab("meus")} className={`flex-1 py-1.5 px-2 text-[10px] font-bold rounded-md uppercase tracking-wider transition-colors whitespace-nowrap ${filterTab === "meus" ? "bg-purple-600 text-white shadow" : "text-gray-500 hover:text-gray-300"}`}>
               Meus
             </button>
             {userRole === "admin" && (
               <>
                 <button onClick={() => setFilterTab("em_atendimento")} className={`flex-1 py-1.5 px-2 text-[10px] font-bold rounded-md uppercase tracking-wider transition-colors whitespace-nowrap ${filterTab === "em_atendimento" ? "bg-purple-600 text-white shadow" : "text-gray-500 hover:text-gray-300"}`}>
                   Atend.
                 </button>
                 <button onClick={() => setFilterTab("finalizado")} className={`flex-1 py-1.5 px-2 text-[10px] font-bold rounded-md uppercase tracking-wider transition-colors whitespace-nowrap ${filterTab === "finalizado" ? "bg-purple-600 text-white shadow" : "text-gray-500 hover:text-gray-300"}`}>
                   Fim
                 </button>
               </>
             )}
           </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredChats.length === 0 && (
             <div className="p-8 text-center text-gray-500 text-xs flex flex-col items-center">
               <CheckBadgeIcon className="w-8 h-8 mb-2 opacity-50 text-gray-600" />
               Nenhum chat nesta lista.
             </div>
          )}
          {filteredChats.map(chat => (
            <div 
              key={chat.id}
              onClick={() => setActiveChatId(chat.id)}
              className={`p-4 border-b border-gray-800/50 cursor-pointer transition-colors relative ${
                activeChatId === chat.id 
                  ? "bg-purple-900/10 border-l-2 border-l-purple-500" 
                  : "hover:bg-white/[0.02] border-l-2 border-l-transparent"
              }`}
            >
               <div className="flex justify-between items-start mb-1">
                 <h3 className={`font-bold text-sm ${activeChatId === chat.id ? 'text-white' : 'text-gray-300'}`}>
                   {chat.customerName}
                 </h3>
                 <span className="text-[10px] text-gray-500">
                   {chat.messages[chat.messages.length - 1]?.time}
                 </span>
               </div>
               <p className="text-xs text-gray-500 line-clamp-1 mb-2">
                 <span className="text-gray-400 font-medium">{chat.messages[chat.messages.length - 1]?.sender === 'agent' ? 'Você: ' : ''}</span>
                 {chat.messages[chat.messages.length - 1]?.content}
               </p>
               <div className="flex items-center gap-2">
                 <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                   chat.isViolatingSLA ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-gray-800 text-gray-400'
                 }`}>
                   {chat.sla}
                 </span>
                 <span className="text-xs">{chat.sentimentEmoji}</span>
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* COLUNA 2: Centro Nervoso do Chat (Meio)                         */}
      {/* ------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col relative">
        {activeChat ? (
          <>
            {/* Header do Chat */}
            <div className="h-16 px-6 border-b border-gray-800 bg-[#0A0A0A] flex items-center justify-between flex-shrink-0">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-lg">
                   {activeChat.customerName.charAt(0)}
                 </div>
                 <div>
                   <h2 className="font-bold text-white text-sm">{activeChat.customerName}</h2>
                   <p className="text-xs text-gray-500">Visitando pelo portal de ajuda</p>
                 </div>
               </div>
            </div>

            {/* Área de Mensagens */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
               {activeChat.messages.map((msg) => (
                 <div key={msg.id} className={`flex ${msg.sender === 'agent' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[75%] rounded-2xl p-4 ${
                     msg.sender === 'agent' 
                       ? 'bg-purple-600 text-white rounded-br-none shadow-[0_0_15px_rgba(147,51,234,0.2)]'
                       : msg.sender === 'ai'
                       ? 'bg-blue-900/20 border border-blue-500/30 text-blue-200 rounded-bl-none shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                       : 'bg-[#111111] border border-gray-800 text-gray-200 rounded-bl-none'
                   }`}>
                      <div className="flex items-center gap-2 mb-1.5">
                         <span className={`text-[10px] font-bold ${
                           msg.sender === 'ai' ? 'text-blue-400 flex items-center gap-1' : msg.sender === 'agent' ? 'text-purple-200' : 'text-gray-400'
                         }`}>
                           {msg.sender === 'ai' && <SparklesIcon className="w-3 h-3" />}
                           {msg.name}
                         </span>
                         <span className="text-[9px] text-gray-500">{msg.time}</span>
                      </div>
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                   </div>
                 </div>
               ))}
               <div ref={messagesEndRef} />
            </div>

            {/* Input Area + Copilot Overlay */}
            <div className="p-4 bg-[#0A0A0A] border-t border-gray-800 relative">
               
               {/* IA Inline Suggestion Bubble */}
               {activeChat.aiSuggestion && (
                 <div className="absolute bottom-full left-4 right-4 mb-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 p-4 rounded-xl shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-2">
                    <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <SparklesIcon className="w-3 h-3" /> IA Copilot Sugere:
                    </h3>
                    <p className="text-gray-200 text-sm italic mb-4 leading-relaxed border-l-2 border-blue-500/50 pl-3">
                      "{activeChat.aiSuggestion}"
                    </p>
                    <div className="flex gap-2">
                       <button 
                         onClick={handleAcceptAISuggestion}
                         className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg flex items-center gap-2"
                       >
                          <CheckBadgeIcon className="w-4 h-4" /> Aprovar e Enviar
                       </button>
                       <button 
                         onClick={() => setChats(chats.map(c => c.id === activeChat.id ? { ...c, aiSuggestion: undefined } : c))}
                         className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-bold transition-colors border border-gray-700"
                       >
                          Recusar
                       </button>
                    </div>
                 </div>
               )}

               <form onSubmit={handleSendManualReply} className="flex items-end gap-2">
                  <div className="flex-1 bg-[#111111] border border-gray-800 rounded-xl overflow-hidden focus-within:border-purple-500 transition-all shadow-inner">
                     <textarea 
                       value={replyText}
                       onChange={(e) => setReplyText(e.target.value)}
                       disabled={activeChat.queueStatus === "entrada" || activeChat.queueStatus === "finalizado"}
                       placeholder={activeChat.queueStatus === "entrada" ? "Assuma o atendimento primeiro para responder..." : "Escreva sua resposta manual aqui..."}
                       className="w-full bg-transparent border-none p-3 text-white resize-none h-16 outline-none custom-scrollbar disabled:opacity-50 disabled:cursor-not-allowed"
                     />
                  </div>
                  <button 
                    type="submit" 
                    disabled={!replyText.trim() || activeChat.queueStatus === "finalizado" || activeChat.queueStatus === "entrada"} 
                    className="h-16 px-6 bg-white hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-black rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                  >
                     Enviar <PaperAirplaneIcon className="w-4 h-4" />
                  </button>
               </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center flex-col text-gray-500">
             <ChatBubbleLeftRightIcon className="w-16 h-16 mb-4 opacity-20" />
             <p className="font-bold">Nenhum chat selecionado</p>
             <p className="text-xs mt-1">Selecione uma conversa na fila para começar o atendimento.</p>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* COLUNA 3: CRM Context & Checkout (Direita)                      */}
      {/* ------------------------------------------------------------- */}
      {activeChat && (
        <div className="w-72 bg-[#0A0A0A] border-l border-gray-800 flex flex-col flex-shrink-0 z-20 shadow-2xl">
           <div className="p-4 border-b border-gray-800 bg-gray-950">
              <h2 className="font-bold text-white text-sm">Contexto & Ações</h2>
           </div>

           <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
              
              {/* Action Button (Assumir vs Encerrar) */}
              {activeChat.queueStatus === "entrada" ? (
                <button 
                  onClick={handleAssumirAtendimento}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white border border-purple-500/50 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(147,51,234,0.3)] animate-in zoom-in-95"
                >
                   Assumir Atendimento
                </button>
              ) : activeChat.queueStatus === "meus" || activeChat.queueStatus === "em_atendimento" ? (
                <button 
                  onClick={() => setShowCheckoutModal(true)}
                  className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                   <XMarkIcon className="w-5 h-5" />
                   Encerrar Chat
                </button>
              ) : (
                <div className="w-full py-3 bg-gray-800/50 text-gray-500 border border-gray-800 rounded-xl font-bold flex items-center justify-center gap-2">
                   <CheckBadgeIcon className="w-5 h-5" />
                   Chat Finalizado
                </div>
              )}

              <hr className="border-gray-800" />

              {/* Sentiment Card */}
              <div className="bg-[#111111] border border-gray-800 p-4 rounded-xl relative overflow-hidden">
                 <div className="absolute -right-4 -top-4 text-6xl opacity-10 blur-sm">{activeChat.sentimentEmoji}</div>
                 <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Sentimento do Cliente (IA)</h3>
                 <div className="flex items-center gap-2">
                    <span className="text-xl">{activeChat.sentimentEmoji}</span>
                    <span className="font-bold text-white">{activeChat.sentiment}</span>
                 </div>
              </div>

              {/* CRM Card */}
              <div>
                 <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                   <BuildingOfficeIcon className="w-3 h-3" /> Perfil do Cliente
                 </h3>
                 <div className="p-4 rounded-xl bg-[#111111] border border-gray-800">
                   <div className="mb-4">
                     <div className="font-bold text-white text-sm">{activeChat.customerName}</div>
                     <div className="text-xs text-gray-500 mt-0.5">{activeChat.customerEmail}</div>
                   </div>
                   
                   <div className="space-y-3 pt-4 border-t border-gray-800/50">
                     <div className="flex justify-between items-center text-xs">
                       <span className="text-gray-500">Empresa</span>
                       <span className="font-bold text-gray-300">{activeChat.tenantName}</span>
                     </div>
                     <div className="flex justify-between items-center text-xs">
                       <span className="text-gray-500">Plano</span>
                       <span className="font-bold text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded">{activeChat.tenantPlan}</span>
                     </div>
                     <div className="flex justify-between items-center text-xs">
                       <span className="text-gray-500">MRR Mensal</span>
                       <span className="font-bold text-green-400">{activeChat.mrr}</span>
                     </div>
                   </div>
                 </div>
              </div>

              {/* Base de Conhecimento Link */}
              <button 
                onClick={() => setShowKbModal(true)}
                className="w-full py-3 bg-blue-500/5 hover:bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm text-xs"
              >
                 <SparklesIcon className="w-4 h-4" />
                 Base de Conhecimento (IA)
              </button>

              {/* SLA Monitor */}
              <div>
                 <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                   <ClockIcon className="w-3 h-3" /> SLA Monitor
                 </h3>
                 <div className={`p-4 rounded-xl border ${activeChat.isViolatingSLA ? 'bg-red-500/10 border-red-500/20' : 'bg-[#111111] border-gray-800'}`}>
                   <div className={`text-sm font-bold ${activeChat.isViolatingSLA ? 'text-red-400' : 'text-gray-300'}`}>
                      {activeChat.sla}
                   </div>
                   {activeChat.isViolatingSLA && (
                     <div className="text-[10px] text-red-500 mt-1 font-medium">Tempo de resposta violado. Alto risco de churn.</div>
                   )}
                 </div>
              </div>

           </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL DE ENCERRAMENTO (CHECKOUT)                                */}
      {/* ------------------------------------------------------------- */}
      {showCheckoutModal && activeChat && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
           <div className="bg-[#111111] border border-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-in zoom-in-95">
              <button onClick={() => setShowCheckoutModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                 <XMarkIcon className="w-6 h-6" />
              </button>
              
              <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center border border-purple-500/30 mb-6">
                 <SparklesIcon className="w-6 h-6 text-purple-400" />
              </div>
              
              <h2 className="text-xl font-bold text-white mb-2">Finalizar Atendimento</h2>
              <p className="text-sm text-gray-400 mb-6">A Inteligência Artificial leu todo o chat e gerou este resumo executivo para ser salvo no histórico.</p>

              <div className="bg-[#0A0A0A] border border-gray-800 rounded-xl p-4 mb-6">
                 <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Resumo Gerado pela IA</h3>
                 <p className="text-xs text-gray-300 leading-relaxed italic border-l-2 border-purple-500/50 pl-3">
                   "Cliente reportou erro 500 no webhook de pagamentos. A equipe técnica (Nível 2) foi acionada. Foi aplicado um bypass temporário no provedor cloud. Cliente confirmou normalização."
                 </p>
                 
                 <div className="flex gap-2 mt-4">
                    <span className="text-[10px] font-bold bg-gray-800 text-gray-400 px-2 py-1 rounded">Tag: Bug Financeiro</span>
                    <span className="text-[10px] font-bold bg-gray-800 text-gray-400 px-2 py-1 rounded">CSAT: N/A</span>
                 </div>
              </div>

              <div className="flex gap-3">
                 <button onClick={() => setShowCheckoutModal(false)} className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold transition-colors">
                    Cancelar
                 </button>
                 <button onClick={handleCloseChat} className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold shadow-[0_0_15px_rgba(147,51,234,0.3)] transition-all">
                    Confirmar e Fechar
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL DE BASE DE CONHECIMENTO                                   */}
      {/* ------------------------------------------------------------- */}
      {showKbModal && activeChat && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
           <div className="bg-[#111111] border border-gray-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl relative animate-in zoom-in-95 flex flex-col h-[600px]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <SparklesIcon className="w-5 h-5 text-blue-400" />
                    Base de Conhecimento Rápida
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">Buscando na documentação de: <strong className="text-gray-200">{activeChat.tenantName}</strong></p>
                </div>
                <button onClick={() => setShowKbModal(false)} className="text-gray-500 hover:text-white">
                   <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="relative mb-6">
                 <MagnifyingGlassIcon className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                 <input 
                   type="text" 
                   placeholder="Faça uma pergunta para a IA sobre o processo..."
                   className="w-full bg-[#0A0A0A] border border-gray-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:border-blue-500/50 outline-none"
                 />
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                 <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                    <h3 className="text-sm font-bold text-blue-400 mb-2">Artigo Sugerido: Como resolver falhas de Webhook (Timeout)</h3>
                    <p className="text-xs text-gray-300 leading-relaxed">
                       Segundo a documentação técnica da {activeChat.tenantName}, quando ocorre um erro 500 originado por timeouts no servidor do cliente, o procedimento padrão Nível 1 é:
                       <br/><br/>
                       1. Validar se o IP do servidor não está bloqueado no WAF.<br/>
                       2. Aplicar um bypass de 24h na fila de retentativas.<br/>
                       3. Solicitar ao cliente a verificação de gargalos no endpoint alvo.
                    </p>
                    <button className="mt-3 text-xs font-bold text-blue-500 hover:text-blue-400 underline">Copiar Link do Artigo</button>
                 </div>
                 
                 <div className="bg-[#0A0A0A] border border-gray-800 rounded-xl p-4 opacity-70">
                    <h3 className="text-sm font-bold text-gray-400 mb-2">Artigo Relacionado: Rotatividade de Chaves API</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">Instruções para invalidar o cache após o cliente rotacionar a chave de produção...</p>
                 </div>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}
