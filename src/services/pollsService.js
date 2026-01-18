/**
 * Polls Service
 * 
 * Provides CRUD operations for polls, options, and votes.
 * 
 * Firestore Data Model (Updated for Public Voting Platform):
 * 
 * Collection: polls
 * - id: string (auto-generated)
 * - title: string (poll title)
 * - description: string (optional)
 * - type: 'single' | 'multiple'
 * - status: 'draft' | 'active' | 'closed'
 * - anonymous: boolean (whether votes are anonymous)
 * - guestVoting: boolean (allow voting without authentication)
 * - resultVisibility: 'public' | 'private' (who can see results)
 * - showResults: boolean (whether to show results to voters immediately)
 * - createdBy: string (creator UID - any authenticated user can create)
 * - createdAt: timestamp
 * - updatedAt: timestamp
 * - startsAt: timestamp (optional, when poll becomes active)
 * - closesAt: timestamp (optional, when poll should close)
 * - totalVotes: number (counter for total votes)
 * - publicLink: string (public voting URL)
 * 
 * Collection: pollOptions (subcollection of polls)
 * - id: string (auto-generated)
 * - pollId: string (parent poll ID)
 * - text: string (option text)
 * - order: number (display order)
 * - voteCount: number (counter for votes on this option)
 * - createdAt: timestamp
 * 
 * Collection: votes
 * - id: string (format: pollId_userId or pollId_guest_<deviceId>)
 * - pollId: string
 * - userId: string | null (Firebase Auth UID, null for guest votes)
 * - guestId: string | null (device/browser ID for guest tracking)
 * - optionIds: string[] (array of selected option IDs)
 * - anonymous: boolean
 * - createdAt: timestamp
 * 
 * WHY THIS STRUCTURE:
 * 1. polls: Main collection for poll metadata
 * 2. pollOptions: Subcollection for scalability and efficient querying
 * 3. votes: Separate collection for vote tracking with unique userId+pollId constraint
 * 
 * This design allows:
 * - Atomic vote counting via transactions
 * - Efficient queries for polls and their options
 * - Double-vote prevention via Firestore security rules
 * - Scalable architecture as polls grow
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
  runTransaction,
  serverTimestamp,
  increment,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { POLL_STATUS, POLL_TYPES } from '../utils/constants';

// Collection names
const POLLS_COLLECTION = 'polls';
const VOTES_COLLECTION = 'votes';

/**
 * Generate public voting link for a poll
 * @param {string} pollId - Poll ID
 * @returns {string} Public voting URL
 */
const generatePublicLink = (pollId) => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/vote/${pollId}`;
};

/**
 * Create a new poll (any authenticated user can create)
 * @param {Object} pollData - Poll data
 * @param {string} pollData.title - Poll title
 * @param {string} pollData.description - Poll description (optional)
 * @param {string} pollData.type - 'single' or 'multiple'
 * @param {boolean} pollData.anonymous - Whether votes are anonymous
 * @param {boolean} pollData.guestVoting - Allow voting without authentication
 * @param {string} pollData.resultVisibility - 'public' or 'private'
 * @param {boolean} pollData.showResults - Whether to show results immediately to voters
 * @param {Array<string>} pollData.options - Array of option texts
 * @param {Date} pollData.startsAt - Optional start date
 * @param {Date} pollData.closesAt - Optional closing date
 * @param {string} userId - Creator user ID
 * @returns {Promise<string>} Poll ID
 */
export const createPoll = async (pollData, userId) => {
  try {
    const pollRef = doc(collection(db, POLLS_COLLECTION));
    const batch = writeBatch(db);

    const startsAt = pollData.startsAt ? new Date(pollData.startsAt) : null;
    const closesAt = pollData.closesAt ? new Date(pollData.closesAt) : null;
    
    // Determine initial status based on start date
    let initialStatus = POLL_STATUS.ACTIVE;
    if (startsAt && startsAt > new Date()) {
      initialStatus = POLL_STATUS.DRAFT;
    }

    // Create poll document (publicLink will be set after commit)
    const pollDoc = {
      title: pollData.title.trim(),
      description: pollData.description?.trim() || '',
      type: pollData.type || POLL_TYPES.SINGLE_CHOICE,
      status: initialStatus,
      anonymous: pollData.anonymous || false,
      guestVoting: pollData.guestVoting || false,
      resultVisibility: pollData.resultVisibility || 'public',
      showResults: pollData.showResults !== false,
      createdBy: userId,
      totalVotes: 0,
      publicLink: '', // Will be set after commit
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      startsAt: startsAt ? Timestamp.fromDate(startsAt) : null,
      closesAt: closesAt ? Timestamp.fromDate(closesAt) : null
    };

    batch.set(pollRef, pollDoc);

    // Create option documents in subcollection
    const options = pollData.options || [];
    options.forEach((optionText, index) => {
      if (optionText.trim()) {
        const optionRef = doc(collection(db, POLLS_COLLECTION, pollRef.id, 'pollOptions'));
        batch.set(optionRef, {
          pollId: pollRef.id,
          text: optionText.trim(),
          order: index,
          voteCount: 0,
          createdAt: serverTimestamp()
        });
      }
    });

    await batch.commit();
    
    // Update publicLink now that we have the poll ID
    const publicLink = generatePublicLink(pollRef.id);
    await updateDoc(pollRef, { publicLink });
    
    return pollRef.id;
  } catch (error) {
    console.error('Error creating poll:', error);
    throw error;
  }
};

/**
 * Get a poll by ID with its options
 * @param {string} pollId - Poll ID
 * @returns {Promise<Object|null>} Poll with options array
 */
export const getPoll = async (pollId) => {
  try {
    const pollDoc = await getDoc(doc(db, POLLS_COLLECTION, pollId));
    
    if (!pollDoc.exists()) {
      return null;
    }

    const poll = { id: pollDoc.id, ...pollDoc.data() };

    // Get options
    const optionsSnapshot = await getDocs(
      query(
        collection(db, POLLS_COLLECTION, pollId, 'pollOptions'),
        orderBy('order', 'asc')
      )
    );

    poll.options = optionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return poll;
  } catch (error) {
    console.error('Error getting poll:', error);
    throw error;
  }
};

/**
 * Get all polls with filtering
 * @param {Object} filters - Filter options
 * @param {string} filters.status - Filter by status
 * @param {string} filters.createdBy - Filter by creator
 * @param {number} limitCount - Maximum number of polls
 * @returns {Promise<Array>} Array of polls
 */
export const getPolls = async (filters = {}, limitCount = null) => {
  try {
    let q = collection(db, POLLS_COLLECTION);

    // Apply filters
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }
    if (filters.createdBy) {
      q = query(q, where('createdBy', '==', filters.createdBy));
    }

    // Order by creation date (newest first)
    q = query(q, orderBy('createdAt', 'desc'));

    if (limitCount) {
      q = query(q, limit(limitCount));
    }

    const snapshot = await getDocs(q);
    const polls = [];

    for (const pollDoc of snapshot.docs) {
      const poll = { id: pollDoc.id, ...pollDoc.data() };
      
      // Get option count (optimize by only counting)
      const optionsSnapshot = await getDocs(
        collection(db, POLLS_COLLECTION, pollDoc.id, 'pollOptions')
      );
      poll.optionCount = optionsSnapshot.size;

      polls.push(poll);
    }

    return polls;
  } catch (error) {
    console.error('Error getting polls:', error);
    throw error;
  }
};

/**
 * Update a poll (admin only)
 * @param {string} pollId - Poll ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export const updatePoll = async (pollId, updates) => {
  try {
    const pollRef = doc(db, POLLS_COLLECTION, pollId);
    
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp()
    };

    // Convert closesAt to Timestamp if provided
    if (updates.closesAt && updates.closesAt instanceof Date) {
      updateData.closesAt = Timestamp.fromDate(updates.closesAt);
    } else if (updates.closesAt === null) {
      updateData.closesAt = null;
    }

    await updateDoc(pollRef, updateData);
  } catch (error) {
    console.error('Error updating poll:', error);
    throw error;
  }
};

/**
 * Close a poll (admin only)
 * @param {string} pollId - Poll ID
 * @returns {Promise<void>}
 */
export const closePoll = async (pollId) => {
  try {
    await updatePoll(pollId, { status: POLL_STATUS.CLOSED });
  } catch (error) {
    console.error('Error closing poll:', error);
    throw error;
  }
};

/**
 * Delete a poll (admin only)
 * This will also delete all associated options and votes via Firestore cascade delete rules
 * @param {string} pollId - Poll ID
 * @returns {Promise<void>}
 */
export const deletePoll = async (pollId) => {
  try {
    // Delete all options first
    const optionsSnapshot = await getDocs(
      collection(db, POLLS_COLLECTION, pollId, 'pollOptions')
    );

    const batch = writeBatch(db);
    optionsSnapshot.docs.forEach(optionDoc => {
      batch.delete(optionDoc.ref);
    });

    // Delete all votes for this poll
    const votesSnapshot = await getDocs(
      query(collection(db, VOTES_COLLECTION), where('pollId', '==', pollId))
    );

    votesSnapshot.docs.forEach(voteDoc => {
      batch.delete(voteDoc.ref);
    });

    // Delete poll
    batch.delete(doc(db, POLLS_COLLECTION, pollId));

    await batch.commit();
  } catch (error) {
    console.error('Error deleting poll:', error);
    throw error;
  }
};

/**
 * Generate vote ID from pollId and userId/guestId
 * Format: pollId_userId or pollId_guest_<guestId> (for Firestore security rules)
 * @param {string} pollId - Poll ID
 * @param {string} userId - User ID (or null for guests)
 * @param {string} guestId - Guest ID (if userId is null)
 * @returns {string} Vote ID
 */
const getVoteId = (pollId, userId, guestId = null) => {
  if (userId) {
    return `${pollId}_${userId}`;
  }
  return `${pollId}_guest_${guestId}`;
};

/**
 * Check if user/guest has already voted on a poll
 * @param {string} pollId - Poll ID
 * @param {string} userId - User ID (or null for guests)
 * @param {string} guestId - Guest ID (if userId is null)
 * @returns {Promise<boolean>}
 */
export const hasUserVoted = async (pollId, userId, guestId = null) => {
  try {
    const voteId = getVoteId(pollId, userId, guestId);
    const voteDoc = await getDoc(doc(db, VOTES_COLLECTION, voteId));
    return voteDoc.exists();
  } catch (error) {
    console.error('Error checking vote:', error);
    throw error;
  }
};

/**
 * Get user's/guest's vote for a poll
 * @param {string} pollId - Poll ID
 * @param {string} userId - User ID (or null for guests)
 * @param {string} guestId - Guest ID (if userId is null)
 * @returns {Promise<Object|null>} Vote object or null
 */
export const getUserVote = async (pollId, userId, guestId = null) => {
  try {
    const voteId = getVoteId(pollId, userId, guestId);
    const voteDoc = await getDoc(doc(db, VOTES_COLLECTION, voteId));

    if (!voteDoc.exists()) {
      return null;
    }

    return { id: voteDoc.id, ...voteDoc.data() };
  } catch (error) {
    console.error('Error getting user vote:', error);
    throw error;
  }
};

/**
 * Cast a vote (atomic transaction to prevent double voting)
 * Supports both authenticated users and guests
 * @param {string} pollId - Poll ID
 * @param {string|null} userId - User ID (null for guests)
 * @param {Array<string>} optionIds - Array of selected option IDs
 * @param {boolean} anonymous - Whether vote is anonymous
 * @param {string|null} guestId - Guest ID (required if userId is null)
 * @returns {Promise<void>}
 */
export const castVote = async (pollId, userId, optionIds, anonymous = false, guestId = null) => {
  try {
    if (!optionIds || optionIds.length === 0) {
      throw new Error('At least one option must be selected');
    }

    // Use transaction to ensure atomicity
    await runTransaction(db, async (transaction) => {
      const pollRef = doc(db, POLLS_COLLECTION, pollId);
      const pollDoc = await transaction.get(pollRef);

      if (!pollDoc.exists()) {
        throw new Error('Poll not found');
      }

      const poll = pollDoc.data();

      // Check if poll allows guest voting (if user is not authenticated)
      if (!userId && !poll.guestVoting) {
        throw new Error('This poll requires authentication to vote');
      }

      // Check if poll has started
      if (poll.startsAt) {
        const now = Timestamp.now();
        if (now < poll.startsAt) {
          throw new Error('Poll has not started yet');
        }
      }

      // Check if poll is active
      if (poll.status !== POLL_STATUS.ACTIVE) {
        throw new Error('Poll is not active');
      }

      // Check if poll has closed
      if (poll.closesAt) {
        const now = Timestamp.now();
        if (now >= poll.closesAt) {
          throw new Error('Poll has closed');
        }
      }

      // Check poll type constraints
      if (poll.type === POLL_TYPES.SINGLE_CHOICE && optionIds.length > 1) {
        throw new Error('Single choice poll only allows one option');
      }

      // Check if user/guest has already voted (using specific vote ID format)
      const voteId = getVoteId(pollId, userId, guestId);
      const voteRef = doc(db, VOTES_COLLECTION, voteId);
      const existingVoteDoc = await transaction.get(voteRef);

      if (existingVoteDoc.exists()) {
        throw new Error('You have already voted on this poll');
      }

      // Validate option IDs exist
      const optionRefs = optionIds.map(optionId =>
        doc(db, POLLS_COLLECTION, pollId, 'pollOptions', optionId)
      );

      const optionDocs = await Promise.all(
        optionRefs.map(ref => transaction.get(ref))
      );

      // Check all options exist
      if (optionDocs.some(doc => !doc.exists())) {
        throw new Error('Invalid option selected');
      }

      // Create vote document with specific ID format
      // For authenticated: pollId_userId
      // For guests: pollId_guest_<guestId>
      transaction.set(voteRef, {
        pollId,
        userId: userId || null,
        guestId: guestId || null,
        optionIds,
        anonymous: anonymous || poll.anonymous,
        createdAt: serverTimestamp()
      });

      // Update poll total votes counter
      transaction.update(pollRef, {
        totalVotes: increment(1)
      });

      // Update option vote counters
      optionRefs.forEach(ref => {
        transaction.update(ref, {
          voteCount: increment(1)
        });
      });
    });

    console.log('Vote cast successfully');
  } catch (error) {
    console.error('Error casting vote:', error);
    throw error;
  }
};

/**
 * Get poll results (vote counts per option)
 * @param {string} pollId - Poll ID
 * @returns {Promise<Object>} Results object with option vote counts
 */
export const getPollResults = async (pollId) => {
  try {
    const poll = await getPoll(pollId);
    
    if (!poll || !poll.options) {
      return null;
    }

    // Results are already in poll.options (voteCount field)
    // This is maintained via transactions when votes are cast
    return {
      pollId,
      totalVotes: poll.totalVotes || 0,
      options: poll.options.map(option => ({
        id: option.id,
        text: option.text,
        voteCount: option.voteCount || 0,
        percentage: poll.totalVotes > 0 
          ? ((option.voteCount || 0) / poll.totalVotes) * 100 
          : 0
      }))
    };
  } catch (error) {
    console.error('Error getting poll results:', error);
    throw error;
  }
};

/**
 * Get polls created by a specific user (creator dashboard)
 * @param {string} userId - Creator user ID
 * @returns {Promise<Array>} Array of polls created by user
 */
export const getCreatorPolls = async (userId) => {
  try {
    return await getPolls({ createdBy: userId });
  } catch (error) {
    console.error('Error getting creator polls:', error);
    throw error;
  }
};

/**
 * Get poll statistics for admin/creator dashboard
 * @param {string|null} userId - Optional: filter by creator user ID
 * @returns {Promise<Object>} Statistics object
 */
export const getPollStats = async (userId = null) => {
  try {
    const filters = userId ? { createdBy: userId } : {};
    const polls = await getPolls(filters);
    
    return {
      totalPolls: polls.length,
      activePolls: polls.filter(p => p.status === POLL_STATUS.ACTIVE).length,
      closedPolls: polls.filter(p => p.status === POLL_STATUS.CLOSED).length,
      draftPolls: polls.filter(p => p.status === POLL_STATUS.DRAFT).length,
      totalVotes: polls.reduce((sum, p) => sum + (p.totalVotes || 0), 0)
    };
  } catch (error) {
    console.error('Error getting poll stats:', error);
    throw error;
  }
};

/**
 * Export poll results as CSV
 * @param {string} pollId - Poll ID
 * @returns {Promise<string>} CSV string
 */
export const exportPollResultsCSV = async (pollId) => {
  try {
    const poll = await getPoll(pollId);
    if (!poll || !poll.options) {
      throw new Error('Poll not found');
    }

    const results = await getPollResults(pollId);
    
    // CSV header
    let csv = 'Option,Votes,Percentage\n';
    
    // CSV rows
    results.options.forEach(option => {
      csv += `"${option.text}",${option.voteCount},${option.percentage.toFixed(2)}%\n`;
    });
    
    csv += `\nTotal Votes,${results.totalVotes},\n`;
    
    return csv;
  } catch (error) {
    console.error('Error exporting CSV:', error);
    throw error;
  }
};

/**
 * Export poll results as JSON
 * @param {string} pollId - Poll ID
 * @returns {Promise<string>} JSON string
 */
export const exportPollResultsJSON = async (pollId) => {
  try {
    const poll = await getPoll(pollId);
    if (!poll) {
      throw new Error('Poll not found');
    }

    const results = await getPollResults(pollId);
    
    const exportData = {
      pollId: poll.id,
      title: poll.title,
      description: poll.description,
      type: poll.type,
      status: poll.status,
      totalVotes: results.totalVotes,
      exportedAt: new Date().toISOString(),
      options: results.options.map(option => ({
        text: option.text,
        votes: option.voteCount,
        percentage: option.percentage
      }))
    };
    
    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Error exporting JSON:', error);
    throw error;
  }
};
