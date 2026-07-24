"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, BuildingOfficeIcon, ServerStackIcon, PencilIcon, TrashIcon, PauseIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";

type Tenant = {
  id: string;
  name: string;
  slug: string;
  status: string;
  created_at: string;
  modules?: string[];
};

const availableModules = [
  { id: "kb", label: "Base de Conhecimento", desc: "Acesso a documentos globais e artigos." },
  { id: "ai", label: "Assistente de IA", desc: "Resolução automatizada de tickets com Inteligência Artificial." },
  { id: "api", label: "Acesso à API", desc: "Habilita chaves de API e webhooks para integrações externas." },
  { id: "fin", label: "Módulo Financeiro", desc: "Controle de assinaturas, faturas e cobranças automáticas." },
  { id: "premium", label: "Suporte Premium", desc: "SLA prioritário e atendimento exclusivo." }
];

export default function TenantsPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [selectedModules, setSelectedModules] = useState<string[]>(["kb"]);
  const [editingId, setEditingId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchTenants = () => {
    setLoading(true);
    // Mocking the backend response
    setTimeout(() => {
      setTenants([
        { id: "1", name: "Acme Corp", slug: "acme-corp", status: "active", created_at: "2026-05-20", modules: ["kb", "ai", "fin"] },
        { id: "2", name: "Tech Solutions", slug: "tech-solutions", status: "active", created_at: "2026-05-21", modules: ["kb", "api"] },
        { id: "3", name: "Global Industries", slug: "global-industries", status: "deleted", created_at: "2026-05-22", modules: ["kb"] }
      ]);
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    
    // Mock save to backend
    setTimeout(() => {
      if (!editingId) {
        setTenants([...tenants, { id: Date.now().toString(), name: newName, slug: newSlug, status: 'active', created_at: new Date().toISOString(), modules: selectedModules }]);
      } else {
        setTenants(tenants.map(t => t.id === editingId ? { ...t, name: newName, slug: newSlug, modules: selectedModules } : t));
      }
      setShowModal(false);
      setShowEditModal(false);
      setNewName("");
      setNewSlug("");
      setSelectedModules(["kb"]);
      setEditingId("");
      setSaving(false);
    }, 600);
  };

  const handleEdit = (e: React.MouseEvent, t: Tenant) => {
    e.stopPropagation();
    setEditingId(t.id);
    setNewName(t.name);
    setNewSlug(t.slug);
    setSelectedModules(t.modules || ["kb"]);
    setShowEditModal(true);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if(!confirm("Tem certeza que deseja suspender este tenant logicamente?")) return;
    // Mock delete (soft delete)
    setTenants(tenants.map(t => t.id === id ? { ...t, status: 'deleted' } : t));
  };

  const handleImpersonate = (e: React.MouseEvent, t: Tenant) => {
    e.stopPropagation();
    // Salvar o slug do tenant no localStorage para ser lido pelo painel /admin
    localStorage.setItem("impersonated_tenant_slug", t.slug);
    localStorage.setItem("impersonated_tenant_name", t.name);
    // Para efeito de demonstração, vamos forçar o role para technician se estiver no Super Admin
    localStorage.setItem("mock_user_role", "technician");
    
    router.push("/admin");
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Tenants do Sistema</h1>
          <p className="text-gray-400 mt-2">Visão global e gerenciamento de empresas clientes na infraestrutura multi-tenant.</p>
        </div>
        <button onClick={() => { setEditingId(""); setNewName(""); setNewSlug(""); setSelectedModules(["kb"]); setShowModal(true); }} className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl shadow-[0_0_15px_rgba(147,51,234,0.3)] hover:bg-purple-500 hover:shadow-[0_0_20px_rgba(147,51,234,0.5)] transition-all font-semibold">
          <PlusIcon className="w-5 h-5" />
          Novo Tenant
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <div className="bg-[#111111] border border-gray-800 p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
               <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                  <BuildingOfficeIcon className="w-5 h-5 text-purple-400" />
               </div>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">Total de Tenants</h3>
            <p className="text-3xl font-bold text-white mt-1">{tenants.length}</p>
         </div>
      </div>

      <div className="bg-[#111111] rounded-2xl shadow-xl border border-gray-800 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-800">
          <thead className="bg-[#0A0A0A]">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Tenant / Empresa</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Slug</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status DB</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500 font-medium">Carregando instâncias...</td></tr>
            ) : tenants.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500 font-medium">Nenhum tenant cadastrado.</td></tr>
            ) : (
              tenants.map(t => (
                <tr key={t.id} onClick={() => router.push(`/super-admin/tenants/${t.id}`)} className={`hover:bg-white/[0.02] transition-colors group cursor-pointer ${t.status === 'deleted' ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-9 h-9 rounded-lg ${t.status === 'deleted' ? 'bg-red-900/20' : 'bg-gray-800'} flex items-center justify-center text-gray-300 font-bold mr-3 border border-gray-700`}>
                        {t.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-gray-200 group-hover:text-purple-300 transition-colors">{t.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-400 font-mono text-sm px-2 py-1 bg-gray-900 rounded-md border border-gray-800">{t.slug}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {t.status === 'deleted' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                        <PauseIcon className="w-3.5 h-3.5" />
                        Suspenso
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                        <ServerStackIcon className="w-3.5 h-3.5" />
                        Ativo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => handleImpersonate(e, t)} className="px-3 py-1.5 text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 rounded-lg transition-colors flex items-center gap-1.5" title="Entrar como Suporte">
                        <ArrowRightOnRectangleIcon className="w-4 h-4" />
                        Acessar Portal
                      </button>
                      <button onClick={(e) => handleEdit(e, t)} className="p-2 text-gray-400 hover:text-purple-400 hover:bg-purple-400/10 rounded-lg transition-colors">
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button onClick={(e) => handleDelete(e, t.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Suspender (Soft Delete)">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {(showModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#111111] border border-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-gray-800 flex justify-between items-center bg-[#0A0A0A]">
              <h2 className="text-lg font-bold text-white">{editingId ? "Editar Tenant" : "Provisionar Novo Tenant"}</h2>
              <button onClick={() => { setShowModal(false); setShowEditModal(false); }} className="text-gray-500 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm font-semibold">
                  {error}
                </div>
              )}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-1.5">Nome da Empresa</label>
                  <input type="text" required value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ex: Stark Industries" className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all placeholder-gray-600 font-medium" />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-1.5">Slug (Identificador URL)</label>
                  <input type="text" required value={newSlug} onChange={e => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder="ex: stark-industries" className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all placeholder-gray-600 font-mono text-sm" />
                  <p className="text-xs text-gray-500 mt-2">Usado no subdomínio e banco de dados isolado.</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-3">Módulos e Permissões do Tenant (Feature Flags)</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                    {availableModules.map(mod => (
                      <label key={mod.id} className="flex items-start gap-3 p-3 rounded-xl border border-gray-800 bg-[#0a0a0a] hover:bg-[#111111] transition-colors cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={selectedModules.includes(mod.id)}
                          onChange={(e) => {
                             if(e.target.checked) setSelectedModules([...selectedModules, mod.id]);
                             else setSelectedModules(selectedModules.filter(m => m !== mod.id));
                          }}
                          className="mt-1 w-4 h-4 text-purple-600 bg-gray-900 border-gray-700 rounded focus:ring-purple-500/50" 
                        />
                        <div>
                           <p className="text-sm font-semibold text-gray-200">{mod.label}</p>
                           <p className="text-xs text-gray-500 mt-0.5">{mod.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => { setShowModal(false); setShowEditModal(false); }} className="px-5 py-2.5 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">Cancelar</button>
                <button type="submit" disabled={saving} className="px-6 py-2.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.4)] transition-all disabled:opacity-50 flex items-center gap-2">
                  {saving ? "Salvando..." : (editingId ? "Salvar Alterações" : "Criar Tenant")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
