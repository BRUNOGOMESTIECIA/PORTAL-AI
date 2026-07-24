"use client";

import { useState } from "react";
import { 
  ShieldCheckIcon,
  PlusIcon,
  ClockIcon,
  InformationCircleIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function SLAsPage() {
  const [slas, setSlas] = useState([
    { id: 1, name: "Incidente Crítico (Bug em Prod)", type: "Técnico", priority: "Urgente", responseTime: "30m", resolutionTime: "4h" },
    { id: 2, name: "Dúvida de Faturamento", type: "Financeiro", priority: "Alta", responseTime: "2h", resolutionTime: "24h" },
    { id: 3, name: "Solicitação de Feature", type: "Produto", priority: "Normal", responseTime: "24h", resolutionTime: "72h" },
    { id: 4, name: "Onboarding (Cliente Novo)", type: "Sucesso do Cliente", priority: "Alta", responseTime: "1h", resolutionTime: "48h" },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSla, setEditingSla] = useState<any>(null);

  const handleOpenNew = () => {
    setEditingSla(null);
    setIsModalOpen(true);
  };

  const handleEdit = (sla: any) => {
    setEditingSla(sla);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(false);
    toast.success(editingSla ? "Regra atualizada com sucesso!" : "Nova Regra Global criada!");
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto pb-10">
      
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <ShieldCheckIcon className="w-8 h-8 text-purple-500" />
            Políticas de SLA Global
          </h1>
          <p className="text-gray-400 mt-2 max-w-2xl">
            Defina o tempo máximo de Resposta e Resolução para cada cruzamento de Tipo e Prioridade de ticket. 
            Estas regras podem ser sobrescritas diretamente no perfil de cada Tenant (Cliente).
          </p>
        </div>
        <button onClick={handleOpenNew} className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          Nova Regra Global
        </button>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-8 flex items-start gap-4">
         <InformationCircleIcon className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
         <div>
            <h4 className="text-blue-400 font-bold text-sm">O que acontece quando o SLA é violado?</h4>
            <p className="text-gray-300 text-sm mt-1 leading-relaxed">
              O ticket receberá uma flag de violação, ficará vermelho na fila de atendimento, e a IA de triagem poderá alertar os gestores ou notificar via Broadcast no sino de alertas.
            </p>
         </div>
      </div>

      {/* Tabela de Regras SLA */}
      <div className="bg-[#111111] rounded-2xl shadow-xl border border-gray-800 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-800">
          <thead className="bg-[#050505]">
            <tr>
              <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Regra de Negócio</th>
              <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Gatilhos (Tipo + Prioridade)</th>
              <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Primeira Resposta</th>
              <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Resolução Completa</th>
              <th className="px-6 py-5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {slas.map(sla => (
              <tr key={sla.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-5">
                   <span className="block text-white font-bold text-sm">{sla.name}</span>
                </td>
                <td className="px-6 py-5">
                   <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded bg-gray-800 border border-gray-700 text-gray-300 text-xs font-bold">{sla.type}</span>
                      <span className="text-gray-500 font-bold">+</span>
                      <span className={`px-2 py-1 rounded border text-xs font-bold uppercase ${
                         sla.priority === 'Urgente' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                         sla.priority === 'Alta' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' :
                         'bg-blue-500/10 border-blue-500/20 text-blue-400'
                      }`}>
                         {sla.priority}
                      </span>
                   </div>
                </td>
                <td className="px-6 py-5">
                   <div className="flex items-center gap-2 text-sm font-bold text-gray-300">
                      <ClockIcon className="w-4 h-4 text-purple-400" />
                      {sla.responseTime}
                   </div>
                </td>
                <td className="px-6 py-5">
                   <div className="flex items-center gap-2 text-sm font-bold text-gray-300">
                      <ShieldCheckIcon className="w-4 h-4 text-green-400" />
                      {sla.resolutionTime}
                   </div>
                </td>
                <td className="px-6 py-5 text-right">
                   <button onClick={() => handleEdit(sla)} className="text-sm font-bold text-purple-400 hover:text-purple-300 transition-colors opacity-0 group-hover:opacity-100">
                     Editar
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#111111] border border-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-gray-800 flex justify-between items-center bg-[#0A0A0A]">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheckIcon className="w-5 h-5 text-purple-400" />
                {editingSla ? "Editar Regra Global" : "Nova Regra Global"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-1.5">Nome da Regra</label>
                <input type="text" defaultValue={editingSla?.name || ""} required placeholder="Ex: Bug Crítico" className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-bold text-gray-400 mb-1.5">Tipo do Ticket</label>
                    <select className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all">
                      <option>Técnico</option>
                      <option>Financeiro</option>
                      <option>Produto</option>
                      <option>Sucesso do Cliente</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-gray-400 mb-1.5">Prioridade</label>
                    <select className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all">
                      <option>Baixa</option>
                      <option>Normal</option>
                      <option>Alta</option>
                      <option>Urgente</option>
                    </select>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-bold text-gray-400 mb-1.5">Tempo Primeira Resposta</label>
                    <input type="text" defaultValue={editingSla?.responseTime || ""} required placeholder="Ex: 30m, 2h" className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all font-mono" />
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-gray-400 mb-1.5">Tempo de Resolução</label>
                    <input type="text" defaultValue={editingSla?.resolutionTime || ""} required placeholder="Ex: 4h, 24h" className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all font-mono" />
                 </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">Cancelar</button>
                <button type="submit" className="px-6 py-2.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.4)] transition-all">
                  Salvar Regra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
