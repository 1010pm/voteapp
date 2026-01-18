/**
 * Authentication Redux Slice
 * 
 * Manages authentication state:
 * - Current user
 * - User data (from Firestore)
 * - User role
 * - Loading states
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  onAuthStateChange,
  getUserData,
  getUserRole,
  logout as firebaseLogout
} from '../../firebase/auth';

// Initial state
const initialState = {
  user: null,
  userData: null,
  role: 'user',
  loading: true,
  error: null
};

// Async thunk to initialize auth state
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChange(async (user) => {
          unsubscribe();
          if (user) {
            try {
              const [userData, role] = await Promise.all([
                getUserData(user.uid),
                getUserRole(user.uid)
              ]);
              resolve({ user, userData, role });
            } catch (error) {
              reject(rejectWithValue(error.message));
            }
          } else {
            resolve({ user: null, userData: null, role: 'user' });
          }
        });
      });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to refresh user data
export const refreshUserData = createAsyncThunk(
  'auth/refreshUserData',
  async (uid, { rejectWithValue }) => {
    try {
      const [userData, role] = await Promise.all([
        getUserData(uid),
        getUserRole(uid)
      ]);
      return { userData, role };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to logout
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await firebaseLogout();
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    setRole: (state, action) => {
      state.role = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Initialize auth
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.userData = action.payload.userData;
        state.role = action.payload.role;
        state.loading = false;
        state.error = null;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Refresh user data
      .addCase(refreshUserData.fulfilled, (state, action) => {
        state.userData = action.payload.userData;
        state.role = action.payload.role;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.userData = null;
        state.role = 'user';
        state.error = null;
      });
  }
});

export const { setUser, setUserData, setRole, clearError } = authSlice.actions;
export default authSlice.reducer;
