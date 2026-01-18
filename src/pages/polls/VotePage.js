/**
 * Public Voting Page - Premium UI/UX
 * 
 * Accessible via /vote/:id
 * Allows both authenticated users and guests to vote
 * Features: Beautiful charts, smooth animations, premium voting experience
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchPoll, castVoteAction, checkUserVote, fetchPollResults } from '../../store/slices/pollsSlice';
import { useToast } from '../../context/ToastContext';
import { getGuestId } from '../../utils/guestUtils';
import { ROUTES, POLL_STATUS, POLL_TYPES } from '../../utils/constants';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { VotePageSkeleton } from '../../components/common/SkeletonLoader';
import { QRCodeSVG } from 'qrcode.react';
import { getPollVoteUrl, copyToClipboard, shareLink } from '../../utils/qrCodeUtils';
import Confetti from 'react-confetti';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, XAxis, YAxis } from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#84cc16'];

const VotePage = () => {
  const { id: pollId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { currentPoll, userVote, pollResults, loading, error } = useAppSelector((state) => state.polls);
  const { success, error: showError } = useToast();

  const [selectedOptions, setSelectedOptions] = useState([]);
  const [showShare, setShowShare] = useState(false);
  const [voting, setVoting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [viewMode, setViewMode] = useState('bars'); // 'bars' or 'pie'

  useEffect(() => {
    if (pollId) {
      loadPoll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollId]);

  useEffect(() => {
    const updateSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const loadPoll = async () => {
    try {
      // Fetch the poll (this will clear userVote in the reducer)
      const poll = await dispatch(fetchPoll(pollId)).unwrap();
      
      // Check if user/guest has voted on THIS specific poll
      if (user) {
        await dispatch(checkUserVote({ pollId, userId: user.uid })).unwrap();
      } else {
        const guestId = getGuestId();
        await dispatch(checkUserVote({ pollId, userId: null, guestId })).unwrap();
      }

      // Load results if poll allows showing them
      if (poll?.showResults) {
        await dispatch(fetchPollResults(pollId)).unwrap();
      }
    } catch (err) {
      showError(err?.message || err?.toString() || t('polls.errors.pollNotFound'));
    }
  };

  const handleOptionToggle = (optionId) => {
    if (!currentPoll) return;

    if (currentPoll.type === POLL_TYPES.SINGLE_CHOICE) {
      setSelectedOptions([optionId]);
    } else {
      setSelectedOptions(prev =>
        prev.includes(optionId)
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    }
  };

  const handleVote = async () => {
    if (selectedOptions.length === 0) {
      showError(t('polls.errors.selectOption'));
      return;
    }

    if (!currentPoll) return;

    if (!currentPoll.guestVoting && !user) {
      showError(t('polls.errors.loginRequired'));
      navigate(ROUTES.LOGIN);
      return;
    }

    if (currentPoll.status !== POLL_STATUS.ACTIVE) {
      showError(t('polls.errors.pollNotActive'));
      return;
    }

    setVoting(true);
    try {
      const userId = user?.uid || null;
      const guestId = !user ? getGuestId() : null;

      await dispatch(castVoteAction({
        pollId,
        userId,
        optionIds: selectedOptions,
        anonymous: currentPoll.anonymous,
        guestId
      })).unwrap();

      success(t('polls.voteSubmitted'));
      setShowConfetti(true);
      await loadPoll();
    } catch (err) {
      showError(err?.message || err?.toString() || t('polls.errors.voteFailed'));
    } finally {
      setVoting(false);
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

  const handleShare = async () => {
    const url = getPollVoteUrl(pollId);
    const shared = await shareLink({
      title: currentPoll?.title || 'Vote Now',
      text: currentPoll?.description || '',
      url
    });

    if (!shared) {
      await handleCopyLink();
    }
  };

  if (loading && !currentPoll) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <VotePageSkeleton />
        </div>
      </div>
    );
  }

  if (error || !currentPoll) {
    const errorMessage = typeof error === 'string' ? error : error?.message || error?.toString() || t('polls.errors.pollNotFound');
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card border-error-200 dark:border-error-800"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-error-600 dark:text-error-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-error-900 dark:text-error-200 mb-1">
                  {t('polls.errors.pollNotFound')}
                </h3>
                <p className="text-error-700 dark:text-error-300">{errorMessage}</p>
              </div>
            </div>
            <div className="mt-6">
              <Button onClick={() => navigate(ROUTES.HOME)}>
                {t('common.back')}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const hasVoted = userVote !== null;
  const canShowResults = hasVoted || currentPoll.showResults || currentPoll.status === POLL_STATUS.CLOSED;

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
      {/* Confetti Animation */}
      {showConfetti && windowSize.width > 0 && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={300}
          gravity={0.3}
        />
      )}
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Poll Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="card card-hover mb-6"
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 leading-tight">
                {currentPoll.title}
              </h1>
              {currentPoll.description && (
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  {currentPoll.description}
                </p>
              )}
            </div>
            {currentPoll.status === POLL_STATUS.ACTIVE && (
              <span className="px-3 py-1 bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300 text-sm font-semibold rounded-full whitespace-nowrap">
                {t('polls.active')}
              </span>
            )}
          </div>

          {/* Share Section */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowShare(!showShare)}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              }
            >
              {showShare ? t('polls.hideShare') : t('polls.sharePoll')}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCopyLink}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              }
            >
              {t('polls.copyLink')}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleShare}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              }
            >
              {t('polls.share')}
            </Button>
          </div>

          {/* Share Panel with QR Code */}
          <AnimatePresence>
            {showShare && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-6 p-6 bg-gradient-to-br from-primary-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-primary-200 dark:border-gray-600">
                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex-shrink-0 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                      <QRCodeSVG 
                        value={getPollVoteUrl(pollId)} 
                        size={180}
                        level="H"
                        includeMargin={true}
                      />
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
                          className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <Button size="sm" onClick={handleCopyLink}>
                          {t('polls.copy')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Voting Section */}
        <AnimatePresence mode="wait">
          {!hasVoted && currentPoll.status === POLL_STATUS.ACTIVE ? (
            <motion.div
              key="voting"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="card mb-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('polls.voteNow')}
              </h2>

              <div className="space-y-3 mb-8">
                {currentPoll.options?.map((option, index) => {
                  const isSelected = selectedOptions.includes(option.id);
                  return (
                    <motion.label
                      key={option.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`flex items-center p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 shadow-md'
                          : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <div className="relative flex-shrink-0 mr-4">
                        <input
                          type={currentPoll.type === POLL_TYPES.SINGLE_CHOICE ? 'radio' : 'checkbox'}
                          name="poll-option"
                          checked={isSelected}
                          onChange={() => handleOptionToggle(option.id)}
                          className="sr-only"
                        />
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected 
                            ? 'border-primary-600 bg-primary-600' 
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {isSelected && (
                            <motion.svg
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-4 h-4 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </motion.svg>
                          )}
                        </div>
                      </div>
                      <span className="text-gray-900 dark:text-white flex-1 text-lg font-medium">
                        {option.text}
                      </span>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-2"
                        >
                          <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </motion.div>
                      )}
                    </motion.label>
                  );
                })}
              </div>

              <Button
                onClick={handleVote}
                loading={voting}
                disabled={selectedOptions.length === 0 || voting}
                fullWidth
                size="lg"
                className="text-lg py-4"
              >
                {t('polls.submitVote')}
              </Button>
            </motion.div>
          ) : hasVoted ? (
            <motion.div
              key="voted"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card border-success-200 dark:border-success-800 bg-success-50/50 dark:bg-success-900/10 mb-6"
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-success-600 dark:text-success-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-success-800 dark:text-success-200 font-medium text-lg">
                  {t('polls.alreadyVoted')}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="closed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card border-warning-200 dark:border-warning-800 bg-warning-50/50 dark:bg-warning-900/10 mb-6"
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-warning-600 dark:text-warning-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-warning-800 dark:text-warning-200 font-medium text-lg">
                  {t('polls.pollClosed')}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Section */}
        {canShowResults && pollResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  {t('polls.results')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('polls.totalVotes')}: <span className="font-bold text-primary-600 dark:text-primary-400">{pollResults.totalVotes}</span>
                </p>
              </div>
              <div className="flex gap-2 mt-4 sm:mt-0">
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
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--tw-color-gray-800)',
                        border: 'none',
                        borderRadius: '0.5rem',
                        color: 'white'
                      }}
                    />
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

        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => navigate(ROUTES.HOME)}>
            {t('common.back')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VotePage;
