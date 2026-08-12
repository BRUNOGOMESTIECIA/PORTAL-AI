import React, { useState, useRef, useEffect } from 'react';
import { MOCK_CATALOG_ITEMS, MockCatalogItem } from '../../../mocks/data';
import { Plus, Edit2, Trash2, X, ChevronDown, FolderOpen, Check } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useEscapeModal } from '../../../hooks/use-escape-modal';
import { apiClient } from '../../../lib/api-client';

const EMOJI_OPTIONS = [
  '💻', '🖥️', '🖨️', '⌨️', '🖱️', '📱', '🔋', '🔌',
  '🔐', '🔑', '🛡️', '🌐', '📶', '📧', '☁️', '💾',
  '💽', '📀', '📡', '⚙️', '📊', '📈', '📋', '📁'
];

export default function CatalogPage() {
  const [items, setItems] = useState<MockCatalogItem[]>(MOCK_CATALOG_ITEMS);
  const [managedCategories, setManagedCategories] = useState<string[]>(['Acesso e Segurança', 'Hardware', 'Software', 'Conectividade', 'Geral']);

  useEffect(() => {
    apiClient.get('/catalog/items')
      .then((data: any[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: MockCatalogItem[] = data.map((i: any) => ({
            id: i.id,
            name: i.name,
            category: i.category_name || i.category || 'Geral',
            description: i.description || '',
            icon: i.icon || '💻',
            slaAmount: i.sla_amount || 4,
            slaType: i.sla_type || 'hours',
          }));
          setItems(mapped);
        }
      })
      .catch(() => console.info('[CatalogPage] API offline, utilizando mock local.'));
  }, []);


  // Modals state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subcategory: '',
    description: '',
    slaAmount: 4,
    slaType: 'hours' as 'hours' | 'days',
    icon: '💻'
  });

  // Category Manager states
  const [newCatName, setNewCatName] = useState('');
  const [editingCatName, setEditingCatName] = useState<string | null>(null);
  const [editedCatValue, setEditedCatValue] = useState('');
  const [catToDelete, setCatToDelete] = useState<string | null>(null);

  // Emoji Popover state
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  useEscapeModal(deleteId !== null, () => setDeleteId(null));
  useEscapeModal(isEditorOpen && !isEmojiPickerOpen, () => setIsEditorOpen(false));
  useEscapeModal(isEmojiPickerOpen, () => setIsEmojiPickerOpen(false));
  useEscapeModal(isCategoryManagerOpen && !catToDelete, () => setIsCategoryManagerOpen(false));
  useEscapeModal(catToDelete !== null, () => setCatToDelete(null));

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setIsEmojiPickerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatSLA = (amount: number, type: 'hours' | 'days') => {
    if (type === 'hours') return `${amount} hora${amount > 1 ? 's' : ''}`;
    return `${amount} dia${amount > 1 ? 's úteis' : ' útil'}`;
  };

  const handleOpenEditor = (item?: MockCatalogItem) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        name: item.name,
        category: item.category,
        subcategory: item.subcategory || '',
        description: item.description,
        slaAmount: item.slaAmount,
        slaType: item.slaType,
        icon: item.icon,
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        category: managedCategories[0] || 'Geral',
        subcategory: '',
        description: '',
        slaAmount: 4,
        slaType: 'hours',
        icon: '💻'
      });
    }
    setIsEditorOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.category.trim()) return;

    // Se o usuário digitou uma categoria que não existe no catálogo de categorias gerenciadas, nós criamos automaticamente
    if (!managedCategories.includes(formData.category.trim())) {
      setManagedCategories([...managedCategories, formData.category.trim()]);
    }

    if (editingId) {
      setItems(items.map(i => i.id === editingId ? { ...i, ...formData } : i));
    } else {
      const newItem: MockCatalogItem = {
        id: `ct${Date.now()}`,
        ...formData
      };
      setItems([...items, newItem]);
    }
    setIsEditorOpen(false);
  };

  const confirmDelete = () => {
    if (deleteId) {
      setItems(items.filter(i => i.id !== deleteId));
      setDeleteId(null);
    }
  };

  // ─── LÓGICA DO GERENCIADOR DE CATEGORIAS ───
  const handleAddCategory = () => {
    const trimmed = newCatName.trim();
    if (trimmed && !managedCategories.includes(trimmed)) {
      setManagedCategories([...managedCategories, trimmed]);
      setNewCatName('');
    }
  };

  const handleStartEditCat = (catName: string) => {
    if (catName === 'Geral') return; // Bloqueia edição de Geral
    setEditingCatName(catName);
    setEditedCatValue(catName);
  };

  const handleSaveCatEdit = () => {
    const trimmed = editedCatValue.trim();
    if (!trimmed || !editingCatName) return;

    if (trimmed !== editingCatName) {
      // 1. Atualizar lista de categorias
      setManagedCategories(managedCategories.map(c => c === editingCatName ? trimmed : c));
      // 2. Cascata: atualizar itens que possuíam essa categoria
      setItems(items.map(i => i.category === editingCatName ? { ...i, category: trimmed } : i));
    }
    setEditingCatName(null);
  };

  const confirmDeleteCategory = () => {
    if (!catToDelete || catToDelete === 'Geral') return;
    
    // 1. Remover a categoria da lista
    setManagedCategories(managedCategories.filter(c => c !== catToDelete));
    
    // 2. Cascata: Mover itens órfãos para "Geral"
    // Garantir que "Geral" exista na lista
    if (!managedCategories.includes('Geral')) {
      setManagedCategories(prev => [...prev, 'Geral']);
    }
    setItems(items.map(i => i.category === catToDelete ? { ...i, category: 'Geral' } : i));
    setCatToDelete(null);
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Catálogo de Serviços</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Gerencie os itens disponíveis para solicitação</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsCategoryManagerOpen(true)}
            className="flex items-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <FolderOpen className="h-4 w-4" /> Gerenciar Categorias
          </button>
          <button 
            onClick={() => handleOpenEditor()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" /> Adicionar Serviço
          </button>
        </div>
      </div>

      {/* Categories & Cards */}
      {managedCategories.map((cat) => {
        const catItems = items.filter(i => i.category === cat);
        const subcategories = Array.from(new Set(catItems.map(i => i.subcategory || '')));
        
        return (
          <div key={cat} className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center justify-between">
              {cat}
              <span className="text-xs font-normal text-slate-400 dark:text-slate-500">{catItems.length} serviço{catItems.length !== 1 ? 's' : ''}</span>
            </h2>
            
            {catItems.length === 0 ? (
              <div className="bg-slate-50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6 text-center text-slate-500 dark:text-slate-400 text-sm">
                Nenhum serviço nesta categoria.
              </div>
            ) : (
              subcategories.map(subcat => {
                const subItems = catItems.filter(i => (i.subcategory || '') === subcat);
                return (
                  <div key={subcat || 'Geral'} className="ml-2">
                    {subcat && (
                      <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                        {subcat}
                      </h3>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                      {subItems.map((item) => (
                        <div key={item.id} className="relative flex items-start gap-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm hover:border-blue-200 dark:hover:border-blue-900/50 hover:shadow-md transition-all group overflow-hidden">
                          <span className="text-2xl mt-1 select-none">{item.icon}</span>
                          <div className="min-w-0 pr-8">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">{item.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{item.description}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 font-medium">SLA: {formatSLA(item.slaAmount, item.slaType)}</p>
                          </div>
                          
                          {/* Ações Flutuantes (Hover) */}
                          <div className="absolute top-3 right-3 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                            <button 
                              onClick={() => handleOpenEditor(item)}
                              className="p-1.5 bg-white dark:bg-slate-800 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => setDeleteId(item.id)}
                              className="p-1.5 bg-white dark:bg-slate-800 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        );
      })}

      {/* ─── MODAL DE EXCLUSÃO DE SERVIÇO ─── */}
      {deleteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm shadow-xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Confirmar Exclusão</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Tem certeza que deseja excluir este serviço do catálogo? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setDeleteId(null)}
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

      {/* ─── MODAL DO EDITOR (CRIAR/EDITAR) SERVIÇO ─── */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4 py-8 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl shadow-xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200 flex flex-col relative my-auto">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {editingId ? 'Editar Serviço' : 'Novo Serviço'}
              </h3>
              <button 
                onClick={() => setIsEditorOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              
              <div className="flex gap-4">
                {/* Seletor de Ícone */}
                <div className="relative" ref={emojiPickerRef}>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Ícone</label>
                  <button
                    onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                    className="w-16 h-10 flex items-center justify-center text-2xl rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                  >
                    {formData.icon}
                  </button>

                  {/* Popover de Emojis */}
                  {isEmojiPickerOpen && (
                    <div className="absolute top-12 left-0 z-[60] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-3 w-64 animate-in fade-in slide-in-from-top-2">
                      <p className="text-xs font-semibold text-slate-500 mb-2">Escolha um ícone</p>
                      <div className="grid grid-cols-6 gap-2">
                        {EMOJI_OPTIONS.map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => {
                              setFormData({ ...formData, icon: emoji });
                              setIsEmojiPickerOpen(false);
                            }}
                            className={cn(
                              "text-xl p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition",
                              formData.icon === emoji && "bg-blue-50 border border-blue-200 dark:bg-blue-900/30 dark:border-blue-800"
                            )}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Nome do Serviço */}
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome do Serviço *</label>
                  <input
                    autoFocus
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Manutenção de Impressora"
                    className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition"
                  />
                </div>
              </div>

              {/* Categorias */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Categoria *</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Ex: Hardware, Sistemas..."
                    list="catalog-categories"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition"
                  />
                  <datalist id="catalog-categories">
                    {managedCategories.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Subcategoria (Opcional)</label>
                    <button 
                      type="button"
                      onClick={() => {
                        const nova = window.prompt('Nome da nova subcategoria:');
                        if (nova && nova.trim()) setFormData({ ...formData, subcategory: nova.trim() });
                      }}
                      className="text-[10px] text-blue-600 hover:underline font-medium"
                    >
                      + Nova
                    </button>
                  </div>
                  <select
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    className="w-full appearance-none rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-3 pr-8 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition cursor-pointer"
                  >
                    <option value="">Nenhuma</option>
                    {Array.from(new Set([
                      ...items.filter(i => i.category === formData.category && i.subcategory).map(i => i.subcategory as string),
                      ...(formData.subcategory ? [formData.subcategory] : [])
                    ])).map(sc => (
                      <option key={sc} value={sc}>{sc}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-[28px] pointer-events-none" />
                </div>
              </div>

              {/* SLA */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Prazo de Resolução (SLA)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={formData.slaAmount}
                    onChange={(e) => setFormData({ ...formData, slaAmount: parseInt(e.target.value) || 1 })}
                    className="w-24 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition"
                  />
                  <div className="relative">
                    <select
                      value={formData.slaType}
                      onChange={(e) => setFormData({ ...formData, slaType: e.target.value as 'hours' | 'days' })}
                      className="appearance-none w-36 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-3 pr-8 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition cursor-pointer"
                    >
                      <option value="hours">Horas</option>
                      <option value="days">Dias úteis</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Descrição Curta</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva rapidamente o que esse serviço atende..."
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl">
              <button 
                onClick={() => setIsEditorOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                disabled={!formData.name.trim() || !formData.category.trim()}
                className="px-5 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors shadow-sm"
              >
                Salvar Serviço
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL DO GERENCIADOR DE CATEGORIAS ─── */}
      {isCategoryManagerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200 flex flex-col overflow-hidden max-h-[80vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-blue-600" />
                Categorias do Catálogo
              </h3>
              <button 
                onClick={() => setIsCategoryManagerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
              {/* Adicionar nova */}
              <div className="flex items-center gap-2 mb-6">
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                  placeholder="Nome da nova categoria..."
                  className="flex-1 h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition"
                />
                <button 
                  onClick={handleAddCategory}
                  disabled={!newCatName.trim()}
                  className="h-10 px-4 text-sm font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors disabled:opacity-50"
                >
                  Adicionar
                </button>
              </div>

              {/* Lista */}
              <div className="space-y-2">
                {managedCategories.map(cat => {
                  const count = items.filter(i => i.category === cat).length;
                  const isEditing = editingCatName === cat;
                  const isGeral = cat === 'Geral';

                  return (
                    <div key={cat} className="group flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                      {isEditing ? (
                        <input
                          autoFocus
                          type="text"
                          value={editedCatValue}
                          onChange={e => setEditedCatValue(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleSaveCatEdit()}
                          className="flex-1 h-8 rounded border border-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30"
                        />
                      ) : (
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{cat}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">{count} serviço{count !== 1 ? 's' : ''} vinculados</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                        {isEditing ? (
                          <button onClick={handleSaveCatEdit} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md"><Check className="w-4 h-4" /></button>
                        ) : (
                          <>
                            {!isGeral && (
                              <button onClick={() => handleStartEditCat(cat)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md"><Edit2 className="w-4 h-4" /></button>
                            )}
                            {!isGeral && (
                              <button onClick={() => setCatToDelete(cat)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md"><Trash2 className="w-4 h-4" /></button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Aviso: Excluir uma categoria move os serviços para "Geral". Renomear atualiza os serviços automaticamente.
              </p>
            </div>

            {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DE CATEGORIA */}
            {catToDelete && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 rounded-2xl">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
                  <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Excluir Categoria?</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                    A categoria <strong>{catToDelete}</strong> será apagada. Todos os serviços que estavam dentro dela serão movidos para <strong>Geral</strong>. Deseja continuar?
                  </p>
                  <div className="flex justify-end gap-3">
                    <button 
                      onClick={() => setCatToDelete(null)}
                      className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={confirmDeleteCategory}
                      className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-sm"
                    >
                      Excluir Categoria
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
