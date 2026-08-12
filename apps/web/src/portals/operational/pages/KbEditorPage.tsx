import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, Save, Image as ImageIcon, Link as LinkIcon, 
  Bold, Italic, Underline, List, ListOrdered, AlignLeft, 
  AlignCenter, AlignRight, Type, Eye, CheckCircle 
} from 'lucide-react';
import { MOCK_KB_ARTICLES, MOCK_STAFF } from '../../../mocks/data';
import { sanitizeHtml } from '../../../lib/sanitize';
import { cn } from '../../../lib/utils';
import { useEscapeModal } from '../../../hooks/use-escape-modal';

import { apiClient } from '../../../lib/api-client';

export default function KbEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isNew = id === 'new';
  const existingArticle = MOCK_KB_ARTICLES.find(a => a.id === id);
  
  const [title, setTitle] = useState(existingArticle?.title || location.state?.title || '');
  const [category, setCategory] = useState(existingArticle?.category || 'Geral');
  const [status, setStatus] = useState<'draft' | 'pending_review' | 'published'>(existingArticle?.status || 'draft');
  const [content, setContent] = useState(existingArticle?.content || location.state?.content || '');

  // Simula um loading inicial se estivesse buscando da API
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEscapeModal(previewOpen, () => setPreviewOpen(false));

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (isNew) {
        await apiClient.post('/kb', { title, content, categoryId: category });
      } else if (id) {
        await apiClient.patch(`/kb/${id}`, { title, content, categoryId: category });
      }
    } catch {
      console.info('[KbEditorPage] API offline, salvando rascunho localmente.');
    } finally {
      setIsSaving(false);
      navigate('/operacional/app/kb');
    }
  };


  const handleCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  if (isLoading) return null;

  return (
    <div className="h-full flex flex-col -m-6" style={{ height: 'calc(100vh - 64px)' }}>
      {/* ─── HEADER ─── */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 shrink-0 flex items-center justify-between z-10 shadow-sm">
        <div className="flex items-center gap-4 flex-1">
          <button 
            onClick={() => navigate('/operacional/app/kb')}
            className="p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Título do Artigo..."
            className="text-xl font-bold bg-transparent outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 flex-1 px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all"
          />
          
          {status === 'published' && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold shrink-0">
              <CheckCircle className="w-3.5 h-3.5" />
              Publicado
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 pl-6 border-l border-slate-200 dark:border-slate-700 ml-6">
          <button 
            onClick={() => setPreviewOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
            Visualizar
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving || !title.trim()}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </header>

      {/* ─── BODY ─── */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Editor Area */}
        <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 flex flex-col overflow-hidden relative">
          
          {/* Rich Text Toolbar */}
          <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center gap-1 shrink-0 overflow-x-auto">
            <select className="text-sm border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1.5 bg-transparent text-slate-700 dark:text-slate-300 outline-none hover:bg-slate-50 dark:hover:bg-slate-800 mr-2 cursor-pointer">
              <option>Normal</option>
              <option>Título 1</option>
              <option>Título 2</option>
              <option>Título 3</option>
            </select>
            
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2" />
            
            <button onClick={() => handleCommand('bold')} className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"><Bold className="w-4 h-4" /></button>
            <button onClick={() => handleCommand('italic')} className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"><Italic className="w-4 h-4" /></button>
            <button onClick={() => handleCommand('underline')} className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"><Underline className="w-4 h-4" /></button>
            
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2" />
            
            <button onClick={() => handleCommand('insertUnorderedList')} className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"><List className="w-4 h-4" /></button>
            <button onClick={() => handleCommand('insertOrderedList')} className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"><ListOrdered className="w-4 h-4" /></button>
            
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2" />
            
            <button onClick={() => handleCommand('justifyLeft')} className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"><AlignLeft className="w-4 h-4" /></button>
            <button onClick={() => handleCommand('justifyCenter')} className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"><AlignCenter className="w-4 h-4" /></button>
            <button onClick={() => handleCommand('justifyRight')} className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"><AlignRight className="w-4 h-4" /></button>
            
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2" />
            
            <button onClick={() => {
              const url = window.prompt('URL do link:');
              if (url) handleCommand('createLink', url);
            }} className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"><LinkIcon className="w-4 h-4" /></button>
            <button onClick={() => {
              const url = window.prompt('URL da imagem:');
              if (url) handleCommand('insertImage', url);
            }} className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"><ImageIcon className="w-4 h-4" /></button>
            
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2" />
            
            <div className="flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded-md cursor-pointer relative group">
              <Type className="w-4 h-4 text-slate-500" />
              <input type="color" onChange={(e) => handleCommand('foreColor', e.target.value)} className="w-6 h-6 p-0 border-0 bg-transparent cursor-pointer rounded overflow-hidden" title="Cor do Texto" />
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-8 flex justify-center">
            <div 
              className="bg-white dark:bg-slate-900 w-full max-w-4xl min-h-full rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-10 outline-none text-slate-800 dark:text-slate-200 leading-relaxed"
              contentEditable
              onInput={e => setContent(e.currentTarget.innerHTML)}
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
              style={{ minHeight: '800px' }}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shrink-0 overflow-y-auto">
          <div className="p-6 space-y-8">
            
            {/* Status */}
            <section>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Status da Publicação</h3>
              <div className="space-y-2">
                <label className={cn("flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors", status === 'published' ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10" : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800")}>
                  <input type="radio" name="status" value="published" checked={status === 'published'} onChange={() => setStatus('published')} className="text-emerald-600 focus:ring-emerald-500" />
                  <div>
                    <p className={cn("text-sm font-semibold", status === 'published' ? "text-emerald-700 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300")}>Publicado</p>
                    <p className="text-xs text-slate-500 mt-0.5">Visível para clientes e equipe.</p>
                  </div>
                </label>
                <label className={cn("flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors", status === 'pending_review' ? "border-amber-500 bg-amber-50 dark:bg-amber-900/10" : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800")}>
                  <input type="radio" name="status" value="pending_review" checked={status === 'pending_review'} onChange={() => setStatus('pending_review')} className="text-amber-600 focus:ring-amber-500" />
                  <div>
                    <p className={cn("text-sm font-semibold", status === 'pending_review' ? "text-amber-700 dark:text-amber-400" : "text-slate-700 dark:text-slate-300")}>Em Revisão</p>
                    <p className="text-xs text-slate-500 mt-0.5">Aguardando aprovação do editor.</p>
                  </div>
                </label>
                <label className={cn("flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors", status === 'draft' ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10" : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800")}>
                  <input type="radio" name="status" value="draft" checked={status === 'draft'} onChange={() => setStatus('draft')} className="text-blue-600 focus:ring-blue-500" />
                  <div>
                    <p className={cn("text-sm font-semibold", status === 'draft' ? "text-blue-700 dark:text-blue-400" : "text-slate-700 dark:text-slate-300")}>Rascunho</p>
                    <p className="text-xs text-slate-500 mt-0.5">Apenas você pode visualizar.</p>
                  </div>
                </label>
              </div>
            </section>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Categoria */}
            <section>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Categoria</h3>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition cursor-pointer"
              >
                <option value="Geral">Geral</option>
                <option value="Sistemas">Sistemas Internos</option>
                <option value="Hardware">Hardware e Equipamentos</option>
                <option value="Acessos">Acessos e Permissões</option>
                <option value="Redes">Redes e Conectividade</option>
              </select>
            </section>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Metadados (read only for mock) */}
            <section>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Detalhes</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Autor</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{existingArticle?.author || 'Você'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Visualizações</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{existingArticle?.views || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Avaliações Úteis</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{existingArticle?.helpfulVotes || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Última edição</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">Agora mesmo</span>
                </div>
              </div>
            </section>

          </div>
        </div>

      </div>

      {/* ─── MODAL DE VISUALIZAÇÃO ─── */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4 py-8">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl h-full shadow-2xl flex flex-col border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Pré-visualização do Cliente</h3>
              <button 
                onClick={() => setPreviewOpen(false)}
                className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Fechar
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 bg-white dark:bg-slate-950">
              <div className="max-w-3xl mx-auto">
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-3 block">{category}</span>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-8">{title || 'Sem título'}</h1>
                <div 
                  className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) || '<p class="text-slate-400 italic">O artigo está vazio.</p>' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
