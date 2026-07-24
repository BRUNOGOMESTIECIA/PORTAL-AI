import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Fingerprint, Monitor, LayoutGrid, Cloud, Gamepad2, Tv, HardDrive, Cpu, ExternalLink, Printer, Package, Smartphone, Server, Send } from 'lucide-react';

/**
 * Definição estática de todas as ferramentas disponíveis no painel.
 * Cada ferramenta pode ter um badge especial (ex: 'Live' ou 'Remoto') 
 * e uma rota opcional de navegação ('route').
 */
const TOOLS = [
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
];

/**
 * Página Principal: Ferramentas de TI.
 * Exibe um grid (grade) de atalhos e utilitários para acesso rápido.
 * Alguns atalhos abrem modais, links externos ou navegam para outras rotas.
 */
export default function ToolsPage() {
  const navigate = useNavigate();
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
                if ('url' in tool && tool.url) {
                  window.open(tool.url as string, '_blank');
                } else if ('route' in tool && tool.route) {
                  navigate(tool.route as string);
                }
              }}
              className={`group relative flex flex-col items-center justify-center gap-4 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-lg transition-all duration-200 ${tool.border} dark:hover:border-slate-600 text-center overflow-hidden`}
            >
              {/* Badge */}
              {tool.badge && (
                <span className="absolute top-3 right-3 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wide">
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
    </div>
  );
}
