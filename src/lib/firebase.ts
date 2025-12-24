import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCJsNYnArxxdPvvM-Bkm8ux2T_kEFViRT8",
    authDomain: "kurchi--e-commerce.firebaseapp.com",
    projectId: "kurchi--e-commerce",
    storageBucket: "kurchi--e-commerce.firebasestorage.app",
    messagingSenderId: "575041992266",
    appId: "1:575041992266:web:b3f377caff8f97d71618b3",
    measurementId: "G-30P312ZL16"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };
