// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getStorage, connectStorageEmulator } from "firebase/storage";

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

// Initialize Analytics only in production
let analytics;
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  analytics = getAnalytics(app);
}
export { analytics };

// Connect to emulators in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Check if emulators are already connected
  if (!auth.emulatorConfig) {
    try {
      connectAuthEmulator(auth, 'http://localhost:9099');
      console.log('🔥 Connected to Auth emulator');
    } catch (error) {
      console.log('Auth emulator connection failed, using production');
    }
  }
  
  // For Firestore emulator, we'll just try to connect
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('🔥 Connected to Firestore emulator');
  } catch (error) {
    console.log('Firestore emulator connection failed, using production');
  }
  
  // For Storage emulator, we'll just try to connect
  try {
    connectStorageEmulator(storage, 'localhost', 9199);
    console.log('🔥 Connected to Storage emulator');
  } catch (error) {
    console.log('Storage emulator connection failed, using production');
  }
}

export default app;
