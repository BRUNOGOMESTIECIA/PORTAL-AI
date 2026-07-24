"use client";

import { useState } from "react";
import { 
  PhotoIcon, 
  SwatchIcon, 
  GlobeAltIcon, 
  CheckCircleIcon,
  EnvelopeIcon
} from "@heroicons/react/24/outline";

interface BrandingFormProps {
  isTenantScope?: boolean; // Se true, esconde configs super-globais (como email do dono do saas)
  initialData?: any;
}

export function BrandingForm({ isTenantScope = false, initialData = {} }: BrandingFormProps) {
  const [primaryColor, setPrimaryColor] = useState(initialData.color || "#A855F7");
  const [domain, setDomain] = useState(initialData.domain || "");
  const [appName, setAppName] = useState(initialData.name || "Meu SaaS");

  const colors = ["#3B82F6", "#8B5CF6", "#A855F7", "#EC4899", "#F43F5E", "#F97316", "#EAB308", "#10B981"];

  return (
    <div className="flex flex-col gap-8">
      {/* Brand Identity */}
      <div className="bg-[#111111] border border-gray-800 rounded-2xl p-8 shadow-xl">
         <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
           <PhotoIcon className="w-6 h-6 text-purple-400" />
           Identidade Visual
         </h3>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-400">Logomarca</label>
              <div className="w-full h-32 border-2 border-dashed border-gray-800 hover:border-purple-500/50 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors group bg-[#0A0A0A]">
                 <PhotoIcon className="w-8 h-8 text-gray-600 group-hover:text-purple-400 mb-2 transition-colors" />
                 <span className="text-xs font-bold text-gray-500 group-hover:text-gray-300">Clique ou arraste a imagem</span>
                 <span className="text-[10px] text-gray-600">PNG, JPG ou SVG (Max 2MB)</span>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-400">Nome do Produto</label>
                <input 
                  type="text" 
                  value={appName}
                  onChange={e => setAppName(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-gray-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-white outline-none focus:border-purple-500/50 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-400 flex justify-between">
                  <span>Cor Primária</span>
                  <span className="text-gray-600">{primaryColor}</span>
                </label>
                <div className="flex gap-2 items-center">
                   {colors.map(color => (
                     <button 
                       key={color}
                       onClick={() => setPrimaryColor(color)}
                       className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${primaryColor === color ? 'ring-2 ring-offset-2 ring-offset-[#111111] ring-white' : ''}`}
                       style={{ backgroundColor: color }}
                     >
                       {primaryColor === color && <CheckCircleIcon className="w-5 h-5 text-white drop-shadow-md" />}
                     </button>
                   ))}
                   <div className="w-px h-8 bg-gray-800 mx-2"></div>
                   <input 
                     type="color" 
                     value={primaryColor}
                     onChange={e => setPrimaryColor(e.target.value)}
                     className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
                   />
                </div>
              </div>
            </div>
         </div>
      </div>

      {/* Domain Customization */}
      <div className="bg-[#111111] border border-gray-800 rounded-2xl p-8 shadow-xl">
         <div className="flex justify-between items-start mb-6">
           <h3 className="text-xl font-bold text-white flex items-center gap-2">
             <GlobeAltIcon className="w-6 h-6 text-blue-400" />
             Domínio Customizado
           </h3>
           <span className="px-2.5 py-1 bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] font-bold rounded-lg uppercase tracking-wider">
             Ativo
           </span>
         </div>

         <div className="flex flex-col gap-2 mb-6">
            <label className="text-sm font-bold text-gray-400">Seu Domínio (CNAME)</label>
            <div className="flex gap-2">
               <input 
                 type="text" 
                 value={domain}
                 onChange={e => setDomain(e.target.value)}
                 placeholder="ex: painel.suaempresa.com"
                 className="flex-1 bg-[#0A0A0A] border border-gray-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-white outline-none focus:border-blue-500/50 transition-colors"
               />
               <button className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-bold text-sm rounded-xl transition-colors">
                 Verificar
               </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Aponte um registro CNAME do seu domínio para <code className="text-blue-400 bg-blue-500/10 px-1 rounded">proxy.nosso-saas.com</code></p>
         </div>
      </div>

      {/* Email / SMTP settings (Only shown if super admin or if tenant has this feature) */}
      {!isTenantScope && (
        <div className="bg-[#111111] border border-gray-800 rounded-2xl p-8 shadow-xl">
           <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
             <EnvelopeIcon className="w-6 h-6 text-emerald-400" />
             Configurações de E-mail (SMTP)
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-400">Host SMTP</label>
                <input type="text" placeholder="smtp.sendgrid.net" className="w-full bg-[#0A0A0A] border border-gray-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-white outline-none" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-400">Porta</label>
                <input type="text" placeholder="587" className="w-full bg-[#0A0A0A] border border-gray-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-white outline-none" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-400">Usuário</label>
                <input type="text" placeholder="apikey" className="w-full bg-[#0A0A0A] border border-gray-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-white outline-none" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-400">Senha</label>
                <input type="password" placeholder="••••••••••••••••" className="w-full bg-[#0A0A0A] border border-gray-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-white outline-none" />
              </div>
           </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end pt-4">
         <button className="px-8 py-3 bg-white hover:bg-gray-200 text-black font-black rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all">
           Salvar Alterações
         </button>
      </div>

    </div>
  );
}
