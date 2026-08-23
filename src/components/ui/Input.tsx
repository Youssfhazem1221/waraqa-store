'use client';

import React, { useId } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export default function Input({
  label,
  error,
  hint,
  icon,
  className = '',
  id,
  required,
  'aria-describedby': describedBy,
  ...props
}: InputProps) {
  // The id used to be derived from the label text, which broke in two ways:
  // in Arabic it produced a non-ASCII id that changed with the language, and
  // two fields sharing a label (or a label with the same slug) collided, so
  // clicking one label focused the other field.
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  const description =
    [error ? errorId : null, hint && !error ? hintId : null, describedBy]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-wider text-char mb-1.5"
        >
          {label}{' '}
          {required && (
            <span className="text-terra" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          // `start-3.5` rather than `left-3.5` so the icon sits on the correct
          // side once the document direction flips to RTL.
          <div className="absolute start-3.5 text-muted pointer-events-none flex items-center justify-center">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={description}
          className={`w-full bg-white text-char placeholder:text-muted/60 border border-line rounded-xl px-3.5 py-2.5 text-sm sm:text-base transition-colors focus:border-maroon focus:ring-2 focus:ring-maroon/15 focus:outline-none ${
            icon ? 'ps-10' : ''
          } ${error ? 'border-error ring-1 ring-error' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-xs text-error font-medium">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={hintId} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}
