import { useEffect } from 'react';
import { useAuth } from '../hooks/use-mock-auth';

// 15 minutos em milissegundos
const INACTIVITY_LIMIT = 15 * 60 * 1000;

export function InactivityTracker() {
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        logout();
        alert('Sua sessão expirou por inatividade para sua segurança.');
      }, INACTIVITY_LIMIT);
    };

    // Eventos que indicam atividade do usuário
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];

    const handleActivity = () => resetTimer();

    events.forEach(event => document.addEventListener(event, handleActivity));
    resetTimer(); // Inicia o timer

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => document.removeEventListener(event, handleActivity));
    };
  }, [isAuthenticated, logout]);

  return null;
}
