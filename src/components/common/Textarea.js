/**
 * Textarea Component - Standard Design
 * 
 * Consistent textarea matching Input component design
 */

import { AnimatePresence, motion } from 'framer-motion';

const Textarea = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  error = null,
  placeholder = '',
  required = false,
  disabled = false,
  rows = 3,
  className = '',
  helperText = null
}) => {
  return (
    <div className={`mb-5 ${className}`}>
      {/* Label - Always above textarea */}
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Textarea */}
      <textarea
        id={name}
        name={name}
        value={value || ''}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        className={`input-base resize-y ${
          error
            ? 'border-error-500 focus:ring-error-500 focus:border-error-500'
            : 'border-gray-300 dark:border-gray-600 focus:border-primary-500'
        } ${
          disabled ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800' : ''
        }`}
      />

      {/* Helper Text or Error */}
      <AnimatePresence>
        {(error || helperText) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mt-1.5"
          >
            {error ? (
              <p className="text-sm text-error-600 dark:text-error-400 flex items-center gap-1.5">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </p>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Textarea;
