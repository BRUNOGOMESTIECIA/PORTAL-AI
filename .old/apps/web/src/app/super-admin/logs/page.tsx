"use client";

import { useState } from "react";
import { 
  CommandLineIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  ChevronDownIcon,
  DocumentDuplicateIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { DateRangePicker } from "../../../components/ui/DateRangePicker";

// Mock Data for Logs
const MOCK_LOGS = [
  { id: "log_1", timestamp: "2026-05-23T14:02:11.432", level: "INFO", module: "Auth", actor: "System", message: "Token refreshed for user usr_982x", payload: '{\n  "userId": "usr_982x",\n  "tenantId": "tnt_acme",\n  "grantType": "refresh_token",\n  "ip": "189.23.44.12",\n  "status": "success"\n}' },
  { id: "log_2", timestamp: "2026-05-23T14:02:12.105", level: "INFO", module: "API", actor: "Acme Corp (tnt_acme)", message: "GET /v1/tenants/active - 200 OK (12ms)", payload: '{\n  "endpoint": "/v1/tenants/active",\n  "method": "GET",\n  "statusCode": 200,\n  "responseTimeMs": 12,\n  "userAgent": "insomnia/2023.5.8"\n}' },
  { id: "log_3", timestamp: "2026-05-23T14:02:15.890", level: "WARN", module: "AI_Engine", actor: "System", message: "High latency detected on primary LLM endpoint (850ms)", payload: '{\n  "provider": "OpenAI",\n  "model": "gpt-4o",\n  "latencyMs": 850,\n  "thresholdMs": 500,\n  "action": "trigger_fallback_circuit"\n}' },
  { id: "log_4", timestamp: "2026-05-23T14:02:16.002", level: "INFO", module: "AI_Engine", actor: "System", message: "Fallback to Claude 3 Haiku successful", payload: '{\n  "provider": "Anthropic",\n  "model": "claude-3-haiku",\n  "latencyMs": 180,\n  "status": "active"\n}' },
  { id: "log_5", timestamp: "2026-05-23T14:03:01.222", level: "ERROR", module: "Database", actor: "System", message: "Connection pool saturated, waiting for available slot...", payload: '{\n  "poolSize": 100,\n  "activeConnections": 100,\n  "idleConnections": 0,\n  "waitingQueries": 14,\n  "timeoutMs": 5000\n}' },
  { id: "log_6", timestamp: "2026-05-23T14:03:02.500", level: "INFO", module: "Database", actor: "System", message: "Pool recovered, queries resuming", payload: '{\n  "activeConnections": 86,\n  "idleConnections": 14,\n  "recoveredQueries": 14\n}' },
  { id: "log_7", timestamp: "2026-05-23T14:04:10.882", level: "INFO", module: "Billing", actor: "Stark Enterprises (tnt_stark)", message: "Invoice INV-2026-05 generated successfully", payload: '{\n  "tenantId": "tnt_stark",\n  "invoiceId": "INV-2026-05",\n  "amountTotal": 1450.00,\n  "currency": "BRL",\n  "status": "draft"\n}' },
  { id: "log_8", timestamp: "2026-05-23T14:05:45.111", level: "CRITICAL", module: "Security", actor: "189.12.33.4", message: "Multiple failed login attempts detected", payload: '{\n  "ip": "189.12.33.4",\n  "attempts": 15,\n  "windowSecs": 60,\n  "targetEmail": "admin@global.com",\n  "action": "ip_blocked"\n}' },
  { id: "log_9", timestamp: "2026-05-23T14:07:22.000", level: "INFO", module: "Webhook", actor: "Global Industries (tnt_global)", message: "Sent ticket.created payload to global_crm_hook", payload: '{\n  "webhookId": "whk_882x",\n  "event": "ticket.created",\n  "targetUrl": "https://crm.global.com/api/hooks/support",\n  "httpStatus": 200,\n  "responseMs": 340\n}' },
  { id: "log_10", timestamp: "2026-05-23T14:08:15.333", level: "WARN", module: "KnowledgeBase", actor: "Téc. Marcos Andrade", message: "Large bulk import triggered (500+ articles)", payload: '{\n  "userId": "usr_tech_02",\n  "action": "bulk_import",\n  "fileSizeMb": 12.4,\n  "articleCount": 542,\n  "estimatedTimeSecs": 45\n}' },
];

export default function LogsPage() {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [moduleFilter, setModuleFilter] = useState("ALL");
  const [actorFilter, setActorFilter] = useState("ALL");

  const hasActiveFilters = search !== "" || levelFilter !== "ALL" || moduleFilter !== "ALL" || actorFilter !== "ALL";

  const clearFilters = () => {
    setSearch("");
    setLevelFilter("ALL");
    setModuleFilter("ALL");
    setActorFilter("ALL");
  };

  const toggleRow = (id: string) => {
    if (expandedRow === id) setExpandedRow(null);
    else setExpandedRow(id);
  };

  const getLevelBadge = (level: string) => {
    switch(level) {
      case "INFO": return <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20"><InformationCircleIcon className="w-3 h-3"/> INFO</span>;
      case "WARN": return <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"><ExclamationTriangleIcon className="w-3 h-3"/> WARN</span>;
      case "ERROR": return <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md font-bold bg-red-500/10 text-red-400 border border-red-500/20"><XCircleIcon className="w-3 h-3"/> ERROR</span>;
      case "CRITICAL": return <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md font-black bg-red-600/20 text-red-500 border border-red-500/50 uppercase animate-pulse"><XCircleIcon className="w-3 h-3"/> CRITICAL</span>;
      default: return <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-gray-500/10 text-gray-400 border border-gray-500/20">{level}</span>;
    }
  };

  const filteredLogs = MOCK_LOGS.filter(log => {
    if (levelFilter !== "ALL" && log.level !== levelFilter) return false;
    if (moduleFilter !== "ALL" && log.module !== moduleFilter) return false;
    if (actorFilter !== "ALL") {
       if (actorFilter === "System" && log.actor !== "System") return false;
       if (actorFilter === "Tenant" && !log.actor.includes("(tnt_")) return false;
       if (actorFilter === "Tech" && !log.actor.includes("Téc.")) return false;
    }
    if (search && !log.message.toLowerCase().includes(search.toLowerCase()) && !log.actor.toLowerCase().includes(search.toLowerCase()) && !log.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto pb-32">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2 flex items-center gap-3">
             <CommandLineIcon className="w-8 h-8 text-purple-500" />
             Auditoria & Logs
          </h1>
          <p className="text-gray-400">Trilha de eventos técnicos, integrações e ações críticas do sistema.</p>
        </div>
        <div>
          <DateRangePicker />
        </div>
      </div>

      {/* Toolbar / Filters */}
      <div className="bg-[#111111] border border-gray-800 rounded-2xl p-4 shadow-xl mb-6 flex flex-col md:flex-row gap-4 items-center">
         <div className="relative flex-1 w-full">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Buscar por mensagem, ID ou ator..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-gray-800 text-sm text-white rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-purple-500/50 transition-colors"
            />
         </div>
         
         <div className="flex gap-4 w-full md:w-auto">
            <div className="relative">
              <select 
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="bg-[#0A0A0A] border border-gray-800 text-sm font-semibold text-gray-300 rounded-xl pl-4 pr-10 py-2.5 outline-none focus:border-purple-500/50 transition-all cursor-pointer appearance-none min-w-[120px]"
              >
                <option value="ALL">Nível: Todos</option>
                <option value="INFO">INFO</option>
                <option value="WARN">WARN</option>
                <option value="ERROR">ERROR</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            <div className="relative">
              <select 
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                className="bg-[#0A0A0A] border border-gray-800 text-sm font-semibold text-gray-300 rounded-xl pl-4 pr-10 py-2.5 outline-none focus:border-purple-500/50 transition-all cursor-pointer appearance-none min-w-[140px]"
              >
                <option value="ALL">Módulo: Todos</option>
                <option value="Auth">Auth</option>
                <option value="API">API</option>
                <option value="AI_Engine">AI Engine</option>
                <option value="Database">Database</option>
                <option value="Webhook">Webhook</option>
                <option value="Security">Security</option>
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
            
            <div className="relative">
              <select 
                value={actorFilter}
                onChange={(e) => setActorFilter(e.target.value)}
                className="bg-[#0A0A0A] border border-gray-800 text-sm font-semibold text-gray-300 rounded-xl pl-4 pr-10 py-2.5 outline-none focus:border-purple-500/50 transition-all cursor-pointer appearance-none min-w-[140px]"
              >
                <option value="ALL">Ator: Todos</option>
                <option value="System">Sistema Automatizado</option>
                <option value="Tenant">Clientes (Empresas)</option>
                <option value="Tech">Equipe Técnica</option>
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
            
            {hasActiveFilters ? (
              <button 
                onClick={clearFilters}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2.5 rounded-xl border border-red-500/30 transition-colors flex items-center gap-2 text-sm font-bold"
              >
                 <XMarkIcon className="w-4 h-4" /> Limpar Filtros
              </button>
            ) : (
              <button className="bg-gray-800 hover:bg-gray-700 text-white p-2.5 rounded-xl border border-gray-700 transition-colors">
                 <FunnelIcon className="w-5 h-5" />
              </button>
            )}
         </div>
      </div>

      {/* Datagrid */}
      <div className="bg-[#111111] border border-gray-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
         {/* Table Header */}
         <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-800 bg-[#0A0A0A] text-xs font-black text-gray-500 uppercase tracking-wider">
            <div className="col-span-2">Timestamp</div>
            <div className="col-span-1">Level</div>
            <div className="col-span-2">Módulo</div>
            <div className="col-span-5">Mensagem</div>
            <div className="col-span-2">Ator</div>
         </div>

         {/* Table Body */}
         <div className="flex-1 overflow-y-auto max-h-[600px] custom-scrollbar">
           {filteredLogs.length === 0 ? (
             <div className="p-10 text-center text-gray-500 font-semibold">
               Nenhum log encontrado com esses filtros.
             </div>
           ) : (
             filteredLogs.map((log) => (
               <div key={log.id} className="group flex flex-col border-b border-gray-800/50 last:border-0">
                 {/* Main Row */}
                 <div 
                   onClick={() => toggleRow(log.id)}
                   className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-900/50 transition-colors cursor-pointer"
                 >
                    <div className="col-span-2 text-xs font-mono text-gray-400">
                      {log.timestamp.replace('T', ' ')}
                    </div>
                    <div className="col-span-1">
                      {getLevelBadge(log.level)}
                    </div>
                    <div className="col-span-2 text-xs font-bold text-gray-300">
                      {log.module}
                    </div>
                    <div className="col-span-5 text-sm text-gray-200 truncate pr-4">
                      {log.message}
                    </div>
                    <div className="col-span-2 text-xs text-gray-500 truncate flex items-center justify-between">
                      <span className="truncate">{log.actor}</span>
                      <ChevronDownIcon className={`w-4 h-4 text-gray-600 transition-transform ${expandedRow === log.id ? 'rotate-180 text-purple-400' : 'group-hover:text-gray-400'}`} />
                    </div>
                 </div>

                 {/* Expanded Details (JSON Payload) */}
                 {expandedRow === log.id && (
                   <div className="bg-[#050505] p-6 border-t border-gray-800/50 shadow-inner">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Metadata / Payload</span>
                        <button className="text-gray-500 hover:text-white flex items-center gap-1 text-[10px] font-bold transition-colors">
                          <DocumentDuplicateIcon className="w-3 h-3" /> Copiar JSON
                        </button>
                      </div>
                      <pre className="text-xs text-green-400 font-mono bg-black/50 p-4 rounded-xl border border-gray-800/80 overflow-x-auto">
                        {log.payload}
                      </pre>
                   </div>
                 )}
               </div>
             ))
           )}
         </div>

         {/* Footer Pagination Mock */}
         <div className="p-4 border-t border-gray-800 bg-[#0A0A0A] flex justify-between items-center text-xs text-gray-500 font-semibold">
            <span>Exibindo {filteredLogs.length} eventos</span>
            <div className="flex gap-2">
              <button className="px-3 py-1 rounded bg-[#111111] border border-gray-800 hover:text-white disabled:opacity-50">Anterior</button>
              <button className="px-3 py-1 rounded bg-[#111111] border border-gray-800 hover:text-white disabled:opacity-50">Próxima</button>
            </div>
         </div>
      </div>
    </div>
  );
}
