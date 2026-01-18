/**
 * UI Redux Slice
 * 
 * Manages UI state:
 * - Dark mode
 * - Language
 * - Loading states
 * - Notifications
 */

import { createSlice } from '@reduxjs/toolkit';

// Get initial theme from localStorage
const getInitialTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  return savedTheme || 'light';
};

// Get initial language from localStorage
const getInitialLanguage = () => {
  const savedLang = localStorage.getItem('language');
  return savedLang || 'en';
};

const initialState = {
  theme: getInitialTheme(),
  language: getInitialLanguage(),
  sidebarOpen: false,
  loading: false
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.theme);
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
      localStorage.setItem('language', action.payload);
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    }
  }
});

export const {
  setTheme,
  toggleTheme,
  setLanguage,
  setSidebarOpen,
  toggleSidebar,
  setLoading
} = uiSlice.actions;

export default uiSlice.reducer;
