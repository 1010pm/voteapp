/**
 * Firebase Authentication Service
 * 
 * Provides authentication functions:
 * - Email/Password sign up and login
 * - Google Sign-In
 * - Password reset
 * - Email verification
 * - User role management
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './config';

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

/**
 * Sign up with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} displayName - User display name
 * @returns {Promise<UserCredential>}
 */
export const signUpWithEmail = async (email, password, displayName) => {
  try {
    // Create user account
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Update user profile with display name
    if (displayName) {
      await updateProfile(userCredential.user, {
        displayName: displayName
      });
    }

    // Send email verification
    await sendEmailVerification(userCredential.user);

    // Create user document in Firestore with default role 'user'
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: displayName || userCredential.user.displayName || '',
      role: 'user', // Default role
      emailVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return userCredential;
  } catch (error) {
    throw error;
  }
};

/**
 * Sign in with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<UserCredential>}
 */
export const signInWithEmail = async (email, password) => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    throw error;
  }
};

/**
 * Sign in with Google
 * @returns {Promise<UserCredential>}
 */
export const signInWithGoogle = async () => {
  try {
    const userCredential = await signInWithPopup(auth, googleProvider);
    
    // Check if user document exists, if not create it
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName || '',
        role: 'user', // Default role
        emailVerified: userCredential.user.emailVerified,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    return userCredential;
  } catch (error) {
    throw error;
  }
};

/**
 * Send password reset email
 * @param {string} email - User email
 * @returns {Promise<void>}
 */
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw error;
  }
};

/**
 * Send email verification
 * @param {User} user - Firebase user object
 * @returns {Promise<void>}
 */
export const verifyEmail = async (user) => {
  try {
    await sendEmailVerification(user);
  } catch (error) {
    throw error;
  }
};

/**
 * Sign out current user
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

/**
 * Get user role from Firestore
 * @param {string} uid - User ID
 * @returns {Promise<string>} User role ('admin' or 'user')
 */
export const getUserRole = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data().role || 'user';
    }
    return 'user';
  } catch (error) {
    console.error('Error getting user role:', error);
    return 'user';
  }
};

/**
 * Update user role (admin only)
 * @param {string} uid - User ID
 * @param {string} role - New role ('admin' or 'user')
 * @returns {Promise<void>}
 */
export const updateUserRole = async (uid, role) => {
  try {
    await setDoc(
      doc(db, 'users', uid),
      { role, updatedAt: new Date().toISOString() },
      { merge: true }
    );
  } catch (error) {
    throw error;
  }
};

/**
 * Get user data from Firestore
 * @param {string} uid - User ID
 * @returns {Promise<Object>} User data
 */
export const getUserData = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

/**
 * Auth state observer
 * @param {Function} callback - Callback function
 * @returns {Function} Unsubscribe function
 */
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};
