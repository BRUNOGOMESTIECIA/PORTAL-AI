"use client";

import { useState } from "react";
import { 
  FolderIcon, 
  FolderOpenIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  CheckIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { Category, useCategories } from "../../hooks/useCategories";

export function CategoryManager() {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();
  const [expanded, setExpanded] = useState<Set<string>>(new Set(categories.map(c => c.id)));
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [addValue, setAddValue] = useState("");

  const toggleExpand = (id: string) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpanded(next);
  };

  const handleStartEdit = (category: Category) => {
    setEditingId(category.id);
    setEditValue(category.name);
  };

  const handleSaveEdit = (id: string) => {
    if (editValue.trim()) {
      updateCategory(id, editValue);
    }
    setEditingId(null);
  };

  const handleStartAdd = (parentId: string | null) => {
    setAddingTo(parentId === null ? "root" : parentId);
    setAddValue("");
    if (parentId && !expanded.has(parentId)) {
      toggleExpand(parentId);
    }
  };

  const handleSaveAdd = () => {
    if (addValue.trim()) {
      addCategory(addValue, addingTo === "root" ? null : addingTo);
    }
    setAddingTo(null);
  };

  const renderTree = (parentId: string | null, depth = 0) => {
    const children = categories.filter(c => c.parentId === parentId);
    if (children.length === 0 && addingTo !== (parentId === null ? "root" : parentId)) return null;

    return (
      <ul className={`flex flex-col gap-1 ${depth > 0 ? "ml-6 pl-4 border-l border-gray-800" : ""}`}>
        {children.map(category => {
          const hasChildren = categories.some(c => c.parentId === category.id);
          const isExpanded = expanded.has(category.id);
          const isEditing = editingId === category.id;

          return (
            <li key={category.id} className="flex flex-col gap-1">
              <div className="group flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.02] border border-transparent hover:border-gray-800 transition-colors">
                <div className="flex items-center gap-2 flex-1">
                  {hasChildren ? (
                    <button onClick={() => toggleExpand(category.id)} className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-white">
                      {isExpanded ? <ChevronDownIcon className="w-3 h-3" /> : <ChevronRightIcon className="w-3 h-3" />}
                    </button>
                  ) : (
                    <div className="w-5 h-5" /> // spacer
                  )}
                  
                  {isExpanded || !hasChildren ? <FolderOpenIcon className="w-4 h-4 text-purple-400" /> : <FolderIcon className="w-4 h-4 text-purple-400" />}
                  
                  {isEditing ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input 
                        autoFocus
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSaveEdit(category.id)}
                        className="bg-[#0A0A0A] border border-purple-500/50 rounded px-2 py-0.5 text-sm text-white outline-none w-full max-w-[200px]"
                      />
                      <button onClick={() => handleSaveEdit(category.id)} className="text-green-400 hover:text-green-300"><CheckIcon className="w-4 h-4" /></button>
                      <button onClick={() => setEditingId(null)} className="text-red-400 hover:text-red-300"><XMarkIcon className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{category.name}</span>
                  )}
                </div>

                {!isEditing && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleStartAdd(category.id)} title="Nova Subcategoria" className="p-1.5 rounded bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700">
                      <PlusIcon className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleStartEdit(category)} title="Renomear" className="p-1.5 rounded bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700">
                      <PencilIcon className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteCategory(category.id)} title="Apagar" className="p-1.5 rounded bg-red-500/10 text-red-400 hover:text-white hover:bg-red-500/20 ml-2">
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {isExpanded && renderTree(category.id, depth + 1)}
            </li>
          );
        })}

        {/* Inline Add Input */}
        {addingTo === (parentId === null ? "root" : parentId) && (
          <li className="flex items-center gap-2 p-2">
            <div className="w-5 h-5" />
            <FolderIcon className="w-4 h-4 text-purple-400/50" />
            <div className="flex items-center gap-2 flex-1">
              <input 
                autoFocus
                value={addValue}
                onChange={e => setAddValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSaveAdd()}
                placeholder="Nome da categoria..."
                className="bg-[#0A0A0A] border border-purple-500/50 rounded px-2 py-0.5 text-sm text-white outline-none w-full max-w-[200px]"
              />
              <button onClick={handleSaveAdd} className="text-green-400 hover:text-green-300"><CheckIcon className="w-4 h-4" /></button>
              <button onClick={() => setAddingTo(null)} className="text-red-400 hover:text-red-300"><XMarkIcon className="w-4 h-4" /></button>
            </div>
          </li>
        )}
      </ul>
    );
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-white">Hierarquia de Pastas</h2>
        <button 
          onClick={() => handleStartAdd(null)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-xs font-bold text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
        >
          <PlusIcon className="w-4 h-4" /> Nova Raiz
        </button>
      </div>

      <div className="bg-[#050505] border border-gray-800 rounded-xl p-4 min-h-[300px]">
        {renderTree(null)}
        {categories.length === 0 && addingTo !== "root" && (
           <div className="flex flex-col items-center justify-center h-full text-gray-500 py-10">
             <FolderOpenIcon className="w-12 h-12 mb-3 opacity-20" />
             <p className="text-sm">Nenhuma categoria criada.</p>
           </div>
        )}
      </div>
    </div>
  );
}
