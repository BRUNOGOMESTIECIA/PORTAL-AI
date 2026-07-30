import React, { useState } from 'react';
import { X, FileText, CheckCircle2, ShieldCheck, Download, Printer, Laptop, Smartphone, Monitor, HardDrive, User, Building2 } from 'lucide-react';
import { toast } from 'sonner';

interface EquipmentDeliveryTermModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EquipmentDeliveryTermModal({ isOpen, onClose }: EquipmentDeliveryTermModalProps) {
  const [employeeName, setEmployeeName] = useState('');
  const [employeeCpf, setEmployeeCpf] = useState('');
  const [department, setDepartment] = useState('');
  const [equipmentType, setEquipmentType] = useState('Notebook');
  const [brandModel, setBrandModel] = useState('Dell Latitude 3420');
  const [serialNumber, setSerialNumber] = useState('SN-2026-88492');
  const [accessories, setAccessories] = useState('Fonte de Alimentação, Mouse Sem Fio, Mochila');
  const [signedByName, setSignedByName] = useState('');
  const [isCheckedConsent, setIsCheckedConsent] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeName || !employeeCpf || !isCheckedConsent) {
      toast.error('Preencha os dados do colaborador e confirme a assinatura digital.');
      return;
    }
    setIsGenerated(true);
    toast.success('Termo de Entrega e Responsabilidade emitido com sucesso!');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        
        {/* Header do Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-600/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Termo de Entrega de Equipamentos com Assinatura Digital
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gerador de Recibo de Responsabilidade de Ativos de TI (Item 099)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isGenerated ? (
          /* Form de Emissão do Termo */
          <form onSubmit={handleGenerate} className="p-6 space-y-6">
            
            {/* Seção 1: Dados do Colaborador */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider flex items-center gap-2">
                <User className="w-4 h-4" /> 1. Dados do Colaborador (Destinatário)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    placeholder="Ex: Carlos Eduardo Silva"
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">CPF / Documento</label>
                  <input
                    type="text"
                    required
                    value={employeeCpf}
                    onChange={(e) => setEmployeeCpf(e.target.value)}
                    placeholder="123.456.789-00"
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Departamento / Cargo</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Ex: Comercial / Gerente de Contas"
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Seção 2: Especificações do Equipamento */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider flex items-center gap-2">
                <Laptop className="w-4 h-4" /> 2. Detalhes do Equipamento e Ativo de TI
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tipo de Equipamento</label>
                  <select
                    value={equipmentType}
                    onChange={(e) => setEquipmentType(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium outline-none focus:border-blue-500"
                  >
                    <option value="Notebook">Notebook</option>
                    <option value="Desktop">Desktop / Estação de Trabalho</option>
                    <option value="Monitor">Monitor HD</option>
                    <option value="Smartphone">Smartphone Corporativo</option>
                    <option value="Impressora">Impressora / Suprimento</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Marca / Modelo</label>
                  <input
                    type="text"
                    value={brandModel}
                    onChange={(e) => setBrandModel(e.target.value)}
                    placeholder="Ex: Dell Latitude 3420"
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Número de Série / Tag</label>
                  <input
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="SN-2026-88492"
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Acessórios Inclusos</label>
                <input
                  type="text"
                  value={accessories}
                  onChange={(e) => setAccessories(e.target.value)}
                  placeholder="Ex: Carregador, Mochila, Mouse, Cabo HDMI"
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Seção 3: Assinatura Digital e Aceite */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> 3. Assinatura Digital e Declaração de Responsabilidade
              </h3>
              
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Declaro para os devidos fins que recebi o equipamento acima especificado em perfeito estado de conservação e funcionamento, comprometendo-me a guardá-lo e zelar pelo seu uso exclusivamente profissional.
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="consentCheck"
                    checked={isCheckedConsent}
                    onChange={(e) => setIsCheckedConsent(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="consentCheck" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                    Assino eletronicamente este termo de responsabilidade com registro de data, hora e IP.
                  </label>
                </div>
              </div>
            </div>

            {/* Botões do Form */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!isCheckedConsent}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                Gerar Termo Assinado Digitalmente
              </button>
            </div>
          </form>
        ) : (
          /* Laudo / Documento Gerado em PDF Impresso */
          <div className="p-8 space-y-6">
            <div className="text-center border-b border-slate-200 dark:border-slate-800 pb-6">
              <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                TIECIA <span className="text-blue-600">ITSM & ATIVOS</span>
              </div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 mt-2">
                TERMO DE RESPONSABILIDADE E ENTREGA DE EQUIPAMENTO
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-mono">Protocolo de Recibo #EQUIP-2026-8842</p>
            </div>

            <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <p>
                Pelo presente termo, a empresa <strong>TIECIA ITSM Ltda</strong> faz a entrega a(o) colaborador(a) <strong>{employeeName}</strong>, inscrito(a) no CPF <strong>{employeeCpf}</strong>, lotado(a) no setor <strong>{department || 'Operacional'}</strong>, do equipamento de TI abaixo especificado:
              </p>

              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono space-y-1.5">
                <p><strong>• Tipo:</strong> {equipmentType}</p>
                <p><strong>• Modelo:</strong> {brandModel}</p>
                <p><strong>• Nº de Série / Tag:</strong> {serialNumber}</p>
                <p><strong>• Acessórios:</strong> {accessories}</p>
              </div>

              <p>
                O colaborador assume total responsabilidade pelo uso adequado e guarda do bem patrimonial, comprometendo-se a devolvê-lo nas mesmas condições quando solicitado ou ao término do contrato de trabalho.
              </p>
            </div>

            {/* Carimbo de Assinatura Digital */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-blue-900 dark:text-blue-200">
                    ASSINADO ELETRONICAMENTE POR {employeeName.toUpperCase()}
                  </p>
                  <p className="text-[11px] text-blue-700 dark:text-blue-400 mt-0.5 font-mono">
                    Data: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')} · IP: 177.136.24.91
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-black bg-blue-600 text-white px-2.5 py-1 rounded-md">
                AUTÊNTICO
              </span>
            </div>

            {/* Ações */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800 no-print">
              <button
                onClick={() => setIsGenerated(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                ← Editar Dados
              </button>

              <div className="flex gap-3">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Printer className="w-4 h-4" /> Imprimir Termo
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20"
                >
                  <Download className="w-4 h-4" /> Baixar PDF Assinado
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
