import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoPortalKey123456789",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "portal-ai-demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "portal-ai-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "portal-ai-demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:abcdef123456"
};

const instaPassoConfig = {
  apiKey: import.meta.env.VITE_INSTAPASSO_API_KEY || "AIzaSyDemoInstaPassoKey987654321",
  authDomain: import.meta.env.VITE_INSTAPASSO_AUTH_DOMAIN || "instapasso-ai-demo.firebaseapp.com",
  projectId: import.meta.env.VITE_INSTAPASSO_PROJECT_ID || "instapasso-ai-demo",
  storageBucket: import.meta.env.VITE_INSTAPASSO_STORAGE_BUCKET || "instapasso-ai-demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_INSTAPASSO_MESSAGING_SENDER_ID || "9876543210",
  appId: import.meta.env.VITE_INSTAPASSO_APP_ID || "1:9876543210:web:654321fedcba"
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
