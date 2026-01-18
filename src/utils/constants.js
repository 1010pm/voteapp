/**
 * Application Constants
 */

export const ROLES = {
  ADMIN: 'admin',
  USER: 'user'
};

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark'
};

export const LANGUAGES = {
  EN: 'en',
  AR: 'ar'
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  ADMIN: '/admin',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  PASSWORD_RESET: '/password-reset',
  CREATE_POLL: '/create-poll',
  MY_POLLS: '/my-polls',
  VOTE: '/vote/:id',
  POLL_RESULTS: '/poll/:id/results'
};

// Poll-related constants
export const POLL_TYPES = {
  SINGLE_CHOICE: 'single',
  MULTIPLE_CHOICE: 'multiple'
};

export const POLL_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  CLOSED: 'closed'
};

export const VOTE_STATUS = {
  PENDING: 'pending',
  CAST: 'cast',
  INVALID: 'invalid'
};
