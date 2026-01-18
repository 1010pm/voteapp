/**
 * Guest User Utilities
 * 
 * Handles guest identification for voting when authentication is not required
 */

const GUEST_ID_KEY = 'voteapp_guest_id';

/**
 * Get or create a guest ID (stored in localStorage)
 * @returns {string} Guest ID
 */
export const getGuestId = () => {
  let guestId = localStorage.getItem(GUEST_ID_KEY);
  
  if (!guestId) {
    // Generate a unique guest ID
    guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(GUEST_ID_KEY, guestId);
  }
  
  return guestId;
};

/**
 * Clear guest ID (useful for testing or resetting)
 */
export const clearGuestId = () => {
  localStorage.removeItem(GUEST_ID_KEY);
};

/**
 * Check if current user is a guest (not authenticated)
 * @param {Object|null} user - Firebase auth user
 * @returns {boolean}
 */
export const isGuest = (user) => {
  return !user;
};
