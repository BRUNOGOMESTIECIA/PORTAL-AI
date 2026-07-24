"use client";

import { useState } from "react";

export type Category = {
  id: string;
  name: string;
  parentId: string | null;
};

// Dados globais simulados para persistir estado em memória no cliente durante a sessão
let globalCategories: Category[] = [
  { id: "1", name: "Configurações Globais", parentId: null },
  { id: "2", name: "Integrações", parentId: null },
  { id: "3", name: "Faturamento", parentId: "1" },
  { id: "4", name: "Webhooks", parentId: "2" },
  { id: "5", name: "Bling ERP", parentId: "2" },
  { id: "6", name: "Gestão de Usuários", parentId: null },
];

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(globalCategories);

  const sync = (newCats: Category[]) => {
    globalCategories = newCats;
    setCategories(newCats);
  };

  const addCategory = (name: string, parentId: string | null) => {
    const newCat = { id: Math.random().toString(36).substr(2, 9), name, parentId };
    sync([...globalCategories, newCat]);
  };

  const updateCategory = (id: string, newName: string) => {
    sync(globalCategories.map(c => c.id === id ? { ...c, name: newName } : c));
  };

  const deleteCategory = (id: string) => {
    // Cascate delete for subcategories
    const toDelete = new Set<string>([id]);
    
    // Simple recursive find to delete children (only 1 level deep for mockup simplicity, but can be expanded)
    globalCategories.forEach(c => {
      if (c.parentId === id) toDelete.add(c.id);
    });

    sync(globalCategories.filter(c => !toDelete.has(c.id)));
  };

  return { categories, addCategory, updateCategory, deleteCategory };
}
