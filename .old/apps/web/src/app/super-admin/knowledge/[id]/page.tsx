"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeftIcon,
  GlobeAltIcon,
  LockClosedIcon,
  FolderOpenIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  TrashIcon,
  EyeIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  XMarkIcon,
  PlusIcon,
  Cog6ToothIcon
} from "@heroicons/react/24/outline";
import { Select } from "../../../../components/ui/Select";
import { useCategories } from "../../../../hooks/useCategories";
import { CategoryManager } from "../../../../components/knowledge/CategoryManager";

export default function KnowledgeEditorPage() {
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === "new";

  const [title, setTitle] = useState(isNew ? "" : "Configuração do Subdomínio Customizado");
  const [content, setContent] = useState(isNew ? "" : "Para configurar o seu subdomínio customizado e utilizar a plataforma com a sua própria marca (ex: app.suaempresa.com.br), siga os passos abaixo:\n\n1. Acesse o painel de DNS do seu provedor de domínio (Registro.br, Cloudflare, GoDaddy).\n2. Crie uma nova entrada do tipo CNAME.\n3. Aponte o valor para `proxy.nosso-saas.com`.\n\nAguarde até 4 horas para a propagação completa.");
  
  const { categories } = useCategories();
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [category, setCategory] = useState("4"); // default mock webhook
  const [visibility, setVisibility] = useState("public");
  const [targetAudience, setTargetAudience] = useState("all_tenants");
  const [selectedTenants, setSelectedTenants] = useState<string[]>(["Acme Corporation"]);
  const [status, setStatus] = useState("published");

  const availableTenants = ["Tech Solutions", "Global Industries", "Startup Inc"];

  const handleAddTenant = (tenant: string) => {
    if (tenant !== "add_new" && !selectedTenants.includes(tenant)) {
      setSelectedTenants([...selectedTenants, tenant]);
    }
  };

  const handleRemoveTenant = (tenantToRemove: string) => {
    setSelectedTenants(selectedTenants.filter(t => t !== tenantToRemove));
  };

  // Build category hierarchy array: ["Configurações Globais", "Faturamento"]
  const getCategoryHierarchy = (id: string): string[] => {
    const cat = categories.find(c => c.id === id);
    if (!cat) return [];
    if (!cat.parentId) return [cat.name];
    return [...getCategoryHierarchy(cat.parentId), cat.name];
  };

  const categoryOptions = categories.map(c => {
    const hierarchy = getCategoryHierarchy(c.id);
    const depth = hierarchy.length - 1;
    return {
      value: c.id,
      _sortKey: hierarchy.join(' > '), // Para ordenar alfabeticamente
      buttonLabel: <span className="truncate">{hierarchy.join(' > ')}</span>,
      label: (
        <div 
          style={{ paddingLeft: `${depth * 16}px` }} 
          className={`flex items-center gap-1.5 leading-tight py-0.5 ${depth === 0 ? 'font-bold text-white' : 'font-medium text-gray-400 group-hover:text-white'}`}
        >
          {depth > 0 && <span className="text-gray-700 text-[10px]">└</span>}
          {c.name}
        </div>
      )
    };
  }).sort((a, b) => a._sortKey.localeCompare(b._sortKey));

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto pb-32">
      
      {/* Header with Back Button */}
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 text-sm font-semibold w-fit">
        <ArrowLeftIcon className="w-4 h-4" />
        Voltar para a Base de Conhecimento
      </button>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Main Editor Column */}
        <div className="flex-1 w-full bg-[#111111] border border-gray-800 rounded-2xl p-10 shadow-2xl min-h-[600px] flex flex-col">
           <textarea 
             value={title}
             rows={1}
             onChange={e => {
               setTitle(e.target.value);
               e.target.style.height = "auto";
               e.target.style.height = `${e.target.scrollHeight}px`;
             }}
             placeholder="Título do Artigo"
             className="w-full bg-transparent text-4xl font-extrabold text-white outline-none placeholder-gray-700 mb-6 resize-none overflow-hidden leading-tight"
             style={{ height: 'auto' }}
           />
           
           <div className="w-full h-px bg-gray-800/50 mb-6"></div>
           
           <textarea 
             value={content}
             onChange={e => setContent(e.target.value)}
             placeholder="Comece a escrever sua documentação aqui... (Suporta Markdown)"
             className="w-full flex-1 bg-transparent text-gray-300 font-medium text-lg leading-relaxed outline-none resize-none placeholder-gray-700 custom-scrollbar"
             style={{ minHeight: '400px' }}
           />
        </div>

        {/* Sidebar Settings Column */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
           <div className="bg-[#111111] border border-gray-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-white font-bold mb-5 flex items-center gap-2">
                <PencilSquareIcon className="w-5 h-5 text-purple-400" />
                Metadados do Artigo
              </h3>

              <div className="space-y-5">
                 <div>
                   <label className="block text-xs font-bold text-gray-500 mb-1.5">Visibilidade</label>
                   <Select 
                     value={visibility}
                     onChange={setVisibility}
                     icon={visibility === 'public' ? <GlobeAltIcon className="w-4 h-4" /> : <LockClosedIcon className="w-4 h-4" />}
                     options={[
                       { value: "public", label: "Público (Portal do Cliente)" },
                       { value: "internal", label: "Interno (Apenas Equipe)" }
                     ]}
                   />
                   <p className="text-[10px] text-gray-500 mt-1">
                     {visibility === 'public' ? 'Clientes poderão ler e buscar este artigo.' : 'Documento restrito aos técnicos da plataforma.'}
                   </p>
                 </div>

                 {visibility === 'public' && (
                   <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                     <label className="block text-xs font-bold text-gray-500 mb-1.5">Audiência (Quais Clientes?)</label>
                     <Select 
                       value={targetAudience}
                       onChange={setTargetAudience}
                       icon={<UserGroupIcon className="w-4 h-4" />}
                       options={[
                         { value: "all_tenants", label: "Todos os Clientes" },
                         { value: "specific_tenants", label: "Selecionar Clientes..." }
                       ]}
                     />
                     
                     {targetAudience === 'specific_tenants' && (
                       <div className="mt-3 pl-3 border-l-2 border-purple-500/30 animate-in fade-in slide-in-from-top-1 duration-200">
                         <div className="flex flex-wrap gap-2 mb-3">
                           {selectedTenants.map(tenant => (
                             <span key={tenant} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#1A1A1A] text-gray-300 border border-gray-700">
                               <BuildingOfficeIcon className="w-3 h-3 text-gray-500" />
                               {tenant}
                               <button onClick={() => handleRemoveTenant(tenant)} className="ml-1 hover:text-red-400 transition-colors">
                                 <XMarkIcon className="w-3 h-3" />
                               </button>
                             </span>
                           ))}
                           {selectedTenants.length === 0 && (
                             <span className="text-xs text-red-400 italic font-medium">Nenhum cliente selecionado.</span>
                           )}
                         </div>

                         <Select 
                           value="add_new"
                           onChange={handleAddTenant}
                           icon={<PlusIcon className="w-4 h-4" />}
                           options={[
                             { value: "add_new", label: "Adicionar Cliente..." },
                             ...availableTenants.filter(t => !selectedTenants.includes(t)).map(t => ({ value: t, label: t }))
                           ]}
                         />
                         
                         <p className="text-[10px] text-purple-400/80 mt-2 font-medium">
                           Apenas os usuários das {selectedTenants.length} empresas selecionadas terão acesso.
                         </p>
                       </div>
                     )}
                   </div>
                 )}

                 <div>
                   <label className="block text-xs font-bold text-gray-500 mb-1.5">Status de Publicação</label>
                   <Select 
                     value={status}
                     onChange={setStatus}
                     options={[
                       { value: "published", label: "🟢 Publicado" },
                       { value: "draft", label: "⚪ Rascunho" },
                       { value: "outdated", label: "🔴 Desatualizado" }
                     ]}
                   />
                 </div>

                 <div>
                   <div className="flex justify-between items-center mb-1.5">
                     <label className="block text-xs font-bold text-gray-500">Pasta / Categoria</label>
                     <button onClick={() => setShowCategoryModal(true)} className="text-[10px] flex items-center gap-1 font-bold text-purple-400 hover:text-purple-300">
                       <Cog6ToothIcon className="w-3 h-3" /> Gerenciar
                     </button>
                   </div>
                   <Select 
                     value={category}
                     onChange={setCategory}
                     icon={<FolderOpenIcon className="w-4 h-4" />}
                     options={categoryOptions}
                   />
                 </div>
              </div>
           </div>

           <div className="bg-[#111111] border border-gray-800 rounded-2xl p-6 shadow-xl">
             <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase">Autor</span>
                <span className="text-sm font-semibold text-white">Alice Gomes</span>
             </div>
             {!isNew && (
               <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-800">
                  <span className="text-xs font-bold text-gray-500 uppercase">Visualizações</span>
                  <span className="text-sm font-semibold text-white flex items-center gap-2"><EyeIcon className="w-4 h-4 text-purple-400" /> 4.205 acessos</span>
               </div>
             )}
           </div>

           {!isNew && (
             <button className="w-full flex justify-center items-center gap-2 text-sm font-bold text-red-400 bg-red-500/10 border border-red-500/20 py-3 rounded-xl hover:bg-red-500/20 transition-colors">
               <TrashIcon className="w-5 h-5" /> Apagar Artigo
             </button>
           )}
        </div>

      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 lg:left-64 right-0 p-4 pointer-events-none z-40 flex justify-center">
        <div className="bg-[#111111]/90 backdrop-blur-md border border-gray-800 rounded-full px-6 py-4 shadow-[0_0_40px_rgba(0,0,0,0.8)] pointer-events-auto flex items-center gap-4 animate-in slide-in-from-bottom-10 duration-500">
           <button onClick={() => router.back()} className="px-5 py-2 rounded-full text-sm font-bold text-gray-400 hover:text-white transition-colors">
             Cancelar
           </button>
           <div className="w-px h-6 bg-gray-800"></div>
           <button onClick={() => router.back()} className="px-6 py-2.5 rounded-full text-sm font-bold bg-purple-600 text-white hover:bg-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.4)] transition-all flex items-center gap-2">
             <CheckCircleIcon className="w-5 h-5" />
             {isNew ? "Criar Artigo" : "Salvar Alterações"}
           </button>
        </div>
      </div>

      {/* Category Manager Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#111111] border border-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
             <div className="flex justify-between items-center p-6 border-b border-gray-800">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <FolderOpenIcon className="w-6 h-6 text-purple-400" />
                  Gerenciador de Pastas
                </h3>
                <button onClick={() => setShowCategoryModal(false)} className="text-gray-500 hover:text-white transition-colors">
                  <XMarkIcon className="w-6 h-6" />
                </button>
             </div>
             
             <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
               <CategoryManager />
             </div>

             <div className="p-6 border-t border-gray-800 bg-[#0A0A0A] flex justify-end">
                <button onClick={() => setShowCategoryModal(false)} className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(147,51,234,0.3)] transition-all">
                  Concluído
                </button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}
