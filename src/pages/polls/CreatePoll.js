/**
 * Create Poll Page
 * 
 * Allows authenticated users to create a new voting poll
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createPoll } from '../../store/slices/pollsSlice';
import { useToast } from '../../context/ToastContext';
import { ROUTES, POLL_TYPES } from '../../utils/constants';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';

const CreatePoll = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { loading } = useAppSelector((state) => state.polls);
  const { success, error: showError } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: POLL_TYPES.SINGLE_CHOICE,
    options: ['', ''],
    anonymous: false,
    guestVoting: true,
    resultVisibility: 'public',
    showResults: true,
    startsAt: '',
    closesAt: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const removeOption = (index) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, options: newOptions }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = t('polls.errors.titleRequired');
    }

    const validOptions = formData.options.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      newErrors.options = t('polls.errors.minTwoOptions');
    }

    // Validate date range
    if (formData.startsAt && formData.closesAt) {
      const startDate = new Date(formData.startsAt);
      const endDate = new Date(formData.closesAt);
      if (endDate <= startDate) {
        newErrors.closesAt = t('polls.errors.endDateMustBeAfterStartDate');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!user) {
      showError(t('auth.errors.loginRequired'));
      navigate(ROUTES.LOGIN);
      return;
    }

    try {
      const validOptions = formData.options.filter(opt => opt.trim());
      const pollData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        options: validOptions,
        anonymous: formData.anonymous,
        guestVoting: formData.guestVoting,
        resultVisibility: formData.resultVisibility,
        showResults: formData.showResults,
        startsAt: formData.startsAt || null,
        closesAt: formData.closesAt || null
      };

      const result = await dispatch(createPoll({ pollData, userId: user.uid })).unwrap();
      
      success(t('polls.createdSuccess'));
      navigate(`${ROUTES.MY_POLLS}?created=${result.id}`);
    } catch (err) {
      showError(err?.message || err?.toString() || t('polls.errors.createFailed'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('polls.createPoll')}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {t('polls.createPollDescription')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
          {/* Title */}
          <Input
            label={t('polls.title')}
            name="title"
            value={formData.title}
            onChange={handleChange}
            error={errors.title}
            placeholder={t('polls.titlePlaceholder')}
            required
          />

          {/* Description */}
          <Textarea
            label={t('polls.description')}
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder={t('polls.descriptionPlaceholder')}
            rows={3}
          />

          {/* Poll Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('polls.pollType')}
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value={POLL_TYPES.SINGLE_CHOICE}
                  checked={formData.type === POLL_TYPES.SINGLE_CHOICE}
                  onChange={handleChange}
                  className="mr-2"
                />
                {t('polls.singleChoice')}
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value={POLL_TYPES.MULTIPLE_CHOICE}
                  checked={formData.type === POLL_TYPES.MULTIPLE_CHOICE}
                  onChange={handleChange}
                  className="mr-2"
                />
                {t('polls.multipleChoice')}
              </label>
            </div>
          </div>

          {/* Options */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {t('polls.options')} <span className="text-error-500 ml-1">*</span>
            </label>
            {errors.options && (
              <p className="text-sm text-error-600 dark:text-error-400 mb-3">{errors.options}</p>
            )}
            <div className="space-y-3">
              {formData.options.map((option, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <Input
                    name={`option-${index}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`${t('polls.option')} ${index + 1}`}
                    className="flex-1 mb-0"
                    label={null}
                  />
                  {formData.options.length > 2 && (
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => removeOption(index)}
                      className="mt-7"
                    >
                      {t('common.delete')}
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOption}
              className="mt-3"
            >
              + {t('polls.addOption')}
            </Button>
          </div>

          {/* Settings */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('polls.settings')}
            </h3>

            {/* Anonymous Voting */}
            <label className="flex items-center">
              <input
                type="checkbox"
                name="anonymous"
                checked={formData.anonymous}
                onChange={handleChange}
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700 dark:text-gray-300">{t('polls.anonymousVoting')}</span>
            </label>

            {/* Guest Voting */}
            <label className="flex items-center">
              <input
                type="checkbox"
                name="guestVoting"
                checked={formData.guestVoting}
                onChange={handleChange}
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700 dark:text-gray-300">{t('polls.allowGuestVoting')}</span>
            </label>

            {/* Result Visibility */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('polls.resultVisibility')}
              </label>
              <select
                name="resultVisibility"
                value={formData.resultVisibility}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="public">{t('polls.publicResults')}</option>
                <option value="private">{t('polls.privateResults')}</option>
              </select>
            </div>

            {/* Show Results Immediately */}
            <label className="flex items-center">
              <input
                type="checkbox"
                name="showResults"
                checked={formData.showResults}
                onChange={handleChange}
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700 dark:text-gray-300">{t('polls.showResultsImmediately')}</span>
            </label>

            {/* Start Date */}
            <Input
              label={t('polls.startDate')}
              name="startsAt"
              type="datetime-local"
              value={formData.startsAt}
              onChange={handleChange}
              placeholder={t('polls.startDatePlaceholder')}
            />

            {/* End Date */}
            <Input
              label={t('polls.endDate')}
              name="closesAt"
              type="datetime-local"
              value={formData.closesAt}
              onChange={handleChange}
              placeholder={t('polls.endDatePlaceholder')}
              error={errors.closesAt}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading}
            >
              {t('polls.createPoll')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(ROUTES.HOME)}
            >
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePoll;
