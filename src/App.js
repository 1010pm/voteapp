/**
 * Main App Component
 * 
 * Sets up routing, Redux Provider, and i18n
 */

import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { initializeAuth } from './store/slices/authSlice';
import './utils/i18n';
import { ROUTES } from './utils/constants';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';
import Navbar from './components/layout/Navbar';
import LoadingSpinner from './components/common/LoadingSpinner';
import { ToastProvider } from './context/ToastContext';
import './App.css';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/auth/Login'));
const SignUp = lazy(() => import('./pages/auth/SignUp'));
const PasswordReset = lazy(() => import('./pages/auth/PasswordReset'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const CreatePoll = lazy(() => import('./pages/polls/CreatePoll'));
const VotePage = lazy(() => import('./pages/polls/VotePage'));
const PollResults = lazy(() => import('./pages/polls/PollResults'));
const MyPolls = lazy(() => import('./pages/polls/MyPolls'));

// App Content Component (needs hooks)
const AppContent = () => {
  const dispatch = useAppDispatch();
  const { theme, language } = useAppSelector((state) => state.ui);

  // Initialize auth on mount
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  // Apply theme class to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Apply language direction
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  return (
    <BrowserRouter>
      <ToastProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navbar />
          <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          }
        >
          <Routes>
            <Route path={ROUTES.HOME} element={<Home />} />
            <Route path={ROUTES.LOGIN} element={<Login />} />
            <Route path={ROUTES.SIGNUP} element={<SignUp />} />
            <Route path={ROUTES.PASSWORD_RESET} element={<PasswordReset />} />
            <Route
              path={ROUTES.DASHBOARD}
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.ADMIN}
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path={ROUTES.CREATE_POLL}
              element={
                <ProtectedRoute>
                  <CreatePoll />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.MY_POLLS}
              element={
                <ProtectedRoute>
                  <MyPolls />
                </ProtectedRoute>
              }
            />
            <Route path={ROUTES.VOTE} element={<VotePage />} />
            <Route
              path={ROUTES.POLL_RESULTS}
              element={
                <ProtectedRoute>
                  <PollResults />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
          </Routes>
        </Suspense>
        </div>
      </ToastProvider>
    </BrowserRouter>
  );
};

// Main App Component with Provider
function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
