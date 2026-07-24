"use client";

import { useState } from "react";
import { PaintBrushIcon, PaperAirplaneIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";

export default function ChatBuilderPage() {
  const [botName, setBotName] = useState("Assistente Acme");
  const [welcomeMessage, setWelcomeMessage] = useState("Olá! Como posso ajudar você hoje?");
  const [primaryColor, setPrimaryColor] = useState("#3b82f6"); // blue-500 default

  const colorPresets = [
    { name: "Blue", value: "#3b82f6" },
    { name: "Purple", value: "#9333ea" },
    { name: "Emerald", value: "#10b981" },
    { name: "Rose", value: "#e11d48" },
    { name: "Amber", value: "#f59e0b" },
    { name: "Dark", value: "#111111" }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-[calc(100vh-140px)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Aparência do Chat</h1>
        <p className="text-gray-400 mt-2">Personalize a identidade visual do assistente virtual (White-label).</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">
        
        {/* Painel de Configurações (Esquerda) */}
        <div className="w-full lg:w-1/3 bg-[#111111] rounded-2xl shadow-xl border border-gray-800 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-gray-800 bg-[#0A0A0A] flex items-center gap-3">
            <PaintBrushIcon className="w-6 h-6 text-purple-400" />
            <h2 className="text-lg font-bold text-white">Configurações</h2>
          </div>
          
          <div className="p-6 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
            {/* Cor Primária */}
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-3">Cor Principal</label>
              <div className="flex flex-wrap gap-3 mb-4">
                {colorPresets.map(color => (
                  <button
                    key={color.value}
                    onClick={() => setPrimaryColor(color.value)}
                    className={`w-10 h-10 rounded-full transition-transform ${primaryColor === color.value ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-[#111111]' : 'hover:scale-110'}`}
                    style={{ backgroundColor: color.value }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={primaryColor} 
                  onChange={(e) => setPrimaryColor(e.target.value)} 
                  className="w-10 h-10 rounded cursor-pointer bg-transparent border-0 p-0"
                />
                <span className="text-xs font-mono text-gray-500 uppercase">{primaryColor}</span>
              </div>
            </div>

            {/* Textos */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-1.5">Nome do Robô</label>
                <input 
                  type="text" 
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:border-transparent outline-none transition-all"
                  style={{ '--tw-ring-color': primaryColor } as any}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-1.5">Mensagem de Boas-vindas</label>
                <textarea 
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  rows={3}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:border-transparent outline-none transition-all resize-none"
                  style={{ '--tw-ring-color': primaryColor } as any}
                />
              </div>
            </div>

            {/* Logotipo */}
            <div>
               <label className="block text-sm font-bold text-gray-400 mb-1.5">Logotipo (Avatar)</label>
               <div className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center cursor-pointer hover:bg-gray-900/50 transition-colors">
                  <p className="text-xs text-gray-500 font-semibold">Clique para fazer upload (PNG, JPG)</p>
               </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-800 bg-[#0A0A0A]">
            <button className="w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all hover:opacity-90" style={{ backgroundColor: primaryColor }}>
              Salvar Alterações
            </button>
          </div>
        </div>

        {/* Área de Preview (Direita) */}
        <div className="w-full lg:w-2/3 bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden relative flex flex-col">
           {/* Mock do Site do Cliente */}
           <div className="flex-1 p-8 opacity-40 select-none pointer-events-none">
              <div className="w-40 h-8 bg-gray-800 rounded-lg mb-12"></div>
              <div className="w-3/4 h-12 bg-gray-800 rounded-xl mb-6"></div>
              <div className="w-1/2 h-6 bg-gray-800 rounded-md mb-4"></div>
              <div className="w-2/3 h-6 bg-gray-800 rounded-md mb-12"></div>
              <div className="grid grid-cols-3 gap-6">
                <div className="h-40 bg-gray-800 rounded-xl"></div>
                <div className="h-40 bg-gray-800 rounded-xl"></div>
                <div className="h-40 bg-gray-800 rounded-xl"></div>
              </div>
           </div>

           {/* Widget Interativo Overlay */}
           <div className="absolute bottom-8 right-8 flex flex-col items-end gap-4 z-10">
              
              {/* Janela de Chat Aberta */}
              <div className="w-80 h-[420px] bg-[#111111] border border-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 origin-bottom-right">
                 {/* Header do Widget */}
                 <div className="px-5 py-4 flex items-center gap-3 shadow-md" style={{ backgroundColor: primaryColor }}>
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/30 backdrop-blur-sm text-white font-bold">
                       {botName.charAt(0) || "B"}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{botName}</h3>
                      <p className="text-[10px] text-white/70 flex items-center gap-1">
                         <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                         Online
                      </p>
                    </div>
                 </div>

                 {/* Área de Mensagens */}
                 <div className="flex-1 p-4 bg-[#0A0A0A] overflow-y-auto space-y-4">
                    {/* Balão da IA */}
                    <div className="flex gap-2 max-w-[85%]">
                       <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white mt-1 shadow-sm" style={{ backgroundColor: primaryColor }}>
                          {botName.charAt(0) || "B"}
                       </div>
                       <div className="bg-gray-800 border border-gray-700 text-gray-200 text-sm px-4 py-2.5 rounded-2xl rounded-tl-sm leading-relaxed shadow-sm">
                          {welcomeMessage}
                       </div>
                    </div>
                    
                    {/* Balão do Usuário */}
                    <div className="flex justify-end">
                       <div className="text-white text-sm px-4 py-2.5 rounded-2xl rounded-tr-sm shadow-sm max-w-[85%]" style={{ backgroundColor: primaryColor }}>
                          Gostaria de saber sobre políticas de reembolso.
                       </div>
                    </div>

                    {/* Digitando indicator mock */}
                    <div className="flex gap-2 max-w-[85%] opacity-50">
                       <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white mt-1 shadow-sm" style={{ backgroundColor: primaryColor }}>
                          {botName.charAt(0) || "B"}
                       </div>
                       <div className="bg-gray-800 border border-gray-700 px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce"></span>
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                       </div>
                    </div>
                 </div>

                 {/* Input Area */}
                 <div className="p-3 bg-[#111111] border-t border-gray-800 flex items-center gap-2">
                    <input 
                      type="text" 
                      placeholder="Escreva sua mensagem..." 
                      className="flex-1 bg-gray-900 border border-gray-700 rounded-full px-4 py-2 text-sm text-white focus:outline-none"
                    />
                    <button className="w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-105" style={{ backgroundColor: primaryColor }}>
                      <PaperAirplaneIcon className="w-4 h-4 text-white -ml-0.5" />
                    </button>
                 </div>
              </div>

              {/* Botão Flutuante (Bubble) */}
              <div className="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center cursor-pointer hover:scale-110 transition-transform" style={{ backgroundColor: primaryColor }}>
                 <ChatBubbleLeftRightIcon className="w-7 h-7 text-white" />
              </div>

           </div>
        </div>
      </div>
    </div>
  );
}
