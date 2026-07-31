import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, Trash2, PauseCircle, CheckCircle2, ShieldCheck, Sparkles, Sun, Moon } from 'lucide-react';
import { toast } from 'sonner';
import { DEFAULT_HOLIDAYS, isSlaPausedNow, SlaPauseInfo } from '../../../lib/business-hours-sla';
import { logAuditEvent } from '../../../lib/audit-logger';

export interface CorporateHoliday {
  date: string; // YYYY-MM-DD
  name: string;
  type: 'nacional' | 'corporativo';
}

const INITIAL_HOLIDAYS: CorporateHoliday[] = [
  { date: '2026-01-01', name: 'Confraternização Universal', type: 'nacional' },
  { date: '2026-04-21', name: 'Tiradentes', type: 'nacional' },
  { date: '2026-05-01', name: 'Dia do Trabalho', type: 'nacional' },
  { date: '2026-09-07', name: 'Independência do Brasil', type: 'nacional' },
  { date: '2026-10-12', name: 'Nossa Sra. Aparecida', type: 'nacional' },
  { date: '2026-11-02', name: 'Finados', type: 'nacional' },
  { date: '2026-11-15', name: 'Proclamação da República', type: 'nacional' },
  { date: '2026-12-25', name: 'Natal', type: 'nacional' },
];

export function SlaBusinessCalendarWidget() {
  const [holidays, setHolidays] = useState<CorporateHoliday[]>(INITIAL_HOLIDAYS);
  const [newDate, setNewDate] = useState('');
  const [newName, setNewName] = useState('');
  const [pauseWeekends, setPauseWeekends] = useState(true);
  const [pauseNightHours, setPauseNightHours] = useState(true);
  const [businessStartHour, setBusinessStartHour] = useState(8);
  const [businessEndHour, setBusinessEndHour] = useState(18);

  const currentStatus: SlaPauseInfo = isSlaPausedNow(new Date());

  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || !newName.trim()) {
      toast.error('Informe a data e o nome do feriado corporativo.');
      return;
    }

    if (holidays.some((h) => h.date === newDate)) {
      toast.warning('Esta data já está cadastrada como feriado.');
      return;
    }

    const item: CorporateHoliday = {
      date: newDate,
      name: newName.trim(),
      type: 'corporativo',
    };

    const updated = [...holidays, item].sort((a, b) => a.date.localeCompare(b.date));
    setHolidays(updated);
    setNewDate('');
    setNewName('');

    logAuditEvent(
      'SLA_HOLIDAY_ADDED',
      `Novo feriado corporativo "${item.name}" (${item.date}) adicionado ao calendário de pausa de SLA.`
    );
    toast.success(`Feriado "${item.name}" adicionado ao calendário de SLA!`);
  };

  const handleRemoveHoliday = (date: string) => {
    const target = holidays.find((h) => h.date === date);
    if (!target) return;

    setHolidays(holidays.filter((h) => h.date !== date));
    logAuditEvent(
      'SLA_HOLIDAY_REMOVED',
      `Feriado corporativo "${target.name}" (${target.date}) removido do calendário.`
    );
    toast.info(`Feriado "${target.name}" removido.`);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-lg space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-200 dark:border-blue-800">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Calendário de Horas Úteis & Pausa de SLA
              <span className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-mono uppercase font-bold">
                Item 054
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Desconsidera finais de semana, feriados nacionais/corporativos e expediente noturno no cálculo de SLA.
            </p>
          </div>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 shadow-sm ${
              currentStatus.isPaused
                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
            }`}
          >
            {currentStatus.isPaused ? (
              <PauseCircle className="w-4 h-4 text-amber-500" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            )}
            <span>{currentStatus.label}</span>
          </span>
        </div>
      </div>

      {/* Grid de Configurações do Expediente */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Finais de Semana */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-500" /> Finais de Semana
            </span>
            <input
              type="checkbox"
              checked={pauseWeekends}
              onChange={(e) => setPauseWeekends(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded cursor-pointer"
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Sábados e Domingos congelam automaticamente a contagem regressiva de SLA.
          </p>
        </div>

        {/* Card 2: Horário Noturno */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Moon className="w-4 h-4 text-indigo-400" /> Fora do Expediente
            </span>
            <input
              type="checkbox"
              checked={pauseNightHours}
              onChange={(e) => setPauseNightHours(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[10px] font-bold text-slate-500">Expediente:</span>
            <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
              {String(businessStartHour).padStart(2, '0')}:00 às {String(businessEndHour).padStart(2, '0')}:00
            </span>
          </div>
        </div>

        {/* Card 3: Pausa em Feriados */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Feriados & Pontes
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full">
              {holidays.length} Feriados Ativos
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Feriados cadastrados interrompem o relógio de SLA até o próximo dia útil.
          </p>
        </div>
      </div>

      {/* Gerenciamento de Feriados Corporativos */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Feriados Nacionais & Folgas Corporativas ({holidays.length})
          </h4>
        </div>

        {/* Form de Adição */}
        <form onSubmit={handleAddHoliday} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
          />
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nome do feriado ou folga (ex: Feriado Municipal)..."
            className="text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar Feriado
          </button>
        </form>

        {/* Grid de Cards de Feriados */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-1 max-h-48 overflow-y-auto pr-1">
          {holidays.map((h) => {
            const [yyyy, mm, dd] = h.date.split('-');
            return (
              <div
                key={h.date}
                className="p-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between gap-2 text-xs"
              >
                <div className="min-w-0 pr-1">
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400 block text-[11px]">
                    {dd}/{mm}/{yyyy}
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block text-[11px]" title={h.name}>
                    {h.name}
                  </span>
                </div>
                {h.type === 'corporativo' && (
                  <button
                    type="button"
                    onClick={() => handleRemoveHoliday(h.date)}
                    className="p-1 text-slate-400 hover:text-rose-500 transition-colors shrink-0"
                    title="Remover feriado"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
