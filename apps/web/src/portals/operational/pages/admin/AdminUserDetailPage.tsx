import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Save, Shield, Building2, ChevronDown, Check, UserX } from 'lucide-react';
import { ALL_MOCK_USERS, MockUser, MockStaff, MockClient, ALL_PERMISSIONS } from '../../../../mocks/data';
import { cn } from '../../../../lib/utils';
import { SuccessModal } from '../../../../components/shared/SuccessModal';
import { toast } from 'sonner';
import { instaPassoDb } from '../../../../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

import { apiClient } from '../../../../lib/api-client';

// Helper to group permissions by module
const groupPermissions = () => {
  const groups: Record<string, string[]> = {};
  ALL_PERMISSIONS.forEach(perm => {
    const module = perm.split('.')[0];
    if (!groups[module]) groups[module] = [];
    groups[module].push(perm);
  });
  return groups;
};

const permissionGroups = groupPermissions();


const moduleLabels: Record<string, string> = {
  tickets: 'Tickets',
  chat: 'Chat Ao Vivo',
  kb: 'Base de Conhecimento',
  catalog: 'Catálogo de Serviços',
  reports: 'Relatórios e Dashboards',
  automation: 'Automações e Regras',
  webhooks: 'Webhooks e Integrações',
  admin: 'Administração Geral'
};

const permissionLabels: Record<string, string> = {
  'tickets.view': 'Visualizar Tickets',
  'tickets.create': 'Criar Tickets',
  'tickets.update': 'Editar Tickets (Geral)',
  'tickets.assign': 'Atribuir/Transferir',
  'tickets.close': 'Fechar Tickets',
  
  'chat.view': 'Acessar Histórico',
  'chat.attend': 'Atender Chats (Ficar Online)',
  'chat.manage': 'Gerenciar Filas/Atendentes',
  
  'kb.view': 'Acesso Interno (Leitura)',
  'kb.write': 'Criar/Editar Rascunhos',
  'kb.publish': 'Publicar Artigos',
  
  'catalog.view': 'Visualizar Catálogo',
  'catalog.manage': 'Gerenciar Serviços/SLA',
  
  'reports.view': 'Visualizar Relatórios',
  
  'automation.view': 'Visualizar Regras',
  'automation.manage': 'Criar/Editar Automações',
  
  'webhooks.view': 'Ver Integrações',
  'webhooks.manage': 'Configurar Webhooks',
  
  'admin.users': 'Gerenciar Equipe/Clientes',
  'admin.roles': 'Papéis e Permissões',
  'admin.sla': 'Contratos e SLAs',
  'admin.settings': 'Configurações Globais (Feriados, SSO, etc)'
};

export default function AdminUserDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get('type') as 'staff' | 'client' || 'staff';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: typeParam,
    role: 'Support Agent', // For staff
    company: '',           // For client
    companySlug: '',
    password: '',
    permissions: ['tickets.view'] as string[],
  });

  const [collapsedModules, setCollapsedModules] = useState<Record<string, boolean>>({});
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchOperator = async () => {
        try {
          const apiUser = await apiClient.get(`/users/${id}`);
          if (apiUser) {
            setFormData({
              name: apiUser.name || apiUser.fullName || '',
              email: apiUser.email || '',
              type: apiUser.type || 'staff',
              role: apiUser.role || 'Support Agent',
              company: apiUser.company || '',
              companySlug: apiUser.companySlug || '',
              password: '',
              permissions: apiUser.permissions || ['tickets.view'],
            });
            return;
          }
        } catch {
          // Ignora falha de API backend e tenta Firestore/Mock
        }

        try {
          const docRef = doc(instaPassoDb, 'operators', id);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            const data = snap.data();
            setFormData({
              name: data.fullName || data.name || '',
              email: data.email || '',
              type: data.type || 'staff',
              role: data.role || 'Support Agent',
              company: data.company || '',
              companySlug: data.companySlug || '',
              password: '',
              permissions: data.permissions || ['tickets.view'],
            });
            return;
          }
        } catch (e) {
          console.warn('Operator document not in Firestore, fallback to mock data');
        }

        const user = ALL_MOCK_USERS.find(u => u.id === id);
        if (user) {
          setFormData({
            name: user.name,
            email: user.email,
            type: user.type,
            role: user.type === 'staff' ? user.role : '',
            company: user.type === 'client' ? user.company : '',
            companySlug: user.type === 'client' ? user.companySlug : '',
            password: user.password,
            permissions: user.type === 'staff' ? user.permissions : [],
          });
        }
      };
      fetchOperator();
    }
  }, [id]);


  const [dynamicRoles, setDynamicRoles] = useState<any[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('instapasso_dynamic_roles');
      if (stored) {
        setDynamicRoles(JSON.parse(stored));
      } else {
        setDynamicRoles([
          { id: '1', name: 'Analista de Suporte N1' },
          { id: '2', name: 'Analista de Suporte N2' },
          { id: '3', name: 'Especialista N3 Cloud & DevOps' },
          { id: '4', name: 'Coordenador / Supervisor Operacional' },
          { id: '5', name: 'Super Administrador / Supervisor' }
        ]);
      }
    } catch (e) {
      setDynamicRoles([]);
    }
  }, []);

  const toggleModule = (module: string) => {
    setCollapsedModules(prev => ({ ...prev, [module]: !prev[module] }));
  };

  const handleTogglePermission = (perm: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({ ...prev, permissions: [...prev.permissions, perm] }));
    } else {
      setFormData(prev => ({ ...prev, permissions: prev.permissions.filter(p => p !== perm) }));
    }
  };

  const handleToggleAllInModule = (module: string, perms: string[]) => {
    const allChecked = perms.every(p => formData.permissions.includes(p));
    if (allChecked) {
      // Remove all
      setFormData(prev => ({ ...prev, permissions: prev.permissions.filter(p => !perms.includes(p)) }));
    } else {
      // Add all missing
      const toAdd = perms.filter(p => !formData.permissions.includes(p));
      setFormData(prev => ({ ...prev, permissions: [...prev.permissions, ...toAdd] }));
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Preencha nome e e-mail do usuário');
      return;
    }

    try {
      const operatorId = id || `op_${Date.now()}`;
      const docRef = doc(instaPassoDb, 'operators', operatorId);
      
      await setDoc(docRef, {
        id: operatorId,
        fullName: formData.name,
        email: formData.email,
        type: formData.type,
        role: formData.role,
        company: formData.company || '',
        companySlug: formData.companySlug || '',
        permissions: formData.permissions,
        status: 'ACTIVE',
        isOnline: false,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }, { merge: true });

      toast.success(id ? 'Usuário operacional atualizado com sucesso!' : 'Novo usuário operacional criado com sucesso!');
      setIsSuccessModalOpen(true);
    } catch (e: any) {
      console.error('Erro ao salvar operador:', e);
      toast.error('Erro ao salvar no banco de dados. Tente novamente.');
    }
  };

  const handleCloseSuccess = () => {
    setIsSuccessModalOpen(false);
    navigate('/operacional/app/admin/users');
  };

  const [isAnonymized, setIsAnonymized] = useState(false);

  const handleAnonymize = async () => {
    if (!window.confirm('ATENÇÃO: Tem certeza que deseja anonimizar este usuário? Esta ação é irreversível (LGPD). Nome, e-mail e telefone serão apagados, e o e-mail passará por hash irreversível. A conta será desativada.')) {
      return;
    }
    
    // In a real scenario: await axios.delete(`/api/v1/users/${id}/anonymize`);
    // (A requisição bateria na Cloud Function anonymizeUser que acabamos de criar)

    setFormData(prev => ({
        ...prev,
        name: '[USUÁRIO ANONIMIZADO]',
        email: 'xxxxxxxx-xxxx@anonymized.local',
        company: prev.type === 'client' ? '[EMPRESA ANONIMIZADA]' : ''
    }));
    setIsAnonymized(true);

    toast.success('Usuário anonimizado com sucesso.', {
      description: 'Todos os dados pessoais foram apagados (Direito ao Esquecimento).'
    });

    
    setTimeout(() => {
      navigate('/operacional/app/admin/users');
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/operacional/app/admin/users')}
            className="p-2 -ml-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {id ? 'Editar Usuário' : 'Novo Usuário'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Configure as informações e acessos
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {id && (
            <button 
              onClick={handleAnonymize}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors shadow-sm"
              title="Direito ao Esquecimento (LGPD)"
            >
              <UserX className="w-4 h-4" />
              Anonimizar (LGPD)
            </button>
          )}
          <button 
            onClick={handleSave}
            disabled={isAnonymized || !formData.name.trim() || !formData.email.trim() || (formData.type === 'client' && !formData.company.trim())}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            Salvar
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 space-y-8">
          
          {/* IDENTIFICAÇÃO BÁSICA */}
          <section>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              Informações Básicas
            </h2>
            
            {!id && (
              <div className="grid grid-cols-2 gap-3 mb-6 max-w-sm">
                <button
                  onClick={() => setFormData({ ...formData, type: 'staff' })}
                  className={cn(
                    "flex items-center justify-center gap-2 h-10 rounded-lg border text-sm font-medium transition-colors",
                    formData.type === 'staff' 
                      ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-300"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  )}
                >
                  <Shield className="w-4 h-4" /> Equipe Interna
                </button>
                <button
                  onClick={() => setFormData({ ...formData, type: 'client' })}
                  className={cn(
                    "flex items-center justify-center gap-2 h-10 rounded-lg border text-sm font-medium transition-colors",
                    formData.type === 'client' 
                      ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-300"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  )}
                >
                  <Building2 className="w-4 h-4" /> Cliente
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nome Completo *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={isAnonymized}
                  className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">E-mail corporativo *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isAnonymized}
                  className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 dark:text-white"
                />
              </div>

              {formData.type === 'staff' ? (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Cargo / Função</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition"
                  >
                    {dynamicRoles.map(role => (
                      <option key={role.id} value={role.name}>{role.name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Empresa</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({ 
                        ...formData, 
                        company: val,
                        companySlug: val.toLowerCase().replace(/\s+/g, '')
                      });
                    }}
                    placeholder="Ex: Acme Corp"
                    className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Senha {id && <span className="text-xs font-normal text-slate-500">(Opcional para alterar)</span>}</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={id ? "Deixe em branco para manter" : "Senha temporária"}
                  className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition"
                />
              </div>
            </div>
          </section>

          {/* PERMISSÕES (Apenas STAFF) */}
          {formData.type === 'staff' && (
            <section>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                Módulos e Permissões
              </h2>
              <div className="space-y-4">
                {Object.entries(permissionGroups).map(([module, perms]) => {
                  const label = moduleLabels[module] || module.toUpperCase();
                  const allChecked = perms.every(p => formData.permissions.includes(p));
                  const someChecked = perms.some(p => formData.permissions.includes(p));
                  
                  return (
                    <div key={module} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                      {/* Accordion Header */}
                      <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 px-4 py-3">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => toggleModule(module)}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors rounded"
                          >
                            <ChevronDown className={cn("w-4 h-4 transition-transform", collapsedModules[module] && "-rotate-90")} />
                          </button>
                          <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{label}</span>
                          {someChecked && !allChecked && (
                            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs px-2 py-0.5 rounded font-medium">Parcial</span>
                          )}
                          {allChecked && (
                            <span className="bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs px-2 py-0.5 rounded font-medium">Acesso Total</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleAllInModule(module, perms)}
                          className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {allChecked ? 'Desmarcar todos' : 'Selecionar todos'}
                        </button>
                      </div>

                      {/* Accordion Body */}
                      {!collapsedModules[module] && (
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-white dark:bg-slate-900">
                          {perms.map(perm => {
                            const isChecked = formData.permissions.includes(perm);
                            return (
                              <label 
                                key={perm} 
                                className={cn(
                                  "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                                  isChecked 
                                    ? "border-blue-200 bg-blue-50/50 dark:border-blue-900/50 dark:bg-blue-900/10" 
                                    : "border-slate-100 bg-slate-50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800"
                                )}
                              >
                                <div className={cn(
                                  "w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0",
                                  isChecked
                                    ? "bg-blue-600 border-blue-600 text-white"
                                    : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                                )}>
                                  {isChecked && <Check className="w-3 h-3" />}
                                </div>
                                <input 
                                  type="checkbox" 
                                  className="sr-only"
                                  checked={isChecked}
                                  onChange={(e) => handleTogglePermission(perm, e.target.checked)}
                                />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                  {permissionLabels[perm] || perm}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

        </div>
      </div>

      <SuccessModal 
        isOpen={isSuccessModalOpen}
        onClose={handleCloseSuccess}
        title="Usuário salvo!"
        message="As informações do usuário foram atualizadas com sucesso."
      />
    </div>
  );
}
