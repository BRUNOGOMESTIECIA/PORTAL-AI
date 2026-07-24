"use client";

import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { CategoryManager } from "../../../../../components/knowledge/CategoryManager";

export default function KnowledgeCategoriesPage() {
  const router = useRouter();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto pb-32">
      
      {/* Header with Back Button */}
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 text-sm font-semibold w-fit">
        <ArrowLeftIcon className="w-4 h-4" />
        Voltar para a Base de Conhecimento
      </button>

      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Árvore de Categorias</h1>
        <p className="text-gray-400">Organize os manuais e tutoriais da sua Base de Conhecimento em pastas hierárquicas.</p>
      </div>

      <div className="bg-[#111111] border border-gray-800 rounded-2xl p-8 shadow-2xl">
        <CategoryManager />
      </div>

    </div>
  );
}
