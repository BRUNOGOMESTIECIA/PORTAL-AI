import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../hooks/use-mock-auth';
import { toast } from 'sonner';
import { MOCK_TENANT_CONFIG } from '../../mocks/data';

// Em produção virá da config do tenant (portal_master.tenants.sso_allowed_domains)
const ALLOWED_DOMAIN = 'tiecia.com.br';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 21 21" className="h-4 w-4" aria-hidden="true">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

export default function OperationalLoginPage() {
  const { loginWithSSO } = useAuth();
  const navigate = useNavigate();
  const [ssoLoading, setSsoLoading] = useState<'google' | 'microsoft' | null>(null);

  const handleSSO = async (provider: 'google' | 'microsoft') => {
    setSsoLoading(provider);
    try {
      const user = await loginWithSSO(provider, 'staff');
      if (user.type === 'staff') {
        navigate('/operacional/app/dashboard');
      } else {
        toast.error('Conta não autorizada para o portal operacional.');
      }
    } catch (error: any) {
      console.error("SSO Login Error:", error);
      toast.error(error.message || 'Falha na autenticação. Tente novamente.');
    } finally {
      setSsoLoading(null);
    }
  };

  const anyLoading = ssoLoading !== null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 mb-4">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Portal Operacional</h1>
          <p className="mt-1 text-sm text-slate-400">Área restrita — equipe de TI</p>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-xl space-y-4">
          {MOCK_TENANT_CONFIG.sso.google && (
            <button
              onClick={() => handleSSO('google')}
              disabled={anyLoading}
              className="w-full flex items-center justify-center gap-3 rounded-lg border border-slate-600 bg-white py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              {ssoLoading === 'google' ? (
                <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
              ) : (
                <GoogleIcon />
              )}
              Entrar com Google Workspace
            </button>
          )}

          {MOCK_TENANT_CONFIG.sso.microsoft && (
            <button
              onClick={() => handleSSO('microsoft')}
              disabled={anyLoading}
              className="w-full flex items-center justify-center gap-3 rounded-lg border border-slate-600 bg-white py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              {ssoLoading === 'microsoft' ? (
                <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
              ) : (
                <MicrosoftIcon />
              )}
              Entrar com Microsoft Entra
            </button>
          )}

          <p className="text-center text-xs text-slate-500">
            Somente contas{' '}
            <span className="font-medium text-slate-400">@{ALLOWED_DOMAIN}</span>{' '}
            são autorizadas
          </p>

          <div className="pt-1 p-3 rounded-lg bg-slate-700/50 border border-slate-600">
            <p className="text-xs text-slate-400 font-medium">Mock — simula login como:</p>
            <p className="text-xs text-slate-300 font-mono mt-1">admin@demo.com (Administrator)</p>
          </div>
        </div>

        <div className="mt-5 text-center">
          <a href="/cliente" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">
            ← Voltar ao portal do cliente
          </a>
        </div>
      </div>
    </div>
  );
}
