import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDa74iJ1LKCEcunDqghVdoMs245joZhHBA",
    authDomain: "gottex-f9335.firebaseapp.com",
    projectId: "gottex-f9335",
    storageBucket: "gottex-f9335.firebasestorage.app",
    messagingSenderId: "26506458922",
    appId: "1:26506458922:web:04c378f2b280b9b37c5053",
    measurementId: "G-WN7G6KSZFC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
