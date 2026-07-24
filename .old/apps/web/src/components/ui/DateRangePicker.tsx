"use client";

import { useState, useRef, useEffect } from "react";
import { CalendarIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

const PRESETS = [
  { id: "today", label: "Hoje" },
  { id: "7d", label: "Últimos 7 dias" },
  { id: "30d", label: "Últimos 30 dias" },
  { id: "quarter", label: "Este Trimestre" },
  { id: "year", label: "Este Ano" },
  { id: "custom", label: "Data Customizada..." },
];

export function DateRangePicker() {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(PRESETS[0]); // Default "Hoje"
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (preset: typeof PRESETS[0]) => {
    setSelected(preset);
    if (preset.id !== "custom") {
      setIsOpen(false);
    }
  };

  const getDisplayText = () => {
    if (selected.id === "custom" && customStart && customEnd) {
      // formata de yyyy-mm-dd para dd/mm/yyyy
      const format = (dateStr: string) => dateStr.split('-').reverse().join('/');
      return `${format(customStart)} até ${format(customEnd)}`;
    }
    return selected.label;
  };

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-[#111111] hover:bg-gray-900 border border-gray-800 text-sm font-semibold text-white rounded-xl px-4 py-2.5 transition-colors focus:ring-2 focus:ring-purple-500/50 outline-none"
      >
        <CalendarIcon className="w-4 h-4 text-purple-400" />
        {getDisplayText()}
        <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-[#0A0A0A] border border-gray-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="p-2 space-y-1">
            {PRESETS.map(preset => (
              <button
                key={preset.id}
                onClick={() => handleSelect(preset)}
                className={`w-full text-left px-3 py-2 text-sm font-bold rounded-lg transition-colors flex items-center justify-between ${
                  selected.id === preset.id 
                    ? 'bg-purple-500/10 text-purple-400' 
                    : 'text-gray-300 hover:bg-gray-900 hover:text-white'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {selected.id === "custom" && (
            <div className="p-3 border-t border-gray-800 bg-[#050505] space-y-3">
              <div className="flex flex-col gap-1">
                 <label className="text-xs font-bold text-gray-500">Data Inicial</label>
                 <input 
                   type="date" 
                   value={customStart}
                   onChange={e => setCustomStart(e.target.value)}
                   className="w-full bg-[#111111] border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-purple-500/50"
                 />
              </div>
              <div className="flex flex-col gap-1">
                 <label className="text-xs font-bold text-gray-500">Data Final</label>
                 <input 
                   type="date" 
                   value={customEnd}
                   onChange={e => setCustomEnd(e.target.value)}
                   className="w-full bg-[#111111] border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-purple-500/50"
                 />
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                disabled={!customStart || !customEnd}
                className="w-full mt-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-800 disabled:text-gray-500 text-white text-xs font-bold py-2 rounded-lg transition-colors"
              >
                Aplicar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
