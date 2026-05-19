'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '@/lib/firebase';

export interface UserSession {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  token: string | null;
}

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  isDemoMode: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Auto-subscribe to auth changes if Firebase is configured
  useEffect(() => {
    if (!isFirebaseConfigured) {
      // Mock Developer Mode - Load from localStorage if present
      const savedUser = localStorage.getItem('kompete_demo_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      try {
        if (firebaseUser) {
          const token = await firebaseUser.getIdToken();
          setUser({
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
            token,
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching Firebase token:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    if (!isFirebaseConfigured) {
      // Mock Authentication in Dev Mode
      const mockUser: UserSession = {
        uid: 'demo_user_123',
        displayName: 'Demo Competitor',
        email: 'demo@kompete.ai',
        photoURL: 'https://api.dicebear.com/7.x/bottts/svg?seed=kompete',
        token: 'mock-dev-token',
      };
      setUser(mockUser);
      localStorage.setItem('kompete_demo_user', JSON.stringify(mockUser));
      setLoading(false);
      return;
    }

    try {
      if (!auth || !googleProvider) return;
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      setUser({
        uid: result.user.uid,
        displayName: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
        token,
      });
    } catch (error) {
      console.error('Google Sign-In failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    if (!isFirebaseConfigured) {
      setUser(null);
      localStorage.removeItem('kompete_demo_user');
      setLoading(false);
      return;
    }

    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Sign-out failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isDemoMode: !isFirebaseConfigured, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
