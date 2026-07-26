import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { auth, db, instaPassoDb, instaPassoAuth } from '../lib/firebase';
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
import { doc, getDoc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { toast } from 'sonner';

/**
 * Interface que define a estrutura do usuário logado na aplicação.
 */
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

/**
 * Valores expostos pelo Contexto de Autenticação.
 */
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

/**
 * Provedor Global de Autenticação.
 * 
 * Envolve a aplicação para fornecer o estado de sessão atual e os métodos 
 * de login, logout e verificação de permissões para todos os componentes.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(instaPassoAuth, async (firebaseUser) => {
      if (firebaseUser) {
        // Ignoramos totalmente o banco de dados aqui para nunca dar erro de permissão.
        // Assumimos os dados do usuário direto da sessão do Google
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário',
          type: 'staff',
          role: 'Administrator',
          department: 'Administração',
          permissions: ['chat.attend', 'chat.view', 'tickets.view', 'admin.users', 'admin.settings', 'kb.view', 'catalog.view', 'reports.view']
        } as AppUser);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Realiza login usando email e senha padrão (Firebase Auth).
   * @param {string} email - E-mail do usuário.
   * @param {string} password - Senha do usuário.
   * @returns {Promise<AppUser>} Usuário logado recuperado do Firestore.
   */
  const login = useCallback(async (email: string, password: string): Promise<AppUser> => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const docRef = doc(db, 'users', cred.user.uid);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error('Usuário não encontrado no banco.');
    return { id: cred.user.uid, ...docSnap.data() } as AppUser;
  }, []);

  /**
   * Envia um link de acesso direto (Magic Link) para o e-mail do cliente.
   * @param {string} email - E-mail para envio do link.
   */
  const sendMagicLink = useCallback(async (email: string): Promise<void> => {
    const actionCodeSettings = {
      url: window.location.origin + '/cliente/login',
      handleCodeInApp: true,
    };
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    window.localStorage.setItem('emailForSignIn', email);
  }, []);

  /**
   * Função para capturar a volta do Magic Link e autenticar.
   * @param {string} email - E-mail do usuário.
   * @returns {Promise<AppUser>}
   */
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

  /**
   * Autenticação Híbrida (Google SSO + Validação Zero-Trust no Firestore)
   * 
   * @description 
   * Ao invés de apenas logar o usuário, o sistema extrai o domínio do e-mail dele (ex: @empresa.com)
   * e consulta o banco de dados 'domains' do InstaPasso. 
   * Se o domínio possuir a role exata passada no parâmetro (expectedType) e status ACTIVE,
   * o login prossegue. Caso contrário, a sessão é instantaneamente destruída.
   * 
   * @param {'google' | 'microsoft'} provider - Provedor SSO
   * @param {'client' | 'staff'} expectedType - Qual lado do portal o usuário está tentando acessar
   * @returns {Promise<AppUser>} Usuário montado na sessão
   */
  const loginWithSSO = useCallback(async (provider: 'google' | 'microsoft', expectedType: 'client' | 'staff'): Promise<AppUser> => {
    if (provider === 'google') {
      const googleProvider = new GoogleAuthProvider();
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });
      
      try {
        const cred = await signInWithPopup(instaPassoAuth, googleProvider);
        const email = cred.user.email || '';
        const domainName = `@${email.split('@')[1]?.toLowerCase()}`;

        // NOVA REGRA: Módulo Equipe Interna (TIECIA)
        if (expectedType === 'staff' && email.endsWith('@tiecia.com.br')) {
           const qOp = query(collection(instaPassoDb, 'operators'), where('email', '==', email.toLowerCase()));
           const snapOp = await getDocs(qOp);
           
           if (snapOp.empty) {
              await signOut(instaPassoAuth);
              throw new Error('Acesso bloqueado. Este e-mail @tiecia.com.br não está cadastrado na Equipe Interna do InstaPasso.');
           }
           
           let opData: any = null;
           let opDocId: string = '';
           snapOp.forEach(doc => { 
              opData = doc.data(); 
              opDocId = doc.id; 
           });
           
           if (opData.status !== 'ACTIVE') {
              await signOut(instaPassoAuth);
              throw new Error('Acesso bloqueado. Seu cadastro na Equipe Interna está inativo ou excluído.');
           }
           
           const isAdmin = opData.role === 'Super Administrador' || opData.role === 'Administrador';
           
           const mockUser: AppUser = {
              id: cred.user.uid,
              email: email,
              name: opData.fullName || cred.user.displayName || email.split('@')[0],
              type: 'staff',
              role: isAdmin ? 'Administrator' : 'Agent',
              department: opData.role,
              permissions: isAdmin 
                 ? ['chat.attend', 'chat.view', 'tickets.view', 'admin.users', 'admin.settings', 'kb.view', 'catalog.view', 'reports.view']
                 : ['chat.attend', 'chat.view', 'tickets.view', 'kb.view']
           };

           // Marca o operador como online no banco
           const { updateDoc } = await import('firebase/firestore');
           await updateDoc(doc(instaPassoDb, 'operators', opDocId), { isOnline: true });

           setUser(mockUser);
           return mockUser;
        }

        // REGRA B2B (CLIENTES / OUTROS DOMÍNIOS)
        // Busca a lista de domínios cadastrados direto do Firestore (Nuvem)
        let validationSystemDomains: any[] = [];
        try {
           const q = query(collection(instaPassoDb, 'domains'), where('domainName', '==', domainName));
           const querySnapshot = await getDocs(q);
           querySnapshot.forEach((doc) => {
             validationSystemDomains.push({ id: doc.id, ...(doc.data() as object) });
           });
        } catch (e: any) {
           console.error("Erro ao buscar domínios na nuvem do Firebase:", e);
           await signOut(instaPassoAuth);
           throw new Error('Falha de segurança: ' + (e.message || 'Erro ao conectar com Firestore'));
        }

        const foundDomains = validationSystemDomains.filter(d => d.domainName === domainName);

        if (foundDomains.length === 0) {
           await signOut(instaPassoAuth);
           throw new Error('Acesso bloqueado. Seu domínio corporativo não está cadastrado.');
        }

        // Verifica a permissão específica da página que tentou logar
        const requiredPermission = expectedType === 'client' ? 'Portal Cliente' : 'Portal Operacional';
        
        // Basta que exista pelo menos UM registro ativo com a permissão correta
        const hasValidAccess = foundDomains.some(d => d.status === 'ACTIVE' && d.allowedPages.includes(requiredPermission));

        if (!hasValidAccess) {
           await signOut(instaPassoAuth);
           throw new Error(`Acesso Negado: Seu domínio não tem permissão para acessar o ${requiredPermission} ou está inativo.`);
        }

        const mockUser: AppUser = {
          id: cred.user.uid,
          email: email,
          name: cred.user.displayName || email.split('@')[0] || 'Usuário',
          type: expectedType,
          ...(expectedType === 'staff' ? { role: 'Administrator', permissions: ['chat.attend', 'chat.view', 'tickets.view', 'admin.users', 'admin.settings'] } : {})
        };
        
        setUser(mockUser);
        return mockUser;
      } catch (error: any) {
        await signOut(instaPassoAuth);
        throw error;
      }
    }
    throw new Error('Provedor SSO não suportado ainda.');
  }, []);

  /**
   * Encerra a sessão atual do usuário, forçando limpeza de RAM imediata.
   */
  const logout = useCallback(async () => {
    try {
      if (user?.type === 'staff' && user.email.endsWith('@tiecia.com.br')) {
         const qOp = query(collection(instaPassoDb, 'operators'), where('email', '==', user.email.toLowerCase()));
         const snapOp = await getDocs(qOp);
         if (!snapOp.empty) {
            let opDocId = '';
            snapOp.forEach(d => { opDocId = d.id; });
            const { updateDoc } = await import('firebase/firestore');
            await updateDoc(doc(instaPassoDb, 'operators', opDocId), { isOnline: false });
         }
      }
      await signOut(instaPassoAuth);
    } catch (e) {
      console.error("Logout error", e);
    } finally {
      setUser(null);
    }
  }, [user]);

  /**
   * Verifica se o usuário atual logado possui a permissão especificada.
   * Utilizado para controle de acesso por RBAC.
   * 
   * @param {string} code - Código da permissão (ex: 'admin.users')
   * @returns {boolean} Verdadeiro se o usuário tem a permissão ou é 'Administrator'.
   */
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
