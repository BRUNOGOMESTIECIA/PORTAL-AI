import React, { useState } from 'react';
import { CheckCircle2, ChevronDown, Paperclip, Send, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useEscapeModal } from '../../../hooks/use-escape-modal';

const TICKET_TYPES = ['Incidente', 'Solicitação', 'Dúvida'];

export const newTicketSchema = z.object({
  title: z.string().min(5, 'O título deve ter pelo menos 5 caracteres.'),
  type: z.string().min(1),
  description: z.string().min(15, 'Forneça mais detalhes (mínimo 15 caracteres).'),
});

export type NewTicketForm = z.infer<typeof newTicketSchema>;

export function NewTicketModal({ initialTitle = '', onClose, onConfirm }: { initialTitle?: string; onClose: () => void; onConfirm?: () => void }) {
  useEscapeModal(true, onClose);
  const [submitted, setSubmitted] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  
  const { register, handleSubmit, watch, setValue, formState: { errors, isValid } } = useForm<NewTicketForm>({
    resolver: zodResolver(newTicketSchema),
    defaultValues: { type: TICKET_TYPES[0], title: initialTitle, description: '' },
    mode: 'onChange'
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };
  
  const removeFile = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: NewTicketForm) => {
    setSubmitted(true);
    if (onConfirm) onConfirm();
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-7 w-7 text-green-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-2">Chamado aberto!</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-6">
            Nossa equipe foi notificada e entrará em contato em breve.
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/portal/tickets" onClick={onClose} className="text-sm font-medium text-blue-600 hover:underline">
              Ver meus chamados
            </Link>
            <span className="text-slate-300">·</span>
            <button onClick={onClose} className="text-sm font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:text-slate-300">
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-700/50">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">Novo chamado</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Preencha as informações para nos ajudar a entender sua solicitação.</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 transition-all duration-200 hover:-translate-y-[1.5px] active:translate-y-[0.5px] hover:shadow-md">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Título <span className="text-red-500">*</span></label>
            <input
              {...register('title')}
              placeholder="Descreva o problema em poucas palavras"
              className={`w-full rounded-xl border bg-white dark:bg-slate-800 px-4 py-3 text-sm outline-none focus:ring-4 transition-all placeholder-slate-400 shadow-sm
                ${errors.title ? 'border-red-300 focus:border-red-500 focus:ring-red-50' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-50 hover:border-slate-300 dark:hover:border-slate-600'}`}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1.5">{errors.title.message}</p>}
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Tipo</label>
              <div className="relative group">
                <select {...register('type')}
                  className="w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 hover:border-slate-300 dark:hover:border-slate-600 transition-all pr-10 text-slate-700 dark:text-slate-300 shadow-sm font-medium cursor-pointer">
                  {TICKET_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 group-hover:text-blue-500 transition-colors pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Descrição <span className="text-red-500">*</span></label>
            <textarea
              {...register('description')}
              placeholder="Descreva com detalhes..."
              rows={3}
              className={`w-full rounded-xl border bg-white dark:bg-slate-800 px-4 py-3 text-sm outline-none resize-none focus:ring-4 transition-all placeholder-slate-400 shadow-sm
                ${errors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-50' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-50 hover:border-slate-300 dark:hover:border-slate-600'}`}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1.5">{errors.description.message}</p>}
          </div>
          
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Anexos (Opcional)</label>
            <div className="flex flex-col gap-2">
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-1">
                  {attachments.map((file, i) => (
                    <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      <Paperclip className="h-3 w-3 text-slate-400 dark:text-slate-500 shrink-0" />
                      <span className="truncate max-w-[120px]">{file.name}</span>
                      <button type="button" onClick={() => removeFile(i)} className="text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors shrink-0">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:bg-slate-800 transition-colors cursor-pointer text-sm font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 group">
                <Paperclip className="h-4 w-4 text-slate-400 dark:text-slate-500 group-hover:text-blue-500 transition-colors" />
                Adicionar imagens
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:bg-slate-800 rounded-xl transition-all duration-200 hover:-translate-y-[1.5px] active:translate-y-[0.5px] hover:shadow-md">Cancelar</button>
            <button type="submit" disabled={!isValid} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white text-sm font-semibold rounded-xl shadow-md disabled:shadow-none transition-all duration-200 hover:-translate-y-[1.5px] active:translate-y-[0.5px] hover:shadow-md">
              <Send className="h-4 w-4" /> Enviar solicitação
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
