'use client';

import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { useLanguage } from '@/context/LanguageContext';

/**
 * The product breadcrumb was previously inlined in the (server) page with
 * hardcoded "Home"/"Shop" labels and an always-left-pointing chevron, so it
 * stayed English and pointed the wrong way in Arabic.
 */
export default function ProductBreadcrumb({
  productName,
  productNameAr,
}: {
  productName: string;
  productNameAr?: string;
}) {
  const { t, isRTL, lp } = useLanguage();

  // The trail read "الرئيسية / المتجر / Mini Sketchbook" in Arabic, because the
  // server page only ever passed the English name.
  const displayName = isRTL && productNameAr ? productNameAr : productName;

  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-8 flex items-center gap-2 text-xs text-muted font-medium"
    >
      <Link href={lp('/')} className="hover:text-maroon transition-colors">
        {t.product.breadcrumbHome}
      </Link>
      <Icon name={isRTL ? 'chevron-left' : 'chevron-right'} size={14} />
      <Link href={lp('/shop')} className="hover:text-maroon transition-colors">
        {t.product.breadcrumbShop}
      </Link>
      <Icon name={isRTL ? 'chevron-left' : 'chevron-right'} size={14} />
      <span className="text-char truncate max-w-xs">{displayName}</span>
    </nav>
  );
}
