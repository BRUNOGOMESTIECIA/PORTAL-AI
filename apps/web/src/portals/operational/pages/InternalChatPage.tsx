import React, { useState, useEffect } from 'react';
import { Send, Hash, Users, Plus, Trash2, MessageSquare, SmilePlus, Pencil, X, CornerDownRight } from 'lucide-react';
import { MOCK_CHANNELS, MOCK_INTERNAL_MESSAGES, MOCK_STAFF, MockChatMessage } from '../../../mocks/data';
import { cn } from '../../../lib/utils';
import { useEscapeModal } from '../../../hooks/use-escape-modal';
import { useAuth } from '../../../hooks/use-mock-auth';
import { apiClient } from '../../../lib/api-client';
import { getSocket } from '../../../lib/socket';

export default function InternalChatPage() {
  const [channels, setChannels] = useState(MOCK_CHANNELS);
  const [messagesMap, setMessagesMap] = useState<Record<string, MockChatMessage[]>>(MOCK_INTERNAL_MESSAGES);
  const [channelId, setChannelId] = useState('ic1');
  const [activeThread, setActiveThread] = useState<MockChatMessage | null>(null);
  
  const [input, setInput] = useState('');
  const [threadInput, setThreadInput] = useState('');
  
  const [deleteTarget, setDeleteTarget] = useState<{ id: string, type: 'channel' | 'message' } | null>(null);
  const [reactionPopover, setReactionPopover] = useState<string | null>(null);
  const [createChannelModal, setCreateChannelModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  
  const { user, hasPermission } = useAuth();
  
  useEscapeModal(deleteTarget !== null, () => setDeleteTarget(null));
  useEscapeModal(createChannelModal, () => setCreateChannelModal(false));
  useEscapeModal(reactionPopover !== null, () => setReactionPopover(null));

  const currentUser = user;
  const canManage = hasPermission('chat.manage');

  // Carrega canais da API NestJS real
  useEffect(() => {
    apiClient.get('/internal/channels')
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setChannels(data.map((c: any) => ({
            id: c.id,
            name: c.name || 'canal',
            type: c.type || 'team',
            unread: c.unread_count || 0,
            lastMessage: c.last_message || ''
          })));
        }
      })
      .catch(() => {});
  }, []);

  // Escuta mensagens do Socket.io em tempo real
  useEffect(() => {
    try {
      const socket = getSocket();
      socket.on('internal:message:new', (msgData: any) => {
        if (msgData.channel_id) {
          const formatted: MockChatMessage = {
            id: msgData.id,
            body: msgData.body,
            senderName: msgData.sender_name || 'Atendente',
            senderType: 'agent',
            createdAt: msgData.created_at || new Date().toISOString()
          };
          setMessagesMap(prev => ({
            ...prev,
            [msgData.channel_id]: [...(prev[msgData.channel_id] || []), formatted]
          }));
        }
      });
      return () => {
        socket.off('internal:message:new');
      };
    } catch {}
  }, []);

  const channel = channels.find((c) => c.id === channelId);
  const messages = messagesMap[channelId] || [];

  // ─── LÓGICA DE CANAIS ────────────────────────────────────────────────────────
  const handleCreateChannel = () => {
    setCreateChannelModal(true);
  };

  const confirmCreateChannel = () => {
    if (newChannelName.trim()) {
      const newId = `ic${Date.now()}`;
      setChannels([...channels, { id: newId, name: newChannelName.trim(), type: 'team', unread: 0, lastMessage: '' }]);
      setMessagesMap({ ...messagesMap, [newId]: [] });
      setChannelId(newId);
    }
    setCreateChannelModal(false);
    setNewChannelName('');
  };

  const handleDeleteChannel = (id: string) => {
    setDeleteTarget({ id, type: 'channel' });
  };

  // ─── LÓGICA DE MENSAGENS ──────────────────────────────────────────────────────
  const handleSendMessage = async () => {
    if (!input.trim() || !currentUser) return;
    const text = input.trim();
    setInput('');

    const newMsg: MockChatMessage = {
      id: `msg_${Date.now()}`,
      body: text,
      senderName: currentUser.name,
      senderType: 'agent',
      createdAt: new Date().toISOString(),
    };

    setMessagesMap(prev => ({
      ...prev,
      [channelId]: [...(prev[channelId] || []), newMsg]
    }));

    // Envia para a API NestJS real
    try {
      await apiClient.post(`/internal/channels/${channelId}/messages`, { body: text });
    } catch (err) {
      console.info('[Chat Interno API] Mensagem enviada em modo local (fallback).');
    }
  };


  const handleDeleteMessage = (msgId: string) => {
    setDeleteTarget({ id: msgId, type: 'message' });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'channel') {
      setChannels(channels.filter(c => c.id !== deleteTarget.id));
      if (channelId === deleteTarget.id) setChannelId('ic1');
    } else {
      setMessagesMap(prev => {
        const msgs = prev[channelId].map(m => 
          m.id === deleteTarget.id ? { ...m, body: '[Mensagem excluída]', isDeleted: true } : m
        );
        return { ...prev, [channelId]: msgs };
      });
      if (activeThread?.id === deleteTarget.id) setActiveThread(null);
    }
    setDeleteTarget(null);
  };

  const handleEditMessage = (msgId: string, currentBody: string) => {
    const newBody = window.prompt('Editar mensagem:', currentBody);
    if (newBody && newBody !== currentBody) {
      setMessagesMap(prev => {
        const msgs = prev[channelId].map(m => 
          m.id === msgId ? { ...m, body: newBody, isEdited: true } : m
        );
        // Atualiza a thread ativa se for a mesma mensagem
        if (activeThread?.id === msgId) {
          setActiveThread(msgs.find(m => m.id === msgId)!);
        }
        return { ...prev, [channelId]: msgs };
      });
    }
  };

  const handleReact = (msgId: string, emoji: string) => {
    setMessagesMap(prev => {
      const msgs = prev[channelId].map(m => {
        if (m.id !== msgId) return m;
        const existing = m.reactions?.find(r => r.emoji === emoji);
        let newReactions = [...(m.reactions || [])];
        if (existing) {
          if (existing.userReacted) {
            existing.count -= 1;
            existing.userReacted = false;
          } else {
            existing.count += 1;
            existing.userReacted = true;
          }
          if (existing.count === 0) {
            newReactions = newReactions.filter(r => r.emoji !== emoji);
          }
        } else {
          newReactions.push({ emoji, count: 1, userReacted: true });
        }
        return { ...m, reactions: newReactions };
      });
      return { ...prev, [channelId]: msgs };
    });
  };

  // ─── LÓGICA DE THREADS ────────────────────────────────────────────────────────
  const handleSendReply = () => {
    if (!threadInput.trim() || !currentUser || !activeThread) return;
    const newReply: MockChatMessage = {
      id: `rep_${Date.now()}`,
      body: threadInput,
      senderName: currentUser.name,
      senderType: 'agent',
      createdAt: new Date().toISOString(),
    };
    
    setMessagesMap(prev => {
      const msgs = prev[channelId].map(m => {
        if (m.id === activeThread.id) {
          const updatedMsg = { ...m, replies: [...(m.replies || []), newReply] };
          setActiveThread(updatedMsg); // Sync active thread
          return updatedMsg;
        }
        return m;
      });
      return { ...prev, [channelId]: msgs };
    });
    setThreadInput('');
  };

  // ─── RENDERIZADOR DE MENÇÕES ────────────────────────────────────────────────
  const renderBody = (text: string) => {
    // Basic mention parser: @Name Name up to next mention or end
    const parts = text.split(/(@[A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        return <span key={i} className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full px-2 py-0.5 text-xs font-semibold mx-0.5">{part}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  // ─── COMPONENTE DE MENSAGEM ─────────────────────────────────────────────────
  const MessageItem = ({ msg, isReply = false }: { msg: MockChatMessage, isReply?: boolean }) => {
    const isMine = msg.senderName === currentUser?.name;
    const canEdit = isMine && !msg.isDeleted;
    const canDelete = (isMine || canManage) && !msg.isDeleted;

    return (
      <div className="group flex items-start gap-3 relative hover:bg-slate-50 dark:hover:bg-slate-800/30 p-2 -mx-2 rounded-xl transition-colors">
        
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0 mt-1">
          <span className="text-xs font-bold text-blue-700 dark:text-blue-400">{msg.senderName.charAt(0)}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{msg.senderName}</span>
            <span className="text-xs text-slate-400">{new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          
          <p className={cn("text-sm", msg.isDeleted ? "text-slate-400 italic" : "text-slate-700 dark:text-slate-300")}>
            {renderBody(msg.body)}
            {msg.isEdited && !msg.isDeleted && <span className="text-xs text-slate-400 ml-2">(editado)</span>}
          </p>

          {/* Reactions */}
          {msg.reactions && msg.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {msg.reactions.map(r => (
                <button 
                  key={r.emoji}
                  onClick={() => handleReact(msg.id, r.emoji)}
                  className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border transition-colors", 
                    r.userReacted 
                      ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400" 
                      : "bg-white border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                  )}
                >
                  <span>{r.emoji}</span>
                  <span>{r.count}</span>
                </button>
              ))}
            </div>
          )}

          {/* Replies indicator (only for main messages) */}
          {!isReply && msg.replies && msg.replies.length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <CornerDownRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
              <button 
                onClick={() => setActiveThread(msg)}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                {msg.replies.length} {msg.replies.length === 1 ? 'resposta' : 'respostas'}
              </button>
              <span className="text-xs text-slate-400">
                Última de {new Date(msg.replies[msg.replies.length - 1].createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
        </div>

        {/* Hover Actions */}
        <div className={cn("absolute right-2 top-2 transition-opacity bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-lg p-0.5 flex items-center z-20", reactionPopover === msg.id ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
          <div className="relative">
            <button onClick={() => setReactionPopover(reactionPopover === msg.id ? null : msg.id)} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md" title="Reagir"><SmilePlus className="w-4 h-4" /></button>
            {reactionPopover === msg.id && (
              <>
                {/* Overlay invisible to catch outside clicks */}
                <div className="fixed inset-0 z-40" onClick={() => setReactionPopover(null)}></div>
                <div className="absolute right-0 bottom-full mb-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg rounded-xl p-1 flex gap-1 z-50">
                  {['👍', '❤️', '😂', '😮', '😢', '👏', '✅', '👀'].map(e => (
                    <button
                      key={e}
                      onClick={() => {
                        handleReact(msg.id, e);
                        setReactionPopover(null);
                      }}
                      className="hover:bg-slate-100 dark:hover:bg-slate-700 p-1.5 rounded-md text-lg transition-colors flex items-center justify-center w-8 h-8"
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          {!isReply && (
            <button onClick={() => setActiveThread(msg)} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md" title="Responder na thread"><MessageSquare className="w-4 h-4" /></button>
          )}
          {canEdit && (
            <button onClick={() => handleEditMessage(msg.id, msg.body)} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md" title="Editar"><Pencil className="w-4 h-4" /></button>
          )}
          {canDelete && (
            <button onClick={() => handleDeleteMessage(msg.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md" title="Excluir"><Trash2 className="w-4 h-4" /></button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex gap-5 flex-1 min-h-0 mt-4">
        
        {/* ─── COLUNA 1: Lista de Canais ─── */}
        <div className="w-56 flex-shrink-0 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Canais</p>
            {canManage && (
              <button onClick={handleCreateChannel} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500" title="Criar Canal">
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {channels.map((ch) => (
              <div key={ch.id} className="group relative flex items-center">
                <button
                  onClick={() => setChannelId(ch.id)}
                  className={cn(
                    'flex-1 flex items-center justify-between px-2 py-2 rounded-lg text-sm transition-colors text-left', 
                    channelId === ch.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Hash className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{ch.name}</span>
                  </div>
                  {ch.unread > 0 && (
                    <span className="text-[10px] font-bold bg-blue-600 text-white rounded-full px-1.5 py-0.5 flex-shrink-0">{ch.unread}</span>
                  )}
                </button>
                {canManage && (
                  <button onClick={() => handleDeleteChannel(ch.id)} className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ─── COLUNA 2: Chat Principal ─── */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-w-0">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 dark:border-slate-800 shadow-sm z-10 shrink-0">
            <Hash className="h-4 w-4 text-slate-400" />
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{channel?.name}</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">Nenhuma mensagem ainda.</div>
            ) : (
              messages.map(msg => <MessageItem key={msg.id} msg={msg} />)
            )}
          </div>

          <div className="p-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
            <div className="flex gap-2 relative">
              <input
                value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={`Mensagem em #${channel?.name}...`}
                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition shadow-sm"
              />
              <button onClick={handleSendMessage} disabled={!input.trim()} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-3.5 py-2.5 rounded-xl transition-colors shadow-sm shrink-0">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ─── COLUNA 3: Painel de Thread (Respostas) ─── */}
        {activeThread && (
          <div className="w-80 flex-shrink-0 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-w-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 shadow-sm z-10 shrink-0">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Thread</p>
              <button onClick={() => setActiveThread(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {/* Mensagem Original */}
              <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                <MessageItem msg={activeThread} isReply={true} />
              </div>

              {/* Respostas */}
              <div className="flex-1 space-y-4">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{activeThread.replies?.length || 0} respostas</p>
                {activeThread.replies?.map(reply => (
                  <MessageItem key={reply.id} msg={reply} isReply={true} />
                ))}
              </div>
            </div>

            {/* Input da Thread */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-900/50">
              <div className="flex gap-2">
                <input
                  value={threadInput} onChange={(e) => setThreadInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                  placeholder="Responder..."
                  className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition shadow-sm"
                />
                <button onClick={handleSendReply} disabled={!threadInput.trim()} className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white px-3 py-2 rounded-lg transition-colors shadow-sm shrink-0">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ─── MODAL DE EXCLUSÃO ─── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm shadow-xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Confirmar Exclusão</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              {deleteTarget.type === 'channel' 
                ? 'Tem certeza que deseja excluir este canal de forma permanente? Todas as mensagens serão perdidas.' 
                : 'Tem certeza que deseja excluir esta mensagem? Ela será ocultada para todos os participantes.'}
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-sm"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL DE CRIAR CANAL ─── */}
      {createChannelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm shadow-xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Novo Canal</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Crie um novo canal de comunicação para a equipe.
            </p>
            
            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome do Canal</label>
              <input
                autoFocus
                type="text"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && confirmCreateChannel()}
                placeholder="Ex: #projetos-especiais"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => {
                  setCreateChannelModal(false);
                  setNewChannelName('');
                }}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmCreateChannel}
                disabled={!newChannelName.trim()}
                className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors shadow-sm"
              >
                Criar Canal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
