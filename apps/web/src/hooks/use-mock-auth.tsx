import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { toast } from 'sonner';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  type: 'client' | 'staff';
  role?: 'Administrator' | 'Technician' | 'Agent';
  department?: string;
  permissions?: string[];
}

interface AuthContextValue {
  user: AppUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AppUser>;
  loginWithSSO: (provider: 'google' | 'microsoft', userType: 'client' | 'staff') => Promise<AppUser>;
  sendMagicLink: (email: string) => Promise<void>;
  loginWithMagicLink: (email: string) => Promise<AppUser>;
  logout: () => void;
  hasPermission: (code: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const docRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setUser({ id: firebaseUser.uid, ...docSnap.data() } as AppUser);
          } else {
            // Conta nova! Cria como Admin para o primeiro acesso
            const newUser: AppUser = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Novo Usuário',
              type: 'staff',
              role: 'Administrator',
              department: 'Administração',
              permissions: ['chat.attend', 'chat.view', 'tickets.view', 'admin.users', 'admin.settings', 'kb.view', 'catalog.view', 'reports.view']
            };
            await setDoc(docRef, newUser);
            setUser(newUser);
            toast.success('Primeiro acesso! Conta de Administrador criada com sucesso.');
          }
        } catch (error) {
          console.error("Erro ao carregar usuário:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AppUser> => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const docRef = doc(db, 'users', cred.user.uid);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error('Usuário não encontrado no banco.');
    return { id: cred.user.uid, ...docSnap.data() } as AppUser;
  }, []);

  const sendMagicLink = useCallback(async (email: string): Promise<void> => {
    const actionCodeSettings = {
      url: window.location.origin + '/cliente/login',
      handleCodeInApp: true,
    };
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    window.localStorage.setItem('emailForSignIn', email);
  }, []);

  const loginWithMagicLink = useCallback(async (email: string): Promise<AppUser> => {
    // Para simplificar a demonstração e desenvolvimento sem e-mail de verdade
    // Vamos apenas criar ou logar o usuário com uma senha fixa
    const mockPassword = "Portal123@Client";
    try {
      const cred = await signInWithEmailAndPassword(auth, email, mockPassword);
      const docRef = doc(db, 'users', cred.user.uid);
      const docSnap = await getDoc(docRef);
      return { id: cred.user.uid, ...docSnap.data() } as AppUser;
    } catch {
      // Se não existir, a gente tenta criar (como se fosse o magic link cadastrando ele)
      const { createUserWithEmailAndPassword } = await import('firebase/auth');
      const cred = await createUserWithEmailAndPassword(auth, email, mockPassword);
      const newUser: AppUser = {
        id: cred.user.uid,
        email: email,
        name: email.split('@')[0],
        type: 'client'
      };
      await setDoc(doc(db, 'users', cred.user.uid), newUser);
      return newUser;
    }
  }, []);

  const loginWithSSO = useCallback(async (provider: 'google' | 'microsoft', userType: 'client' | 'staff'): Promise<AppUser> => {
    if (provider === 'google') {
      const googleProvider = new GoogleAuthProvider();
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });
      const cred = await signInWithPopup(auth, googleProvider);
      const idToken = await cred.user.getIdToken();

      // Consultar o Sistema Manhattan para validar a autorização (Zero-Trust)
      const res = await fetch('https://sistema-manhattan.vercel.app/api/v1/autorizar', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({
              ipOrigem: 'IP_Navegador',
              sistemaOrigem: navigator.userAgent
          })
      });
      
      const data = await res.json();

      if (res.ok && data.autorizado) {
        // Wait for onAuthStateChanged to load the document, but return a temporary object to satisfy the Promise
        const docRef = doc(db, 'users', cred.user.uid);
        const docSnap = await getDoc(docRef);
        
        // Define o tipo com base no retorno da API ou usa o solicitado pela tela
        const finalType = data.usuario?.tipo || userType;

        if (docSnap.exists()) {
          return { id: cred.user.uid, ...docSnap.data() } as AppUser;
        } else {
          const newUser: AppUser = {
            id: cred.user.uid,
            email: cred.user.email || '',
            name: data.usuario?.nome || cred.user.displayName || cred.user.email?.split('@')[0] || 'Usuário',
            type: finalType,
            ...(finalType === 'staff' ? { role: 'Administrator', permissions: ['chat.attend', 'chat.view', 'tickets.view', 'admin.users', 'admin.settings'] } : {})
          };
          await setDoc(docRef, newUser);
          return newUser;
        }
      } else {
        await signOut(auth);
        throw new Error(data.mensagem || 'Acesso bloqueado pelo Sistema Manhattan.');
      }
    }
    throw new Error('Provedor SSO não suportado ainda.');
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  const hasPermission = useCallback((code: string) => {
    if (!user || user.type !== 'staff') return false;
    if (user.role === 'Administrator') return true;
    return user.permissions?.includes(code) || false;
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, loginWithSSO, sendMagicLink, loginWithMagicLink, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
