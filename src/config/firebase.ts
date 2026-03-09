import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  setPersistence,
  browserLocalPersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase config
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "home-chore-manager.firebaseapp.com",
  projectId: "home-chore-manager",
  storageBucket: "home-chore-manager.firebasestorage.app",
  messagingSenderId: "57126527560",
  appId: "1:57126527560:web:2f840963644c1b178c6e7d",
  measurementId: "G-22XKTLGF7N"
};

// Initialize app safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize auth once
let auth: any;

console.log('firebase.ts loaded - initializing Firebase auth for platform:', typeof window === 'undefined' ? 'React Native' : 'Web');

let authReady: Promise<void> = Promise.resolve();

if (typeof window === 'undefined') {
  // React Native environment - try to use React Native persistence
  try {
    // Dynamic import for React Native persistence
    const { getReactNativePersistence } = require('firebase/auth');
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
    console.log('Firebase auth initialized with React Native persistence');
  } catch (error) {
    console.warn('React Native persistence not available, using default auth:', error);
    auth = initializeAuth(app);
    console.log('Firebase auth initialized with default settings');
  }
} else {
  // Web environment
  auth = getAuth(app);
  authReady = (async () => {
    try {
      await setPersistence(auth, browserLocalPersistence);
      console.log('Web auth persistence set to browserLocalPersistence');
      console.log('authReady: persistence is configured for web');
    } catch (error) {
      console.warn('Failed to set web persistence:', error);
    }
  })();
}

// Firestore
const db = getFirestore(app);

// Export instances and helpers
export { auth, db, authReady };

// Ensure web persistence is applied before any sign-in action
const ensureWebPersistence = async () => {
  if (typeof window !== 'undefined') {
    try {
      console.log('ensureWebPersistence: attempting to set browserLocalPersistence');
      await setPersistence(auth, browserLocalPersistence);
      console.log('ensureWebPersistence: browserLocalPersistence set');
    } catch (error) {
      console.warn('Failed to ensure web persistence:', error);
    }
  }
};

// Auth functions
export const loginUser = async (email: string, password: string) => {
  await ensureWebPersistence();
  return signInWithEmailAndPassword(auth, email, password);
};

export const registerUser = async (email: string, password: string) => {
  await ensureWebPersistence();
  return createUserWithEmailAndPassword(auth, email, password);
};

export const logoutUser = () => signOut(auth);

export { onAuthStateChanged };