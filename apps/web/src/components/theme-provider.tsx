import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, instaPassoDb } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

type Theme = 'light' | 'dark' | 'original';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: 'original',
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'original',
  storageKey = 'vite-ui-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  // OBS-05 FIX: Sincronização da preferência de tema no documento do usuário no Firestore (Banco 1: portal-ai-tiecia)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(instaPassoDb, 'users_sso', firebaseUser.uid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            if (data.preferredTheme && ['light', 'dark', 'original'].includes(data.preferredTheme)) {
              setThemeState(data.preferredTheme as Theme);
              localStorage.setItem(storageKey, data.preferredTheme);
            }
          }
        } catch (e) {
          console.info('[Theme Sync] Usando preferência local de tema.', e);
        }
      }
    });

    return () => unsubscribe();
  }, [storageKey]);

  useEffect(() => {
    const root = window.document.documentElement;

    // Remove old classes and data-theme
    root.classList.remove('light', 'dark');
    root.removeAttribute('data-theme');

    if (theme === 'dark' || theme === 'light') {
      root.classList.add(theme);
    }
    
    // Always set data-theme so globals.css can apply the variables
    root.setAttribute('data-theme', theme);
  }, [theme]);

  const handleSetTheme = async (newTheme: Theme) => {
    localStorage.setItem(storageKey, newTheme);
    setThemeState(newTheme);

    // Persiste no Firestore no perfil do usuário
    if (auth.currentUser) {
      try {
        const userDocRef = doc(instaPassoDb, 'users_sso', auth.currentUser.uid);
        await setDoc(userDocRef, { preferredTheme: newTheme }, { merge: true });
      } catch (e) {
        console.warn('[Theme Sync] Erro ao salvar tema no perfil do Firestore:', e);
      }
    }
  };

  const value = {
    theme,
    setTheme: handleSetTheme,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};
