/**
 * My Polls Dashboard
 * 
 * Creator dashboard to view and manage all created polls
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../store/hooks';
import { getCreatorPolls, closePoll, deletePoll } from '../../services/pollsService';
import { useToast } from '../../context/ToastContext';
import { ROUTES, POLL_STATUS } from '../../utils/constants';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { motion } from 'framer-motion';
import { getPollVoteUrl, copyToClipboard } from '../../utils/qrCodeUtils';

const MyPolls = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { user } = useAppSelector((state) => state.auth);
  const { success, error: showError } = useToast();

  const [polls, setPolls] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingPolls, setLoadingPolls] = useState(true);

  useEffect(() => {
    if (user) {
      loadMyPolls();
      
      // Show success message if poll was just created
      const createdPollId = searchParams.get('created');
      if (createdPollId) {
        success(t('polls.createdSuccess'));
        // Scroll to top
        window.scrollTo(0, 0);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadMyPolls = async () => {
    if (!user) return;

    setLoadingPolls(true);
    try {
      const myPolls = await getCreatorPolls(user.uid);
      setPolls(myPolls);

      // Calculate stats
      setStats({
        total: myPolls.length,
        active: myPolls.filter(p => p.status === POLL_STATUS.ACTIVE).length,
        closed: myPolls.filter(p => p.status === POLL_STATUS.CLOSED).length,
        totalVotes: myPolls.reduce((sum, p) => sum + (p.totalVotes || 0), 0)
      });
    } catch (err) {
      showError(err?.message || err?.toString() || t('errors.generic'));
    } finally {
      setLoadingPolls(false);
    }
  };

  const handleClosePoll = async (pollId) => {
    if (!window.confirm(t('polls.closePoll') + '?')) {
      return;
    }

    try {
      await closePoll(pollId);
      success(t('polls.pollClosedSuccess'));
      await loadMyPolls();
    } catch (err) {
      showError(err?.message || err?.toString() || t('errors.generic'));
    }
  };

  const handleDeletePoll = async (pollId) => {
    if (!window.confirm(t('polls.confirmDeletePoll'))) {
      return;
    }

    try {
      await deletePoll(pollId);
      success(t('polls.pollDeletedSuccess'));
      await loadMyPolls();
    } catch (err) {
      showError(err?.message || err?.toString() || t('errors.generic'));
    }
  };

  const handleCopyLink = async (pollId) => {
    const url = getPollVoteUrl(pollId);
    const copied = await copyToClipboard(url);
    if (copied) {
      success(t('polls.linkCopied'));
    } else {
      showError(t('polls.linkCopyFailed'));
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      [POLL_STATUS.ACTIVE]: {
        label: t('polls.active'),
        className: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
      },
      [POLL_STATUS.CLOSED]: {
        label: t('polls.closed'),
        className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
      },
      [POLL_STATUS.DRAFT]: {
        label: t('polls.draft'),
        className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
      }
    };

    const config = statusConfig[status] || statusConfig[POLL_STATUS.DRAFT];
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.className}`}>
        {config.label}
      </span>
    );
  };

  if (loadingPolls) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('polls.myPolls')}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {t('polls.viewMyPolls')}
            </p>
          </div>
          <Link to={ROUTES.CREATE_POLL}>
            <Button variant="primary">
              + {t('polls.createPoll')}
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
            >
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('polls.total')}
              </h3>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {stats.total}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
            >
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('polls.active')}
              </h3>
              <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.active}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
            >
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('polls.closed')}
              </h3>
              <p className="mt-2 text-3xl font-bold text-gray-600 dark:text-gray-400">
                {stats.closed}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
            >
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('polls.totalVotes')}
              </h3>
              <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats.totalVotes}
              </p>
            </motion.div>
          </div>
        )}

        {/* Polls List */}
        {polls.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card text-center py-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="flex justify-center mb-6"
            >
              <div className="w-32 h-32 bg-gradient-to-br from-primary-100 to-indigo-100 dark:from-primary-900/20 dark:to-indigo-900/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-16 h-16 text-primary-600 dark:text-primary-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {t('polls.noPollsYet')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              {t('polls.noPollsDescription')}
            </p>
            <Link to={ROUTES.CREATE_POLL}>
              <Button variant="primary" size="lg">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t('polls.createPoll')}
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {polls.map((poll, index) => (
              <motion.div
                key={poll.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -2 }}
                className="card card-hover group"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {poll.title}
                        </h3>
                        {getStatusBadge(poll.status)}
                      </div>
                    </div>
                    {poll.description && (
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {poll.description}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span className="font-semibold text-primary-600 dark:text-primary-400">{poll.totalVotes || 0}</span>
                        <span>{t('polls.votes')}</span>
                      </div>
                      <span className="text-gray-300 dark:text-gray-600">•</span>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span>{poll.options?.length || 0} {t('polls.options')}</span>
                      </div>
                      {poll.createdAt && (
                        <>
                          <span className="text-gray-300 dark:text-gray-600">•</span>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{new Date(poll.createdAt?.toDate?.() || poll.createdAt).toLocaleDateString()}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 md:flex-col md:items-end">
                    <Link to={`${ROUTES.POLL_RESULTS.replace(':id', poll.id)}`}>
                      <Button variant="primary" size="sm" fullWidth className="md:w-auto">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        {t('polls.viewResults')}
                      </Button>
                    </Link>
                    <Link to={`${ROUTES.VOTE.replace(':id', poll.id)}`} target="_blank">
                      <Button variant="outline" size="sm" fullWidth className="md:w-auto">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {t('polls.viewAsVoter')}
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyLink(poll.id)}
                      fullWidth
                      className="md:w-auto"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      {t('polls.copyLink')}
                    </Button>
                    {poll.status === POLL_STATUS.ACTIVE && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleClosePoll(poll.id)}
                        fullWidth
                        className="md:w-auto"
                      >
                        {t('polls.closePoll')}
                      </Button>
                    )}
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeletePoll(poll.id)}
                      fullWidth
                      className="md:w-auto"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      {t('common.delete')}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPolls;
