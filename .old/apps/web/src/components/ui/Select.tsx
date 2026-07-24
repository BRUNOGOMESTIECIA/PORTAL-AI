"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

export interface SelectOption {
  value: string;
  label: string | React.ReactNode;
  buttonLabel?: string | React.ReactNode;
}

interface SelectProps {
  value: string;
  onChange: (val: string) => void;
  options: SelectOption[];
  className?: string;
  placeholder?: string;
  icon?: React.ReactNode;
}

export function Select({ value, onChange, options, className = "", placeholder, icon }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-[#0A0A0A] border border-gray-800 rounded-xl px-3 py-2.5 text-sm font-semibold outline-none transition-all hover:border-gray-700 ${isOpen ? 'ring-2 ring-purple-500/50 border-purple-500/50' : ''}`}
      >
        <span className="flex items-center gap-2 text-white truncate">
          {icon && <span className="text-gray-500 flex-shrink-0">{icon}</span>}
          {selectedOption ? (selectedOption.buttonLabel || selectedOption.label) : <span className="text-gray-500">{placeholder || "Selecione..."}</span>}
        </span>
        <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-[#111111] border border-gray-800 rounded-xl shadow-2xl py-1.5 animate-in fade-in zoom-in-95 duration-100 max-h-60 overflow-y-auto custom-scrollbar origin-top">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm font-semibold transition-colors flex items-center gap-2 ${
                value === opt.value 
                  ? 'bg-purple-600/10 text-purple-400' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
