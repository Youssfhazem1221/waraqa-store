import React from 'react';
import Button from '@/components/ui/Button';

interface EmptyStateProps {
  title: string;
  message: string;
  resetLabel: string;
  onReset?: () => void;
}

export default function EmptyState({ title, message, resetLabel, onReset }: EmptyStateProps) {
  return (
    <div className="border-y border-line py-16 text-center">
      <h3 className="font-serif text-2xl font-semibold text-char">{title}</h3>
      <p className="mt-2 text-muted">{message}</p>
      {onReset && (
        <Button variant="secondary" size="sm" onClick={onReset} className="mt-6">
          {resetLabel}
        </Button>
      )}
    </div>
  );
}
