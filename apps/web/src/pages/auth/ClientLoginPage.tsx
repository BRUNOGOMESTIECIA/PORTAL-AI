import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Mail, HeadphonesIcon, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/use-mock-auth';
import { toast } from 'sonner';
import { MOCK_TENANT_CONFIG } from '../../mocks/data';

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

function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 21 21" className="h-4 w-4 shrink-0" aria-hidden="true">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

export default function ClientLoginPage() {
  const { sendMagicLink, loginWithMagicLink, loginWithSSO } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMockLoading, setIsMockLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState<'google' | 'microsoft' | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await sendMagicLink(email);
      setSent(true);
    } catch {
      toast.error('Não foi possível enviar o link. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMockAccess = async () => {
    setIsMockLoading(true);
    try {
      const user = await loginWithMagicLink(email);
      if (user.type === 'client') {
        navigate('/portal');
      } else {
        toast.error('Conta não autorizada para o portal do cliente.');
      }
    } catch {
      toast.error('E-mail não encontrado nas contas de demonstração.');
    } finally {
      setIsMockLoading(false);
    }
  };

  const handleSSO = async (provider: 'google' | 'microsoft') => {
    setSsoLoading(provider);
    try {
      const user = await loginWithSSO(provider, 'client');
      if (user.type === 'client' || user.type === 'staff') {
        navigate('/portal');
      } else {
        toast.error('Conta não autorizada para o portal do cliente.');
      }
    } catch {
      toast.error('Falha na autenticação. Tente novamente.');
    } finally {
      setSsoLoading(null);
    }
  };

  const anyLoading = isLoading || ssoLoading !== null;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center bg-blue-600 p-12 text-white">
        <HeadphonesIcon className="h-16 w-16 mb-6 opacity-90" />
        <h2 className="text-3xl font-bold mb-3">Central de Suporte</h2>
        <p className="text-blue-100 text-center text-lg max-w-sm">
          Abra chamados, acompanhe atendimentos e acesse nossa base de conhecimento.
        </p>
        <div className="mt-10 space-y-4 w-full max-w-xs">
          {[
            { icon: '⚡', text: 'Respostas rápidas com IA' },
            { icon: '📋', text: 'Acompanhe seus chamados em tempo real' },
            { icon: '💬', text: 'Chat direto com nossa equipe' },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3 text-blue-100">
              <span className="text-xl">{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <HeadphonesIcon className="h-7 w-7 text-blue-600" />
            <span className="text-xl font-bold text-slate-800">Central de Suporte</span>
          </div>

          {!sent ? (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Bem-vindo de volta</h1>
                <p className="mt-1 text-slate-500">Escolha como deseja acessar o portal</p>
              </div>

              {/* Google — destaque */}
              {MOCK_TENANT_CONFIG.sso.google && (
                <button
                  onClick={() => handleSSO('google')}
                  disabled={anyLoading}
                  className="w-full flex items-center justify-center gap-3 rounded-xl bg-white border-2 border-blue-200 py-3 text-sm font-semibold text-slate-700 hover:border-blue-400 hover:bg-blue-50 disabled:opacity-50 transition-all shadow-sm"
                >
                  {ssoLoading === 'google' ? (
                    <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                  ) : (
                    <GoogleIcon />
                  )}
                  Entrar com Google Workspace
                </button>
              )}

              {/* Microsoft — secundário */}
              {MOCK_TENANT_CONFIG.sso.microsoft && (
                <button
                  onClick={() => handleSSO('microsoft')}
                  disabled={anyLoading}
                  className="mt-3 w-full flex items-center justify-center gap-3 rounded-xl bg-white border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50 transition-all"
                >
                  {ssoLoading === 'microsoft' ? (
                    <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                  ) : (
                    <MicrosoftIcon />
                  )}
                  Entrar com Microsoft
                </button>
              )}

              {/* Divider */}
              <div className="my-6 flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400 font-medium">ou receba um link por e-mail</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Magic link */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="voce@suaempresa.com.br" required
                    className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <button
                  type="submit" disabled={anyLoading}
                  className="w-full rounded-lg bg-slate-700 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enviar link de acesso'}
                </button>
              </form>

              <div className="mt-5 p-3 rounded-lg bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-500 mb-1 font-medium">Contas de demonstração (magic link):</p>
                <p className="text-xs text-slate-600 font-mono">joao.silva@clienteabc.com.br</p>
                <p className="text-xs text-slate-600 font-mono">maria.santos@clienteabc.com.br</p>
              </div>
            </>
          ) : (
            <>
              <div className="mb-8">
                <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                  <Mail className="h-7 w-7 text-blue-600" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Verifique seu e-mail</h1>
                <p className="mt-2 text-slate-500">
                  Enviamos um link de acesso para <span className="font-medium text-slate-700">{email}</span>.
                  O link expira em 15 minutos.
                </p>
              </div>

              <p className="text-xs text-slate-400 mb-6">
                Não recebeu? Verifique a pasta de spam ou{' '}
                <button onClick={() => setSent(false)} className="text-blue-600 hover:underline">
                  tente outro e-mail
                </button>.
              </p>

              {/* Dev shortcut */}
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-xs text-amber-700 font-medium mb-2">Modo desenvolvimento</p>
                <button
                  onClick={handleMockAccess}
                  disabled={isMockLoading}
                  className="w-full rounded-lg bg-amber-500 py-2 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {isMockLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Simular clique no link'}
                </button>
              </div>

              <button
                onClick={() => setSent(false)}
                className="mt-6 flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Voltar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
