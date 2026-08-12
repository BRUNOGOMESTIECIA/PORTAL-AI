import React from 'react';
import { useMotionPreference } from '../../hooks/use-motion-preference';

interface PageTransitionWrapperProps {
  children: React.ReactNode;
  className?: string;
  keyName?: string;
}

/**
 * 🎬 Wrapper de Transição de Tela para o Item 094
 * Aplica animação fluída de entrada/troca de rota respeitando o perfil de movimento.
 */
export function PageTransitionWrapper({ children, className = '', keyName }: PageTransitionWrapperProps) {
  const { getPageTransitionClass } = useMotionPreference();
  const transitionClass = getPageTransitionClass();

  return (
    <div key={keyName} className={`w-full flex-1 flex flex-col ${transitionClass} ${className}`}>
      {children}
    </div>
  );
}
