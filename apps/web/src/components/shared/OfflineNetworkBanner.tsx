import React, { useState, useEffect } from 'react';
import { WifiOff, Database, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getOfflineSyncStatus, subscribeToNetworkStatus, flushOfflineMutations, OfflineSyncStatus } from '../../lib/pwa-offline-sync';
import { toast } from 'sonner';

/**
 * 📶 Banner do Item 022: Alerta de Rede e Modo Offline no Topo do Portal
 */
export function OfflineNetworkBanner() {
  const [status, setStatus] = useState<OfflineSyncStatus>(getOfflineSyncStatus());
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToNetworkStatus((newStatus) => {
      setStatus(newStatus);
    });
    return () => unsubscribe();
  }, []);

  if (status.isOnline) return null;

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      const res = await flushOfflineMutations();
      setIsSyncing(false);
      toast.success(`${res.syncedCount} ações offline sincronizadas com sucesso!`);
    } catch (e) {
      setIsSyncing(false);
      toast.error('Erro ao sincronizar mutações offline.');
    }
  };

  return (
    <div className="bg-amber-500 text-slate-950 px-4 py-2 flex items-center justify-between text-xs font-bold shadow-md animate-in slide-in-from-top duration-300 z-40 border-b border-amber-600">
      <div className="flex items-center gap-2">
        <div className="p-1 bg-slate-950/20 rounded-md">
          <WifiOff className="w-4 h-4 text-slate-950" />
        </div>
        <div>
          <span>🟡 MODO OFFLINE ATIVO (Cache IndexedDB)</span>
          <span className="ml-2 text-[11px] font-normal opacity-90">
            Você está desconectado. {status.pendingQueueCount} ação(ões) salvas em cache local para envio automático.
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {status.pendingQueueCount > 0 && (
          <button
            onClick={handleSyncNow}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-950 hover:bg-slate-900 text-amber-400 font-extrabold rounded-lg text-xs transition-all shadow cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            Sincronizar Fila ({status.pendingQueueCount})
          </button>
        )}
      </div>
    </div>
  );
}
