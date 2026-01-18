/**
 * Skeleton Loader Component
 * 
 * Premium skeleton loading states for better perceived performance
 */

import { motion } from 'framer-motion';

const SkeletonLoader = ({ 
  variant = 'text', 
  width = '100%', 
  height = '1rem',
  className = '',
  lines = 1,
  rounded = true
}) => {
  const baseClasses = `skeleton ${rounded ? 'rounded-lg' : ''} ${className}`;

  if (variant === 'text') {
    return (
      <div className="space-y-2" style={{ width }}>
        {Array.from({ length: lines }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: index * 0.1
            }}
            className={baseClasses}
            style={{ height, width: index === lines - 1 ? '80%' : '100%' }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <motion.div
        initial={{ opacity: 0.6 }}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className={`${baseClasses} p-6`}
        style={{ width, height }}
      >
        <div className="space-y-4">
          <div className="skeleton rounded-lg h-6 w-3/4" />
          <div className="skeleton rounded-lg h-4 w-full" />
          <div className="skeleton rounded-lg h-4 w-5/6" />
        </div>
      </motion.div>
    );
  }

  if (variant === 'circle') {
    return (
      <motion.div
        initial={{ opacity: 0.6 }}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className={`${baseClasses} rounded-full`}
        style={{ width: height, height }}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0.6 }}
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      className={baseClasses}
      style={{ width, height }}
    />
  );
};

// Poll Card Skeleton
export const PollCardSkeleton = () => (
  <div className="card">
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <SkeletonLoader variant="text" width="60%" height="1.5rem" />
        <SkeletonLoader variant="circle" height="1.5rem" width="1.5rem" />
      </div>
      <SkeletonLoader variant="text" lines={2} height="1rem" />
      <div className="flex gap-4">
        <SkeletonLoader variant="text" width="30%" height="0.875rem" />
        <SkeletonLoader variant="text" width="30%" height="0.875rem" />
      </div>
      <div className="flex gap-2">
        <SkeletonLoader variant="text" width="5rem" height="2.5rem" rounded />
        <SkeletonLoader variant="text" width="5rem" height="2.5rem" rounded />
      </div>
    </div>
  </div>
);

// Vote Page Skeleton
export const VotePageSkeleton = () => (
  <div className="space-y-6">
    <div className="card">
      <SkeletonLoader variant="text" width="70%" height="2rem" className="mb-4" />
      <SkeletonLoader variant="text" lines={2} height="1rem" />
    </div>
    <div className="card">
      <SkeletonLoader variant="text" width="40%" height="1.5rem" className="mb-4" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton rounded-lg h-16" />
        ))}
      </div>
    </div>
  </div>
);

export default SkeletonLoader;
