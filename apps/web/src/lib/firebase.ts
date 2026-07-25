import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDu_VK35nuwDx-s3zG9vNjNRuVPH9nB6B0",
  authDomain: "portal-ia-784f6.firebaseapp.com",
  projectId: "portal-ia-784f6",
  storageBucket: "portal-ia-784f6.firebasestorage.app",
  messagingSenderId: "400935660517",
  appId: "1:400935660517:web:83ea998c17cd0b3083dd0c"
};

const instaPassoConfig = {
  apiKey: "AIzaSyBZyrcBfFRjhhMOpkhxLLrzgZ5vII6Tl98",
  authDomain: "instapasso.firebaseapp.com",
  projectId: "instapasso",
  storageBucket: "instapasso.firebasestorage.app",
  messagingSenderId: "190667143384",
  appId: "1:190667143384:web:7b97b8b82d7912dfd2bfad"
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
export default app;
