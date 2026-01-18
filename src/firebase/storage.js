/**
 * Firebase Storage Service
 * 
 * Provides file upload and management functions
 */

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll
} from 'firebase/storage';
import { storage } from './config';

/**
 * Upload a file to Firebase Storage
 * @param {File} file - File to upload
 * @param {string} path - Storage path (e.g., 'avatars/user123.jpg')
 * @param {Function} onProgress - Progress callback (optional)
 * @returns {Promise<string>} Download URL
 */
export const uploadFile = async (file, path, onProgress = null) => {
  try {
    const storageRef = ref(storage, path);
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a file from Firebase Storage
 * @param {string} path - Storage path
 * @returns {Promise<void>}
 */
export const deleteFile = async (path) => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    throw error;
  }
};

/**
 * Get download URL for a file
 * @param {string} path - Storage path
 * @returns {Promise<string>} Download URL
 */
export const getFileURL = async (path) => {
  try {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch (error) {
    throw error;
  }
};
