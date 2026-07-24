import ChatInterface from "@/components/chat/ChatInterface";

export const metadata = {
  title: "Suporte Inteligente - SaaS Portal",
  description: "Resolva suas dúvidas rapidamente com nossa IA.",
};

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Central de Ajuda
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Pergunte à nossa IA ou fale com um de nossos especialistas.
          </p>
        </div>
        
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <ChatInterface />
        </div>
      </div>
    </div>
  );
}
