"use client";

import { useState } from "react";
import { CreditCardIcon, ChartBarIcon, ArrowTrendingUpIcon, ShieldCheckIcon, DocumentTextIcon, ArrowDownTrayIcon, PencilIcon, XMarkIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function BillingPage() {
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState("");
  
  const handleDownloadInvoice = () => {
    toast.success("Fatura PDF gerada e baixada com sucesso!");
  };

  const handleOpenPlanModal = (tenant: string) => {
    setSelectedTenant(tenant);
    setIsPlanModalOpen(true);
  };

  const handleChangePlan = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPlanModalOpen(false);
    toast.success(`Plano do tenant ${selectedTenant} atualizado!`);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Faturamento & Planos</h1>
          <p className="text-gray-400 mt-2">Visão geral do MRR (Receita Mensal Recorrente) e status financeiro das empresas.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#111111] border border-gray-800 p-6 rounded-2xl shadow-lg relative overflow-hidden group hover:border-purple-500/50 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-bl-full pointer-events-none" />
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
              <CurrencyIcon className="w-6 h-6 text-purple-400" />
            </div>
            <span className="flex items-center gap-1 text-green-400 text-sm font-bold bg-green-400/10 px-2 py-1 rounded-md">
              <ArrowTrendingUpIcon className="w-4 h-4" />
              +12%
            </span>
          </div>
          <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">MRR (Receita Recorrente)</h3>
          <p className="text-4xl font-black text-white mt-2">R$ 45.230<span className="text-xl text-gray-500 font-medium">,00</span></p>
        </div>

        <div className="bg-[#111111] border border-gray-800 p-6 rounded-2xl shadow-lg relative overflow-hidden group hover:border-blue-500/50 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <CreditCardIcon className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Assinaturas Ativas</h3>
          <p className="text-4xl font-black text-white mt-2">142</p>
        </div>

        <div className="bg-[#111111] border border-gray-800 p-6 rounded-2xl shadow-lg relative overflow-hidden group hover:border-red-500/50 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
              <DocumentTextIcon className="w-6 h-6 text-red-400" />
            </div>
          </div>
          <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Inadimplência</h3>
          <p className="text-4xl font-black text-white mt-2">3 <span className="text-xl text-gray-500 font-medium">empresas</span></p>
        </div>
      </div>

      {/* Tabela de Planos Mockada */}
      <div className="bg-[#111111] rounded-2xl shadow-xl border border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#0A0A0A]">
          <h2 className="text-lg font-bold text-white">Tenants vs. Planos</h2>
          <button className="text-sm font-semibold text-purple-400 hover:text-purple-300">Ver Relatório Completo &rarr;</button>
        </div>
        <table className="min-w-full divide-y divide-gray-800">
          <thead className="bg-[#0A0A0A]">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Tenant</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Plano Atual</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Valor Mensal</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status Pgto</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            <tr className="hover:bg-white/[0.02] transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="font-semibold text-gray-200">Acme Corporation</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Enterprise
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-300 font-medium">R$ 1.990,00</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-green-400 text-xs font-bold bg-green-400/10 px-2 py-1 rounded-md border border-green-500/20">Pago</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => handleOpenPlanModal("Acme Corporation")} className="p-2 text-gray-400 hover:text-purple-400 hover:bg-purple-400/10 rounded-lg transition-colors" title="Mudar Plano">
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button onClick={handleDownloadInvoice} className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors" title="Baixar Fatura">
                    <ArrowDownTrayIcon className="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
            <tr className="hover:bg-white/[0.02] transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="font-semibold text-gray-200">Stark Industries</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Pro
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-300 font-medium">R$ 890,00</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-red-400 text-xs font-bold bg-red-400/10 px-2 py-1 rounded-md border border-red-500/20">Atrasado (5 dias)</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => handleOpenPlanModal("Stark Industries")} className="p-2 text-gray-400 hover:text-purple-400 hover:bg-purple-400/10 rounded-lg transition-colors" title="Mudar Plano">
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button onClick={handleDownloadInvoice} className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors" title="Baixar Fatura">
                    <ArrowDownTrayIcon className="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
            <tr className="hover:bg-white/[0.02] transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="font-semibold text-gray-200">Wayne Enterprises</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-gray-500/10 text-gray-400 border border-gray-500/20">
                  Basic
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-300 font-medium">R$ 290,00</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-green-400 text-xs font-bold bg-green-400/10 px-2 py-1 rounded-md border border-green-500/20">Pago</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => handleOpenPlanModal("Wayne Enterprises")} className="p-2 text-gray-400 hover:text-purple-400 hover:bg-purple-400/10 rounded-lg transition-colors" title="Mudar Plano">
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button onClick={handleDownloadInvoice} className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors" title="Baixar Fatura">
                    <ArrowDownTrayIcon className="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Plan Change Modal */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#111111] border border-gray-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-gray-800 flex justify-between items-center bg-[#0A0A0A]">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">Mudar Plano</h2>
                <p className="text-xs text-gray-500 mt-1">{selectedTenant}</p>
              </div>
              <button onClick={() => setIsPlanModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleChangePlan} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-1.5">Novo Plano</label>
                <select className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all font-medium">
                  <option value="basic">Basic (R$ 290/mês)</option>
                  <option value="pro">Pro (R$ 890/mês)</option>
                  <option value="enterprise">Enterprise (R$ 1.990/mês)</option>
                </select>
              </div>

              <div>
                 <label className="flex items-start gap-3 p-3 rounded-xl border border-gray-800 bg-[#0A0A0A] cursor-pointer">
                    <input type="checkbox" className="mt-1 flex-shrink-0 w-4 h-4 text-purple-600 bg-gray-900 border-gray-700 rounded" />
                    <div>
                      <p className="text-sm font-semibold text-gray-300">Cobrar Pro-rata Imediata</p>
                      <p className="text-xs text-gray-500 mt-0.5">Gera uma fatura com a diferença dos dias usados neste mês.</p>
                    </div>
                 </label>
              </div>
              
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsPlanModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">Cancelar</button>
                <button type="submit" className="px-6 py-2.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.4)] transition-all">
                  Confirmar Mudança
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function CurrencyIcon(props: any) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
