/**
 * Polls Redux Slice
 * 
 * Manages polls state:
 * - List of polls
 * - Current poll being viewed
 * - Poll results
 * - Loading states
 * - Error states
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as pollsService from '../../services/pollsService';

// Initial state
const initialState = {
  polls: [],
  currentPoll: null,
  pollResults: null,
  userVote: null,
  loading: false,
  error: null,
  filters: {
    status: null
  }
};

// Async thunks
export const fetchPolls = createAsyncThunk(
  'polls/fetchPolls',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const polls = await pollsService.getPolls(filters);
      return polls;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPoll = createAsyncThunk(
  'polls/fetchPoll',
  async (pollId, { rejectWithValue }) => {
    try {
      const poll = await pollsService.getPoll(pollId);
      if (!poll) {
        return rejectWithValue('Poll not found');
      }
      return poll;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createPoll = createAsyncThunk(
  'polls/createPoll',
  async ({ pollData, userId }, { rejectWithValue }) => {
    try {
      const pollId = await pollsService.createPoll(pollData, userId);
      const poll = await pollsService.getPoll(pollId);
      return poll;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updatePollAction = createAsyncThunk(
  'polls/updatePoll',
  async ({ pollId, updates }, { rejectWithValue }) => {
    try {
      await pollsService.updatePoll(pollId, updates);
      const poll = await pollsService.getPoll(pollId);
      return poll;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const closePollAction = createAsyncThunk(
  'polls/closePoll',
  async (pollId, { rejectWithValue }) => {
    try {
      await pollsService.closePoll(pollId);
      const poll = await pollsService.getPoll(pollId);
      return poll;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deletePollAction = createAsyncThunk(
  'polls/deletePoll',
  async (pollId, { rejectWithValue }) => {
    try {
      await pollsService.deletePoll(pollId);
      return pollId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPollResults = createAsyncThunk(
  'polls/fetchPollResults',
  async (pollId, { rejectWithValue }) => {
    try {
      const results = await pollsService.getPollResults(pollId);
      return results;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const checkUserVote = createAsyncThunk(
  'polls/checkUserVote',
  async ({ pollId, userId, guestId = null }, { rejectWithValue }) => {
    try {
      const vote = await pollsService.getUserVote(pollId, userId, guestId);
      return vote;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const castVoteAction = createAsyncThunk(
  'polls/castVote',
  async ({ pollId, userId, optionIds, anonymous, guestId }, { rejectWithValue }) => {
    try {
      await pollsService.castVote(pollId, userId, optionIds, anonymous, guestId);
      
      // Fetch updated poll and results
      const [poll, results, vote] = await Promise.all([
        pollsService.getPoll(pollId),
        pollsService.getPollResults(pollId),
        pollsService.getUserVote(pollId, userId, guestId)
      ]);

      return { poll, results, vote };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Polls slice
const pollsSlice = createSlice({
  name: 'polls',
  initialState,
  reducers: {
    clearCurrentPoll: (state) => {
      state.currentPoll = null;
      state.pollResults = null;
      state.userVote = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch polls
      .addCase(fetchPolls.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPolls.fulfilled, (state, action) => {
        state.loading = false;
        state.polls = action.payload;
        state.error = null;
      })
      .addCase(fetchPolls.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch poll
      .addCase(fetchPoll.pending, (state) => {
        state.loading = true;
        state.error = null;
        // Clear previous vote when loading a new poll
        state.userVote = null;
      })
      .addCase(fetchPoll.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPoll = action.payload;
        state.error = null;
      })
      .addCase(fetchPoll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create poll
      .addCase(createPoll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPoll.fulfilled, (state, action) => {
        state.loading = false;
        state.polls.unshift(action.payload);
        state.error = null;
      })
      .addCase(createPoll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update poll
      .addCase(updatePollAction.fulfilled, (state, action) => {
        const index = state.polls.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.polls[index] = action.payload;
        }
        if (state.currentPoll?.id === action.payload.id) {
          state.currentPoll = action.payload;
        }
      })
      // Close poll
      .addCase(closePollAction.fulfilled, (state, action) => {
        const index = state.polls.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.polls[index] = action.payload;
        }
        if (state.currentPoll?.id === action.payload.id) {
          state.currentPoll = action.payload;
        }
      })
      // Delete poll
      .addCase(deletePollAction.fulfilled, (state, action) => {
        state.polls = state.polls.filter(p => p.id !== action.payload);
        if (state.currentPoll?.id === action.payload) {
          state.currentPoll = null;
          state.pollResults = null;
          state.userVote = null;
        }
      })
      // Fetch poll results
      .addCase(fetchPollResults.fulfilled, (state, action) => {
        state.pollResults = action.payload;
      })
      // Check user vote
      .addCase(checkUserVote.fulfilled, (state, action) => {
        state.userVote = action.payload;
      })
      // Cast vote
      .addCase(castVoteAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(castVoteAction.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPoll = action.payload.poll;
        state.pollResults = action.payload.results;
        state.userVote = action.payload.vote;
        state.error = null;
        
        // Update poll in polls list
        const index = state.polls.findIndex(p => p.id === action.payload.poll.id);
        if (index !== -1) {
          state.polls[index] = action.payload.poll;
        }
      })
      .addCase(castVoteAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearCurrentPoll, clearError, setFilters } = pollsSlice.actions;
export default pollsSlice.reducer;
