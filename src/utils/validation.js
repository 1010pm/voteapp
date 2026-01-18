/**
 * Validation Utilities
 * 
 * Input validation functions for forms
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} { valid: boolean, message: string }
 */
export const validatePassword = (password) => {
  if (!password) {
    return { valid: false, message: 'Password is required' };
  }
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters' };
  }
  return { valid: true, message: '' };
};

/**
 * Validate password confirmation
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {Object} { valid: boolean, message: string }
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return { valid: false, message: 'Passwords do not match' };
  }
  return { valid: true, message: '' };
};

/**
 * Get Firebase error message
 * @param {Error} error - Firebase error
 * @returns {string} User-friendly error message
 */
export const getFirebaseErrorMessage = (error) => {
  const errorCode = error.code;
  
  const errorMessages = {
    'auth/email-already-in-use': 'Email is already in use',
    'auth/invalid-email': 'Invalid email address',
    'auth/operation-not-allowed': 'Operation not allowed',
    'auth/weak-password': 'Password is too weak',
    'auth/user-disabled': 'User account has been disabled',
    'auth/user-not-found': 'User not found',
    'auth/wrong-password': 'Wrong password',
    'auth/too-many-requests': 'Too many requests. Please try again later',
    'auth/network-request-failed': 'Network error. Please check your connection',
    'auth/requires-recent-login': 'Please log in again to complete this action'
  };

  return errorMessages[errorCode] || error.message || 'An error occurred';
};
