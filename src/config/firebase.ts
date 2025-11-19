import { initializeApp } from "firebase/app";
import { 
  getAuth,
  GoogleAuthProvider,
  OAuthProvider
} from "firebase/auth";

// Your actual config here:
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

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
