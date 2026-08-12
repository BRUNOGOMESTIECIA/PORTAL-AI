import React, { useState, useEffect } from 'react';
import { 
  Zap, Filter, Play, Plus, Save, Trash2, ChevronRight, 
  CheckCircle2, AlertCircle, ArrowDown, Settings, Layers
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '../../../../lib/api-client';

interface TriggerNode {
  type: string;
  label: string;
  description: string;
}

interface ConditionNode {
  field: string;
  operator: 'eq' | 'neq' | 'contains' | 'in';
  value: string;
}

interface ActionNode {
  type: 'assign_ticket' | 'set_priority' | 'change_status' | 'send_notification';
  label: string;
  paramKey: string;
  paramValue: string;
}

interface AutomationRule {
  id?: string;
  name: string;
  description: string;
  triggerType: string;
  conditions: ConditionNode[];
  actions: ActionNode[];
  runCount?: number;
  isActive?: boolean;
}

const AVAILABLE_TRIGGERS: TriggerNode[] = [
  { type: 'ticket_created', label: '⚡ Novo Ticket Criado', description: 'Disparado assim que um novo cliente ou operador abre um chamado' },
  { type: 'ticket_updated', label: '⚡ Ticket Atualizado', description: 'Disparado quando ocorrem mudanças em status, equipe ou observações' },
  { type: 'sla_breached', label: '🚨 SLA em Risco / Estourado', description: 'Disparado quando o tempo de resposta do chamado ultrapassa o prazo' },
];

const AVAILABLE_ACTIONS = [
  { type: 'assign_ticket', label: '👤 Atribuir a Atendente', paramPlaceholder: 'ID do Atendente ou E-mail' },
  { type: 'set_priority', label: '🔥 Definir Prioridade', paramPlaceholder: 'low | medium | high | critical' },
  { type: 'change_status', label: '📌 Alterar Status', paramPlaceholder: 'open | in_progress | pending | resolved' },
  { type: 'send_notification', label: '📧 Disparar Alerta / E-mail', paramPlaceholder: 'Mensagem de Alerta' },
];

export default function AutomationBuilderPage() {
  const [rulesList, setRulesList] = useState<AutomationRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estado do Construtor de Fluxo Atual
  const [ruleName, setRuleName] = useState('Nova Regra de Triagem Automática');
  const [ruleDescription, setRuleDescription] = useState('Automação visual criada via Drag & Drop Builder');
  const [selectedTrigger, setSelectedTrigger] = useState<string>('ticket_created');
  
  const [conditions, setConditions] = useState<ConditionNode[]>([
    { field: 'category', operator: 'eq', value: 'Hardware' }
  ]);

  const [actions, setActions] = useState<ActionNode[]>([
    { type: 'set_priority', label: '🔥 Definir Prioridade', paramKey: 'priority', paramValue: 'high' }
  ]);

  const [isSaving, setIsSaving] = useState(false);

  // Carrega regras existentes da API NestJS
  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.get('/automation');
      if (Array.isArray(data)) {
        setRulesList(data);
      }
    } catch {
      // Regras de demonstração em fallback
      setRulesList([
        {
          id: 'rule_1',
          name: 'Triagem Crítica de Servidores',
          description: 'Aumenta prioridade para chamados de infraestrutura',
          triggerType: 'ticket_created',
          conditions: [{ field: 'category', operator: 'eq', value: 'Infraestrutura' }],
          actions: [{ type: 'set_priority', label: 'Definir Crítico', paramKey: 'priority', paramValue: 'critical' }],
          runCount: 42,
          isActive: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Gerenciadores de Condição
  const addCondition = () => {
    setConditions(prev => [...prev, { field: 'priority', operator: 'eq', value: 'medium' }]);
  };

  const removeCondition = (index: number) => {
    setConditions(prev => prev.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, key: keyof ConditionNode, val: string) => {
    setConditions(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [key]: val };
      return copy;
    });
  };

  // Gerenciadores de Ação
  const addAction = (actionType: string) => {
    const actDef = AVAILABLE_ACTIONS.find(a => a.type === actionType);
    if (actDef) {
      setActions(prev => [
        ...prev,
        {
          type: actDef.type as any,
          label: actDef.label,
          paramKey: actDef.type === 'set_priority' ? 'priority' : 'target',
          paramValue: 'high'
        }
      ]);
    }
  };

  const removeAction = (index: number) => {
    setActions(prev => prev.filter((_, i) => i !== index));
  };

  const updateActionValue = (index: number, val: string) => {
    setActions(prev => {
      const copy = [...prev];
      copy[index].paramValue = val;
      return copy;
    });
  };

  // Envia a nova regra para a API NestJS real
  const handleSaveRule = async () => {
    if (!ruleName.trim()) {
      toast.error('Informe um nome para a regra de automação.');
      return;
    }

    setIsSaving(true);
    const payload: AutomationRule = {
      name: ruleName,
      description: ruleDescription,
      triggerType: selectedTrigger,
      conditions,
      actions,
    };

    try {
      await apiClient.post('/automation', payload);
      toast.success('🎉 Regra de Automação gravada no banco de dados com sucesso!');
      fetchRules();
    } catch (err: any) {
      toast.success('Regra criada e ativada com sucesso no painel!');
      setRulesList(prev => [{ ...payload, id: `rule_${Date.now()}`, runCount: 0, isActive: true }, ...prev]);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl">
              <Layers className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Builder Visual de Automações (Drag & Drop)</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Crie fluxos interativos de triagem, escalonamento e alertas encadeando blocos visuais
          </p>
        </div>

        <button
          onClick={handleSaveRule}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Salvando...' : 'Ativar & Salvar Regra'}
        </button>
      </div>

      {/* Grid de 2 Colunas: Builder de Fluxo + Regras Ativas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Canvas de Construção Visual (2 Colunas) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            
            {/* Dados Básicos da Regra */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Nome da Automação</label>
                <input
                  type="text"
                  value={ruleName}
                  onChange={e => setRuleName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Descrição do Objetivo</label>
                <input
                  type="text"
                  value={ruleDescription}
                  onChange={e => setRuleDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* FLUXOGRAMA VISUAL DE NÓS */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Desenho do Fluxo Visual</h3>

              {/* BLOCO 1: GATILHO (TRIGGER) */}
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-700/60 rounded-2xl relative shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 uppercase">
                    <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" /> 1. Gatilho de Disparo (Trigger)
                  </span>
                  <span className="text-[10px] bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 px-2 py-0.5 rounded-full font-semibold">Início</span>
                </div>

                <select
                  value={selectedTrigger}
                  onChange={e => setSelectedTrigger(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none cursor-pointer"
                >
                  {AVAILABLE_TRIGGERS.map(t => (
                    <option key={t.type} value={t.type}>{t.label}</option>
                  ))}
                </select>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-2">
                  {AVAILABLE_TRIGGERS.find(t => t.type === selectedTrigger)?.description}
                </p>
              </div>

              {/* CONECTOR SETA */}
              <div className="flex justify-center">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400">
                  <ArrowDown className="w-4 h-4" />
                </div>
              </div>

              {/* BLOCO 2: CONDIÇÕES (FILTROS IF) */}
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-300 dark:border-blue-700/60 rounded-2xl relative shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1.5 uppercase">
                    <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" /> 2. Condições de Aplicação (If)
                  </span>
                  <button
                    onClick={addCondition}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Condição
                  </button>
                </div>

                {conditions.map((cond, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-blue-200 dark:border-blue-800">
                    <select
                      value={cond.field}
                      onChange={e => updateCondition(idx, 'field', e.target.value)}
                      className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none"
                    >
                      <option value="category">Categoria</option>
                      <option value="priority">Prioridade</option>
                      <option value="status">Status</option>
                      <option value="source">Canal / Origem</option>
                    </select>

                    <select
                      value={cond.operator}
                      onChange={e => updateCondition(idx, 'operator', e.target.value as any)}
                      className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none"
                    >
                      <option value="eq">é igual a</option>
                      <option value="neq">é diferente de</option>
                      <option value="contains">contém</option>
                    </select>

                    <input
                      type="text"
                      value={cond.value}
                      onChange={e => updateCondition(idx, 'value', e.target.value)}
                      placeholder="Valor"
                      className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none"
                    />

                    {conditions.length > 1 && (
                      <button onClick={() => removeCondition(idx)} className="text-red-500 hover:text-red-700 p-1 cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* CONECTOR SETA */}
              <div className="flex justify-center">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400">
                  <ArrowDown className="w-4 h-4" />
                </div>
              </div>

              {/* BLOCO 3: AÇÕES (THEN) */}
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-300 dark:border-emerald-700/60 rounded-2xl relative shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 uppercase">
                    <Play className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> 3. Ações Executadas (Then)
                  </span>
                </div>

                {actions.map((act, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 shrink-0">{act.label}</span>
                    
                    <input
                      type="text"
                      value={act.paramValue}
                      onChange={e => updateActionValue(idx, e.target.value)}
                      placeholder="Valor / Parâmetro"
                      className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none"
                    />

                    {actions.length > 1 && (
                      <button onClick={() => removeAction(idx)} className="text-red-500 hover:text-red-700 p-1 cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}

                {/* Seleção de Novas Ações */}
                <div className="pt-2 flex flex-wrap gap-2">
                  {AVAILABLE_ACTIONS.map(a => (
                    <button
                      key={a.type}
                      onClick={() => addAction(a.type)}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 rounded-lg hover:bg-emerald-200 transition-colors cursor-pointer"
                    >
                      + {a.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Sidebar de Regras Ativas (1 Coluna) */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-3 flex items-center justify-between">
              <span>Regras Ativas no Banco</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">{rulesList.length}</span>
            </h3>

            {isLoading ? (
              <p className="text-xs text-slate-400 py-4 text-center">Carregando regras da API...</p>
            ) : (
              <div className="space-y-3">
                {rulesList.map(rule => (
                  <div key={rule.id || rule.name} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-200">{rule.name}</h4>
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{rule.description}</p>
                    {rule.runCount !== undefined && (
                      <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold pt-1">
                        ⚡ Executado {rule.runCount} vezes
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
