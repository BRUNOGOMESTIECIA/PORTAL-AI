/// <reference types="vite-plugin-pwa/client" />
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Providers } from './app/providers';
import { AppRouter } from './app/router';
import './styles/globals.css';
import { registerSW } from 'virtual:pwa-register';

// Registra o Service Worker para cache offline e sincronização automática
const updateSW = registerSW({
  onNeedRefresh() {
    updateSW(true);
  },
  onOfflineReady() {},
});

// Limpa flag de erro de chunk quando a aplicação carrega com sucesso
sessionStorage.removeItem('chunk_reload_attempt');

// Trata automaticamente erros de módulos desatualizados após um novo deploy na Vercel (404 nos chunks antigos)
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && (
    event.reason.message?.includes('Failed to fetch dynamically imported module') ||
    event.reason.name === 'ChunkLoadError' ||
    String(event.reason).includes('dynamically imported module')
  )) {
    event.preventDefault();
    console.warn('[Vercel Deploy] Módulo desatualizado detectado. Recarregando versão atualizada...');
    window.location.reload();
  }
});

// 🛡️ Bloqueio Avançado de Inspeção de Código e DevTools (Item 084 / BUG-13 FIX)
if (import.meta.env.PROD || import.meta.env.VITE_ENABLE_DEVTOOLS_BLOCKER === 'true') {
  // 1. Bloqueia botão direito e atalhos de teclado (F12, Ctrl+Shift+I/J/C, Ctrl+U, Cmd+Opt+I)
  document.addEventListener('contextmenu', (e) => e.preventDefault());
  document.addEventListener('keydown', (e) => {
    if (e.key === 'F12') e.preventDefault();
    if (e.ctrlKey && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) e.preventDefault();
    if (e.ctrlKey && ['U', 'u', 'S', 's'].includes(e.key)) e.preventDefault();
    if (e.metaKey && e.altKey && ['I', 'i', 'J', 'j', 'U', 'u', 'C', 'c'].includes(e.key)) e.preventDefault();
  });

  // 2. BUG-13 FIX: Detecção contínua de abertura via Menu do Navegador ou janela destacada
  let isDevToolsDetected = false;

  const checkDevToolsDeltas = () => {
    const widthThreshold = window.outerWidth - window.innerWidth > 160;
    const heightThreshold = window.outerHeight - window.innerHeight > 160;
    
    if (widthThreshold || heightThreshold) {
      if (!isDevToolsDetected) {
        isDevToolsDetected = true;
        console.warn('[Security] DevTools detectado por inspeção de dimensões.');
      }
    }
  };

  // Check por armadilha de tempo no debugger
  const checkDebuggerTiming = () => {
    const start = performance.now();
    try {
      const fn = new Function('debugger');
      fn();
    } catch (e) {}
    const end = performance.now();
    if (end - start > 100) {
      if (!isDevToolsDetected) {
        isDevToolsDetected = true;
        console.warn('[Security] DevTools detectado por atraso no debugger.');
      }
    }
  };

  window.addEventListener('resize', checkDevToolsDeltas);
  setInterval(checkDebuggerTiming, 2000);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Providers>
      <AppRouter />
    </Providers>
  </React.StrictMode>,
);
