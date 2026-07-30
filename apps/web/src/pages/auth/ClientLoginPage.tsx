import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, HeadphonesIcon } from 'lucide-react';
import { useAuth } from '../../hooks/use-mock-auth';
import { toast } from 'sonner';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export default function ClientLoginPage() {
  const { loginWithSSO } = useAuth();
  const navigate = useNavigate();
  const [ssoLoading, setSsoLoading] = useState(false);

  const handleSSO = async () => {
    setSsoLoading(true);
    try {
      const user = await loginWithSSO('google', 'client');
      if (user.type === 'client' || user.type === 'staff') {
        navigate('/portal');
      } else {
        toast.error('Conta não autorizada para o portal do cliente.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Falha na autenticação. Tente novamente.');
    } finally {
      setSsoLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center bg-blue-600 p-12 text-white">
        <HeadphonesIcon className="h-16 w-16 mb-6 opacity-90" />
        <h2 className="text-3xl font-bold mb-3">Central de Suporte</h2>
        <p className="text-blue-100 text-center text-lg max-w-sm">
          Acesso Exclusivo para Clientes Corporativos.
        </p>
      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Bem-vindo de volta</h1>
            <p className="mt-1 text-slate-500">Acesse o Portal do Cliente de forma segura</p>
          </div>

          <button
            onClick={handleSSO}
            disabled={ssoLoading}
            className="w-full flex items-center justify-center gap-3 rounded-xl bg-white border-2 border-blue-200 py-3 text-sm font-semibold text-slate-700 hover:border-blue-400 hover:bg-blue-50 disabled:opacity-50 transition-all shadow-sm"
          >
            {ssoLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            ) : (
              <GoogleIcon />
            )}
            Entrar com Google (Portal Cliente)
          </button>

          {/* Aviso de Privacidade LGPD (Art. 7º & Art. 6º) */}
          <div className="mt-8 pt-4 border-t border-slate-200 text-center">
            <p className="text-[11px] text-slate-500 leading-relaxed">
              🔒 <strong>Aviso de Privacidade LGPD (Lei 13.709/18):</strong> Ao acessar, seu endereço IP e registros de conexão são coletados com segurança para fins de auditoria e cumprimento contratual (Art. 7º, V e IX).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
