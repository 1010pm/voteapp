/**
 * Firestore Database Service
 * 
 * Provides CRUD operations for Firestore collections:
 * - Users collection
 * - Custom collections as needed
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

/**
 * Create a document
 * @param {string} collectionName - Collection name
 * @param {string} docId - Document ID
 * @param {Object} data - Document data
 * @returns {Promise<void>}
 */
export const createDocument = async (collectionName, docId, data) => {
  try {
    await setDoc(doc(db, collectionName, docId), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Get a document by ID
 * @param {string} collectionName - Collection name
 * @param {string} docId - Document ID
 * @returns {Promise<Object|null>}
 */
export const getDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    throw error;
  }
};

/**
 * Update a document
 * @param {string} collectionName - Collection name
 * @param {string} docId - Document ID
 * @param {Object} data - Updated data
 * @returns {Promise<void>}
 */
export const updateDocument = async (collectionName, docId, data) => {
  try {
    await updateDoc(doc(db, collectionName, docId), {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a document
 * @param {string} collectionName - Collection name
 * @param {string} docId - Document ID
 * @returns {Promise<void>}
 */
export const deleteDocument = async (collectionName, docId) => {
  try {
    await deleteDoc(doc(db, collectionName, docId));
  } catch (error) {
    throw error;
  }
};

/**
 * Get all documents from a collection
 * @param {string} collectionName - Collection name
 * @param {Array} filters - Array of filter objects {field, operator, value}
 * @param {string} orderByField - Field to order by
 * @param {string} orderDirection - 'asc' or 'desc'
 * @param {number} limitCount - Maximum number of documents
 * @returns {Promise<Array>}
 */
export const getCollection = async (
  collectionName,
  filters = [],
  orderByField = null,
  orderDirection = 'desc',
  limitCount = null
) => {
  try {
    let q = collection(db, collectionName);

    // Apply filters
    if (filters.length > 0) {
      filters.forEach(filter => {
        q = query(q, where(filter.field, filter.operator, filter.value));
      });
    }

    // Apply ordering
    if (orderByField) {
      q = query(q, orderBy(orderByField, orderDirection));
    }

    // Apply limit
    if (limitCount) {
      q = query(q, limit(limitCount));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    throw error;
  }
};

/**
 * Get all users (admin only)
 * @returns {Promise<Array>}
 */
export const getAllUsers = async () => {
  try {
    return await getCollection('users', [], 'createdAt', 'desc');
  } catch (error) {
    throw error;
  }
};

/**
 * Get user statistics for admin dashboard
 * @returns {Promise<Object>}
 */
export const getUserStats = async () => {
  try {
    const users = await getAllUsers();
    const totalUsers = users.length;
    const verifiedUsers = users.filter(u => u.emailVerified).length;
    const adminUsers = users.filter(u => u.role === 'admin').length;
    const regularUsers = users.filter(u => u.role === 'user').length;

    return {
      totalUsers,
      verifiedUsers,
      adminUsers,
      regularUsers,
      unverifiedUsers: totalUsers - verifiedUsers
    };
  } catch (error) {
    throw error;
  }
};
