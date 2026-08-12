import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Users } from 'lucide-react';
import { apiClient } from '../../../../lib/api-client';


export interface TicketQueue {
  id: string;
  name: string;
  description: string;
  color: string;
  autoAssign: boolean;
  isActive: boolean;
}

export const DEFAULT_QUEUES: TicketQueue[] = [
  { id: 'q_n1', name: 'N1 - Triagem e Suporte Inicial', description: 'Fila padrão para novos chamados', color: '#3b82f6', autoAssign: false, isActive: true },
  { id: 'q_n2', name: 'N2 - Especialistas e Análise', description: 'Chamados que exigem maior conhecimento técnico', color: '#8b5cf6', autoAssign: false, isActive: true },
  { id: 'q_infra', name: 'Infraestrutura e Redes', description: 'Problemas de hardware, servidores e conectividade', color: '#f59e0b', autoAssign: false, isActive: true },
  { id: 'q_soc', name: 'SOC - Segurança da Informação', description: 'Incidentes de segurança e controle de acesso', color: '#ef4444', autoAssign: false, isActive: true }
];

export function useDynamicQueues() {
  const [queues, setQueues] = useState<TicketQueue[]>([]);

  useEffect(() => {
    // Tenta carregar do backend NestJS primeiro
    apiClient.get('/roles')
      .then((data: any[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const apiQueues: TicketQueue[] = data.map((r: any) => ({
            id: r.id,
            name: r.name,
            description: r.description || 'Fila de atendimento',
            color: '#3b82f6',
            autoAssign: false,
            isActive: true,
          }));
          setQueues(apiQueues);
          localStorage.setItem('portal_queues', JSON.stringify(apiQueues));
          return;
        }
        throw new Error('Nenhuma fila');
      })
      .catch(() => {
        const saved = localStorage.getItem('portal_queues');
        if (saved) {
          setQueues(JSON.parse(saved));
        } else {
          setQueues(DEFAULT_QUEUES);
          localStorage.setItem('portal_queues', JSON.stringify(DEFAULT_QUEUES));
        }
      });
  }, []);

  const saveQueues = (newQueues: TicketQueue[]) => {
    setQueues(newQueues);
    localStorage.setItem('portal_queues', JSON.stringify(newQueues));
    // Tenta sincronizar salvamento com API NestJS em background
    apiClient.post('/automation', { name: 'FilaSync', queues: newQueues }).catch(() => {});
  };

  return { queues, saveQueues };
}


export default function QueuesManagerPanel() {
  const { queues, saveQueues } = useDynamicQueues();
  const [isEditing, setIsEditing] = useState(false);
  const [editingQueue, setEditingQueue] = useState<TicketQueue | null>(null);

  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formColor, setFormColor] = useState('#3b82f6');
  const [formAutoAssign, setFormAutoAssign] = useState(false);
  const [formIsActive, setFormIsActive] = useState(true);

  const handleCreateNew = () => {
    setEditingQueue(null);
    setFormName('');
    setFormDesc('');
    setFormColor('#3b82f6');
    setFormAutoAssign(false);
    setFormIsActive(true);
    setIsEditing(true);
  };

  const handleEdit = (queue: TicketQueue) => {
    setEditingQueue(queue);
    setFormName(queue.name);
    setFormDesc(queue.description);
    setFormColor(queue.color);
    setFormAutoAssign(queue.autoAssign);
    setFormIsActive(queue.isActive);
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta mesa? Tickets atrelados poderão ficar órfãos.')) {
      saveQueues(queues.filter(q => q.id !== id));
    }
  };

  const handleSave = () => {
    if (!formName) return;

    if (editingQueue) {
      const newQueues = queues.map(q => q.id === editingQueue.id ? { 
        ...q, 
        name: formName, 
        description: formDesc,
        color: formColor,
        autoAssign: formAutoAssign,
        isActive: formIsActive
      } : q);
      saveQueues(newQueues);
    } else {
      const newQueue: TicketQueue = {
        id: `queue_${Date.now()}`,
        name: formName,
        description: formDesc,
        color: formColor,
        autoAssign: formAutoAssign,
        isActive: formIsActive
      };
      saveQueues([...queues, newQueue]);
    }
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-medium leading-6 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-500" />
          {editingQueue ? 'Editar Mesa de Ticket' : 'Nova Mesa de Ticket'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-2">Nome da Mesa</label>
              <input
                type="text"
                value={formName}
                onChange={e => setFormName(e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-blue-500"
                placeholder="Ex: N2 - Redes"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-2">Descrição</label>
              <textarea
                value={formDesc}
                onChange={e => setFormDesc(e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-blue-500 h-24 resize-none"
                placeholder="Descreva o propósito desta fila..."
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-2">Cor de Identificação</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formColor}
                  onChange={e => setFormColor(e.target.value)}
                  className="w-10 h-10 rounded border border-border cursor-pointer bg-background"
                />
                <span className="text-sm text-muted">{formColor}</span>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer p-3 border border-border rounded-lg hover:bg-zinc-900/30 transition-colors">
                <input
                  type="checkbox"
                  checked={formAutoAssign}
                  onChange={e => setFormAutoAssign(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-blue-500 focus:ring-0"
                />
                <div>
                  <div className="text-sm font-medium text-foreground">Atribuição Automática</div>
                  <div className="text-xs text-muted">Distribuir tickets automaticamente nesta fila (Round Robin)</div>
                </div>
              </label>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer p-3 border border-border rounded-lg hover:bg-zinc-900/30 transition-colors">
                <input
                  type="checkbox"
                  checked={formIsActive}
                  onChange={e => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-blue-500 focus:ring-0"
                />
                <div>
                  <div className="text-sm font-medium text-foreground">Mesa Ativa</div>
                  <div className="text-xs text-muted">Apenas mesas ativas recebem novos tickets</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-border">
          <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm text-muted hover:text-foreground">Cancelar</button>
          <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium text-sm transition-colors">
            Salvar Mesa
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Mesas de Atendimento (Filas)
          </h2>
          <p className="text-sm text-muted">Gerencie como os tickets são roteados e distribuídos entre sua equipe.</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nova Mesa
        </button>
      </div>

      <div className="grid gap-4">
        {queues.map(queue => (
          <div key={queue.id} className="bg-card border border-border rounded-xl p-5 flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div 
                className="w-4 h-4 rounded-full mt-1 flex-shrink-0 shadow-sm" 
                style={{ backgroundColor: queue.color }} 
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-foreground">{queue.name}</h3>
                  {!queue.isActive && (
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">Inativo</span>
                  )}
                  {queue.autoAssign && (
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">Auto-Assign</span>
                  )}
                </div>
                <p className="text-sm text-muted mt-1">{queue.description}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleEdit(queue)}
                className="p-2 text-muted hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                title="Editar"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleDelete(queue.id)}
                className="p-2 text-muted hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                title="Excluir"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {queues.length === 0 && (
          <div className="text-center p-8 border border-dashed border-border rounded-xl text-muted text-sm">
            Nenhuma mesa configurada.
          </div>
        )}
      </div>
    </div>
  );
}
