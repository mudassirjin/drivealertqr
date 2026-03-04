// lib/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
   apiKey: "AIzaSyAScNsGHcd0BTpuUFp_fci4M_kGOl5-1bs",
    authDomain: "drivealert-qr.firebaseapp.com",
    projectId: "drivealert-qr",
    storageBucket: "drivealert-qr.firebasestorage.app",
    messagingSenderId: "1091471834470",
    appId: "1:1091471834470:web:6c5a3533ebd07e03f41ca7"
  };

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);