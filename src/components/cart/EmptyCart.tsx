import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';

export default function EmptyCart() {
  return (
    <div className="max-w-md mx-auto my-16 bg-white border border-line rounded-3xl p-10 sm:p-12 text-center shadow-xs">
      <div className="w-20 h-20 rounded-2xl bg-cream border border-line flex items-center justify-center mx-auto mb-6 text-maroon">
        <Icon name="bag" size={36} />
      </div>

      <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-char mb-2">
        Your bag is empty
      </h2>

      <p className="text-muted text-sm leading-relaxed mb-8">
        Looks like you haven&apos;t added any sketchbooks yet. Discover our handmade paper
        formats and fill your blank page.
      </p>

      <Link href="/shop" className="block">
        <Button size="lg" fullWidth>
          <Icon name="bag" size={18} />
          <span>Explore Sketchbooks</span>
        </Button>
      </Link>
    </div>
  );
}
