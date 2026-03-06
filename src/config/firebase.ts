import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAuth,
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
  apiKey: "AIzaSyBSdf0iiy4lSJL9Gv-Xw7akDLg2ENh7n3g",
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

console.log('Initializing Firebase auth for platform:', typeof window === 'undefined' ? 'React Native' : 'Web');

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
  auth = initializeAuth(app, {
    persistence: browserLocalPersistence,
  });
  console.log('Firebase auth initialized with web persistence');
}

// Firestore
const db = getFirestore(app);

// Export instances
export { auth, db };

// Auth functions
export const loginUser = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const registerUser = (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email, password);

export const logoutUser = () => signOut(auth);

export { onAuthStateChanged };