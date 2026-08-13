import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

// 1. Banco 1: Portal AI / InstaPasso & Segurança Central (`portal-ai-tiecia`)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB1-lnRyFDOuON7px65XvUh1ulivitDisU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "portal-ai-tiecia.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "portal-ai-tiecia",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "portal-ai-tiecia.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "622284963952",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:622284963952:web:268cb9da5816f9962d74b5"
};

// 2. Banco 2: Tickets & Chat Stream (`portal-tickets-chat`)
const ticketsChatConfig = {
  apiKey: import.meta.env.VITE_TICKETS_CHAT_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB1-lnRyFDOuON7px65XvUh1ulivitDisU",
  authDomain: import.meta.env.VITE_TICKETS_CHAT_AUTH_DOMAIN || "portal-tickets-chat.firebaseapp.com",
  projectId: import.meta.env.VITE_TICKETS_CHAT_PROJECT_ID || "portal-tickets-chat",
  storageBucket: import.meta.env.VITE_TICKETS_CHAT_STORAGE_BUCKET || "portal-tickets-chat.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_TICKETS_CHAT_MESSAGING_SENDER_ID || "622284963952",
  appId: import.meta.env.VITE_TICKETS_CHAT_APP_ID || "1:622284963952:web:268cb9da5816f9962d74b6"
};

// 3. Banco 3: Cadastros Gerais & Ativos (`portal-general-registration`)
const generalRegConfig = {
  apiKey: import.meta.env.VITE_GENERAL_REG_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB1-lnRyFDOuON7px65XvUh1ulivitDisU",
  authDomain: import.meta.env.VITE_GENERAL_REG_AUTH_DOMAIN || "portal-general-registration.firebaseapp.com",
  projectId: import.meta.env.VITE_GENERAL_REG_PROJECT_ID || "portal-general-registration",
  storageBucket: import.meta.env.VITE_GENERAL_REG_STORAGE_BUCKET || "portal-general-registration.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_GENERAL_REG_MESSAGING_SENDER_ID || "622284963952",
  appId: import.meta.env.VITE_GENERAL_REG_APP_ID || "1:622284963952:web:268cb9da5816f9962d74b7"
};

// Initialize Firebase Apps para os 3 projetos reais
const app = initializeApp(firebaseConfig); // portal-ai-tiecia
const ticketsChatApp = initializeApp(ticketsChatConfig, "ticketsChat"); // portal-tickets-chat
const generalRegApp = initializeApp(generalRegConfig, "generalRegistration"); // portal-general-registration

// Auth Services
export const auth = getAuth(app);
export const instaPassoAuth = getAuth(app);
export const ticketsChatAuth = getAuth(ticketsChatApp);
export const generalRegAuth = getAuth(generalRegApp);
export const opAuth = ticketsChatAuth;

// Firestore Services
export const db = getFirestore(app); // portal-ai-tiecia
export const instaPassoDb = getFirestore(app); // portal-ai-tiecia (Segurança / Auth)
export const ticketsChatDb = getFirestore(ticketsChatApp); // portal-tickets-chat
export const generalRegDb = getFirestore(generalRegApp); // portal-general-registration
export const opDb = ticketsChatDb; // Alias para retrocompatibilidade

// Conectar aos emuladores apenas quando explicitamente ativado via variável de ambiente
if (import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  const host = "localhost";
  console.info(`[Firebase] Conectando aos emuladores locais no host: ${host}`);
  connectAuthEmulator(auth, `http://${host}:9099`);
  connectAuthEmulator(ticketsChatAuth, `http://${host}:9099`, { disableWarnings: true });
  connectAuthEmulator(generalRegAuth, `http://${host}:9099`, { disableWarnings: true });
  connectFirestoreEmulator(db, host, 8080);
  connectFirestoreEmulator(ticketsChatDb, host, 8080);
  connectFirestoreEmulator(generalRegDb, host, 8080);
}

export const instaPassoApp = app;
export const opApp = ticketsChatApp;
export { ticketsChatApp, generalRegApp };
export default app;
