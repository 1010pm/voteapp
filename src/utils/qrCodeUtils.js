/**
 * QR Code Utilities
 * 
 * Helper functions for QR code generation and sharing
 */

/**
 * Generate public voting URL
 * @param {string} pollId - Poll ID
 * @returns {string} Public voting URL
 */
export const getPollVoteUrl = (pollId) => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/vote/${pollId}`;
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
};

/**
 * Share via Web Share API if available
 * @param {Object} shareData - Share data {title, text, url}
 * @returns {Promise<boolean>} Success status
 */
export const shareLink = async (shareData) => {
  try {
    if (navigator.share) {
      await navigator.share(shareData);
      return true;
    }
    return false;
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Error sharing:', error);
    }
    return false;
  }
};
