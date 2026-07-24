import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function ClientChatPage() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
        <MessageCircle className="h-8 w-8 text-blue-500" />
      </div>
      <h2 className="text-lg font-semibold text-slate-800 mb-2">Chat de suporte</h2>
      <p className="text-slate-500 text-sm max-w-xs">
        Use o botão de chat no canto inferior direito da tela para conversar com nossa equipe.
      </p>
    </div>
  );
}
