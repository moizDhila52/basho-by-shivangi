// lib/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAwRf75Q5OuSzhrW3RQyFHhuOlzjRr2lHQ",
  authDomain: "basho-auth.firebaseapp.com",
  projectId: "basho-auth",
  storageBucket: "basho-auth.firebasestorage.app",
  messagingSenderId: "719987656380",
  appId: "1:719987656380:web:c005b9dd10bc6706c5f2b9",
};

// Initialize Firebase
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
