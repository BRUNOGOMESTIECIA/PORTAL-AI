"use client";

import { useState } from "react";
import { 
  XMarkIcon,
  CheckIcon,
  PhotoIcon,
  LinkIcon,
  CodeBracketIcon,
  ListBulletIcon
} from "@heroicons/react/24/outline";

export default function RichTextEditor({ doc, onClose, onSave }: { doc: any, onClose: () => void, onSave: (title: string, content: string) => void }) {
  const [content, setContent] = useState(doc?.content || "");
  const [title, setTitle] = useState(doc?.title || "Novo Documento");

  return (
    <div className="fixed inset-0 z-[100] bg-[#050505] flex flex-col animate-in zoom-in-95 duration-200">
      {/* Topbar */}
      <div className="h-16 border-b border-gray-800 bg-[#0a0a0a] flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-transparent text-white font-bold text-xl outline-none placeholder-gray-600 min-w-[300px]"
            placeholder="Título do documento..."
          />
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="text-gray-400 hover:text-white px-4 py-2 font-medium">Cancelar</button>
          <button 
            onClick={() => onSave(title, content)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg font-bold shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-colors flex items-center gap-2"
          >
            <CheckIcon className="w-5 h-5" />
            Salvar e Publicar
          </button>
        </div>
      </div>

      {/* Toolbar (Estilo WYSIWYG) */}
      <div className="h-14 border-b border-gray-800 bg-[#111111] flex items-center px-6 gap-2 overflow-x-auto custom-scrollbar select-none">
        <button className="w-9 h-9 flex items-center justify-center text-gray-300 hover:bg-gray-700 hover:text-white rounded font-serif font-bold text-lg transition-colors">B</button>
        <button className="w-9 h-9 flex items-center justify-center text-gray-300 hover:bg-gray-700 hover:text-white rounded font-serif italic text-lg transition-colors">I</button>
        <button className="w-9 h-9 flex items-center justify-center text-gray-300 hover:bg-gray-700 hover:text-white rounded font-serif underline text-lg transition-colors">U</button>
        <button className="w-9 h-9 flex items-center justify-center text-gray-300 hover:bg-gray-700 hover:text-white rounded font-serif line-through text-lg transition-colors">S</button>
        
        <div className="w-px h-6 bg-gray-700 mx-2"></div>
        
        <button className="h-9 px-3 flex items-center justify-center text-gray-300 hover:bg-gray-700 hover:text-white rounded font-bold transition-colors">H1</button>
        <button className="h-9 px-3 flex items-center justify-center text-gray-300 hover:bg-gray-700 hover:text-white rounded font-bold transition-colors">H2</button>
        <button className="h-9 px-3 flex items-center justify-center text-gray-300 hover:bg-gray-700 hover:text-white rounded font-bold transition-colors">H3</button>
        
        <div className="w-px h-6 bg-gray-700 mx-2"></div>
        
        <button className="w-9 h-9 flex items-center justify-center text-gray-300 hover:bg-gray-700 hover:text-white rounded transition-colors"><ListBulletIcon className="w-5 h-5" /></button>
        <button className="w-9 h-9 flex items-center justify-center text-gray-300 hover:bg-gray-700 hover:text-white rounded transition-colors"><LinkIcon className="w-5 h-5" /></button>
        <button className="w-9 h-9 flex items-center justify-center text-gray-300 hover:bg-gray-700 hover:text-white rounded transition-colors"><PhotoIcon className="w-5 h-5" /></button>
        <button className="w-9 h-9 flex items-center justify-center text-gray-300 hover:bg-gray-700 hover:text-white rounded transition-colors"><CodeBracketIcon className="w-5 h-5" /></button>
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#050505] p-8 flex justify-center pb-32 cursor-text">
        <div className="w-full max-w-4xl bg-[#111111] border border-gray-800 rounded-xl shadow-2xl p-10 min-h-[800px]">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Comece a escrever o conteúdo do documento aqui..."
            className="w-full h-full min-h-[700px] bg-transparent text-gray-300 text-lg leading-relaxed outline-none resize-none placeholder-gray-700 font-sans"
          />
        </div>
      </div>
    </div>
  );
}
