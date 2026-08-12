import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB1-lnRyFDOuON7px65XvUh1ulivitDisU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "portal-ai-tiecia.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "portal-ai-tiecia",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "portal-ai-tiecia.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "622284963952",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:622284963952:web:268cb9da5816f9962d74b5"
};

const instaPassoConfig = {
  apiKey: import.meta.env.VITE_INSTAPASSO_API_KEY || "AIzaSyB1-lnRyFDOuON7px65XvUh1ulivitDisU",
  authDomain: import.meta.env.VITE_INSTAPASSO_AUTH_DOMAIN || "portal-ai-tiecia.firebaseapp.com",
  projectId: import.meta.env.VITE_INSTAPASSO_PROJECT_ID || "portal-ai-tiecia",
  storageBucket: import.meta.env.VITE_INSTAPASSO_STORAGE_BUCKET || "portal-ai-tiecia.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_INSTAPASSO_MESSAGING_SENDER_ID || "622284963952",
  appId: import.meta.env.VITE_INSTAPASSO_APP_ID || "1:622284963952:web:268cb9da5816f9962d74b5"
};


// Initialize Firebase (Portal Principal)
const app = initializeApp(firebaseConfig);

// Initialize Firebase (Portal InstaPasso para Login SSO e Permissões)
const instaPassoApp = initializeApp(instaPassoConfig, "instapasso");

// Initialize Firebase services
export const auth = getAuth(app);
export const instaPassoAuth = getAuth(instaPassoApp);
export const db = getFirestore(app);
export const instaPassoDb = getFirestore(instaPassoApp);

// Conectar aos emuladores apenas quando explicitamente ativado via variável de ambiente
if (import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  const host = "localhost";
  console.info(`[Firebase] Conectando aos emuladores locais no host: ${host}`);
  connectAuthEmulator(auth, `http://${host}:9099`);
  connectAuthEmulator(instaPassoAuth, `http://${host}:9099`, { disableWarnings: true });
  connectFirestoreEmulator(db, host, 8080);
  connectFirestoreEmulator(instaPassoDb, host, 8080);
}


export { instaPassoApp };
export default app;
