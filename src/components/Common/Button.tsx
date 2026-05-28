import React from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 border-transparent disabled:bg-indigo-300',
  secondary:
    'bg-white text-gray-700 hover:bg-gray-50 focus:ring-indigo-500 border-gray-300 disabled:bg-gray-100',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 border-transparent disabled:bg-red-300',
  ghost:
    'bg-transparent text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500 border-transparent disabled:text-indigo-300',
  success:
    'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 border-transparent disabled:bg-green-300',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={[
        'inline-flex items-center justify-center gap-2 font-medium rounded-lg border',
        'transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(' ')}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-4 w-4"
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
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : leftIcon ? (
        <span className="h-4 w-4">{leftIcon}</span>
      ) : null}
      {children}
      {!isLoading && rightIcon && <span className="h-4 w-4">{rightIcon}</span>}
    </button>
  );
}
