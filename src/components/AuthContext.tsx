import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider, appleProvider } from '../config/firebase';
import { createUserProfile, checkIfUserExists } from '../services/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signUpWithEmail: (email: string, password: string, username: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);

      // Check if user profile exists, if not create one
      const userExists = await checkIfUserExists(result.user.uid);
      if (!userExists) {
        await createUserProfile(result.user.uid, {
          displayName: result.user.displayName || '',
          email: result.user.email || '',
          subscription: 'free'
        });
      }
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithApple = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, appleProvider);

      // Check if user profile exists, if not create one
      const userExists = await checkIfUserExists(result.user.uid);
      if (!userExists) {
        await createUserProfile(result.user.uid, {
          displayName: result.user.displayName || '',
          email: result.user.email || '',
          subscription: 'free'
        });
      }
    } catch (error: any) {
      console.error('Error signing in with Apple:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string, username: string) => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Update the user's profile with the username
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: username
        });

        // Create user profile in Firestore
        await createUserProfile(userCredential.user.uid, {
          displayName: username,
          email: email,
          subscription: 'free'
        });
      }
    } catch (error: any) {
      console.error('Error signing up with email:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Error signing in with email:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signInWithApple,
    signUpWithEmail,
    signInWithEmail,
    signOut,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

