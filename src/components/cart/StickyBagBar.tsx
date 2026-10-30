'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import Button, { buttonClasses } from '@/components/ui/Button';
import Icon, { type IconName } from '@/components/ui/Icon';
import Price from '@/components/ui/Price';

interface StickyBagBarProps {
  /** The page's own total and button. The bar steps aside while it is on screen. */
  watch: React.RefObject<HTMLElement | null>;
  label: string;
  total: number;
  action: string;
  icon: IconName;
  /** A link onwards (the bag); without one, the button submits the form the bar sits in (checkout). */
  href?: string;
  isSubmitting?: boolean;
}

/**
 * Phones: the total and the next step, one thumb-tap away. On the bag and at
 * checkout the summary's button sat 1,000–1,700 px down the page, under every
 * line and field. Same bar as the product page's.
 */
export default function StickyBagBar({ watch, label, total, action, icon, href, isSubmitting }: StickyBagBarProps) {
  const { locale } = useLanguage();
  const [show, setShow] = useState(false);

  // Shown only while the summary's button is still below the screen. Once the
  // shopper reaches it (or scrolls past it, to the footer), the bar stays out
  // of the way. The top margin is the sticky header, which hides what is under it.
  useEffect(() => {
    const el = watch.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const below = entry.boundingClientRect.top >= (entry.rootBounds?.bottom ?? window.innerHeight);
        setShow(!entry.isIntersecting && below);
      },
      { rootMargin: '-64px 0px 0px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [watch]);

  const content = (
    <>
      <Icon name={icon} size={16} />
      <span>{action}</span>
    </>
  );

  return (
    <div
      className={`lg:hidden fixed inset-x-0 bottom-0 z-30 bg-cream/95 backdrop-blur-sm border-t border-line px-4 py-3 flex items-center gap-3 transition-transform duration-300 ${
        show ? 'translate-y-0' : 'translate-y-full'
      }`}
      // Off screen it is out of the tab order and the accessibility tree.
      inert={!show}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm text-muted truncate">{label}</p>
        <p className="text-lg font-semibold text-maroon">
          <Price value={total} locale={locale} currencyClassName="text-xs font-normal text-muted" />
        </p>
      </div>
      {href ? (
        <Link href={href} className={buttonClasses({ className: 'shrink-0' })}>
          {content}
        </Link>
      ) : (
        <Button type="submit" isLoading={isSubmitting} className="shrink-0">
          {content}
        </Button>
      )}
    </div>
  );
}
