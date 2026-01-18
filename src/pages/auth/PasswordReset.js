/**
 * Password Reset Page
 * 
 * Send password reset email to user
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { resetPassword } from '../../firebase/auth';
import { ROUTES } from '../../utils/constants';
import { isValidEmail, getFirebaseErrorMessage } from '../../utils/validation';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const PasswordReset = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  const handleChange = (e) => {
    setEmail(e.target.value);
    setEmailError('');
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!email) {
      setEmailError(t('errors.required'));
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError(t('auth.invalidEmail'));
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {t('auth.resetPassword')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {t('auth.dontHaveAccount')}{' '}
            <Link
              to={ROUTES.SIGNUP}
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              {t('auth.signup')}
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg">
              {t('auth.passwordResetSent')}
            </div>
          )}

          <div>
            <Input
              label={t('auth.email')}
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              error={emailError}
              placeholder={t('auth.email')}
              required
            />
          </div>

          <div>
            <Button
              type="submit"
              fullWidth
              loading={loading}
              disabled={loading || success}
            >
              {t('auth.sendResetEmail')}
            </Button>
          </div>

          <div className="text-center">
            <Link
              to={ROUTES.LOGIN}
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              {t('common.back')} {t('auth.login')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordReset;
