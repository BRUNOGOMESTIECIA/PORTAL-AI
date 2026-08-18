import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Tv, ShieldCheck, CheckCircle2, Loader2, ArrowLeft, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../../../hooks/use-mock-auth';
import { authorizeTvDevice } from '../../../../lib/tv-device-auth';

export default function TvAuthorizePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loginWithSSO, isLoading: isAuthLoading } = useAuth();

  const codeParam = searchParams.get('code') || '';
  const [code, setCode] = useState(codeParam.replace(/\D/g, ''));
  const [deviceName, setDeviceName] = useState('Smart TV Videowall NOC (Sala de Operações)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [ssoLoading, setSsoLoading] = useState(false);

  useEffect(() => {
    if (codeParam) {
      setCode(codeParam.replace(/\D/g, ''));
    }
  }, [codeParam]);

  const handleAuthorize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length < 6) {
      toast.error('Informe um código de 6 dígitos válido.');
      return;
    }

    if (!user || user.type !== 'staff') {
      toast.error('Você precisa estar logado com sua conta corporativa para autorizar a TV.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authorizeTvDevice(
        code,
        { name: user.name, email: user.email },
        deviceName
      );

      if (res.success) {
        setIsSuccess(true);
        toast.success(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || 'Erro ao autorizar Smart TV.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setSsoLoading(true);
    try {
      await loginWithSSO('google', 'staff');
      toast.success('Login efetuado com sucesso!');
    } catch (err: any) {
      toast.error(err.message || 'Falha no login Google SSO.');
    } finally {
      setSsoLoading(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3 shadow-inner">
            <Tv className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold text-white">Autorizar Smart TV</h1>
          <p className="text-xs text-slate-400 mt-1">
            Pareamento de Videowall / Central de Monitoramento NOC
          </p>
        </div>

        {/* Caso o usuário ainda não esteja logado */}
        {!user || user.type !== 'staff' ? (
          <div className="space-y-4 text-center">
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 leading-relaxed">
              <Lock className="h-4 w-4 text-amber-400 mx-auto mb-1.5" />
              Apenas membros autorizados da equipe de TI (<strong>@tiecia.com.br</strong>) podem liberar novos dispositivos de exibição.
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={ssoLoading}
              className="w-full flex items-center justify-center gap-3 rounded-xl bg-blue-600 hover:bg-blue-500 py-3.5 text-sm font-bold text-white transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
            >
              {ssoLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ShieldCheck className="h-5 w-5" />
              )}
              Entrar com Google para Autorizar TV
            </button>
          </div>
        ) : isSuccess ? (
          /* Sucesso ao Autorizar */
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 mx-auto animate-bounce">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">TV Autorizada com Sucesso!</h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                A tela da Smart TV já desbloqueou automaticamente e está transmitindo os dados em tempo real.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-left text-xs space-y-1.5">
              <p className="text-slate-400"><strong>Dispositivo:</strong> {deviceName}</p>
              <p className="text-slate-400"><strong>Código:</strong> {code.slice(0, 3)}-{code.slice(3)}</p>
              <p className="text-slate-400"><strong>Autorizado por:</strong> {user.name} ({user.email})</p>
            </div>

            <button
              onClick={() => navigate('/operacional/app/dashboard')}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-white transition"
            >
              Ir para o Painel Operacional
            </button>
          </div>
        ) : (
          /* Formulário de Autorização */
          <form onSubmit={handleAuthorize} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Código de 6 dígitos exibido na TV:
              </label>
              <input
                type="text"
                maxLength={7}
                value={code.length > 3 && !code.includes('-') ? `${code.slice(0, 3)}-${code.slice(3)}` : code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="Ex: 834-192"
                className="w-full text-center text-2xl font-black font-mono tracking-widest bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-4 py-3 text-white outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nome de identificação desta TV:
              </label>
              <input
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                className="w-full text-sm bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !code || code.length < 6}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3.5 text-sm font-bold text-white transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <ShieldCheck className="h-5 w-5" />
                )}
                Autorizar Exibição Contínua (24/7)
              </button>
            </div>

            <div className="pt-2 text-center">
              <p className="text-[11px] text-slate-500">
                Logado como: <strong>{user.name}</strong> ({user.email})
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
