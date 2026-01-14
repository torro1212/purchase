import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCUdRenKEWjbbnnEDdC1oUFzHOhQB6Za5Q",
    authDomain: "purchse-660f9.firebaseapp.com",
    projectId: "purchse-660f9",
    storageBucket: "purchse-660f9.firebasestorage.app",
    messagingSenderId: "268521810102",
    appId: "1:268521810102:web:16ce98963ba5524f12de17",
    measurementId: "G-DQ226FZ0FD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
