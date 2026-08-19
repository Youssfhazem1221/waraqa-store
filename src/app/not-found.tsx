import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto my-20 px-4 text-center space-y-6">
      <div className="w-20 h-20 rounded-3xl bg-white border border-line flex items-center justify-center mx-auto text-maroon shadow-xs">
        <span className="font-serif text-3xl font-bold">404</span>
      </div>

      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-maroon">
          Page Not Found
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-char">
          A truly blank page.
        </h1>
        <p className="text-muted text-sm leading-relaxed">
          The page you were looking for doesn&apos;t exist or has moved. Let&apos;s get you back to
          our sketchbooks.
        </p>
      </div>

      <div className="pt-2 flex justify-center gap-4">
        <Link href="/shop">
          <Button size="md">
            <Icon name="bag" size={18} />
            <span>Go to Shop</span>
          </Button>
        </Link>
        <Link href="/">
          <Button variant="secondary" size="md">
            <span>Back Home</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
