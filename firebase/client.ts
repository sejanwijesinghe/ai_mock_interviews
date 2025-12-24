// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);