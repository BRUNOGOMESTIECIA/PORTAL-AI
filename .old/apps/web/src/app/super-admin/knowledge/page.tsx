"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  MagnifyingGlassIcon,
  PlusIcon,
  BookOpenIcon,
  EyeIcon,
  ExclamationCircleIcon,
  Squares2X2Icon,
  ListBulletIcon,
  LockClosedIcon,
  GlobeAltIcon,
  FolderOpenIcon,
  PencilSquareIcon,
  ClockIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { Select } from "../../../components/ui/Select";

type Article = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  visibility: "public" | "internal";
  status: "published" | "draft" | "outdated";
  author: string;
  views: number;
  updatedAt: string;
};

export default function KnowledgeBasePage() {
  const router = useRouter();
  
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [articles] = useState<Article[]>([
    { id: "1", title: "Configuração do Subdomínio Customizado", excerpt: "Passo a passo para apontar o CNAME do seu domínio para a plataforma.", category: "api", visibility: "public", status: "published", author: "Alice Gomes", views: 4205, updatedAt: "Há 2 dias" },
    { id: "2", title: "[Manual Interno] Como resetar o rate-limit", excerpt: "Procedimento emergencial no banco de dados quando um cliente bloqueia a API.", category: "engineering", visibility: "internal", status: "published", author: "Marcos Silva", views: 142, updatedAt: "Há 1 semana" },
    { id: "3", title: "Quais os métodos de pagamento suportados?", excerpt: "Cartões de crédito via Stripe, PIX e Boletos registrados.", category: "billing", visibility: "public", status: "outdated", author: "Financeiro", views: 15400, updatedAt: "Há 8 meses" },
    { id: "4", title: "Como adicionar variáveis no Webhook", excerpt: "Tutorial de configuração de payload de webhooks.", category: "api", visibility: "public", status: "published", author: "Carlos Souza", views: 890, updatedAt: "Há 1 mês" },
    { id: "5", title: "Rascunho: Nova Política de SLA", excerpt: "Novos tempos de resposta que entrarão em vigor no próximo semestre.", category: "engineering", visibility: "internal", status: "draft", author: "Roberto Diretor", views: 12, updatedAt: "Ontem" },
    { id: "6", title: "Onde encontro minha API Key?", excerpt: "Caminho no painel para gerar tokens de autenticação Bearer.", category: "api", visibility: "public", status: "published", author: "Alice Gomes", views: 9230, updatedAt: "Há 3 meses" },
  ]);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCategoryModalOpen(false);
    setNewCategoryName("");
    toast.success("Categoria criada com sucesso!");
  };

  const filteredArticles = articles.filter(a => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) || a.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "all" || a.category === categoryFilter;
    const matchVisibility = visibilityFilter === "all" || a.visibility === visibilityFilter;
    return matchSearch && matchCategory && matchVisibility;
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto pb-10">
      
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Base de Conhecimento</h1>
          <p className="text-gray-400 mt-2">Documentação Oficial, Manuais Internos e Artigos de Ajuda (Tier 0).</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsCategoryModalOpen(true)} className="flex items-center gap-2 bg-[#111111] border border-gray-800 text-gray-300 hover:text-white hover:bg-gray-900 px-5 py-2.5 rounded-xl transition-colors font-semibold">
            <FolderOpenIcon className="w-5 h-5" />
            Nova Categoria
          </button>
          <button onClick={() => router.push('/super-admin/knowledge/new')} className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl shadow-[0_0_15px_rgba(147,51,234,0.3)] hover:bg-purple-500 transition-all font-semibold">
            <PlusIcon className="w-5 h-5" />
            Novo Artigo
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <div className="bg-[#111111] border border-gray-800 p-6 rounded-2xl shadow-lg relative overflow-hidden flex items-center justify-between">
            <div>
              <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">Total de Artigos</h3>
              <p className="text-3xl font-black text-white">{articles.length}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
               <BookOpenIcon className="w-6 h-6 text-blue-400" />
            </div>
         </div>
         <div className="bg-[#111111] border border-gray-800 p-6 rounded-2xl shadow-lg relative overflow-hidden flex items-center justify-between">
            <div>
              <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">Visualizações (30d)</h3>
              <p className="text-3xl font-black text-white">29.8k</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
               <EyeIcon className="w-6 h-6 text-indigo-400" />
            </div>
         </div>
         <div className="bg-[#111111] border border-red-500/30 p-6 rounded-2xl shadow-[0_0_20px_rgba(220,38,38,0.05)] relative overflow-hidden flex items-center justify-between">
            <div>
              <h3 className="text-red-400 text-sm font-bold uppercase tracking-wider mb-1">Desatualizados / Rascunho</h3>
              <p className="text-3xl font-black text-white">{articles.filter(a => a.status !== 'published').length}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
               <ExclamationCircleIcon className="w-6 h-6 text-red-400" />
            </div>
         </div>
      </div>

      {/* Toolbar */}
      <div className="bg-[#111111] p-5 rounded-2xl shadow-xl border border-gray-800 flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
           <MagnifyingGlassIcon className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-500" />
           <input 
             type="text"
             value={search}
             onChange={e => setSearch(e.target.value)}
             placeholder="Buscar artigo por título ou termo..."
             className="w-full bg-[#0A0A0A] border border-gray-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white font-medium focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
           />
        </div>
        
        <div className="w-48">
          <Select 
            value={categoryFilter}
            onChange={setCategoryFilter}
            icon={<FolderOpenIcon className="w-4 h-4" />}
            options={[
              { value: "all", label: "Todas Categorias" },
              { value: "api", label: "API & Integrações" },
              { value: "billing", label: "Faturamento" },
              { value: "engineering", label: "Engenharia (Interno)" },
            ]}
          />
        </div>

        <div className="w-48">
          <Select 
            value={visibilityFilter}
            onChange={setVisibilityFilter}
            options={[
              { value: "all", label: "Qualquer Visibilidade" },
              { value: "public", label: "🌐 Apenas Públicos" },
              { value: "internal", label: "🔒 Apenas Internos" },
            ]}
          />
        </div>

        {/* View Toggle */}
        <div className="flex bg-[#0A0A0A] border border-gray-800 rounded-xl p-1">
          <button 
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
            title="Visualização em Cards"
          >
            <Squares2X2Icon className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
            title="Visualização em Tabela"
          >
            <ListBulletIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Render Condition: Grid vs List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          {filteredArticles.map(article => (
            <div key={article.id} onClick={() => router.push(`/super-admin/knowledge/${article.id}`)} className="bg-[#111111] border border-gray-800 rounded-2xl p-6 shadow-lg hover:border-purple-500/50 transition-colors group cursor-pointer flex flex-col h-full">
               <div className="flex justify-between items-start mb-4">
                 <div className="inline-flex px-2.5 py-1 rounded-md bg-[#0A0A0A] border border-gray-800 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                   <FolderOpenIcon className="w-3 h-3" /> {article.category}
                 </div>
                 
                 {article.visibility === 'public' ? (
                   <span title="Público: Visível para Clientes" className="text-blue-400 bg-blue-500/10 p-1.5 rounded-lg border border-blue-500/20">
                     <GlobeAltIcon className="w-4 h-4" />
                   </span>
                 ) : (
                   <span title="Interno: Restrito à Equipe" className="text-orange-400 bg-orange-500/10 p-1.5 rounded-lg border border-orange-500/20">
                     <LockClosedIcon className="w-4 h-4" />
                   </span>
                 )}
               </div>

               <h3 className="text-lg font-bold text-white mb-2 leading-snug group-hover:text-purple-400 transition-colors">{article.title}</h3>
               <p className="text-sm text-gray-500 line-clamp-2 mb-6 flex-1">{article.excerpt}</p>
               
               <div className="pt-4 border-t border-gray-800/80 flex items-center justify-between text-xs font-semibold text-gray-400">
                 <div className="flex flex-col gap-1">
                   <span className="flex items-center gap-1.5"><ClockIcon className="w-3.5 h-3.5" /> Atualizado {article.updatedAt}</span>
                   <span className="flex items-center gap-1.5"><EyeIcon className="w-3.5 h-3.5" /> {article.views.toLocaleString()} views</span>
                 </div>
                 
                 {article.status === 'published' ? (
                   <span className="text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">Publicado</span>
                 ) : article.status === 'draft' ? (
                   <span className="text-gray-400 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">Rascunho</span>
                 ) : (
                   <span className="text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">Desatualizado</span>
                 )}
               </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#111111] rounded-2xl shadow-xl border border-gray-800 overflow-hidden animate-in fade-in duration-300">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-[#050505]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Documento</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Visibilidade</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Métricas & Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filteredArticles.map(article => (
                <tr key={article.id} onClick={() => router.push(`/super-admin/knowledge/${article.id}`)} className="hover:bg-white/[0.02] transition-colors group cursor-pointer">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-white text-sm mb-1 group-hover:text-purple-400 transition-colors">{article.title}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500 text-xs font-medium flex items-center gap-1"><FolderOpenIcon className="w-3 h-3" /> {article.category}</span>
                        <span className="text-gray-500 text-xs font-medium flex items-center gap-1"><PencilSquareIcon className="w-3 h-3" /> {article.author}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {article.visibility === 'public' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-400 uppercase border border-blue-500/20">
                        <GlobeAltIcon className="w-3.5 h-3.5" /> Público
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-orange-500/10 text-orange-400 uppercase border border-orange-500/20">
                        <LockClosedIcon className="w-3.5 h-3.5" /> Interno
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-2">
                       {article.status === 'published' ? (
                         <span className="w-fit text-[10px] font-bold uppercase text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">Publicado</span>
                       ) : article.status === 'draft' ? (
                         <span className="w-fit text-[10px] font-bold uppercase text-gray-400 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">Rascunho</span>
                       ) : (
                         <span className="w-fit text-[10px] font-bold uppercase text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">Desatualizado</span>
                       )}
                       <span className="text-gray-400 text-xs font-semibold flex items-center gap-1.5"><EyeIcon className="w-3.5 h-3.5" /> {article.views.toLocaleString()} acessos</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button className="text-purple-400 hover:text-purple-300 font-bold text-sm bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/20 hover:bg-purple-500/20 transition-all opacity-0 group-hover:opacity-100">
                      Editar Artigo
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Categoria Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#111111] border border-gray-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-gray-800 flex justify-between items-center bg-[#0A0A0A]">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FolderOpenIcon className="w-5 h-5 text-purple-400" />
                Nova Categoria
              </h2>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreateCategory} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-1.5">Nome da Categoria</label>
                <input type="text" required value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="Ex: Troubleshooting de Rede" className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all placeholder-gray-600" />
              </div>
              
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">Cancelar</button>
                <button type="submit" className="px-6 py-2.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.4)] transition-all">
                  Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
