// lib/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// GET THESE VALUES FROM YOUR FIREBASE CONSOLE: Project Settings -> General -> "Your apps"
const firebaseConfig = {
  apiKey: "AIzaSyAwRf75Q5OuSzhrW3RQyFHhuOlzjRr2lHQ",
  authDomain: "basho-auth.firebaseapp.com",
  projectId: "basho-auth",
  storageBucket: "basho-auth.firebasestorage.app",
  messagingSenderId: "719987656380",
  appId: "1:719987656380:web:c005b9dd10bc6706c5f2b9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
