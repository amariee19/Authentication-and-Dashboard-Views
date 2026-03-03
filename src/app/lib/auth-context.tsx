import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  UserCredential
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export type UserRole = 'patient' | 'caregiver';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string, role: UserRole) => Promise<SignInResult>;
  signUp: (email: string, password: string, role: UserRole, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

interface SignInResult {
  userCredential: UserCredential; // Or better: import { UserCredential } from 'firebase/auth'
  profile: UserProfile;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Fetch user profile from Firestore
        try {
          const profileDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (profileDoc.exists()) {
            setUserProfile(profileDoc.data() as UserProfile);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // const signIn = async (email: string, password: string, role: UserRole) => {
  //   const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
  //   // Verify role matches
  //   const profileDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
  //   if (profileDoc.exists()) {
  //     const profile = profileDoc.data() as UserProfile;
  //     if (profile.role !== role) {
  //       await firebaseSignOut(auth);
  //       throw new Error('Invalid role for this account');
  //     }
  //   }
  // };
const signIn = async (email: string, password: string, role: UserRole): Promise<SignInResult> => {
  // 1. Authenticate with Firebase
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  
  // 2. Verify role in Firestore
  const profileDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
  
  if (profileDoc.exists()) {
    const profile = profileDoc.data() as UserProfile;
    if (profile.role !== role) {
      await firebaseSignOut(auth);
      throw new Error('Invalid role for this account');
    }
    // 3. Return the successful credential and the profile
    return { userCredential, profile };
   
  } else {
    // If they logged in but have no database profile, log them out for safety
    await firebaseSignOut(auth);
    throw new Error('No profile found for this user');
  }
};

  const signUp = async (email: string, password: string, role: UserRole, name?: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user profile in Firestore
    const profile: UserProfile = {
      uid: userCredential.user.uid,
      email: email,
      role: role,
      name: name
    };
    
    await setDoc(doc(db, 'users', userCredential.user.uid), profile);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signIn, signUp, signOut }}>
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
