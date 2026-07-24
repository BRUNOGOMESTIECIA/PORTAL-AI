"use client";

import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500">
      <div className="mb-10 text-center lg:text-left">
        <h2 className="text-3xl font-extrabold text-white mb-2">Esqueceu a senha?</h2>
        <p className="text-gray-400">Não se preocupe, enviaremos as instruções de recuperação para o seu e-mail.</p>
      </div>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">E-mail cadastrado</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#111111] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" 
              placeholder="nome@suaempresa.com"
            />
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl transition-colors mt-4 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
             Enviar link de recuperação
          </button>
        </form>
      ) : (
        <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-2xl text-center">
           <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
           </div>
           <h3 className="text-lg font-bold text-white mb-2">E-mail enviado!</h3>
           <p className="text-sm text-gray-400">
             Se o e-mail <strong>{email}</strong> estiver cadastrado em nossa base, você receberá um link em instantes.
           </p>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href="/auth/login" className="text-sm font-bold text-gray-500 hover:text-white transition-colors flex items-center justify-center gap-2">
           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
           </svg>
           Voltar para o Login
        </Link>
      </div>
    </div>
  );
}
