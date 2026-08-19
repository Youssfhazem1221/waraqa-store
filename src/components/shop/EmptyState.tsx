import React from 'react';
import Button from '@/components/ui/Button';

interface EmptyStateProps {
  title?: string;
  message?: string;
  onReset?: () => void;
}

export default function EmptyState({
  title = 'No sketchbooks found',
  message = 'Try changing your search keywords or resetting your size filters.',
  onReset,
}: EmptyStateProps) {
  return (
    <div className="bg-white border border-line rounded-3xl p-12 sm:p-16 text-center max-w-lg mx-auto my-12">
      <div className="w-16 h-16 rounded-2xl bg-cream border border-line flex items-center justify-center mx-auto mb-4 text-maroon">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 className="font-serif text-xl sm:text-2xl font-semibold text-char mb-2">
        {title}
      </h3>
      <p className="text-muted text-sm sm:text-base mb-6 leading-relaxed">
        {message}
      </p>
      {onReset && (
        <Button variant="secondary" size="sm" onClick={onReset}>
          Reset Filters
        </Button>
      )}
    </div>
  );
}
