import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'light' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
}

const baseStyles =
  'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 cursor-pointer select-none rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]';

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'text-xs px-3 py-2 rounded-lg gap-1.5',
  md: 'text-sm sm:text-base px-5 py-3 rounded-xl gap-2',
  lg: 'text-base sm:text-lg px-7 py-4 rounded-2xl gap-2.5 font-semibold',
};

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-maroon text-cream hover:bg-esp border border-transparent shadow-sm shadow-maroon/10 hover:shadow-md',
  secondary:
    'bg-transparent text-maroon border border-maroon hover:bg-maroon hover:text-cream',
  ghost:
    'bg-transparent text-maroon hover:bg-maroon/10 border border-transparent px-3',
  light:
    'bg-cream text-maroon hover:bg-white border border-line shadow-sm',
  danger:
    'bg-error text-white hover:bg-red-800 border border-transparent',
};

/**
 * The button's visual styles, usable on any element.
 *
 * Use this on a `<Link>` instead of wrapping a `<Button>` in one: an `<a>`
 * containing a `<button>` is invalid HTML and nests two interactive controls,
 * which sends focus to the anchor and leaves the button's focus styles dead.
 */
export function buttonClasses({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
} = {}): string {
  return `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${
    fullWidth ? 'w-full' : ''
  } ${className}`;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  className = '',
  disabled,
  children,
  ...props
}: ButtonProps) {
  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
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
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
