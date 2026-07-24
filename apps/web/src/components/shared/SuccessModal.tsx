import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useEscapeModal } from '../../hooks/use-escape-modal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export function SuccessModal({ isOpen, onClose, title, message }: Props) {
  useEscapeModal(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-2">{title}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{message}</p>
        <button 
          onClick={onClose}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 hover:-translate-y-[1px] shadow-md"
        >
          OK
        </button>
      </div>
    </div>
  );
}
