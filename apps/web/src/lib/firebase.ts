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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
