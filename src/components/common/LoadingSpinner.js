/**
 * Loading Spinner Component
 * 
 * Premium loading indicator with smooth animations
 */

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const LoadingSpinner = ({ size = 'md', text = null, fullScreen = false }) => {
  const { t } = useTranslation();
  const displayText = text || t('common.loading');

  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-[3px]',
    xl: 'h-16 w-16 border-[3px]'
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50'
    : 'flex flex-col items-center justify-center p-4';

  return (
    <div className={containerClasses}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear'
        }}
        className={`rounded-full border-t-primary-600 border-r-primary-600 border-b-transparent border-l-transparent ${sizeClasses[size]}`}
      />
      {displayText && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-sm font-medium text-gray-600 dark:text-gray-400"
        >
          {displayText}
        </motion.p>
      )}
    </div>
  );
};

export default LoadingSpinner;

