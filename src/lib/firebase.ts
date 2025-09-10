// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB9mkB7HwgXzWdDgvF8wYWWm8_FypjINXA",
  authDomain: "cognicare-6b2a9.firebaseapp.com",
  projectId: "cognicare-6b2a9",
  storageBucket: "cognicare-6b2a9.firebasestorage.app",
  messagingSenderId: "819480168263",
  appId: "1:819480168263:web:7bb826617b10e730a86e62",
  measurementId: "G-DMQ9GBSSV7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;
