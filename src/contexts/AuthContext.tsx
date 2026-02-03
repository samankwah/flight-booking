import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  getAuth,
  onAuthStateChanged,
  User,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  UserCredential
} from "firebase/auth";
import { app } from "../firebase";
import toast from "react-hot-toast";

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  isAdmin: boolean;
  refreshAdminStatus: () => Promise<void>;
  signInWithGoogle: () => Promise<UserCredential>;
  signInWithApple: () => Promise<UserCredential>;
  loginWithEmail: (email: string, password: string) => Promise<UserCredential>;
  registerWithEmail: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const auth = getAuth(app);

  // Refresh admin status from Custom Claims
  const refreshAdminStatus = async () => {
    if (currentUser) {
      try {
        const tokenResult = await currentUser.getIdTokenResult(true); // Force refresh
        setIsAdmin(tokenResult.claims.admin === true);
      } catch (error) {
        console.error('Error refreshing admin status:', error);
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setLoading(false);

      if (user) {
        try {
          const tokenResult = await user.getIdTokenResult();
          setIsAdmin(tokenResult.claims.admin === true);
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    });

    return unsubscribe;
  }, [auth]);

  // Google Sign-In
  const signInWithGoogle = async (): Promise<UserCredential> => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    try {
      const result = await signInWithPopup(auth, provider);
      toast.success(`Welcome, ${result.user.displayName || 'User'}!`);
      return result;
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in with Google');
      throw error;
    }
  };

  // Apple Sign-In
  const signInWithApple = async (): Promise<UserCredential> => {
    const provider = new OAuthProvider('apple.com');
    provider.addScope('email');
    provider.addScope('name');
    try {
      const result = await signInWithPopup(auth, provider);
      toast.success(`Welcome, ${result.user.displayName || 'User'}!`);
      return result;
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in with Apple');
      throw error;
    }
  };

  // Email/Password Login
  const loginWithEmail = async (email: string, password: string): Promise<UserCredential> => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      toast.success('Successfully logged in!');
      return result;
    } catch (error: any) {
      toast.error(error.message || 'Failed to login');
      throw error;
    }
  };

  // Email/Password Registration
  const registerWithEmail = async (email: string, password: string): Promise<UserCredential> => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      toast.success('Account created successfully!');
      return result;
    } catch (error: any) {
      // Map Firebase error codes to user-friendly messages
      const errorMessages: Record<string, string> = {
        'auth/email-already-in-use': 'This email is already registered. Please login instead.',
        'auth/weak-password': 'Password must be at least 6 characters.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/operation-not-allowed': 'Email registration is currently disabled.',
        'auth/too-many-requests': 'Too many attempts. Please try again later.'
      };
      const message = errorMessages[error.code] || error.message || 'Failed to create account';
      toast.error(message);
      throw new Error(message);
    }
  };

  // Logout
  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to logout');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      loading,
      isAdmin,
      refreshAdminStatus,
      signInWithGoogle,
      signInWithApple,
      loginWithEmail,
      registerWithEmail,
      logout
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
