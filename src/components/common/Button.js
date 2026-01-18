/**
 * Button Component
 * 
 * Premium reusable button with variants, loading state, and smooth animations
 */

import { motion } from 'framer-motion';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  icon = null,
  iconPosition = 'left'
}) => {
  const baseClasses = 'btn-base relative overflow-hidden';

  const variantClasses = {
    primary:
      'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-md hover:shadow-lg active:shadow-md',
    secondary:
      'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600',
    danger:
      'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500 shadow-md hover:shadow-lg active:shadow-md',
    outline:
      'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500 dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-900/20 dark:hover:border-primary-300',
    ghost:
      'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-gray-500'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-5 py-2.5 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-2.5'
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';

  const buttonContent = (
    <>
      {loading && (
        <svg
          className={`animate-spin ${iconSize} flex-shrink-0`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {!loading && icon && iconPosition === 'left' && (
        <span className={iconSize}>{icon}</span>
      )}
      <span className={loading ? 'opacity-0' : ''}>{children}</span>
      {!loading && icon && iconPosition === 'right' && (
        <span className={iconSize}>{icon}</span>
      )}
      {/* Ripple effect background */}
      <span className="absolute inset-0 -z-10 bg-white/20 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
    </>
  );

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
    >
      {buttonContent}
    </motion.button>
  );
};

export default Button;
