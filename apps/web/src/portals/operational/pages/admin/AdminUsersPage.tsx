import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, User, Search, Shield, Building2, ExternalLink, ChevronDown, Lock } from 'lucide-react';
import { ALL_MOCK_USERS, MockUser, MockClient } from '../../../../mocks/data';
import { cn } from '../../../../lib/utils';
import { instaPassoDb } from '../../../../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { apiClient } from '../../../../lib/api-client';

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'staff' | 'client'>('staff');
  const [searchQuery, setSearchQuery] = useState('');
  const [realOperators, setRealOperators] = useState<any[]>([]);
  const [expandedCompanies, setExpandedCompanies] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Tenta carregar usuários da API NestJS real
    apiClient.get('/users')
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setRealOperators(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const newOps = data.filter((u: any) => !existingIds.has(u.id));
            return [...prev, ...newOps];
          });
        }
      })
      .catch((err) => {
        console.info('[Users API] Servidor em standby. Usando Firestore InstaPasso.', err?.message);
      });

    const unsubscribe = onSnapshot(collection(instaPassoDb, 'operators'), (snapshot) => {
      const ops: any[] = [];
      snapshot.forEach(doc => {
        ops.push({ id: doc.id, ...doc.data() });
      });
      setRealOperators(ops);
    });
    return () => unsubscribe();
  }, []);


  const toggleCompany = (company: string) => {
    setExpandedCompanies(prev => ({ ...prev, [company]: !prev[company] }));
  };

  const clientUsers = ALL_MOCK_USERS.filter(u => {
    if (u.type !== 'client') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.company.toLowerCase().includes(q);
    }
    return true;
  }) as MockClient[];

  const filteredOperators = realOperators.filter(op => {
    if (op.status === 'DELETED') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (op.fullName || op.name || '').toLowerCase().includes(q) || (op.email || '').toLowerCase().includes(q) || (op.role || '').toLowerCase().includes(q);
    }
    return true;
  });

  const handleOpenInstaPasso = () => {
    window.open('https://insta-passo.vercel.app', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Gestão de Usuários</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Gerencie os acessos da equipe e clientes cadastrados</p>
        </div>
        {activeTab === 'staff' ? (
          <button 
            onClick={handleOpenInstaPasso}
            className="flex items-center gap-2 bg-slate-900 hover:bg-black dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all shadow-sm"
          >
            <ExternalLink className="h-4 w-4" /> Cadastrar no InstaPasso
          </button>
        ) : (
          <button 
            onClick={() => navigate('/operacional/app/admin/users/new?type=client')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all shadow-sm"
          >
            <Plus className="h-4 w-4" /> Novo Cliente
          </button>
        )}
      </div>

      {/* BANNER INSTAPASSO SSO FOR STAFF */}
      {activeTab === 'staff' && (
        <div className="p-4 border border-blue-200 dark:border-blue-900/40 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Gestão Centralizada via InstaPasso (SSO)</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Os operadores da Equipe Interna e suas permissões são cadastrados de forma segura no painel do <strong>InstaPasso</strong>.
              </p>
            </div>
          </div>
          <button
            onClick={handleOpenInstaPasso}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0"
          >
            <span>Gerenciar no InstaPasso</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

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
            <span className="flex items-center gap-2"><Shield className="w-4 h-4" /> Equipe Interna ({filteredOperators.length})</span>
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
            <span className="flex items-center gap-2"><Building2 className="w-4 h-4" /> Clientes ({clientUsers.length})</span>
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
        {activeTab === 'staff' ? (
          filteredOperators.length === 0 ? (
            <div className="p-10 text-center space-y-3">
              <Shield className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Nenhum operador cadastrado no InstaPasso ainda.</p>
              <button
                onClick={handleOpenInstaPasso}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Cadastrar primeiro operador no InstaPasso <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredOperators.map((op) => (
                <div key={op.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                    {(op.fullName || op.name || 'O').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{op.fullName || op.name}</p>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        op.status === 'ACTIVE' || op.status === 'ativo' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {op.status === 'ACTIVE' || op.status === 'ativo' ? 'Ativo (SSO)' : 'Inativo'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{op.email}</p>
                  </div>
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-full">
                      {op.role || 'N1'}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1">
                      {op.permissions?.length || 0} permissões ativas
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          clientUsers.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
              Nenhum cliente encontrado.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {Object.entries(
                clientUsers.reduce((acc, user) => {
                  const comp = user.company || 'Sem Empresa';
                  if (!acc[comp]) acc[comp] = [];
                  acc[comp].push(user);
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
                      {clients.map(u => (
                        <div key={u.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{u.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{u.email}</p>
                          </div>
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full flex items-center gap-1">
                            <Building2 className="w-3 h-3" /> {u.company}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

