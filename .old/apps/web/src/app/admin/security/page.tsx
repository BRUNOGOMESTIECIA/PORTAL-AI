"use client";

import { ShieldCheckIcon, KeyIcon, LockClosedIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

export default function SecurityPage() {
  const logs = [
    { id: 1, event: "Login bem-sucedido", user: "Alice Gomes", ip: "187.12.34.56", time: "Hoje às 10:23", status: "success" },
    { id: 2, event: "Tentativa de login falha", user: "Desconhecido", ip: "45.192.12.4", time: "Hoje às 08:15", status: "danger" },
    { id: 3, event: "Senha alterada", user: "Carlos Souza", ip: "187.12.34.56", time: "Ontem às 15:40", status: "warning" },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Segurança e Auditoria</h1>
        <p className="text-gray-400 mt-2">Controles de acesso, logs de auditoria e políticas de segurança da empresa.</p>
      </div>

      <div className="bg-[#111111] rounded-2xl shadow-xl border border-gray-800 p-6 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
            <ShieldCheckIcon className="w-6 h-6 text-purple-400" />
          </div>
          <div>
             <h2 className="text-xl font-bold text-white">Autenticação em Duas Etapas (MFA)</h2>
             <p className="text-sm text-gray-400">Exigir código via app (Google Authenticator) para toda a equipe.</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-gray-900 rounded-xl border border-gray-800">
           <span className="text-gray-300 font-medium">Forçar MFA para todos os usuários</span>
           <button className="w-12 h-6 rounded-full bg-purple-600 relative transition-colors">
              <div className="absolute top-1 left-7 w-4 h-4 rounded-full bg-white shadow-md transition-all" />
           </button>
        </div>
      </div>

      <div className="bg-[#111111] rounded-2xl shadow-xl border border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-800 bg-[#0A0A0A] flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">Logs de Acesso Recentes</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-800">
          <thead className="bg-[#0A0A0A]">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Evento</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Usuário</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Endereço IP</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Data/Hora</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                   <div className="flex items-center gap-2">
                     <div className={`w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-green-500' : log.status === 'danger' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                     <span className="text-gray-200 font-medium">{log.event}</span>
                   </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-400 text-sm">{log.user}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-mono text-sm">{log.ip}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-400 text-sm">{log.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
