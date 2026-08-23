'use client';

import React, { useId } from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
}

export default function Select({
  label,
  error,
  hint,
  options,
  className = '',
  id,
  required,
  'aria-describedby': describedBy,
  ...props
}: SelectProps) {
  // See Input: label-derived ids changed with the active language and collided
  // between fields.
  const generatedId = useId();
  const selectId = id || generatedId;
  const errorId = `${selectId}-error`;
  const hintId = `${selectId}-hint`;

  const description =
    [error ? errorId : null, hint && !error ? hintId : null, describedBy]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
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
      <div className="relative">
        <select
          id={selectId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={description}
          className={`w-full bg-white text-char border border-line rounded-xl px-3.5 py-2.5 text-sm sm:text-base appearance-none transition-colors focus:border-maroon focus:ring-2 focus:ring-maroon/15 focus:outline-none pe-10 cursor-pointer ${
            error ? 'border-error ring-1 ring-error' : ''
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {/* `end-3.5` keeps the chevron on the trailing edge in both directions;
            `right-3.5` put it on top of the text in RTL. */}
        <div className="absolute end-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
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
