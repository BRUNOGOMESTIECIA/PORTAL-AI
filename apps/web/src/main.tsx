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

// Bloqueio de Inspeção de Código (Global)
document.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('keydown', (e) => {
  // Bloquear F12
  if (e.key === 'F12') e.preventDefault();
  
  // Bloquear Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
  if (e.ctrlKey && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) {
    e.preventDefault();
  }
  
  // Bloquear Ctrl+U (Ver código-fonte)
  if (e.ctrlKey && ['U', 'u'].includes(e.key)) {
    e.preventDefault();
  }
  
  // Bloquear atalhos do Mac (Cmd+Option+I/J/U)
  if (e.metaKey && e.altKey && ['I', 'i', 'J', 'j', 'U', 'u', 'C', 'c'].includes(e.key)) {
    e.preventDefault();
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Providers>
      <AppRouter />
    </Providers>
  </React.StrictMode>,
);
