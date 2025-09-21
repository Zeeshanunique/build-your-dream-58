import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface UserProfile {
  uid: string;
  email: string;
  role: 'therapist' | 'parent' | 'child';
  name: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: 'therapist' | 'parent' | 'child') => Promise<void>;
  logout: () => Promise<void>;
  quickLogin: (role: 'therapist' | 'parent' | 'child') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        // Fetch user profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data() as UserProfile);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (userDoc.exists()) {
        const profileData = userDoc.data() as UserProfile;
        setUserProfile(profileData);
      } else {
        // Create a default profile for existing auth users
        const defaultProfile: UserProfile = {
          uid: result.user.uid,
          email: result.user.email!,
          role: email.includes('therapist') ? 'therapist' : email.includes('parent') ? 'parent' : 'child',
          name: result.user.displayName || 'Demo User',
          createdAt: new Date().toISOString()
        };
        
        await setDoc(doc(db, 'users', result.user.uid), defaultProfile);
        setUserProfile(defaultProfile);
      }
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string, role: 'therapist' | 'parent' | 'child') => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await updateProfile(result.user, { displayName: name });
      
      // Create user profile in Firestore
      const userProfile: UserProfile = {
        uid: result.user.uid,
        email: result.user.email!,
        role,
        name,
        createdAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'users', result.user.uid), userProfile);
      setUserProfile(userProfile);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      throw error;
    }
  };

  // Quick login for demo purposes with improved error handling and data seeding
  const quickLogin = async (role: 'therapist' | 'parent' | 'child') => {
    const demoUsers = {
      therapist: { email: 'therapist@cognicare.com', password: 'demo123', name: 'Dr. Sarah Smith' },
      parent: { email: 'parent@cognicare.com', password: 'demo123', name: 'Jennifer Rodriguez' },
      child: { email: 'child@cognicare.com', password: 'demo123', name: 'Emma Rodriguez' }
    };

    const demoUser = demoUsers[role];

    try {
      // Try to sign in first
      await signIn(demoUser.email, demoUser.password);

      // Seed initial data if this is a new login
      await seedInitialData(role);

    } catch (error: any) {
      // If sign in fails, create the demo user
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        try {
          await signUp(demoUser.email, demoUser.password, demoUser.name, role);
          // Seed initial data for new user
          await seedInitialData(role);
        } catch (signUpError) {
          console.error('Failed to create demo user:', signUpError);
          throw signUpError;
        }
      } else {
        throw error;
      }
    }
  };

  // Function to seed initial data for demo users
  const seedInitialData = async (role: 'therapist' | 'parent' | 'child') => {
    if (!auth.currentUser) return;

    try {
      const { seedDemoData } = await import('@/lib/firebase-service');
      await seedDemoData(auth.currentUser.uid, role);
    } catch (error) {
      console.error('Error seeding initial data:', error);
      // Don't throw error - this shouldn't prevent login
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    logout,
    quickLogin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
