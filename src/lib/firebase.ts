// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";        // <--- Added this
import { getFirestore } from "firebase/firestore"; // <--- Added this

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCJsNYnArxxdPvvM-Bkm8ux2T_kEFViRT8",
  authDomain: "kurchi--e-commerce.firebaseapp.com",
  projectId: "kurchi--e-commerce",
  storageBucket: "kurchi--e-commerce.firebasestorage.app",
  messagingSenderId: "575041992266",
  appId: "1:575041992266:web:b3f377caff8f97d71618b3",
  measurementId: "G-30P312ZL16"
};

// 1. Initialize Firebase
const app = initializeApp(firebaseConfig);

// 2. Initialize Services
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
const auth = getAuth(app);       // <--- The App needs this for Login
const db = getFirestore(app);    // <--- The App needs this for Data

// 3. Export them so other files can use them
export { app, analytics, auth, db };