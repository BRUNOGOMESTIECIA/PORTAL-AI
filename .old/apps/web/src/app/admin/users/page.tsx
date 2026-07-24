"use client";

import { useState } from "react";
import { 
  EnvelopeIcon, 
  TrashIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";

type ClientUser = {
  id: string;
  name: string;
  email: string;
  status: "active" | "pending";
};

const initialUsers: ClientUser[] = [
  { id: "1", name: "João Pereira", email: "joao.pereira@empresa.com", status: "active" },
  { id: "2", name: "Maria Clara", email: "maria.clara@empresa.com", status: "active" },
  { id: "3", name: "José Alves", email: "jose.alves@empresa.com", status: "pending" },
];

export default function TenantClientsPage() {
  const [users, setUsers] = useState<ClientUser[]>(initialUsers);
  const [search, setSearch] = useState("");
  
  // Invite State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: ClientUser = {
      id: Date.now().toString(),
      name: "Convite Enviado",
      email: newEmail,
      status: "pending",
    };
    setUsers([...users, newUser]);
    setShowInviteModal(false);
    setNewEmail("");
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Tem certeza que deseja remover o acesso deste funcionário?")) {
      setUsers(users.filter(t => t.id !== id));
    }
  };

  const filteredUsers = users.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Equipe Interna (Usuários)</h1>
          <p className="text-gray-400 mt-2">Gerencie quais funcionários da sua empresa têm acesso ao portal de suporte.</p>
        </div>
        <button onClick={() => setShowInviteModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] transition-all font-semibold whitespace-nowrap">
          <EnvelopeIcon className="w-5 h-5" />
          Convidar Usuário
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <div className="bg-[#111111] border border-gray-800 p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
               <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <UserGroupIcon className="w-5 h-5 text-blue-400" />
               </div>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">Usuários Cadastrados</h3>
            <p className="text-3xl font-bold text-white mt-1">{users.length}</p>
         </div>
      </div>

      <div className="bg-[#111111] rounded-2xl shadow-xl border border-gray-800 overflow-hidden flex flex-col min-h-[400px]">
        <div className="p-4 border-b border-gray-800 bg-[#0A0A0A]">
          <input 
            type="text" 
            placeholder="Buscar por nome ou e-mail..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#111111] border border-gray-800 text-sm text-white px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none"
          />
        </div>

        <table className="min-w-full divide-y divide-gray-800">
          <thead className="bg-[#0A0A0A]">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Usuário</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap">
                   <div className="flex items-center gap-3">
                     <div className="w-9 h-9 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center font-bold text-sm text-gray-300">
                        {u.name.charAt(0)}
                     </div>
                     <div>
                       <span className="block font-semibold text-gray-200">{u.name}</span>
                       <span className="block text-xs text-gray-500">{u.email}</span>
                     </div>
                   </div>
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
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-gray-500">Nenhum funcionário encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#111111] border border-gray-800 rounded-2xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-gray-800 flex justify-between items-center bg-[#0A0A0A]">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Convidar Funcionário
              </h2>
            </div>
            
            <form onSubmit={handleInvite} className="flex flex-col">
              <div className="p-6">
                <label className="block text-sm font-bold text-gray-400 mb-1.5">E-mail Corporativo</label>
                <input type="email" required value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="email@empresa.com" className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder-gray-600" />
              </div>

              <div className="px-6 py-5 border-t border-gray-800 bg-[#0A0A0A] flex justify-end gap-3">
                <button type="button" onClick={() => setShowInviteModal(false)} className="px-5 py-2.5 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">Cancelar</button>
                <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all">
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
