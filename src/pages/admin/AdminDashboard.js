/**
 * Admin Dashboard Page
 * 
 * Admin-only dashboard with analytics and user management
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getAllUsers, getUserStats, deleteDocument } from '../../firebase/firestore';
import { updateUserRole } from '../../firebase/auth';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { refreshUserData } from '../../store/slices/authSlice';
import { ROLES } from '../../utils/constants';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersData, statsData] = await Promise.all([
        getAllUsers(),
        getUserStats()
      ]);
      setUsers(usersData);
      setStats(statsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const { user: currentUser } = useAppSelector((state) => state.auth);

  const handleRoleChange = async (uid, newRole) => {
    try {
      await updateUserRole(uid, newRole);
      await loadData();
      // Refresh current user data if it's the logged-in user
      if (currentUser && currentUser.uid === uid) {
        await dispatch(refreshUserData(uid));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (uid) => {
    if (!window.confirm(t('admin.confirmDeleteUser'))) {
      return;
    }
    try {
      await deleteDocument('users', uid);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('admin.title')}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {t('admin.analytics')}
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('admin.totalUsers')}
              </h3>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalUsers}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('admin.verifiedUsers')}
              </h3>
              <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.verifiedUsers}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('admin.adminUsers')}
              </h3>
              <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats.adminUsers}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('admin.regularUsers')}
              </h3>
              <p className="mt-2 text-3xl font-bold text-purple-600 dark:text-purple-400">
                {stats.regularUsers}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('admin.unverifiedUsers')}
              </h3>
              <p className="mt-2 text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.unverifiedUsers}
              </p>
            </div>
          </div>
        )}

        {/* User Management Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('admin.userManagement')}
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('auth.email')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('common.name')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('admin.changeRole')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {user.displayName || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === ROLES.ADMIN
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 rtl:space-x-reverse">
                      {user.role !== ROLES.ADMIN ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRoleChange(user.id, ROLES.ADMIN)}
                        >
                          {t('admin.makeAdmin')}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRoleChange(user.id, ROLES.USER)}
                        >
                          {t('admin.removeAdmin')}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        {t('admin.deleteUser')}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
