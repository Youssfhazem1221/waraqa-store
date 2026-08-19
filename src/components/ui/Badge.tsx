import React from 'react';

export interface BadgeProps {
  variant?: 'new' | 'sale' | 'out' | 'soft' | 'success' | 'warning' | 'info';
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export default function Badge({
  variant = 'soft',
  children,
  className = '',
  icon,
}: BadgeProps) {
  const base =
    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider select-none';

  const variants = {
    new: 'bg-sage text-[#20301a] border border-sage/40',
    sale: 'bg-terra text-white shadow-sm',
    out: 'bg-transparent border border-muted text-muted',
    soft: 'bg-cream text-maroon border border-line',
    success: 'bg-success/15 text-success border border-success/30',
    warning: 'bg-warning/15 text-warning border border-warning/30',
    info: 'bg-maroon/10 text-maroon border border-maroon/20',
  };

  return (
    <span className={`${base} ${variants[variant]} ${className}`}>
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
