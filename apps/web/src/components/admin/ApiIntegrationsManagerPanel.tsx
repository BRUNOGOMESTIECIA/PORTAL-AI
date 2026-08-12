import React, { useState } from 'react';
import { 
  Globe, Plus, RefreshCw, CheckCircle2, XCircle, AlertTriangle, 
  Trash2, Edit, ShieldCheck, Activity, Key, Link as LinkIcon, Server, 
  Terminal, ExternalLink, Cpu, Printer, Fingerprint, Smartphone, MessageSquare
} from 'lucide-react';
import { useApiIntegrations, ApiIntegration, ToolTargetId } from '../../hooks/use-api-integrations';
import { toast } from 'sonner';

const TOOL_OPTIONS: { id: ToolTargetId; label: string; icon: React.ElementType }[] = [
  { id: 'global', label: '🌐 Global / Backend ITSM (NestJS)', icon: Globe },
  { id: 'impressoras', label: '🖨️ Monitoramento de Impressoras', icon: Printer },
  { id: 'monitoramento', label: '🖥️ Monitoramento de Equipamentos & RMM', icon: Cpu },
  { id: 'biometria', label: '🔑 Acesso Biométrico', icon: Fingerprint },
  { id: 'mdm', label: '📱 MDM / Dispositivos Móveis', icon: Smartphone },
  { id: 'waf', label: '🔒 Antivírus ClamAV & WAF', icon: ShieldCheck },
  { id: 'notifications', label: '📧 E-mail & Webhooks', icon: Server },
  { id: 'custom', label: '⚡ Ferramenta Personalizada / API Externa', icon: Terminal },
];

export function ApiIntegrationsManagerPanel() {
  const { 
    integrations, 
    addIntegration, 
    updateIntegration, 
    deleteIntegration, 
    testConnection 
  } = useApiIntegrations();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ApiIntegration | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [targetToolId, setTargetToolId] = useState<ToolTargetId>('global');
  const [customCategory, setCustomCategory] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [authType, setAuthType] = useState<'none' | 'bearer' | 'apikey' | 'basic'>('bearer');
  const [apiKey, setApiKey] = useState('');
  const [customHeaders, setCustomHeaders] = useState('');

  const [testingId, setTestingId] = useState<string | null>(null);

  const totalIntegrations = integrations.length;
  const onlineIntegrations = integrations.filter((i) => i.status === 'online').length;
  const offlineIntegrations = integrations.filter((i) => i.status === 'offline').length;
  const avgLatency = Math.round(
    integrations.reduce((acc, curr) => acc + (curr.latencyMs || 0), 0) / (totalIntegrations || 1)
  );

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setName('');
    setTargetToolId('global');
    setCustomCategory('');
    setBaseUrl('');
    setAuthType('bearer');
    setApiKey('');
    setCustomHeaders('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: ApiIntegration) => {
    setEditingItem(item);
    setName(item.name);
    setTargetToolId(item.targetToolId);
    setCustomCategory(item.customCategory || '');
    setBaseUrl(item.baseUrl);
    setAuthType(item.authType);
    setApiKey(item.apiKey || '');
    setCustomHeaders(item.customHeaders || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !baseUrl.trim()) {
      toast.error('Preencha o Nome e a URL da API!');
      return;
    }

    if (editingItem) {
      updateIntegration(editingItem.id, {
        name,
        targetToolId,
        customCategory: targetToolId === 'custom' ? customCategory : undefined,
        baseUrl,
        authType,
        apiKey,
        customHeaders
      });
    } else {
      addIntegration({
        name,
        targetToolId,
        customCategory: targetToolId === 'custom' ? customCategory : undefined,
        baseUrl,
        authType,
        apiKey,
        customHeaders
      });
    }

    setIsModalOpen(false);
  };

  const handleTestPing = async (id: string) => {
    setTestingId(id);
    await testConnection(id);
    setTestingId(null);
  };

  const handlePingAll = async () => {
    toast.info('Iniciando teste de ping em todas as APIs cadastradas...');
    for (const item of integrations) {
      await testConnection(item.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-gray-900 via-gray-800 to-indigo-950 border border-gray-800 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Globe className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Gerenciador de Integrações de API
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-semibold uppercase">
                InstaPasso Vault
              </span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Cadastre, credencie e vincule APIs ao Sistema Operacional com monitoramento de ping em tempo real.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            type="button"
            onClick={handlePingAll}
            className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-gray-700 bg-gray-800/80 text-gray-200 hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5 text-purple-400" />
            Testar Todas
          </button>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            Nova Integração
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Total de APIs</span>
            <Server className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-white mt-2">{totalIntegrations}</div>
        </div>

        <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>APIs Online</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 mt-2">{onlineIntegrations}</div>
        </div>

        <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>APIs Offline</span>
            <XCircle className="h-4 w-4 text-red-400" />
          </div>
          <div className="text-xl font-bold text-red-400 mt-2">{offlineIntegrations}</div>
        </div>

        <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Latência Média</span>
            <Activity className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-400 mt-2">{avgLatency} ms</div>
        </div>
      </div>

      {/* Table of Registered APIs */}
      <div className="rounded-2xl bg-gray-900/70 border border-gray-800 overflow-hidden shadow-xl">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-purple-400" />
            APIs Credenciadas no InstaPasso
          </h3>
          <span className="text-xs text-gray-500">Sincronizado via BroadcastChannel</span>
        </div>

        {integrations.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-xs">
            Nenhuma API cadastrada ainda. Clique em "Nova Integração" para vincular seu backend ou serviço.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-950/80 text-gray-400 font-medium uppercase text-[10px] border-b border-gray-800">
                <tr>
                  <th className="px-5 py-3.5">Nome / Serviço</th>
                  <th className="px-5 py-3.5">Ferramenta Destino</th>
                  <th className="px-5 py-3.5">URL Base</th>
                  <th className="px-5 py-3.5">Autenticação</th>
                  <th className="px-5 py-3.5 text-center">Status / Ping</th>
                  <th className="px-5 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 text-gray-300">
                {integrations.map((item) => {
                  const toolOpt = TOOL_OPTIONS.find((t) => t.id === item.targetToolId);
                  const isTesting = testingId === item.id || item.status === 'testing';

                  return (
                    <tr key={item.id} className="hover:bg-gray-800/40 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <span>{item.name}</span>
                          {item.targetToolId === 'global' && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-normal">
                              Global
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-gray-400">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-800 border border-gray-700 text-gray-300">
                          {toolOpt?.label || item.targetToolId}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 font-mono text-[11px] text-gray-400 max-w-[220px] truncate">
                        <span className="hover:text-purple-400 transition-colors cursor-pointer" title={item.baseUrl}>
                          {item.baseUrl}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-gray-400 uppercase text-[10px]">
                        <span className="inline-flex items-center gap-1">
                          <Key className="h-3 w-3 text-amber-400" />
                          {item.authType}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        <div className="inline-flex items-center gap-2">
                          {isTesting ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              <RefreshCw className="h-3 w-3 animate-spin" />
                              Testando...
                            </span>
                          ) : item.status === 'online' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                              Online ({item.latencyMs || 25}ms)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 font-medium">
                              <XCircle className="h-3 w-3 text-red-400" />
                              Offline
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleTestPing(item.id)}
                            disabled={isTesting}
                            className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
                            title="Testar Conexão (Ping)"
                          >
                            <RefreshCw className={`h-3.5 w-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
                            title="Editar API"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteIntegration(item.id)}
                            className="p-1.5 rounded-lg bg-gray-800 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                            title="Remover API"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Cadastro / Edição de API */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-gray-900 border border-gray-800 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Globe className="h-5 w-5 text-purple-400" />
                {editingItem ? 'Editar Integração de API' : 'Cadastrar Nova API no InstaPasso'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-medium mb-1">
                  Nome da Integração / Serviço *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Backend NestJS Principal, Zabbix Monitor, WhatsApp Gateway..."
                  className="w-full p-2.5 rounded-xl border border-gray-700 bg-gray-950 text-white outline-none focus:border-purple-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">
                  Ferramenta Destino no Sistema Operacional *
                </label>
                <select
                  value={targetToolId}
                  onChange={(e) => setTargetToolId(e.target.value as ToolTargetId)}
                  className="w-full p-2.5 rounded-xl border border-gray-700 bg-gray-950 text-white outline-none focus:border-purple-500 transition-colors"
                >
                  {TOOL_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {targetToolId === 'custom' && (
                <div>
                  <label className="block text-gray-300 font-medium mb-1">
                    Categoria da Ferramenta Personalizada
                  </label>
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Ex: Alertas, ERP, CRM, Automação..."
                    className="w-full p-2.5 rounded-xl border border-gray-700 bg-gray-950 text-white outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="block text-gray-300 font-medium mb-1">
                  URL Base da API (Endpoint HTTP/HTTPS) *
                </label>
                <input
                  type="url"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://api.suaempresa.com.br/v1"
                  className="w-full p-2.5 rounded-xl border border-gray-700 bg-gray-950 text-white font-mono text-[11px] outline-none focus:border-purple-500 transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">
                    Tipo de Autenticação
                  </label>
                  <select
                    value={authType}
                    onChange={(e) => setAuthType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-gray-700 bg-gray-950 text-white outline-none focus:border-purple-500 transition-colors"
                  >
                    <option value="none">Sem Autenticação</option>
                    <option value="bearer">Bearer Token (JWT)</option>
                    <option value="apikey">Chave de API (API Key)</option>
                    <option value="basic">Basic Auth</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">
                    Chave / Token de Acesso
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="••••••••••••••••"
                    className="w-full p-2.5 rounded-xl border border-gray-700 bg-gray-950 text-white outline-none focus:border-purple-500 transition-colors font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-lg shadow-purple-600/20 transition-all"
                >
                  {editingItem ? 'Salvar Alterações' : 'Cadastrar e Testar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
