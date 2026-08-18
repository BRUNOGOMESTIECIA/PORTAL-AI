import React, { useState, useEffect } from 'react';
import { Tv, ShieldCheck, QrCode, Smartphone, Laptop, CheckCircle2, RefreshCw, Lock } from 'lucide-react';
import { 
  generatePairingCode, 
  createTvPairingRequest, 
  listenTvPairingStatus, 
  TvPairingRequest 
} from '../../lib/tv-device-auth';

interface TvDevicePairingScreenProps {
  onPairedSuccess: () => void;
  panelTitle?: string;
}

export function TvDevicePairingScreen({ onPairedSuccess, panelTitle = 'Videowall Central NOC' }: TvDevicePairingScreenProps) {
  const [pairingData, setPairingData] = useState<{ code: string; formattedCode: string } | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authorizedBy, setAuthorizedBy] = useState('');
  const [loading, setLoading] = useState(true);

  const initPairing = async () => {
    setLoading(true);
    const newCodes = generatePairingCode();
    setPairingData(newCodes);

    try {
      await createTvPairingRequest(newCodes.code, newCodes.formattedCode);
      setLoading(false);
    } catch (e) {
      console.error('Erro ao registrar solicitação de pareamento:', e);
      setLoading(false);
    }
  };

  useEffect(() => {
    initPairing();
  }, []);

  useEffect(() => {
    if (!pairingData?.code) return;

    const unsubscribe = listenTvPairingStatus(
      pairingData.code,
      (data: TvPairingRequest) => {
        setIsAuthorized(true);
        setAuthorizedBy(data.authorizedBy || 'Administrador');
        setTimeout(() => {
          onPairedSuccess();
        }, 2200);
      }
    );

    return () => unsubscribe();
  }, [pairingData?.code, onPairedSuccess]);

  // URL para onde o QR Code aponta
  const currentHost = typeof window !== 'undefined' ? window.location.origin : '';
  const authorizeUrl = `${currentHost}/tv/autorizar?code=${pairingData?.code || ''}`;
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&color=0-0-0&bgcolor=255-255-255&data=${encodeURIComponent(authorizeUrl)}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-8 select-none font-sans overflow-hidden">
      {/* Top Header */}
      <header className="w-full max-w-6xl flex items-center justify-between border-b border-slate-800/80 pb-6 pt-2">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-inner">
            <Tv className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">PORTAL ITSM</h1>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 border border-blue-700/50">
                Modo Smart TV
              </span>
            </div>
            <p className="text-xs text-slate-400">Exibição Contínua 24/7 &bull; {panelTitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-4 py-2 rounded-xl text-xs text-slate-300">
          <Lock className="h-3.5 w-3.5 text-amber-400" />
          <span>Acesso Seguro Restrito &bull; Pareamento Obrigatório</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-5xl my-auto py-8">
        {isAuthorized ? (
          /* Estado de Sucesso Imediato ao Autorizar */
          <div className="flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500 py-12">
            <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 mb-6 shadow-2xl shadow-emerald-500/30 animate-bounce">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <h2 className="text-3xl font-black text-white mb-2">Smart TV Autorizada com Sucesso!</h2>
            <p className="text-slate-300 text-base max-w-md mb-4">
              Dispositivo validado por <strong className="text-emerald-400 font-bold">{authorizedBy}</strong>.
            </p>
            <p className="text-xs text-slate-400 flex items-center gap-2 bg-slate-900/80 px-4 py-2 rounded-full border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Iniciando transmissão do painel NOC em tempo real...
            </p>
          </div>
        ) : (
          /* Estado de Aguardando Pareamento (Estilo Netflix) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-900/70 border border-slate-800/90 rounded-3xl p-8 lg:p-12 shadow-2xl backdrop-blur-sm">
            
            {/* Lado Esquerdo: Instruções e Código Gigante */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
              <div>
                <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20 mb-3">
                  <ShieldCheck className="h-3.5 w-3.5" /> Pareamento Rápido de Dispositivo
                </span>
                <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
                  Autorize esta Smart TV
                </h2>
                <p className="text-slate-300 text-sm mt-2 leading-relaxed">
                  Para liberar a exibição dos chamados e métricas nesta tela, autorize o acesso apontando o celular para o QR Code ou digitando o código abaixo.
                </p>
              </div>

              {/* Caixa de Código em Destaque */}
              <div className="bg-slate-950/90 border-2 border-blue-500/30 rounded-2xl p-6 shadow-inner text-center">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                  Código de Ativação da TV
                </p>
                <div className="text-5xl lg:text-6xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-200 to-blue-400 py-1 font-mono">
                  {loading ? '--- ---' : pairingData?.formattedCode}
                </div>
                <div className="mt-3 flex items-center justify-center gap-2 text-xs text-blue-300/80">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                  <span>Aguardando aprovação do técnico...</span>
                </div>
              </div>

              {/* Passos Rápidos */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3.5 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 text-blue-400 font-bold text-xs">
                    1
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Smartphone className="h-3.5 w-3.5 text-blue-400" /> No Celular
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      Abra a câmera e aponte para o QR Code ao lado.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3.5 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 text-indigo-400 font-bold text-xs">
                    2
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Laptop className="h-3.5 w-3.5 text-indigo-400" /> No Computador
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      Acesse <span className="text-indigo-300 font-mono">/tv/autorizar</span> e digite o código.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Lado Direito: QR Code de Alta Resolução */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center bg-slate-950/80 border border-slate-800/90 rounded-2xl p-6 text-center">
              <div className="relative p-3 bg-white rounded-2xl shadow-2xl border-4 border-white">
                <img 
                  src={qrCodeImageUrl} 
                  alt="QR Code de Pareamento da TV" 
                  className="w-56 h-56 rounded-xl object-contain block"
                />
                <div className="absolute inset-0 border-2 border-blue-500/20 rounded-2xl pointer-events-none" />
              </div>

              <p className="text-xs font-bold text-slate-200 mt-4 flex items-center gap-1.5">
                <QrCode className="h-4 w-4 text-blue-400" /> Aponte a câmera para parear
              </p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs leading-relaxed">
                Você será direcionado para a página de autorização segura da TIÉCIA.
              </p>

              <button
                onClick={initPairing}
                disabled={loading}
                className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg hover:border-slate-700 transition"
              >
                <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                Gerar novo código
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Footer */}
      <footer className="w-full max-w-6xl flex items-center justify-between text-xs text-slate-500 border-t border-slate-900 pt-4">
        <span>🔒 Proteção de Exibição Corporativa &bull; ISO 27001 &bull; TIÉCIA Tecnologia</span>
        <span>A autorização é permanente (24/7) e não desconecta quando o operador sai.</span>
      </footer>
    </div>
  );
}
