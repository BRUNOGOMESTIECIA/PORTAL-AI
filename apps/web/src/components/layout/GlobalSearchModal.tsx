import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Ticket, BookOpen, Wrench, Building2, User, ChevronRight, X, Command } from 'lucide-react';
import { useTickets } from '../../hooks/use-tickets';
import { useAuth } from '../../hooks/use-mock-auth';
import { formatTicketProtocol } from '../../lib/audit-logger';
import { MOCK_CATALOG_ITEMS } from '../../mocks/data';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const navigate = useNavigate();
  const { tickets } = useTickets();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Reseta ao abrir
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Tecla ESC para fechar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filtragem segura de resultados
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];

    const q = query.toLowerCase().trim();
    const results: Array<{
      id: string;
      title: string;
      subtitle: string;
      category: 'ticket' | 'kb' | 'tool' | 'client';
      path: string;
      badge?: string;
    }> = [];

    const isStaff = user?.type === 'staff';

    // 1. Busca por Tickets
    tickets.forEach((t) => {
      // Se for cliente, restringe aos seus próprios tickets
      if (!isStaff && t.requesterEmail !== user?.email) {
        return;
      }

      const protocolStr = formatTicketProtocol(t.number || t.id).toLowerCase();
      const titleStr = (t.title || '').toLowerCase();
      const reqStr = (t.requesterName || '').toLowerCase();

      if (protocolStr.includes(q) || titleStr.includes(q) || reqStr.includes(q)) {
        results.push({
          id: `tkt-${t.id}`,
          title: t.title,
          subtitle: `${formatTicketProtocol(t.number || t.id)} · Solicitante: ${t.requesterName}`,
          category: 'ticket',
          path: isStaff ? `/operacional/app/tickets/${t.id}` : `/cliente/tickets/${t.id}`,
          badge: t.status.toUpperCase(),
        });
      }
    });

    // 2. Busca pelo Catálogo / KB
    MOCK_CATALOG_ITEMS.forEach((kb: any) => {
      if (kb.title.toLowerCase().includes(q) || (kb.category || '').toLowerCase().includes(q)) {
        results.push({
          id: `kb-${kb.id}`,
          title: kb.title,
          subtitle: `Catálogo de Serviços · Categoria: ${kb.category}`,
          category: 'kb',
          path: isStaff ? `/operacional/app/catalog` : `/cliente/catalog`,
        });
      }
    });

    // 3. Ferramentas (Somente equipe operacional)
    if (isStaff) {
      const tools = [
        { name: 'InstaPasso SSO & Auditoria', path: '/operacional/app/tools', desc: 'Central de Identidade e Logs ISO 27001' },
        { name: 'Monitoramento de Impressoras', path: '/operacional/app/tools', desc: 'Contadores e Níveis de Toner' },
        { name: 'Relatórios Executivos', path: '/operacional/app/reports', desc: 'Exportações PDF e Excel' },
      ];

      tools.forEach((tl, idx) => {
        if (tl.name.toLowerCase().includes(q) || tl.desc.toLowerCase().includes(q)) {
          results.push({
            id: `tool-${idx}`,
            title: tl.name,
            subtitle: tl.desc,
            category: 'tool',
            path: tl.path,
          });
        }
      });
    }

    return results.slice(0, 8); // Limita a 8 resultados
  }, [query, tickets, user]);

  const handleSelectResult = (path: string) => {
    onClose();
    navigate(path);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-20 bg-slate-950/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col space-y-0">
        
        {/* Barra de Entrada de Pesquisa */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <Search className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar tickets (#2026XXXX), solicitante, base de conhecimento ou ferramentas (Ctrl+K)..."
            className="w-full bg-transparent text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-mono text-slate-500 dark:text-slate-400 ml-2">
            ESC
          </kbd>
        </div>

        {/* Resultados da Pesquisa */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
          {!query.trim() ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 space-y-2">
              <div className="flex justify-center">
                <Command className="w-8 h-8 opacity-40 text-blue-500" />
              </div>
              <p className="text-xs font-medium">Digite um protocolo <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-blue-600 dark:text-blue-400">#20261048</code> ou palavra-chave para buscar instantaneamente.</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400">
              <p className="text-sm font-semibold">Nenhum resultado encontrado para "{query}"</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Verifique o protocolo ou tente outro termo.</p>
            </div>
          ) : (
            searchResults.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectResult(item.path)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex-shrink-0">
                      {item.category === 'ticket' && <Ticket className="w-4 h-4" />}
                      {item.category === 'kb' && <BookOpen className="w-4 h-4" />}
                      {item.category === 'tool' && <Wrench className="w-4 h-4" />}
                      {item.category === 'client' && <Building2 className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate">{item.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{item.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {item.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Rodapé Informativo */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
          <span>Pressione <strong>ESC</strong> para fechar</span>
          <span className="font-mono">Busca Instantânea ITSM</span>
        </div>
      </div>
    </div>
  );
}
