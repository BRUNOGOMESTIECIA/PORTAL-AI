"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showTiflux, setShowTiflux] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    const assistantMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: assistantMessageId, role: "assistant", content: "" },
    ]);

    try {
      // Usamos fetch diretamente para poder ler o body como stream
      // O host da API idealmente viria de variável de ambiente, mas como é local MVP...
      const response = await fetch("http://localhost:8005/api/v1/chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-Slug": "acme", // Mocking header do middleware Next.js
        },
        body: JSON.stringify({ message: userMessage.content }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;

        if (value) {
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataStr = line.replace("data: ", "");
              try {
                const data = JSON.parse(dataStr);
                
                if (data.content === "[DONE]") {
                  setIsTyping(false);
                } else if (data.content) {
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessageId
                        ? { ...msg, content: msg.content + data.content }
                        : msg
                    )
                  );
                } else if (data.error) {
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessageId
                        ? { ...msg, content: "Erro: " + data.error }
                        : msg
                    )
                  );
                  setIsTyping(false);
                }
              } catch (e) {
                console.error("Erro no parse JSON do SSE", e);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
      setIsTyping(false);
    }
  };

  if (showTiflux) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-gray-100 p-8 rounded-xl shadow-inner border border-dashed border-gray-300">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Atendimento Humano (Tiflux)</h2>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          A partir deste ponto, o widget embedado do Tiflux seria exibido.
          (Mock da integração).
        </p>
        <button 
          onClick={() => setShowTiflux(false)}
          className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
        >
          Voltar para IA
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] border border-gray-200 rounded-lg shadow-sm bg-white overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <div>
          <h2 className="font-semibold text-lg">Chat de Suporte IA</h2>
          <p className="text-blue-100 text-sm">Respostas instantâneas baseadas na base de conhecimento</p>
        </div>
        <button
          onClick={() => setShowTiflux(true)}
          className="text-sm bg-white text-blue-600 px-3 py-1.5 rounded font-medium hover:bg-blue-50 transition-colors"
        >
          Falar com Humano
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            <p>Olá! Como posso ajudar você hoje?</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-white text-gray-800 border border-gray-200 shadow-sm rounded-bl-none"
              }`}
            >
              {/* Em um MVP de RAG real usaríamos Markdown parse aqui */}
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua dúvida..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={isTyping || !input.trim()}
            className="bg-blue-600 text-white rounded-full px-6 py-2 font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}
