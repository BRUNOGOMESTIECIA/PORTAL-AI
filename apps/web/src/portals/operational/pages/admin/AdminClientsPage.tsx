import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Building2, MoreVertical, Shield } from 'lucide-react';
import { MOCK_COMPANIES } from '../../../../mocks/data';
import { cn } from '../../../../lib/utils';

export default function AdminClientsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCompanies = MOCK_COMPANIES.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Empresas e Clientes</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Gerencie os clientes, configurações de SLA e contratos</p>
        </div>
        <button 
          onClick={() => navigate('/operacional/app/admin/clients/new')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Nova Empresa
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col flex-1 min-h-0 shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar empresa por nome ou slug..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCompanies.map(company => (
              <div 
                key={company.id}
                onClick={() => navigate(`/operacional/app/admin/clients/${company.id}`)}
                className="group p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer relative"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    company.isActive 
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  )}>
                    {company.isActive ? 'Ativo' : 'Inativo'}
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1 truncate group-hover:text-blue-600 transition-colors">{company.name}</h3>
                <p className="text-xs text-slate-500 mb-4 font-mono">@{company.slug}</p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                    <Shield className="w-3.5 h-3.5" />
                    <span className="capitalize">{company.contractType}</span>
                  </div>
                  <span className="text-blue-600 dark:text-blue-400 text-xs font-semibold group-hover:underline">
                    Gerenciar Cliente &rarr;
                  </span>
                </div>
              </div>
            ))}

            {filteredCompanies.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500">
                Nenhuma empresa encontrada com "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
