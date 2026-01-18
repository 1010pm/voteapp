/**
 * Poll Results Page - Creator/Owner View
 * 
 * Dedicated page for poll creators to view:
 * - Detailed results
 * - Analytics
 * - Voter information (if enabled)
 * - Poll management actions
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchPoll, fetchPollResults, closePollAction } from '../../store/slices/pollsSlice';
import { useToast } from '../../context/ToastContext';
import { ROUTES, POLL_STATUS } from '../../utils/constants';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { QRCodeSVG } from 'qrcode.react';
import { getPollVoteUrl, copyToClipboard } from '../../utils/qrCodeUtils';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, XAxis, YAxis } from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#84cc16'];

const PollResults = () => {
  const { id: pollId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { currentPoll, pollResults, loading, error } = useAppSelector((state) => state.polls);
  const { success, error: showError } = useToast();

  const [viewMode, setViewMode] = useState('bars');
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    if (pollId) {
      loadPoll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollId]);

  const loadPoll = async () => {
    try {
      const poll = await dispatch(fetchPoll(pollId)).unwrap();
      
      // Check if user is the creator
      if (poll.createdBy !== user?.uid) {
        showError(t('polls.errors.unauthorizedAccess'));
        navigate(ROUTES.MY_POLLS);
        return;
      }

      // Load results (creators can always see results)
      await dispatch(fetchPollResults(pollId)).unwrap();
    } catch (err) {
      showError(err?.message || err?.toString() || t('polls.errors.pollNotFound'));
    }
  };

  const handleClosePoll = async () => {
    if (!window.confirm(t('polls.closePoll') + '?')) {
      return;
    }

    try {
      await dispatch(closePollAction(pollId)).unwrap();
      success(t('polls.pollClosedSuccess'));
      await loadPoll();
    } catch (err) {
      showError(err?.message || err?.toString() || t('errors.generic'));
    }
  };

  const handleCopyLink = async () => {
    const url = getPollVoteUrl(pollId);
    const copied = await copyToClipboard(url);
    if (copied) {
      success(t('polls.linkCopied'));
    } else {
      showError(t('polls.linkCopyFailed'));
    }
  };

  if (loading && !currentPoll) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !currentPoll) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card border-error-200 dark:border-error-800">
            <p className="text-error-600 dark:text-error-400">{error || t('polls.errors.pollNotFound')}</p>
            <div className="mt-4">
              <Button onClick={() => navigate(ROUTES.MY_POLLS)}>
                {t('common.back')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const chartData = pollResults?.options?.map((option, index) => ({
    name: option.text,
    value: option.voteCount,
    percentage: option.percentage,
    fill: COLORS[index % COLORS.length]
  })) || [];

  const winningOption = pollResults?.options?.reduce((max, option) => 
    option.voteCount > (max?.voteCount || 0) ? option : max
  , null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {t('polls.results')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('polls.creatorResultsDescription')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(ROUTES.MY_POLLS)}
            >
              {t('common.back')}
            </Button>
          </div>
        </motion.div>

        {/* Poll Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card mb-6"
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentPoll.title}
                </h2>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  currentPoll.status === POLL_STATUS.ACTIVE
                    ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {currentPoll.status === POLL_STATUS.ACTIVE ? t('polls.active') : t('polls.closed')}
                </span>
              </div>
              {currentPoll.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {currentPoll.description}
                </p>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span>
                  {t('polls.totalVotes')}: <strong className="text-primary-600 dark:text-primary-400">{pollResults?.totalVotes || 0}</strong>
                </span>
                <span>•</span>
                <span>
                  {currentPoll.options?.length || 0} {t('polls.options')}
                </span>
                {currentPoll.createdAt && (
                  <>
                    <span>•</span>
                    <span>
                      {t('polls.createdAt')}: {new Date(currentPoll.createdAt?.toDate?.() || currentPoll.createdAt).toLocaleDateString()}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            {currentPoll.status === POLL_STATUS.ACTIVE && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleClosePoll}
              >
                {t('polls.closePoll')}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowShare(!showShare)}
            >
              {showShare ? t('polls.hideShare') : t('polls.sharePoll')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
            >
              {t('polls.copyLink')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(getPollVoteUrl(pollId), '_blank')}
            >
              {t('polls.viewAsVoter')}
            </Button>
          </div>

          {/* Share Panel */}
          {showShare && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-6 p-6 bg-gradient-to-br from-primary-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-primary-200 dark:border-gray-600"
            >
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-shrink-0 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                  <QRCodeSVG value={getPollVoteUrl(pollId)} size={180} level="H" includeMargin={true} />
                </div>
                <div className="flex-1 w-full">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-lg">
                    {t('polls.sharePoll')}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {t('polls.shareDescription')}
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={getPollVoteUrl(pollId)}
                      className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none"
                    />
                    <Button size="sm" onClick={handleCopyLink}>
                      {t('polls.copy')}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Results Charts */}
        {pollResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card mb-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {t('polls.results')}
              </h3>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'bars' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('bars')}
                >
                  {t('polls.bars')}
                </Button>
                <Button
                  variant={viewMode === 'pie' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('pie')}
                >
                  {t('polls.pie')}
                </Button>
              </div>
            </div>

            {/* Charts */}
            <div className="mb-8">
              {viewMode === 'bars' ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" tick={{ fill: 'currentColor' }} className="text-gray-600 dark:text-gray-400" />
                    <YAxis tick={{ fill: 'currentColor' }} className="text-gray-600 dark:text-gray-400" />
                    <Tooltip />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Detailed Results */}
            <div className="space-y-4">
              {pollResults.options.map((option, index) => {
                const isWinning = winningOption?.id === option.id;
                return (
                  <motion.div
                    key={option.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isWinning
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-gray-900 dark:text-white font-semibold text-lg">
                          {option.text}
                        </span>
                        {isWinning && (
                          <span className="px-2 py-0.5 bg-primary-600 text-white text-xs font-bold rounded-full">
                            {t('polls.winner')}
                          </span>
                        )}
                      </div>
                      <span className="text-gray-600 dark:text-gray-400 font-medium">
                        {option.voteCount} <span className="text-sm">({option.percentage.toFixed(1)}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${option.percentage}%` }}
                        transition={{ duration: 1, delay: index * 0.1, ease: 'easeOut' }}
                        className={`h-full rounded-full ${
                          isWinning ? 'bg-gradient-to-r from-primary-500 to-primary-600' : 'bg-primary-500'
                        }`}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PollResults;
