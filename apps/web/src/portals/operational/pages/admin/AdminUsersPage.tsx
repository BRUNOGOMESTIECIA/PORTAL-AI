import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, User, Search, Shield, Building2, MoreVertical, Edit2, Key, UserX, UserCheck, X, ChevronDown } from 'lucide-react';
import { ALL_MOCK_USERS, MockUser, MockStaff, MockClient, ALL_PERMISSIONS } from '../../../../mocks/data';
import { cn } from '../../../../lib/utils';
import { useEscapeModal } from '../../../../hooks/use-escape-modal';
import { SuccessModal } from '../../../../components/shared/SuccessModal';

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<MockUser[]>(ALL_MOCK_USERS);
  const [activeTab, setActiveTab] = useState<'staff' | 'client'>('staff');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const [expandedCompanies, setExpandedCompanies] = useState<Record<string, boolean>>({});

  const toggleCompany = (company: string) => {
    setExpandedCompanies(prev => ({ ...prev, [company]: !prev[company] }));
  };

  // Action Menu State (Popover)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filteredUsers = users.filter(u => {
    if (u.type !== activeTab) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || 
             (u.type === 'client' && u.company.toLowerCase().includes(q)) ||
             (u.type === 'staff' && u.role.toLowerCase().includes(q));
    }
    return true;
  });

  const handleOpenEditor = (user?: MockUser) => {
    setOpenMenuId(null);
    if (user) {
      navigate(`/operacional/app/admin/users/${user.id}`);
    } else {
      navigate(`/operacional/app/admin/users/new?type=${activeTab}`);
    }
  };

  const handleToggleStatus = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u));
    setOpenMenuId(null);
  };

  const handleResetPassword = (id: string) => {
    setIsSuccessModalOpen(true);
    setOpenMenuId(null);
  };

  const renderUserRow = (u: MockUser) => (
    <div key={u.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group relative">
      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
        <User className="h-5 w-5 text-slate-500 dark:text-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{u.name}</p>
          {!u.isActive && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 px-1.5 py-0.5 rounded">Desativado</span>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{u.email}</p>
      </div>
      
      <div className="hidden md:flex flex-col items-end">
        {u.type === 'staff' ? (
          <span className="text-xs font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-full">
            {u.role}
          </span>
        ) : (
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full flex items-center gap-1">
            <Building2 className="w-3 h-3" /> {u.company}
          </span>
        )}
      </div>

      {/* ACTION MENU */}
      <div className="relative">
        <button 
          onClick={() => setOpenMenuId(openMenuId === u.id ? null : u.id)}
          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg transition-colors"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
        
        {openMenuId === u.id && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg rounded-xl z-50 overflow-hidden animate-in fade-in zoom-in duration-100">
              <button 
                onClick={() => handleOpenEditor(u)}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <Edit2 className="w-4 h-4" /> Editar usuário
              </button>
              <button 
                onClick={() => handleResetPassword(u.id)}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <Key className="w-4 h-4" /> Resetar senha
              </button>
              <div className="h-px bg-slate-200 dark:bg-slate-700 my-1" />
              <button 
                onClick={() => handleToggleStatus(u.id)}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50"
              >
                {u.isActive ? (
                  <><UserX className="w-4 h-4 text-red-600" /> <span className="text-red-600">Desativar acesso</span></>
                ) : (
                  <><UserCheck className="w-4 h-4 text-emerald-600" /> <span className="text-emerald-600">Reativar acesso</span></>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Gestão de Usuários</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Gerencie os acessos da equipe e clientes</p>
        </div>
        <button 
          onClick={() => handleOpenEditor()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> Novo usuário
        </button>
      </div>

      {/* TABS & SEARCH */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('staff')}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors",
              activeTab === 'staff' 
                ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20" 
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            <span className="flex items-center gap-2"><Shield className="w-4 h-4" /> Equipe Interna</span>
          </button>
          <button
            onClick={() => setActiveTab('client')}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors",
              activeTab === 'client' 
                ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20" 
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            <span className="flex items-center gap-2"><Building2 className="w-4 h-4" /> Clientes</span>
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-colors"
          />
        </div>
      </div>

      {/* LISTA DE USUÁRIOS */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-visible">
        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
            Nenhum usuário encontrado.
          </div>
        ) : activeTab === 'client' ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {Object.entries(
              filteredUsers.reduce((acc, user) => {
                const comp = (user as MockClient).company || 'Sem Empresa';
                if (!acc[comp]) acc[comp] = [];
                acc[comp].push(user as MockClient);
                return acc;
              }, {} as Record<string, MockClient[]>)
            ).map(([company, clients]) => (
              <div key={company} className="flex flex-col">
                <button 
                  onClick={() => toggleCompany(company)}
                  className="flex items-center justify-between px-5 py-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">{company}</span>
                    <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs px-2 py-0.5 rounded-full">{clients.length}</span>
                  </div>
                  <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", !expandedCompanies[company] && "-rotate-90")} />
                </button>
                
                {expandedCompanies[company] && (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 pl-4 border-l-2 border-slate-100 dark:border-slate-800 ml-5 my-2">
                    {clients.map(renderUserRow)}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredUsers.map(renderUserRow)}
          </div>
        )}
      </div>

      <SuccessModal 
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="E-mail Enviado"
        message="Um e-mail de redefinição de senha foi enviado para o usuário."
      />
    </div>
  );
}
