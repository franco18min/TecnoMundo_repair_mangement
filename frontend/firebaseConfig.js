// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDxeLWdYMCgu7TiR-J4S1MKV6E7KmOmXx8",
  authDomain: "tecnomundo-repair-mangement.firebaseapp.com",
  projectId: "tecnomundo-repair-mangement",
  storageBucket: "tecnomundo-repair-mangement.firebasestorage.app",
  messagingSenderId: "646560511665",
  appId: "1:646560511665:web:e6a1e78e60a38403ef5490",
  measurementId: "G-5BP623JBDV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);