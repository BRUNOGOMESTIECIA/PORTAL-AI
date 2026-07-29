import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, Building2, Clock, BarChart, Users as UsersIcon, Link as LinkIcon, Lock, X } from 'lucide-react';
import { MOCK_COMPANIES, MOCK_CLIENTS, MockCompany } from '../../../../mocks/data';
import { cn } from '../../../../lib/utils';
import { useEscapeModal } from '../../../../hooks/use-escape-modal';
import { SuccessModal } from '../../../../components/shared/SuccessModal';

type ClientTab = 'profile' | 'sla' | 'business_hours' | 'users' | 'sso';

export default function AdminClientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [activeTab, setActiveTab] = useState<ClientTab>('profile');
  const [showSuccess, setShowSuccess] = useState(false);

  const initialCompany = MOCK_COMPANIES.find(c => c.id === id) || {
    id: 'new',
    slug: '',
    name: '',
    isActive: true,
    contractType: 'standard',
    slaServices: [
      {
        serviceName: 'Suporte Técnico',
        policies: [
          { priority: 'Baixa', response: 24, resolution: 72 },
          { priority: 'Média', response: 8, resolution: 24 },
          { priority: 'Alta', response: 2, resolution: 8 },
          { priority: 'Urgente', response: 1, resolution: 4 },
        ]
      }
    ],
    businessHours: { 
      timezone: 'America/Sao_Paulo', 
      schedule: [
        { day: 'Segunda-feira', active: true, start: '09:00', end: '18:00' },
        { day: 'Terça-feira', active: true, start: '09:00', end: '18:00' },
        { day: 'Quarta-feira', active: true, start: '09:00', end: '18:00' },
        { day: 'Quinta-feira', active: true, start: '09:00', end: '18:00' },
        { day: 'Sexta-feira', active: true, start: '09:00', end: '18:00' },
        { day: 'Sábado', active: false, start: '09:00', end: '13:00' },
        { day: 'Domingo', active: false, start: '00:00', end: '00:00' },
      ]
    },
    ssoDomains: []
  } as MockCompany;

  const [company, setCompany] = useState<MockCompany>(initialCompany);

  const companyUsers = MOCK_CLIENTS.filter(u => u.company === company.slug);

  const handleSave = () => {
    setShowSuccess(true);
  };

  const TABS: { id: ClientTab; label: string; icon: React.ElementType }[] = [
    { id: 'profile', label: 'Perfil', icon: Building2 },
    { id: 'sla', label: 'Políticas de SLA', icon: BarChart },
    { id: 'business_hours', label: 'Horários', icon: Clock },
    { id: 'users', label: 'Usuários Vinculados', icon: UsersIcon },
    { id: 'sso', label: 'SSO & Segurança', icon: Lock },
  ];

  return (
    <div className="h-full flex flex-col space-y-6">
      <SuccessModal 
        isOpen={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          if (isNew) navigate('/operacional/app/admin/clients');
        }}
        title="Salvo com sucesso"
        message={isNew ? "A nova empresa foi criada." : "As configurações da empresa foram salvas."}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/operacional/app/admin/clients')}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {isNew ? 'Nova Empresa' : company.name}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {isNew ? 'Cadastre os dados do cliente' : 'Gerenciamento de configurações do cliente'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            Salvar
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 gap-6">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 space-y-1">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left",
                    activeTab === tab.id 
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" 
                      : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-y-auto">
          <div className="p-6 max-w-3xl">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Perfil da Empresa</h2>
                  <p className="text-sm text-slate-500">Informações básicas e identificação do cliente no portal.</p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome da Empresa</label>
                    <input 
                      type="text" 
                      value={company.name}
                      onChange={e => setCompany({...company, name: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
                      placeholder="Ex: Acme Corp"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Slug (Identificador)</label>
                    <input 
                      type="text" 
                      value={company.slug}
                      onChange={e => setCompany({...company, slug: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors font-mono"
                      placeholder="acmecorp"
                    />
                    <p className="text-xs text-slate-500 mt-1">Usado nas URLs do portal de clientes (ex: acme.seusistema.com)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo de Contrato</label>
                    <select 
                      value={company.contractType}
                      onChange={e => setCompany({...company, contractType: e.target.value as any})}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
                    >
                      <option value="basic">Basic (SLA Padrão)</option>
                      <option value="standard">Standard (SLA Intermediário)</option>
                      <option value="premium">Premium (SLA Prioritário)</option>
                    </select>
                    <p className="text-xs text-slate-500 mt-1">O contrato define o escopo de serviços e SLAs base para este cliente.</p>
                  </div>

                  <div className="col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={company.isActive}
                        onChange={e => setCompany({...company, isActive: e.target.checked})}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Empresa Ativa</span>
                    </label>
                    <p className="text-xs text-slate-500 mt-1 ml-6">Se desmarcado, os usuários dessa empresa não poderão acessar o portal.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sla' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Políticas de SLA por Serviço</h2>
                  <p className="text-sm text-slate-500">Defina os tempos máximos (em horas úteis) para primeira resposta e resolução separados por tipo de serviço.</p>
                </div>

                {company.slaServices.map((service, sIdx) => (
                  <div key={sIdx} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden mb-6">
                    <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                      <h3 className="font-semibold text-slate-800 dark:text-slate-100">{service.serviceName}</h3>
                    </div>
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 font-medium">
                        <tr>
                          <th className="px-4 py-3">Prioridade</th>
                          <th className="px-4 py-3">Tempo de Resposta (h)</th>
                          <th className="px-4 py-3">Tempo de Resolução (h)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {service.policies.map((policy, pIdx) => (
                          <tr key={policy.priority} className="bg-white dark:bg-slate-900">
                            <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                              <div className="flex items-center gap-2">
                                <div className={cn(
                                  "w-2 h-2 rounded-full",
                                  policy.priority === 'Baixa' ? 'bg-slate-400' :
                                  policy.priority === 'Média' ? 'bg-blue-500' :
                                  policy.priority === 'Alta' ? 'bg-orange-500' : 'bg-red-500'
                                )} />
                                {policy.priority}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <input 
                                type="number" 
                                value={policy.response}
                                onChange={e => {
                                  const newServices = [...company.slaServices];
                                  newServices[sIdx].policies[pIdx].response = Number(e.target.value);
                                  setCompany({...company, slaServices: newServices});
                                }}
                                className="w-24 h-8 px-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 transition-colors"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input 
                                type="number" 
                                value={policy.resolution}
                                onChange={e => {
                                  const newServices = [...company.slaServices];
                                  newServices[sIdx].policies[pIdx].resolution = Number(e.target.value);
                                  setCompany({...company, slaServices: newServices});
                                }}
                                className="w-24 h-8 px-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 transition-colors"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'business_hours' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Horário de Atendimento</h2>
                  <p className="text-sm text-slate-500">Defina o fuso horário e horários úteis para fins de contagem do SLA.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fuso Horário</label>
                    <select 
                      value={company.businessHours.timezone}
                      onChange={e => setCompany({
                        ...company, 
                        businessHours: { ...company.businessHours, timezone: e.target.value }
                      })}
                      className="w-full max-w-md px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
                    >
                      <option value="America/Sao_Paulo">America/Sao_Paulo (Brasília)</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Grade de Horários</h3>
                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-medium">
                          <tr>
                            <th className="px-4 py-3">Dia da Semana</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Início</th>
                            <th className="px-4 py-3">Fim</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {company.businessHours.schedule.map((day, idx) => (
                            <tr key={day.day} className="bg-white dark:bg-slate-900">
                              <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                                {day.day}
                              </td>
                              <td className="px-4 py-3">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input 
                                    type="checkbox"
                                    checked={day.active}
                                    onChange={e => {
                                      const newSched = [...company.businessHours.schedule];
                                      newSched[idx].active = e.target.checked;
                                      setCompany({...company, businessHours: {...company.businessHours, schedule: newSched}});
                                    }}
                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                  />
                                </label>
                              </td>
                              <td className="px-4 py-3">
                                <input 
                                  type="time" 
                                  value={day.start}
                                  disabled={!day.active}
                                  onChange={e => {
                                    const newSched = [...company.businessHours.schedule];
                                    newSched[idx].start = e.target.value;
                                    setCompany({...company, businessHours: {...company.businessHours, schedule: newSched}});
                                  }}
                                  className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:border-blue-500 disabled:opacity-50"
                                />
                              </td>
                              <td className="px-4 py-3">
                                <input 
                                  type="time" 
                                  value={day.end}
                                  disabled={!day.active}
                                  onChange={e => {
                                    const newSched = [...company.businessHours.schedule];
                                    newSched[idx].end = e.target.value;
                                    setCompany({...company, businessHours: {...company.businessHours, schedule: newSched}});
                                  }}
                                  className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:border-blue-500 disabled:opacity-50"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Usuários Vinculados</h2>
                  <p className="text-sm text-slate-500">Lista de clientes que pertencem a esta empresa e podem abrir tickets em nome dela.</p>
                </div>

                {companyUsers.length === 0 ? (
                  <div className="py-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    <UsersIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 dark:text-slate-400">Nenhum usuário vinculado a este slug ({company.slug}).</p>
                  </div>
                ) : (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="px-4 py-3">Nome</th>
                          <th className="px-4 py-3">E-mail</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {companyUsers.map(user => (
                          <tr key={user.id} className="bg-white dark:bg-slate-900">
                            <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                              {user.name}
                            </td>
                            <td className="px-4 py-3 text-slate-500">{user.email}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'sso' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Segurança e Mapeamento de Domínios</h2>
                  <p className="text-sm text-slate-500">Mapeie os domínios de e-mail deste cliente. O login único (SSO via Google/Microsoft) é configurado globalmente nas Configurações Gerais.</p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Domínios do Cliente</h3>
                  <p className="text-xs text-slate-500">Usuários que fizerem login via SSO com esses domínios serão automaticamente vinculados a esta empresa.</p>
                  
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      placeholder="Ex: @empresa.com.br"
                      className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
                    />
                    <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                      Adicionar
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 pt-2">
                    {company.ssoDomains.map(domain => (
                      <div key={domain} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs font-medium">
                        {domain}
                        <button 
                          onClick={() => setCompany({...company, ssoDomains: company.ssoDomains.filter(d => d !== domain)})}
                          className="hover:bg-blue-100 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors"
                        >
                          <X className="w-3 h-3 opacity-50" />
                        </button>
                      </div>
                    ))}
                    {company.ssoDomains.length === 0 && (
                      <span className="text-xs text-slate-400 italic">Nenhum domínio configurado.</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
