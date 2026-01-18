/**
 * User Dashboard Page
 * 
 * Main dashboard for authenticated users
 */

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../store/hooks';
import { ROUTES } from '../../utils/constants';
import Button from '../../components/common/Button';

const Dashboard = () => {
  const { t } = useTranslation();
  const { userData } = useAppSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('dashboard.welcome')}, {userData?.displayName || 'User'}!
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {t('dashboard.title')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Create Poll Card */}
          <Link to={ROUTES.CREATE_POLL} className="block">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-dashed border-blue-300 dark:border-blue-700 hover:border-blue-500 dark:hover:border-blue-500">
              <div className="flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">
                {t('polls.createPoll')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center text-sm">
                {t('polls.createPollDescription')}
              </p>
            </div>
          </Link>

          {/* My Polls Card */}
          <Link to={ROUTES.MY_POLLS} className="block">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">
                {t('polls.myPolls')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center text-sm">
                {t('polls.viewMyPolls')}
              </p>
            </div>
          </Link>

          {/* Stats Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t('dashboard.stats')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {t('dashboard.statsDescription')}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('dashboard.quickActions')}
          </h3>
          <div className="flex flex-wrap gap-4">
            <Link to={ROUTES.CREATE_POLL}>
              <Button variant="primary">
                {t('polls.createPoll')}
              </Button>
            </Link>
            <Link to={ROUTES.MY_POLLS}>
              <Button variant="outline">
                {t('polls.myPolls')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
