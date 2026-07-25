import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA4RJMcfa6z97dlzKvEawphl36gTv4Kd1M",
  authDomain: "sistema-manhattan.firebaseapp.com",
  projectId: "sistema-manhattan",
  storageBucket: "sistema-manhattan.firebasestorage.app",
  messagingSenderId: "90628524545",
  appId: "1:90628524545:web:51d107d50cd6c8954f8e00"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
