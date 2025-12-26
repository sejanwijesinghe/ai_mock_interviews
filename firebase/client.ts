import { initializeApp, getApp, getApps } from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "@firebase/firestore";


const firebaseConfig = {
    apiKey: "AIzaSyCeGSxxOZMjrGExTHPHHaMDY6ZXUlwBcYU",
    authDomain: "repliq-3a3b7.firebaseapp.com",
    projectId: "repliq-3a3b7",
    storageBucket: "repliq-3a3b7.firebasestorage.app",
    messagingSenderId: "144360459824",
    appId: "1:144360459824:web:f4a5cef790bb859fd967f5",
    measurementId: "G-D81HGZ6N0Z"
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth();
export const db = getFirestore(app);