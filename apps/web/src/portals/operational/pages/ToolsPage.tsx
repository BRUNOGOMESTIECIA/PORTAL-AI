import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Fingerprint, Monitor, LayoutGrid, Cloud, Gamepad2, Tv, HardDrive, Cpu, 
  ExternalLink, Printer, Package, Smartphone, Server, Send, ShieldCheck, 
  ArrowLeft, Lock, Maximize2, FileText, Building2
} from 'lucide-react';
import { useAuth } from '../../../hooks/use-mock-auth';
import { toast } from 'sonner';
import { EquipmentDeliveryTermModal } from '../components/EquipmentDeliveryTermModal';
import { B2bCompanyPerformanceModal } from '../components/B2bCompanyPerformanceModal';
import { EncryptionComplianceWidget } from '../components/EncryptionComplianceWidget';
import { PeriodicAuditReportModal } from '../components/PeriodicAuditReportModal';
import { SessionTimeoutSettingsWidget } from '../components/SessionTimeoutSettingsWidget';
import { LgpdUserAnonymizationWidget } from '../components/LgpdUserAnonymizationWidget';
import { FrameAncestorsPolicyWidget } from '../components/FrameAncestorsPolicyWidget';
import { SessionCookiePolicyWidget } from '../components/SessionCookiePolicyWidget';
import { HttpSecurityHeadersWidget } from '../components/HttpSecurityHeadersWidget';
import { AntiBruteForcePanelWidget } from '../components/AntiBruteForcePanelWidget';
import { SecurityAuditLogsWidget } from '../components/SecurityAuditLogsWidget';
import { LogTtlPolicyWidget } from '../components/LogTtlPolicyWidget';
import { MfaPolicyEnforcementWidget } from '../components/MfaPolicyEnforcementWidget';
import { FileUploadSanitizerWidget } from '../components/FileUploadSanitizerWidget';
import { WafCorporateFilterWidget } from '../components/WafCorporateFilterWidget';

/**
 * Definição estática de todas as ferramentas disponíveis no painel.
 */
const TOOLS = [
  {
    id: 'instapasso',
    name: 'InstaPasso',
    description: 'Gestão de acessos, autenticação SSO, governança e auditoria de segurança ISO 27001.',
    icon: ShieldCheck,
    color: 'text-emerald-500',
    bg: 'bg-emerald-100 dark:bg-emerald-500/10',
    border: 'hover:border-emerald-400 border-emerald-300 dark:border-emerald-700/50 shadow-emerald-500/5',
    badge: 'SSO & Auditoria',
    isInstaPasso: true,
  },
  {
    id: 'biometria',
    name: 'Acesso Biométrico',
    description: 'Gerenciar registros e liberações biométricas de colaboradores.',
    icon: Fingerprint,
    color: 'text-indigo-500',
    bg: 'bg-indigo-100 dark:bg-indigo-500/10',
    border: 'hover:border-indigo-400',
    badge: null,
  },

  {
    id: 'workspace',
    name: 'Workspace',
    description: 'Gerenciamento de usuários e dispositivos do Google Workspace.',
    icon: LayoutGrid,
    color: 'text-emerald-500',
    bg: 'bg-emerald-100 dark:bg-emerald-500/10',
    border: 'hover:border-emerald-400',
    badge: null,
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    description: 'Gestão de licenças e dispositivos do ecossistema Microsoft.',
    icon: Cloud,
    color: 'text-blue-600',
    bg: 'bg-blue-100 dark:bg-blue-600/10',
    border: 'hover:border-blue-500',
    badge: null,
  },
  {
    id: 'takecontrol',
    name: 'Take Control',
    description: 'Acesso remoto seguro para suporte técnico.',
    icon: Gamepad2,
    color: 'text-amber-500',
    bg: 'bg-amber-100 dark:bg-amber-500/10',
    border: 'hover:border-amber-400',
    badge: 'Remoto',
  },
  {
    id: 'teamviewer',
    name: 'Team Viewer',
    description: 'Conexão remota e suporte a usuários corporativos.',
    icon: Tv,
    color: 'text-sky-500',
    bg: 'bg-sky-100 dark:bg-sky-500/10',
    border: 'hover:border-sky-400',
    badge: 'Remoto',
  },
  {
    id: 'gdrive',
    name: 'Google Drive',
    description: 'Armazenamento e compartilhamento de arquivos corporativos.',
    icon: HardDrive,
    color: 'text-green-500',
    bg: 'bg-green-100 dark:bg-green-500/10',
    border: 'hover:border-green-400',
    badge: null,
  },
  {
    id: 'monitoramento',
    name: 'Monitoramento de Equipamentos',
    description: 'Visualização em tempo real do estado dos ativos de TI.',
    icon: Cpu,
    color: 'text-purple-500',
    bg: 'bg-purple-100 dark:bg-purple-500/10',
    border: 'hover:border-purple-400',
    badge: 'Live',
    route: '/operacional/app/tools/equipment',
  },
  {
    id: 'impressoras',
    name: 'Monitoramento de Impressoras',
    description: 'Status de tinta, papel e fila de impressão em tempo real.',
    icon: Printer,
    color: 'text-teal-500',
    bg: 'bg-teal-100 dark:bg-teal-500/10',
    border: 'hover:border-teal-400',
    badge: 'Live',
    route: '/operacional/app/tools/printers',
  },
  {
    id: 'ativos',
    name: 'Gestão de Ativos',
    description: 'Controle de inventário, licenças e ciclo de vida de hardwares e softwares.',
    icon: Package,
    color: 'text-orange-500',
    bg: 'bg-orange-100 dark:bg-orange-500/10',
    border: 'hover:border-orange-400',
    badge: 'Externo',
    url: 'https://ativos.rl.tec.br/login',
  },
  {
    id: 'mdm',
    name: 'MDM',
    description: 'Gestão e controle de dispositivos móveis corporativos.',
    icon: Smartphone,
    color: 'text-pink-500',
    bg: 'bg-pink-100 dark:bg-pink-500/10',
    border: 'hover:border-pink-400',
    badge: null,
  },
  {
    id: 'rmm',
    name: 'RMM',
    description: 'Monitoramento remoto avançado e automação de TI.',
    icon: Server,
    color: 'text-cyan-500',
    bg: 'bg-cyan-100 dark:bg-cyan-500/10',
    border: 'hover:border-cyan-400',
    badge: 'Remoto',
  },
  {
    id: 'printaway',
    name: 'Print Away',
    description: 'Gerenciamento de fila de impressão em nuvem e liberação segura.',
    icon: Send,
    color: 'text-rose-500',
    bg: 'bg-rose-100 dark:bg-rose-500/10',
    border: 'hover:border-rose-400',
    badge: null,
  },
  {
    id: 'termo_entrega',
    name: 'Termo de Entrega de Equipamentos',
    description: 'Gerador de recibos de responsabilidade com assinatura digital (Item 099).',
    icon: FileText,
    color: 'text-blue-500',
    bg: 'bg-blue-100 dark:bg-blue-500/10',
    border: 'hover:border-blue-400 border-blue-300 dark:border-blue-700/50 shadow-blue-500/5',
    badge: 'Assinatura Digital',
    isTermModal: true,
  },
  {
    id: 'b2b_report',
    name: 'Extrato de Desempenho B2B (QBR)',
    description: 'Laudo executivo de cumprimento de SLA, CSAT e volumetria por empresa cliente (Item 130).',
    icon: Building2,
    color: 'text-indigo-500',
    bg: 'bg-indigo-100 dark:bg-indigo-500/10',
    border: 'hover:border-indigo-400 border-indigo-300 dark:border-indigo-700/50 shadow-indigo-500/5',
    badge: 'Laudo Corporativo',
    isB2bModal: true,
  },
];

/**
 * Página Principal: Ferramentas de TI.
 * Exibe um grid (grade) de atalhos e utilitários para acesso rápido.
 * Alguns atalhos abrem modais, links externos ou navegam para outras rotas.
 */
export default function ToolsPage() {
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  const [activeEmbeddedTool, setActiveEmbeddedTool] = useState<string | null>(null);
  const [showTermModal, setShowTermModal] = useState(false);
  const [showB2bModal, setShowB2bModal] = useState(false);
  const [showAuditReportModal, setShowAuditReportModal] = useState(false);
  const [instaPassoTab, setInstaPassoTab] = useState<'acessos' | 'equipe' | 'logs' | 'security'>('acessos');

  // Regra de Acesso do InstaPasso: Administradores, Supervisores e equipe com permissões admin/tickets
  const canAccessInstaPasso = () => {
    if (!user) return false;
    const roleUpper = (user.role || '').toUpperCase();
    if (roleUpper.includes('ADMIN') || roleUpper.includes('SUPER') || roleUpper.includes('TECNICO') || roleUpper.includes('TECHNICIAN')) {
      return true;
    }
    return hasPermission('admin.settings') || hasPermission('admin.users') || hasPermission('tickets.view');
  };

  // ── Renderização Embutida do InstaPasso ─────────────────────────────────────
  if (activeEmbeddedTool === 'instapasso') {
    return (
      <div className="space-y-4 animate-in fade-in duration-200">
        {/* Barra de Topo do Sistema InstaPasso (Idêntico ao Layout do Portal InstaPasso) */}
        <div className="bg-[#090d16] text-white rounded-2xl p-4 shadow-xl border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Logo & Voltar */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveEmbeddedTool(null)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para Ferramentas
              </button>
              <div className="h-5 w-px bg-slate-700 hidden sm:block" />
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-black text-xs">
                  IP
                </div>
                <h2 className="text-sm font-black text-white tracking-tight">InstaPasso SSO</h2>
              </div>
            </div>

            {/* Ações da Direita */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAuditReportModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/30 cursor-pointer"
              >
                📄 Laudo ISO 27001
              </button>
              <button
                onClick={() => window.open('https://insta-passo.vercel.app/', '_blank')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-700 cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                Abrir em Nova Aba
              </button>
            </div>
          </div>

          {/* Menu de Abas Internas Nativas do InstaPasso */}
          <div className="flex items-center gap-1 border-b border-slate-800 pb-1 text-xs font-bold overflow-x-auto">
            <button
              onClick={() => setInstaPassoTab('acessos')}
              className={`px-4 py-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                instaPassoTab === 'acessos'
                  ? 'border-emerald-400 text-white font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Gerenciamento de Acessos
            </button>
            <button
              onClick={() => setInstaPassoTab('equipe')}
              className={`px-4 py-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                instaPassoTab === 'equipe'
                  ? 'border-emerald-400 text-white font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Equipe Interna
            </button>
            <button
              onClick={() => setInstaPassoTab('logs')}
              className={`px-4 py-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                instaPassoTab === 'logs'
                  ? 'border-emerald-400 text-white font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Logs de Auditoria
            </button>
            <button
              onClick={() => setInstaPassoTab('security')}
              className={`px-4 py-2 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                instaPassoTab === 'security'
                  ? 'border-blue-400 text-blue-400 font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              🛡️ Segurança & Governança ISO 27001
            </button>
          </div>
        </div>

        {/* Modal do Laudo Mensal de Auditoria (Item 112) */}
        <PeriodicAuditReportModal
          isOpen={showAuditReportModal}
          onClose={() => setShowAuditReportModal(false)}
        />

        {/* Conteúdo da Aba Selecionada */}
        {instaPassoTab === 'acessos' || instaPassoTab === 'equipe' || instaPassoTab === 'logs' ? (
          <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative w-full">
            <iframe
              src="https://insta-passo.vercel.app/"
              className="w-full min-h-[720px] h-[calc(100vh-200px)] border-0 rounded-2xl"
              title="Portal InstaPasso Admin"
            />
          </div>
        ) : (
          <div className="dark">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Coluna 1: Proteção Ativa, WAF e Logs */}
              <div className="space-y-6">
                <WafCorporateFilterWidget />
                <AntiBruteForcePanelWidget />
                <SecurityAuditLogsWidget />
                <SessionTimeoutSettingsWidget />
                <SessionCookiePolicyWidget />
                <HttpSecurityHeadersWidget />
              </div>
              
              {/* Coluna 2: Governança, Compliance e Políticas */}
              <div className="space-y-6">
                <FileUploadSanitizerWidget />
                <MfaPolicyEnforcementWidget />
                <EncryptionComplianceWidget />
                <LogTtlPolicyWidget />
                <LgpdUserAnonymizationWidget />
                <FrameAncestorsPolicyWidget />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Ferramentas</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Acesso rápido às ferramentas administrativas e utilitários da equipe de TI.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => {
                if ((tool as any).isTermModal) {
                  setShowTermModal(true);
                } else if ((tool as any).isB2bModal) {
                  setShowB2bModal(true);
                } else if ((tool as any).isInstaPasso) {
                  if (canAccessInstaPasso()) {
                    setActiveEmbeddedTool('instapasso');
                  } else {
                    toast.error('Acesso restrito ao InstaPasso. Apenas Administradores e Supervisores autorizados.');
                  }
                } else if ('url' in tool && tool.url) {
                  window.open(tool.url as string, '_blank');
                } else if ('route' in tool && tool.route) {
                  navigate(tool.route as string);
                }
              }}
              className={`group relative flex flex-col items-center justify-center gap-4 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-lg transition-all duration-200 ${tool.border} dark:hover:border-slate-600 text-center overflow-hidden cursor-pointer`}
            >
              {/* Badge */}
              {tool.badge && (
                <span className={`absolute top-3 right-3 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                  (tool as any).isInstaPasso
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}>
                  {tool.badge}
                </span>
              )}

              {/* Icon */}
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${tool.bg} ${tool.color} group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-8 h-8" />
              </div>

              {/* Text */}
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm">
                  {tool.name}
                </h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
                  {tool.description}
                </p>
              </div>

              {/* External link indicator */}
              <ExternalLink className="absolute bottom-3 right-3 w-3.5 h-3.5 text-slate-300 dark:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          );
        })}
      </div>

      {/* Modal Gerador do Termo de Entrega de Equipamento com Assinatura Digital (Item 099) */}
      <EquipmentDeliveryTermModal isOpen={showTermModal} onClose={() => setShowTermModal(false)} />

      {/* Modal Extrato de Desempenho B2B / QBR (Item 130) */}
      <B2bCompanyPerformanceModal isOpen={showB2bModal} onClose={() => setShowB2bModal(false)} />
    </div>
  );
}
