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

const manhattanConfig = {
  apiKey: "AIzaSyA4RJMcfa6z97dlzKvEawphl36gTv4Kd1M",
  authDomain: "sistema-manhattan.firebaseapp.com",
  projectId: "sistema-manhattan",
  storageBucket: "sistema-manhattan.firebasestorage.app",
  messagingSenderId: "90628524545",
  appId: "1:90628524545:web:51d107d50cd6c8954f8e00"
};

// Initialize Firebase (Portal Principal)
const app = initializeApp(firebaseConfig);

// Initialize Firebase (Portal Manhattan para Login SSO)
const manhattanApp = initializeApp(manhattanConfig, "manhattan");

// Initialize Firebase services
export const auth = getAuth(app);
export const manhattanAuth = getAuth(manhattanApp);
export const db = getFirestore(app);
export default app;
