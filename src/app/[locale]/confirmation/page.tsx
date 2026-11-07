'use client';

import React, { useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { CustomerInfo, CartItem } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { buttonClasses } from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import Spinner from '@/components/ui/Spinner';
import Price from '@/components/ui/Price';
import { useStoredJson } from '@/lib/useStoredValue';
import { lineTotal } from '@/lib/money';
import { formatNumber } from '@/lib/format';
import { GOVERNORATES_AR } from '@/lib/translations';
import { WHATSAPP_NUMBER } from '@/lib/constants';

interface StoredOrder {
  orderId: string;
  customer: CustomerInfo;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  notes?: string;
  isLoggedToSheet: boolean;
}

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderIdParam = searchParams.get('orderId');
  const { t, isRTL, lp, locale } = useLanguage();

  // Read the stored order AFTER mount so the first client render matches the
  // server-rendered HTML (reading sessionStorage during render causes a
  // hydration mismatch).
  const parseOrder = useCallback(
    (raw: unknown): StoredOrder | null => {
      if (!raw || typeof raw !== 'object') return null;
      const parsed = raw as StoredOrder;
      if (typeof parsed.orderId !== 'string' || !Array.isArray(parsed.items)) return null;

      // Only show the receipt that belongs to the order in the URL. Landing on
      // /confirmation later (bookmark, back button, a second order in the same
      // tab) used to redisplay whichever order happened to be in session.
      if (orderIdParam && parsed.orderId !== orderIdParam) return null;

      return parsed;
    },
    [orderIdParam]
  );

  const order = useStoredJson('waraqa-last-order', parseOrder, 'session');

  const orderId = order?.orderId || orderIdParam;
  const customerEmail = order?.customer?.email?.trim();

  // No id in the URL and nothing in session: there is no order to confirm, so
  // say that instead of inventing a plausible-looking "WRQ-NEW" receipt.
  if (!orderId) {
    return (
      <div className="bg-white border border-line rounded-3xl p-8 sm:p-12 shadow-sm text-center space-y-6">
        <div className="space-y-2">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-char text-balance">
            {t.confirmation.noOrderTitle}
          </h1>
          <p className="text-sm text-muted leading-relaxed max-w-md mx-auto">
            {t.confirmation.noOrderDesc}
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href={lp('/shop')} className={buttonClasses({ variant: 'secondary', className: 'w-full sm:w-auto' })}>
            {t.confirmation.continueShopping}
          </Link>
          <Link href={lp('/')} className={buttonClasses({ variant: 'ghost', className: 'w-full sm:w-auto text-xs' })}>
            {t.confirmation.returnHome}
          </Link>
        </div>
      </div>
    );
  }

  const governorate = order?.customer?.governorate || '';
  const governorateName = isRTL ? GOVERNORATES_AR[governorate] || governorate : governorate;

  // Cash-on-delivery shoppers want a person to confirm with; open WhatsApp
  // with the order number already typed.
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `${t.confirmation.whatsappMessage} ${orderId}`
  )}`;

  return (
    <div className="bg-white border border-line rounded-3xl p-8 sm:p-12 shadow-sm text-center space-y-8">

      {/* Title */}
      <div className="space-y-2">
        <span className="text-sm text-muted">
          {t.confirmation.badge}
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-semibold text-char text-balance">
          {t.confirmation.title}
        </h1>
        <div className="inline-flex items-center gap-2 bg-cream border border-line px-4 py-1.5 rounded-none mt-2 text-sm font-bold text-maroon">
          <span>
            {t.confirmation.orderNum}{' '}
            <bdi dir="ltr" data-ident>
              {orderId}
            </bdi>
          </span>
        </div>
      </div>

      {/* What happens next — receipt emailed + confirmation to follow */}
      <div className="border-y border-line rounded-2xl p-6 text-start space-y-3">
        <div className="flex items-start gap-3">
          <div className="text-maroon shrink-0 mt-0.5">
            <Icon name="mail" size={24} />
          </div>
          <div className="space-y-1">
            <h2 className="font-serif text-lg font-semibold text-char">
              {t.confirmation.inboxTitle}
            </h2>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              {t.confirmation.inboxDesc}
            </p>
          </div>
        </div>

        {customerEmail && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 bg-white border border-line rounded-xl px-4 py-2.5 text-xs sm:text-sm">
            <Icon name="check" size={16} className="text-success shrink-0" />
            <span className="text-muted">{t.confirmation.receiptSentTo}</span>
            <bdi dir="ltr" data-ident className="font-medium text-char [overflow-wrap:anywhere]">
              {customerEmail}
            </bdi>
          </div>
        )}

        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-sm text-maroon underline underline-offset-4 decoration-1 hover:decoration-2"
        >
          {t.confirmation.whatsappCta}
        </a>
      </div>

      {/* Order Details Breakdown (if in session) */}
      {order && (
        <div className="border-t border-line pt-6 text-start space-y-4">
          <h3 className="font-serif text-base font-semibold text-char">
            {t.confirmation.summaryTitle}
          </h3>

          <div className="bg-cream/40 rounded-2xl p-4 divide-y divide-line/60 text-xs sm:text-sm">
            {order.items.map((i) => {
              const displayName = isRTL ? (i.product.nameAr || i.product.name) : i.product.name;
              return (
                <div key={i.product.sku} className="py-2.5 flex justify-between">
                  <span className="text-char/80">
                    {displayName} <strong className="text-char">×{formatNumber(i.qty, locale)}</strong>
                  </span>
                  <Price
                    value={lineTotal(i.product.price, i.qty)}
                    locale={locale}
                    className="font-medium text-char"
                  />
                </div>
              );
            })}

            <div className="pt-3 flex justify-between text-xs text-muted">
              <span>{t.checkout.deliveryFee} ({governorateName})</span>
              {order.shipping === 0 ? (
                <span>{t.common.freeShippingTag}</span>
              ) : (
                <Price value={order.shipping} locale={locale} />
              )}
            </div>

            <div className="pt-3 flex justify-between text-base font-bold text-maroon">
              <span>{t.confirmation.totalCod}</span>
              <Price value={order.total} locale={locale} />
            </div>
          </div>

          {/* Delivery address snapshot */}
          <div className="text-xs text-muted space-y-1 bg-white border border-line rounded-xl p-4">
            <div className="font-semibold text-char">{t.confirmation.deliveryTo}</div>
            <div>
              <bdi>{order.customer.name}</bdi> ·{' '}
              <bdi dir="ltr" data-ident>
                {order.customer.phone}
              </bdi>
            </div>
            <div>
              {governorateName}
              {order.customer.city ? `${isRTL ? '، ' : ', '}${order.customer.city}` : ''}
              {isRTL ? '، ' : ', '}
              {order.customer.address}
            </div>
          </div>
        </div>
      )}

      {/* Continue Shopping */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link href={lp('/shop')} className={buttonClasses({ variant: 'secondary', className: 'w-full sm:w-auto' })}>
          {t.confirmation.continueShopping}
        </Link>
        <Link href={lp('/')} className={buttonClasses({ variant: 'ghost', className: 'w-full sm:w-auto text-xs' })}>
          {t.confirmation.returnHome}
        </Link>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <Suspense
        fallback={
          <div className="bg-white border border-line rounded-3xl p-12 text-center space-y-4">
            <Spinner size="lg" />
            <p className="text-lg text-char">{t.confirmation.loadingOrder}</p>
          </div>
        }
      >
        <ConfirmationContent />
      </Suspense>
    </div>
  );
}
