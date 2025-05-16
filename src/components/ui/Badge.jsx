import React from 'react';
import PropTypes from 'prop-types';

// Tailwind-style variant system
const baseStyles = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors';

const variantStyles = {
  solid: {
    default: 'bg-gray-800 text-white',
    primary: 'bg-primary text-white',
    success: 'bg-green-600 text-white',
    danger: 'bg-red-600 text-white',
    warning: 'bg-yellow-500 text-white',
  },
  outline: {
    default: 'border border-gray-300 text-gray-800',
    primary: 'border border-primary text-primary',
    success: 'border border-green-600 text-green-600',
    danger: 'border border-red-600 text-red-600',
    warning: 'border border-yellow-500 text-yellow-500',
  },
};

export const Badge = ({
  children,
  variant = 'solid',
  color = 'default',
  className = '',
}) => {
  const variantClass =
    (variantStyles[variant] && variantStyles[variant][color]) ||
    variantStyles[variant].default;

  const combinedClasses = `${baseStyles} ${variantClass} ${className}`.trim();

  return <span className={combinedClasses}>{children}</span>;
};

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['solid', 'outline']),
  color: PropTypes.oneOf(['default', 'primary', 'success', 'danger', 'warning']),
  className: PropTypes.string,
};

export default Badge;
