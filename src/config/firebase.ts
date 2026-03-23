import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// IMPORTANT: Replace these with your actual Firebase config values from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDzPfZixWtWaNAqR8k4XoPbVGqK2TTtl7M",
  authDomain: "violify.firebaseapp.com",
  projectId: "violify",
  storageBucket: "violify.firebasestorage.app",
  messagingSenderId: "471620250066",
  appId: "1:471620250066:web:56ace640bee8ff7a97000b",
  measurementId: "G-HLTYFGK0BX"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Apple Auth Provider
export const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

export default app;
