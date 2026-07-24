"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  TrashIcon, 
  EnvelopeIcon, 
  XMarkIcon
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";

type Technician = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "technician";
  status: "active" | "pending";
  metrics: {
    resolvedThisWeek: number;
    csat: number;
    avgResponseTime: string;
    openTickets: number;
  };
  permissions: string[];
};

const initialTechs: Technician[] = [
  { 
    id: "1", name: "Alice Gomes", email: "alice@acme.com", role: "admin", status: "active",
    metrics: { resolvedThisWeek: 145, csat: 4.9, avgResponseTime: "8 min", openTickets: 3 },
    permissions: ["kb_edit", "tickets_delete", "settings_access", "reports_view"]
  },
  { 
    id: "2", name: "Carlos Souza", email: "carlos@acme.com", role: "technician", status: "active",
    metrics: { resolvedThisWeek: 82, csat: 4.6, avgResponseTime: "14 min", openTickets: 12 },
    permissions: ["kb_view", "reports_view"]
  },
  { 
    id: "3", name: "Beatriz Lima", email: "beatriz@acme.com", role: "technician", status: "pending",
    metrics: { resolvedThisWeek: 0, csat: 0, avgResponseTime: "0 min", openTickets: 0 },
    permissions: []
  },
];

const availablePermissions = [
  { id: "kb_view", label: "Visualizar Base de Conhecimento", desc: "Pode ler artigos internos e externos." },
  { id: "kb_edit", label: "Editar Base de Conhecimento", desc: "Pode criar e apagar artigos." },
  { id: "tickets_delete", label: "Apagar Tickets", desc: "Pode excluir permanentemente tickets do sistema." },
  { id: "reports_view", label: "Acessar Relatórios", desc: "Pode ver dashboards de métricas globais." },
  { id: "settings_access", label: "Configurações Globais", desc: "Pode alterar regras de negócio e integrações." },
];

export default function TechniciansPage() {
  const router = useRouter();
  const [techs, setTechs] = useState<Technician[]>(initialTechs);
  const [search, setSearch] = useState("");
  
  // Modals state
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Invite Form State
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "technician">("technician");
  const [newPermissions, setNewPermissions] = useState<string[]>(["kb_view"]);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const newTech: Technician = {
      id: Date.now().toString(),
      name: "Convite Enviado",
      email: newEmail,
      role: newRole,
      status: "pending",
      metrics: { resolvedThisWeek: 0, csat: 0, avgResponseTime: "-", openTickets: 0 },
      permissions: newPermissions
    };
    setTechs([...techs, newTech]);
    setShowInviteModal(false);
    setNewEmail("");
    setNewRole("technician");
    setNewPermissions(["kb_view"]);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Tem certeza que deseja remover o acesso deste técnico?")) {
      setTechs(techs.filter(t => t.id !== id));
    }
  };

  const filteredTechs = techs.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto flex gap-6">
      
      {/* Main List Area */}
      <div className="w-full transition-all duration-300">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Equipe de Atendimento</h1>
            <p className="text-gray-400 mt-2">Gerencie os técnicos da plataforma, monitore desempenho e controle permissões globais.</p>
          </div>
          <button onClick={() => setShowInviteModal(true)} className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl shadow-[0_0_15px_rgba(147,51,234,0.3)] hover:bg-purple-500 hover:shadow-[0_0_20px_rgba(147,51,234,0.5)] transition-all font-semibold whitespace-nowrap">
            <EnvelopeIcon className="w-5 h-5" />
            Convidar Membro
          </button>
        </div>

        <div className="bg-[#111111] rounded-2xl shadow-xl border border-gray-800 overflow-hidden flex flex-col">
          {/* Search bar inside list */}
          <div className="p-4 border-b border-gray-800 bg-[#0A0A0A]">
            <input 
              type="text" 
              placeholder="Buscar por nome ou e-mail..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#111111] border border-gray-800 text-sm text-white px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-purple-500/50 outline-none"
            />
          </div>

          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-[#0A0A0A]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Técnico</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Desempenho (Semana)</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filteredTechs.map((u) => (
                <tr 
                  key={u.id} 
                  onClick={() => router.push(`/super-admin/users/${u.id}`)}
                  className="transition-colors group cursor-pointer hover:bg-white/[0.02]"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                     <div className="flex items-center gap-3">
                       <div className="w-9 h-9 rounded-full border bg-gray-800 border-gray-700 text-gray-300 flex items-center justify-center font-bold text-sm">
                          {u.name.charAt(0)}
                       </div>
                       <div>
                         <span className="block font-semibold text-gray-200 group-hover:text-purple-400 transition-colors">{u.name}</span>
                         <span className="block text-xs text-gray-500">{u.email}</span>
                       </div>
                     </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                     {u.status === 'active' ? (
                       <div className="flex items-center gap-6">
                         <div className="flex flex-col">
                           <span className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-1">Tickets</span>
                           <span className="text-white font-bold">{u.metrics.resolvedThisWeek} <span className="text-gray-600 font-normal text-sm">resolvidos</span></span>
                         </div>
                         <div className="flex flex-col">
                           <span className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-1">CSAT</span>
                           <span className="text-white font-bold flex items-center gap-1">
                             <StarIcon className="w-3.5 h-3.5 text-yellow-500" /> {u.metrics.csat}
                           </span>
                         </div>
                       </div>
                     ) : (
                       <span className="text-gray-600 text-sm italic">Aguardando aceite</span>
                     )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {u.status === 'active' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20 uppercase tracking-widest">
                        Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 uppercase tracking-widest">
                        Pendente
                      </span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button onClick={(e) => handleDelete(u.id, e)} className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100" title="Remover Acesso">
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTechs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">Nenhum técnico encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#111111] border border-gray-800 rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-gray-800 flex justify-between items-center bg-[#0A0A0A] flex-shrink-0">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <EnvelopeIcon className="w-5 h-5 text-purple-400" />
                Convidar Técnico
              </h2>
              <button onClick={() => setShowInviteModal(false)} className="text-gray-500 hover:text-white transition-colors">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleInvite} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-1.5">E-mail Profissional</label>
                  <input type="email" required value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="ex: suporte@plataforma.com" className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all placeholder-gray-600" />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-1.5">Cargo Inicial</label>
                  <select value={newRole} onChange={e => setNewRole(e.target.value as any)} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all font-medium">
                    <option value="technician">Técnico de Suporte</option>
                    <option value="admin">Administrador (Acesso Total)</option>
                  </select>
                </div>

                {newRole === 'technician' && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="block text-sm font-bold text-gray-400 mb-3">Permissões Específicas</label>
                    <div className="space-y-2">
                      {availablePermissions.map(perm => (
                        <label key={perm.id} className="flex items-start gap-3 p-3 rounded-xl border border-gray-800 bg-[#0A0A0A] hover:bg-gray-900 transition-colors cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={newPermissions.includes(perm.id)}
                            onChange={(e) => {
                               if(e.target.checked) setNewPermissions([...newPermissions, perm.id]);
                               else setNewPermissions(newPermissions.filter(p => p !== perm.id));
                            }}
                            className="mt-1 flex-shrink-0 w-4 h-4 text-purple-600 bg-gray-900 border-gray-700 rounded focus:ring-purple-500/50 transition-colors" 
                          />
                          <div>
                            <p className="text-sm font-semibold text-gray-300">{perm.label}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-5 border-t border-gray-800 bg-[#0A0A0A] flex justify-end gap-3 flex-shrink-0">
                <button type="button" onClick={() => setShowInviteModal(false)} className="px-5 py-2.5 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">Cancelar</button>
                <button type="submit" className="px-6 py-2.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.4)] transition-all">
                  Enviar Convite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
