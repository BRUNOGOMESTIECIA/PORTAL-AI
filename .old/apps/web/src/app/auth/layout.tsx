export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050505] flex selection:bg-blue-500/30">
      {/* Left side: branding/art */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0A0A0A] border-r border-gray-800 items-center justify-center overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none"
             style={{ background: 'radial-gradient(circle at top left, #3b82f6 0%, transparent 60%)' }}></div>
        <div className="absolute bottom-0 right-0 w-full h-full opacity-20 pointer-events-none"
             style={{ background: 'radial-gradient(circle at bottom right, #8b5cf6 0%, transparent 60%)' }}></div>
        
        {/* Glass Card in the middle */}
        <div className="relative z-10 max-w-lg p-10 bg-[#111111]/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl shadow-2xl">
           <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-xl mb-8 flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
           </div>
           <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">O futuro do suporte técnico.</h1>
           <p className="text-lg text-gray-400 leading-relaxed">
             Um portal de autoatendimento inteligente, integrado ao TiFlux, com Inteligência Artificial para encantar seus clientes e reduzir sua fila de chamados.
           </p>
           
           <div className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-3">
                 <div className="w-10 h-10 rounded-full border-2 border-[#111111] bg-gray-700"></div>
                 <div className="w-10 h-10 rounded-full border-2 border-[#111111] bg-gray-600"></div>
                 <div className="w-10 h-10 rounded-full border-2 border-[#111111] bg-gray-500"></div>
              </div>
              <p className="text-sm font-semibold text-gray-400">Junte-se a milhares de empresas.</p>
           </div>
        </div>
      </div>

      {/* Right side: form area */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
           {children}
        </div>
      </div>
    </div>
  );
}
