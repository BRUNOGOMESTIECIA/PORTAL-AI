"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // mock redirect
    window.location.href = "/admin";
  };

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500">
      <div className="mb-10 text-center lg:text-left">
        <h2 className="text-3xl font-extrabold text-white mb-2">Bem-vindo de volta</h2>
        <p className="text-gray-400">Faça login para gerenciar seu portal de atendimento.</p>
      </div>

      {/* Google Auth Button */}
      <button className="w-full mb-6 bg-[#111111] hover:bg-gray-900 border border-gray-700 hover:border-gray-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-all">
         <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            <path fill="none" d="M1 1h22v22H1z" />
         </svg>
         Entrar com Google
      </button>

      <div className="flex items-center my-6">
         <div className="flex-grow border-t border-gray-800"></div>
         <span className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ou entre com e-mail</span>
         <div className="flex-grow border-t border-gray-800"></div>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">E-mail corporativo</label>
          <input 
            type="email" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#111111] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" 
            placeholder="nome@suaempresa.com"
          />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
             <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Senha</label>
             <Link href="/auth/forgot-password" className="text-xs font-bold text-blue-500 hover:text-blue-400 transition-colors">
               Esqueceu a senha?
             </Link>
          </div>
          <input 
            type="password" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#111111] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" 
            placeholder="••••••••"
          />
        </div>

        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl transition-colors mt-4 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
           Acessar Painel
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-500 font-medium">
        Sua empresa ainda não tem conta? <Link href="/auth/register" className="text-blue-500 hover:text-blue-400 font-bold transition-colors">Cadastre-se</Link>
      </p>
    </div>
  );
}
