import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const instaPassoConfig = {
  apiKey: import.meta.env.VITE_INSTAPASSO_API_KEY,
  authDomain: import.meta.env.VITE_INSTAPASSO_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_INSTAPASSO_PROJECT_ID,
  storageBucket: import.meta.env.VITE_INSTAPASSO_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_INSTAPASSO_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_INSTAPASSO_APP_ID
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
export { instaPassoApp };
export default app;
