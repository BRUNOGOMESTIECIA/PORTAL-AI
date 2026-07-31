import React from 'react';

interface TypingIndicatorProps {
  isTyping: boolean;
  name?: string;
}

export function TypingIndicator({ isTyping, name = 'Atendente' }: TypingIndicatorProps) {
  if (!isTyping) return null;

  return (
    <div className="flex items-center gap-2.5 px-3.5 py-1.5 bg-slate-800/90 border border-slate-700/60 rounded-full text-xs text-slate-200 w-fit shadow-md animate-in fade-in slide-in-from-bottom-1 duration-200 my-1.5">
      <div className="flex items-center gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.32s]" />
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.16s]" />
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
      </div>
      <span className="font-semibold text-[11px] tracking-tight">
        <strong className="text-emerald-400">{name}</strong> está digitando...
      </span>
    </div>
  );
}
