"use client";

import { useState } from "react";
import { MagnifyingGlassIcon, TicketIcon, ChatBubbleLeftRightIcon, ChevronRightIcon, BookOpenIcon, UserCircleIcon, XMarkIcon, ArrowLeftIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";

export default function PortalUI({ tenantName, primaryColor = "#3b82f6" }: { tenantName: string, primaryColor?: string }) {
  const [activeTab, setActiveTab] = useState("home"); // home, tickets, profile
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [chatMessage, setChatMessage] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [promoAlerts, setPromoAlerts] = useState(false);

  const popularArticles = [
    { id: 1, title: "Como redefinir minha senha?", category: "Conta", content: "Para redefinir sua senha, clique em 'Esqueci minha senha' na tela de login. Você receberá um e-mail com instruções detalhadas. Verifique sua caixa de spam caso não encontre." },
    { id: 2, title: "Qual o prazo de reembolso?", category: "Financeiro", content: "Os reembolsos são processados em até 7 dias úteis após a aprovação. O valor retornará para a mesma forma de pagamento utilizada na compra original." },
    { id: 3, title: "Configurando alertas por e-mail", category: "Sistema", content: "Acesse suas configurações de perfil clicando na sua foto no canto superior direito. Vá em 'Notificações' e ative as caixas de seleção correspondentes aos alertas que deseja receber." }
  ];

  const myTickets = [
    { id: "T-106", title: "Como resetar minha senha?", status: "Resolvido", date: "Ontem", description: "Esqueci minha senha e o e-mail não chega.", resolution: "Verificamos que o e-mail estava caindo na caixa de spam do seu provedor corporativo. Já enviamos um novo link de redefinição." },
    { id: "T-105", title: "Sistema lento ao gerar relatório", status: "Em Análise", date: "Há 3 dias", description: "Sempre que clico em exportar para PDF a tela congela.", resolution: "A equipe de engenharia está investigando os logs da sua conta." },
    { id: "T-101", title: "Dúvida sobre faturamento mensal", status: "Fechado", date: "Semana passada", description: "A nota fiscal deste mês veio com valor diferente.", resolution: "Foi aplicado o desconto pro-rata referente à mudança de plano no dia 15." }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30 pb-24">
      
      {/* Navbar */}
      <nav className="border-b border-gray-800 bg-[#0A0A0A]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab("home")}>
             <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center font-bold shadow-sm group-hover:scale-105 transition-transform">
                {tenantName.charAt(0).toUpperCase()}
             </div>
             <span className="font-bold text-lg tracking-tight capitalize group-hover:text-gray-300 transition-colors">{tenantName} Help Center</span>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={() => setActiveTab("tickets")} className={`text-sm font-semibold transition-colors ${activeTab === 'tickets' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>Meus Tickets</button>
             <button onClick={() => setActiveTab("profile")} className="flex items-center gap-2 text-sm font-semibold text-white bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-full transition-colors">
               <UserCircleIcon className="w-5 h-5" />
               Meu Perfil
             </button>
          </div>
        </div>
      </nav>

      {/* --- TAB: HOME --- */}
      {activeTab === "home" && (
        <>
          {/* Hero Section */}
          <div className="relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] opacity-20 pointer-events-none"
                 style={{ background: `radial-gradient(circle at top, ${primaryColor} 0%, transparent 70%)` }}></div>
            
            <div className="max-w-3xl mx-auto px-6 pt-24 pb-16 text-center relative z-10">
              <h1 className="text-5xl font-extrabold tracking-tight mb-6 leading-tight">
                Como podemos te ajudar hoje?
              </h1>
              
              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-6 w-6 text-gray-500 group-focus-within:text-white transition-colors" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-14 pr-6 py-5 bg-[#111111]/80 backdrop-blur-xl border border-gray-700 rounded-2xl text-lg text-white placeholder-gray-500 focus:ring-2 focus:border-transparent outline-none transition-all shadow-2xl"
                  placeholder="Descreva seu problema ou busque um artigo..."
                  style={{ '--tw-ring-color': primaryColor } as any}
                />
                <button 
                   className="absolute inset-y-2 right-2 px-6 rounded-xl font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
                   style={{ backgroundColor: primaryColor }}
                >
                  Buscar
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            
            {/* Quick Actions */}
            <div className="md:col-span-2 space-y-8">
               
               {/* Section: Artigos Populares */}
               <div>
                 <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                   <BookOpenIcon className="w-6 h-6 text-blue-400" />
                   Artigos Populares
                 </h2>
                 <div className="grid gap-4">
                   {popularArticles.map(article => (
                     <div key={article.id} onClick={() => setSelectedArticle(article)} className="bg-[#111111] border border-gray-800 rounded-2xl p-5 hover:border-gray-600 cursor-pointer transition-all hover:bg-gray-900/80 group flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1 block">{article.category}</span>
                          <h3 className="font-semibold text-gray-200 group-hover:text-white transition-colors">{article.title}</h3>
                        </div>
                        <ChevronRightIcon className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                     </div>
                   ))}
                 </div>
               </div>

            </div>

            {/* Sidebar */}
            <div className="space-y-6">
               {/* Card: Abrir Ticket */}
               <div className="bg-gradient-to-br from-gray-900 to-[#111111] border border-gray-800 rounded-2xl p-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>
                  <TicketIcon className="w-8 h-8 text-gray-400 mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">Não encontrou a resposta?</h3>
                  <p className="text-sm text-gray-400 mb-6">Nossa equipe técnica está pronta para analisar seu caso detalhadamente.</p>
                  <button onClick={() => setIsChatOpen(true)} className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors shadow-lg relative z-10">
                    Abrir Chamado
                  </button>
               </div>

               {/* Meus Tickets (Logado) */}
               <div className="bg-[#111111] border border-gray-800 rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-white">Chamados Recentes</h3>
                    <button onClick={() => setActiveTab("tickets")} className="text-xs text-blue-400 hover:text-blue-300 font-semibold">Ver todos</button>
                  </div>
                  <div className="space-y-3">
                    {myTickets.slice(0, 2).map(ticket => (
                      <div key={ticket.id} onClick={() => setSelectedTicket(ticket)} className="p-3 bg-gray-900 border border-gray-800 rounded-xl hover:border-gray-600 cursor-pointer transition-all">
                         <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-mono font-bold text-gray-500">{ticket.id}</span>
                            <span className="text-[10px] uppercase font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-md border border-green-500/20">{ticket.status}</span>
                         </div>
                         <p className="text-sm font-semibold text-gray-300 truncate">{ticket.title}</p>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        </>
      )}

      {/* --- TAB: TICKETS --- */}
      {activeTab === "tickets" && (
        <div className="max-w-5xl mx-auto px-6 py-12 animate-in fade-in duration-300">
           <button onClick={() => setActiveTab("home")} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm font-semibold mb-8 transition-colors">
              <ArrowLeftIcon className="w-4 h-4" />
              Voltar para o Início
           </button>
           
           <div className="flex justify-between items-end mb-8">
             <div>
               <h1 className="text-3xl font-bold text-white mb-2">Meus Tickets</h1>
               <p className="text-gray-400">Acompanhe o status e o histórico dos seus chamados de suporte.</p>
             </div>
             <button onClick={() => setIsChatOpen(true)} className="px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95" style={{ backgroundColor: primaryColor }}>
                Novo Chamado
             </button>
           </div>

           <div className="bg-[#111111] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
              <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-gray-900/50 border-b border-gray-800 text-xs uppercase tracking-wider text-gray-500">
                     <th className="p-4 font-bold">ID</th>
                     <th className="p-4 font-bold">Assunto</th>
                     <th className="p-4 font-bold">Status</th>
                     <th className="p-4 font-bold">Última Atualização</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-800">
                   {myTickets.map(ticket => (
                     <tr key={ticket.id} onClick={() => setSelectedTicket(ticket)} className="hover:bg-gray-900 cursor-pointer transition-colors group">
                       <td className="p-4 font-mono text-sm text-gray-400 group-hover:text-white transition-colors">{ticket.id}</td>
                       <td className="p-4 font-semibold text-gray-200 group-hover:text-white transition-colors">{ticket.title}</td>
                       <td className="p-4">
                         <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md border ${ticket.status === 'Resolvido' ? 'text-green-400 bg-green-500/10 border-green-500/20' : ticket.status === 'Fechado' ? 'text-gray-400 bg-gray-500/10 border-gray-500/20' : 'text-blue-400 bg-blue-500/10 border-blue-500/20'}`}>
                           {ticket.status}
                         </span>
                       </td>
                       <td className="p-4 text-sm text-gray-500">{ticket.date}</td>
                     </tr>
                   ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {/* --- TAB: PROFILE --- */}
      {activeTab === "profile" && (
        <div className="max-w-3xl mx-auto px-6 py-12 animate-in fade-in duration-300">
           <button onClick={() => setActiveTab("home")} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm font-semibold mb-8 transition-colors">
              <ArrowLeftIcon className="w-4 h-4" />
              Voltar para o Início
           </button>
           
           <h1 className="text-3xl font-bold text-white mb-2">Meu Perfil</h1>
           <p className="text-gray-400 mb-8">Gerencie suas informações pessoais e preferências da conta.</p>

           <div className="bg-[#111111] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl mb-8">
              <div className="p-6 border-b border-gray-800 flex items-center gap-4">
                 <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center text-xl font-bold text-white border-2 border-gray-700">
                    JD
                 </div>
                 <div>
                    <h2 className="text-xl font-bold text-white">John Doe</h2>
                    <p className="text-gray-400 text-sm">john.doe@example.com</p>
                 </div>
              </div>
              <div className="p-6 space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nome Completo</label>
                      <input type="text" defaultValue="John Doe" className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gray-600 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">E-mail</label>
                      <input type="email" defaultValue="john.doe@example.com" disabled className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed" />
                    </div>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Telefone</label>
                    <input type="tel" placeholder="(11) 99999-9999" className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gray-600 transition-colors" />
                 </div>
                 <div className="pt-4 flex justify-end">
                    <button className="px-6 py-2 rounded-xl font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95" style={{ backgroundColor: primaryColor }}>
                      Salvar Alterações
                    </button>
                 </div>
              </div>
           </div>
           
           <div className="bg-[#111111] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
             <div className="p-6 border-b border-gray-800">
                <h3 className="font-bold text-white mb-1 flex items-center gap-2"><Cog6ToothIcon className="w-5 h-5 text-gray-400" /> Preferências do Sistema</h3>
                <p className="text-sm text-gray-400">Gerencie como você recebe notificações e alertas.</p>
             </div>
             <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                   <div>
                     <p className="font-semibold text-gray-200">Notificações por E-mail</p>
                     <p className="text-sm text-gray-500">Receber e-mails quando um chamado for respondido.</p>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer" onClick={() => setEmailNotifications(!emailNotifications)}>
                     <div className={`w-11 h-6 rounded-full transition-all flex items-center p-[2px] ${emailNotifications ? '' : 'bg-gray-700'}`} style={emailNotifications ? { backgroundColor: primaryColor } : {}}>
                        <div className={`w-5 h-5 bg-white rounded-full transition-all shadow-sm ${emailNotifications ? 'translate-x-5' : 'translate-x-0'}`}></div>
                     </div>
                   </label>
                </div>
                
                <div className="flex items-center justify-between pt-6 border-t border-gray-800">
                   <div>
                     <p className="font-semibold text-gray-200">Alertas Promocionais</p>
                     <p className="text-sm text-gray-500">Receber dicas e novidades sobre novos recursos.</p>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer" onClick={() => setPromoAlerts(!promoAlerts)}>
                     <div className={`w-11 h-6 rounded-full transition-all flex items-center p-[2px] ${promoAlerts ? '' : 'bg-gray-700'}`} style={promoAlerts ? { backgroundColor: primaryColor } : {}}>
                        <div className={`w-5 h-5 bg-white rounded-full transition-all shadow-sm ${promoAlerts ? 'translate-x-5' : 'translate-x-0'}`}></div>
                     </div>
                   </label>
                </div>
             </div>
           </div>
        </div>
      )}

      {/* Floating Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
        {/* Chat Window */}
        {isChatOpen && (
          <div className="w-[360px] h-[550px] bg-[#111111] border border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 origin-bottom-right">
             <div className="px-5 py-4 flex justify-between items-center shadow-md relative" style={{ backgroundColor: primaryColor }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/30 backdrop-blur-sm text-white font-bold">
                      {tenantName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Assistente IA</h3>
                    <p className="text-[10px] text-white/80 flex items-center gap-1 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                        Responde instantaneamente
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="text-white/70 hover:text-white transition-colors">
                  <XMarkIcon className="w-6 h-6" />
                </button>
             </div>

             <div className="flex-1 p-5 bg-[#0A0A0A] overflow-y-auto space-y-6">
                <div className="flex gap-3 max-w-[90%]">
                    <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white mt-1 shadow-sm" style={{ backgroundColor: primaryColor }}>
                      {tenantName.charAt(0).toUpperCase()}
                    </div>
                    <div className="bg-gray-800 border border-gray-700 text-gray-200 text-sm px-4 py-3 rounded-2xl rounded-tl-sm leading-relaxed shadow-sm">
                      Olá! Sou o assistente virtual da {tenantName}. Fui treinado com todos os manuais e regras da empresa. Como posso te ajudar hoje?
                    </div>
                </div>
             </div>

             <div className="p-4 bg-[#111111] border-t border-gray-800">
                <div className="relative flex items-center">
                  <input 
                    type="text" 
                    placeholder="Digite sua dúvida..." 
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-full pl-5 pr-12 py-3 text-sm text-white focus:outline-none focus:border-gray-500 transition-colors shadow-inner"
                  />
                  <button className="absolute right-2 w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-105" style={{ backgroundColor: primaryColor }}>
                    <ChatBubbleLeftRightIcon className="w-4 h-4 text-white" />
                  </button>
                </div>
             </div>
          </div>
        )}

        {/* Chat Toggle Button */}
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-16 h-16 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.3)] flex items-center justify-center hover:scale-110 transition-transform active:scale-95" 
          style={{ backgroundColor: primaryColor }}
        >
           {isChatOpen ? (
             <XMarkIcon className="w-8 h-8 text-white" />
           ) : (
             <ChatBubbleLeftRightIcon className="w-8 h-8 text-white" />
           )}
        </button>
      </div>

      {/* Modal: Artigo */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#111111] border border-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="px-6 py-5 border-b border-gray-800 flex justify-between items-start bg-[#0A0A0A]">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2 block">{selectedArticle.category}</span>
                <h2 className="text-2xl font-bold text-white">{selectedArticle.title}</h2>
              </div>
              <button onClick={() => setSelectedArticle(null)} className="text-gray-500 hover:text-white transition-colors">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 p-8 overflow-y-auto bg-[#050505]">
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed text-lg">{selectedArticle.content}</p>
              </div>
              
              <div className="mt-12 pt-8 border-t border-gray-800 text-center">
                 <p className="text-sm font-semibold text-gray-500 mb-4">Este artigo foi útil?</p>
                 <div className="flex items-center justify-center gap-4">
                    <button className="px-6 py-2 rounded-full border border-gray-700 text-white hover:bg-gray-800 transition-colors">👍 Sim</button>
                    <button className="px-6 py-2 rounded-full border border-gray-700 text-white hover:bg-gray-800 transition-colors">👎 Não</button>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Chamado (Ticket) */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#111111] border border-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="px-6 py-5 border-b border-gray-800 flex justify-between items-center bg-[#0A0A0A]">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-gray-500 bg-gray-900 px-2 py-1 rounded">{selectedTicket.id}</span>
                <h2 className="text-lg font-bold text-white">{selectedTicket.title}</h2>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="text-gray-500 hover:text-white transition-colors">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 p-6 overflow-y-auto bg-[#050505]">
              <div className="flex gap-4 mb-8 bg-gray-900 border border-gray-800 rounded-xl p-4">
                 <div>
                   <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Status</p>
                   <p className="text-sm font-semibold text-green-400">{selectedTicket.status}</p>
                 </div>
                 <div className="w-px h-8 bg-gray-800" />
                 <div>
                   <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Data de Criação</p>
                   <p className="text-sm text-gray-200 font-semibold">{selectedTicket.date}</p>
                 </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 ml-8 relative">
                    <div className="absolute -left-12 top-2 w-8 h-8 rounded-full bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                      Você
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">{selectedTicket.description}</p>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 ml-8 relative">
                    <div className="absolute -left-12 top-2 w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                      Sup
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-gray-200 text-sm">Equipe de Suporte</span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">{selectedTicket.resolution}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
