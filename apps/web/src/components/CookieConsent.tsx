import { useEffect, useState } from 'react';
import { ShieldAlert, X } from 'lucide-react';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('portal_lgpd_consent');
    if (!consent) {
      // Pequeno atraso para animação suave ao entrar
      setTimeout(() => setIsVisible(true), 1500);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('portal_lgpd_consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:bottom-8 md:w-[400px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl p-5 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-500">
      <button 
        onClick={() => setIsVisible(false)} 
        className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
      >
        <X className="w-4 h-4" />
      </button>
      
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Privacidade e Cookies</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-3 leading-relaxed">
            Nós utilizamos cookies e tecnologias semelhantes para melhorar sua experiência. Ao continuar navegando, você concorda com nossa Política de Privacidade.
          </p>
          <div className="flex gap-2">
            <button 
              onClick={handleAccept}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Concordar e Fechar
            </button>
            <button 
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Saiba mais
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
