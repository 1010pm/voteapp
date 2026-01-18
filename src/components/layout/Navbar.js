/**
 * Navigation Bar Component
 * 
 * Main navigation with user menu and language/theme switchers
 */

import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { toggleTheme, setLanguage } from '../../store/slices/uiSlice';
import { ROUTES, ROLES, LANGUAGES } from '../../utils/constants';
import Button from '../common/Button';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, userData, role } = useAppSelector((state) => state.auth);
  const { theme, language } = useAppSelector((state) => state.ui);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate(ROUTES.LOGIN);
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const handleLanguageChange = (lang) => {
    dispatch(setLanguage(lang));
    i18n.changeLanguage(lang);
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              to={user ? ROUTES.DASHBOARD : ROUTES.HOME}
              className="text-xl font-bold text-blue-600 dark:text-blue-400"
            >
              VoteApp
            </Link>
          </div>

          {/* Navigation Links */}
          {user && (
            <div className="hidden md:flex items-center space-x-4 rtl:space-x-reverse">
              <Link
                to={ROUTES.DASHBOARD}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium"
              >
                {t('navigation.dashboard')}
              </Link>
              <Link
                to={ROUTES.CREATE_POLL}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium"
              >
                {t('navigation.createPoll')}
              </Link>
              <Link
                to={ROUTES.MY_POLLS}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium"
              >
                {t('navigation.myPolls')}
              </Link>
              {role === ROLES.ADMIN && (
                <Link
                  to={ROUTES.ADMIN}
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium"
                >
                  {t('navigation.admin')}
                </Link>
              )}
            </div>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {/* Language Switcher */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <button
                onClick={() => handleLanguageChange(LANGUAGES.EN)}
                className={`px-2 py-1 text-sm rounded ${
                  language === LANGUAGES.EN
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => handleLanguageChange(LANGUAGES.AR)}
                className={`px-2 py-1 text-sm rounded ${
                  language === LANGUAGES.AR
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                AR
              </button>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={handleThemeToggle}
              className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label={t('theme.toggleTheme')}
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            {/* User Menu */}
            {user ? (
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {userData?.displayName || user.email}
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  {t('auth.logout')}
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Link to={ROUTES.LOGIN}>
                  <Button variant="outline" size="sm">
                    {t('auth.login')}
                  </Button>
                </Link>
                <Link to={ROUTES.SIGNUP}>
                  <Button size="sm">{t('auth.signup')}</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
