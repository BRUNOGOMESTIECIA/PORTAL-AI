import React from 'react';
import { ExternalChatEmbedWidget } from '../../../components/chat/ExternalChatEmbedWidget';

export default function ClientChatPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-1">Chat de Suporte ao Vivo</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Converse diretamente com nossos atendentes em tempo real via Socket.io.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col items-center">
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Você pode utilizar a janela flutuante no canto inferior ou iniciar um novo atendimento abaixo:</p>
        <div className="w-full max-w-xl">
          <ExternalChatEmbedWidget companyName="Suporte Especializado TI" tenantSlug="clienteabc" />
        </div>
      </div>
    </div>
  );
}

