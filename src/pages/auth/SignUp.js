/**
 * Sign Up Page
 * 
 * User registration with email/password and Google Sign-In
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { signUpWithEmail, signInWithGoogle } from '../../firebase/auth';
import { initializeAuth } from '../../store/slices/authSlice';
import { ROUTES } from '../../utils/constants';
import {
  isValidEmail,
  validatePassword,
  validatePasswordMatch,
  getFirebaseErrorMessage
} from '../../utils/validation';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const SignUp = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, loading: authLoading } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      navigate(ROUTES.DASHBOARD);
    }
  }, [user, authLoading, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setError(null);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = t('errors.required');
    }

    if (!formData.email) {
      newErrors.email = t('errors.required');
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = t('auth.invalidEmail');
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.message;
    }

    const passwordMatchValidation = validatePasswordMatch(
      formData.password,
      formData.confirmPassword
    );
    if (!passwordMatchValidation.valid) {
      newErrors.confirmPassword = t('auth.passwordsDontMatch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await signUpWithEmail(
        formData.email,
        formData.password,
        formData.displayName
      );
      await dispatch(initializeAuth());
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      await dispatch(initializeAuth());
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {t('auth.createAccount')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {t('auth.alreadyHaveAccount')}{' '}
            <Link
              to={ROUTES.LOGIN}
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              {t('auth.login')}
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Input
              label={t('common.name')}
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              error={errors.displayName}
              placeholder={t('common.name')}
              required
            />

            <Input
              label={t('auth.email')}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder={t('auth.email')}
              required
            />

            <Input
              label={t('auth.password')}
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder={t('auth.password')}
              required
            />

            <Input
              label={t('auth.confirmPassword')}
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              placeholder={t('auth.confirmPassword')}
              required
            />
          </div>

          <div>
            <Button
              type="submit"
              fullWidth
              loading={loading}
              disabled={loading}
            >
              {t('auth.signup')}
            </Button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                  {t('common.or')}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <svg
                  className="w-5 h-5 mr-2"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {t('auth.signInWithGoogle')}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
