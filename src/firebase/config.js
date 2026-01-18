/**
 * Firebase Configuration
 * 
 * This file initializes Firebase services (Auth, Firestore, Storage)
 * using environment variables for security.
 * 
 * Setup Instructions:
 * 1. Create a Firebase project at https://console.firebase.google.com
 * 2. Enable Authentication (Email/Password, Google)
 * 3. Create Firestore database
 * 4. Enable Storage
 * 5. Copy your config values to .env file
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Validate that all required environment variables are set
const requiredEnvVars = [
  'REACT_APP_FIREBASE_API_KEY',
  'REACT_APP_FIREBASE_AUTH_DOMAIN',
  'REACT_APP_FIREBASE_PROJECT_ID',
  'REACT_APP_FIREBASE_STORAGE_BUCKET',
  'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
  'REACT_APP_FIREBASE_APP_ID'
];

const missingVars = requiredEnvVars.filter(
  varName => !process.env[varName]
);

if (missingVars.length > 0) {
  console.error(
    'Missing Firebase environment variables:',
    missingVars.join(', ')
  );
  console.error('Please check your .env file');
  console.error('Make sure to restart the dev server after creating/updating .env');
}

// Debug: Log Firebase config status (without exposing full API key)
if (process.env.NODE_ENV === 'development') {
  console.log('Firebase Config Status:', {
    apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : '❌ MISSING',
    authDomain: firebaseConfig.authDomain || '❌ MISSING',
    projectId: firebaseConfig.projectId || '❌ MISSING',
    storageBucket: firebaseConfig.storageBucket || '❌ MISSING',
    messagingSenderId: firebaseConfig.messagingSenderId || '❌ MISSING',
    appId: firebaseConfig.appId ? `${firebaseConfig.appId.substring(0, 20)}...` : '❌ MISSING',
    hasAllRequired: missingVars.length === 0
  });
  
  if (!firebaseConfig.apiKey) {
    console.error('⚠️ API Key is missing! Check your .env file and restart the dev server.');
  } else if (firebaseConfig.apiKey.length < 30) {
    console.error('⚠️ API Key appears to be too short. Please verify it in Firebase Console.');
  }
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
