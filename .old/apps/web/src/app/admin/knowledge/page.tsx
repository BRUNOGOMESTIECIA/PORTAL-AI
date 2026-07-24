"use client";

import { useState } from "react";
import { DocumentTextIcon, ArrowUpTrayIcon, TrashIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

export default function KnowledgeBasePage() {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [files, setFiles] = useState([
    { id: 1, name: "Manual_do_Usuario_v2.pdf", size: "2.4 MB", status: "sincronizado", date: "22/05/2026" },
    { id: 2, name: "Politica_de_Reembolso.pdf", size: "840 KB", status: "sincronizado", date: "21/05/2026" },
    { id: 3, name: "Tabela_de_Precos_2026.pdf", size: "1.2 MB", status: "processando", date: "Há 5 minutos" },
  ]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Base de Conhecimento (IA)</h1>
          <p className="text-gray-400 mt-2">Faça upload de PDFs para treinar o assistente virtual da sua empresa.</p>
        </div>
        <button 
          onClick={() => setIsUploading(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] transition-all font-semibold"
        >
          <ArrowUpTrayIcon className="w-5 h-5" />
          Fazer Upload de PDF
        </button>
      </div>

      <div className="bg-[#111111] rounded-2xl shadow-xl border border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-800 bg-[#0A0A0A] flex justify-between items-center">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <DocumentTextIcon className="w-5 h-5 text-blue-400" />
            Documentos Treinados ({files.length})
          </h2>
        </div>
        
        <table className="min-w-full divide-y divide-gray-800">
          <thead className="bg-[#0A0A0A]">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Nome do Arquivo</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Tamanho</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Data de Envio</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status IA</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {files.map(file => (
              <tr key={file.id} onClick={() => setSelectedFile(file)} className="hover:bg-white/[0.04] cursor-pointer transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg group-hover:bg-red-500/20 transition-colors">
                      <DocumentTextIcon className="w-5 h-5 text-red-400" />
                    </div>
                    <span className="font-semibold text-gray-200 group-hover:text-blue-400 transition-colors">{file.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-400 text-sm">{file.size}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-400 text-sm">{file.date}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {file.status === 'sincronizado' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                      Sincronizado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                      <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                      Processando Vetores
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button onClick={(e) => { e.stopPropagation(); /* lógica de excluir */ }} className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isUploading && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#111111] border border-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8 text-center animate-in zoom-in-95 duration-200">
             <div className="w-16 h-16 mx-auto bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center mb-4">
                <ArrowUpTrayIcon className="w-8 h-8 text-blue-400" />
             </div>
             <h2 className="text-xl font-bold text-white mb-2">Upload de PDF</h2>
             <p className="text-gray-400 text-sm mb-8">Arraste e solte o seu arquivo PDF aqui, ou clique para procurar no seu computador.</p>
             
             <div className="border-2 border-dashed border-gray-700 hover:border-blue-500 transition-colors rounded-xl p-10 cursor-pointer mb-6 bg-gray-900/50">
               <span className="text-blue-400 font-semibold">Selecionar Arquivo (.pdf)</span>
             </div>

             <div className="flex justify-end gap-3">
                <button onClick={() => setIsUploading(false)} className="px-5 py-2.5 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">Cancelar</button>
             </div>
          </div>
        </div>
      )}

      {selectedFile && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#111111] border border-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col h-[80vh]">
             <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center bg-[#0A0A0A]">
               <h2 className="text-lg font-bold text-white flex items-center gap-2">
                 <DocumentTextIcon className="w-5 h-5 text-blue-400" />
                 {selectedFile.name}
               </h2>
               <button onClick={() => setSelectedFile(null)} className="text-gray-500 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
               </button>
             </div>
             
             <div className="flex-1 p-6 overflow-y-auto bg-gray-900/30">
                <div className="flex gap-6 mb-6">
                   <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl p-4">
                     <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Status da IA</p>
                     <p className="text-green-400 font-semibold">{selectedFile.status}</p>
                   </div>
                   <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl p-4">
                     <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Tamanho</p>
                     <p className="text-gray-300 font-semibold">{selectedFile.size}</p>
                   </div>
                   <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl p-4">
                     <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Enviado em</p>
                     <p className="text-gray-300 font-semibold">{selectedFile.date}</p>
                   </div>
                </div>

                <h3 className="text-sm font-bold text-gray-400 mb-3">Conteúdo Extraído (Preview)</h3>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 h-64 overflow-y-auto custom-scrollbar">
                   <p className="text-sm text-gray-300 leading-relaxed font-serif">
                     [Preview do PDF]<br/><br/>
                     1. Introdução<br/>
                     Este documento estabelece as diretrizes de operação e as regras de negócio para devoluções de mercadoria. 
                     O prazo máximo para solicitação de reembolso é de 7 dias úteis após o recebimento, mediante apresentação da nota fiscal.<br/><br/>
                     2. Condições<br/>
                     O produto deve estar na embalagem original, sem sinais de uso ou violação do lacre. 
                     Exceções são aplicadas apenas em casos de defeito de fabricação comprovado por nossa assistência técnica...
                   </p>
                </div>
             </div>
             
             <div className="px-6 py-4 border-t border-gray-800 flex justify-end gap-3 bg-[#0A0A0A]">
                <button className="px-5 py-2.5 rounded-xl font-bold text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2 border border-transparent hover:border-red-500/20">
                  <TrashIcon className="w-5 h-5" /> Excluir Arquivo
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
