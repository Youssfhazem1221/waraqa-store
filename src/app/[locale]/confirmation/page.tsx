'use client';

import React, { useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { CustomerInfo, CartItem } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import Spinner from '@/components/ui/Spinner';
import { useStoredJson } from '@/lib/useStoredValue';
import { formatAmount, lineTotal } from '@/lib/money';

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
  const { t, isRTL, lp } = useLanguage();

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
        <div className="w-16 h-16 rounded-3xl bg-cream border border-line flex items-center justify-center mx-auto text-muted">
          <Icon name="box" size={32} />
        </div>
        <div className="space-y-2">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-char">
            {t.confirmation.noOrderTitle}
          </h1>
          <p className="text-sm text-muted leading-relaxed max-w-md mx-auto">
            {t.confirmation.noOrderDesc}
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href={lp('/shop')} className="w-full sm:w-auto">
            <Button variant="secondary" size="md" className="w-full sm:w-auto">
              <span>{t.confirmation.continueShopping}</span>
            </Button>
          </Link>
          <Link href={lp('/')} className="w-full sm:w-auto">
            <Button variant="ghost" size="md" className="w-full sm:w-auto text-xs">
              <span>{t.confirmation.returnHome}</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-line rounded-3xl p-8 sm:p-12 shadow-sm text-center space-y-8">
      {/* Success Icon */}
      <div className="w-20 h-20 rounded-3xl bg-sage/20 border border-sage/40 flex items-center justify-center mx-auto text-success">
        <Icon name="check" size={40} />
      </div>

      {/* Title */}
      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-maroon">
          {t.confirmation.badge}
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-char">
          {t.confirmation.title}
        </h1>
        <div className="inline-flex items-center gap-2 bg-cream border border-line px-4 py-1.5 rounded-none mt-2 font-mono text-sm font-bold text-maroon">
          <span>{t.confirmation.orderNum} {orderId}</span>
        </div>
      </div>

      {/* What happens next — receipt emailed + confirmation to follow */}
      <div className="bg-[#FAF5EE] border-2 border-maroon/20 rounded-2xl p-6 text-start space-y-3">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-maroon text-cream shrink-0 mt-0.5">
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
          <div className="flex items-center gap-2 bg-white border border-line rounded-xl px-4 py-2.5 text-xs sm:text-sm">
            <Icon name="check" size={16} className="text-success shrink-0" />
            <span className="text-muted">{t.confirmation.receiptSentTo}</span>
            <span className="font-medium text-char break-all">{customerEmail}</span>
          </div>
        )}
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
                    {displayName} <strong className="text-char">×{i.qty}</strong>
                  </span>
                  <span className="font-medium text-char font-mono">
                    {formatAmount(lineTotal(i.product.price, i.qty))} {t.common.currency}
                  </span>
                </div>
              );
            })}

            <div className="pt-3 flex justify-between text-xs text-muted">
              <span>{t.checkout.deliveryFee} ({order.customer.governorate})</span>
              <span>{order.shipping === 0 ? t.common.freeShippingTag : `${formatAmount(order.shipping)} ${t.common.currency}`}</span>
            </div>

            <div className="pt-3 flex justify-between font-serif text-base font-bold text-maroon">
              <span>{t.confirmation.totalCod}</span>
              <span>{formatAmount(order.total)} {t.common.currency}</span>
            </div>
          </div>

          {/* Delivery address snapshot */}
          <div className="text-xs text-muted space-y-1 bg-white border border-line rounded-xl p-4">
            <div className="font-semibold text-char">{t.confirmation.deliveryTo}</div>
            <div>{order.customer.name} · {order.customer.phone}</div>
            <div>
              {order.customer.governorate}
              {order.customer.city ? `, ${order.customer.city}` : ''} — {order.customer.address}
            </div>
          </div>
        </div>
      )}

      {/* Continue Shopping */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link href={lp('/shop')} className="w-full sm:w-auto">
          <Button variant="secondary" size="md" className="w-full sm:w-auto">
            <span>{t.confirmation.continueShopping}</span>
          </Button>
        </Link>
        <Link href={lp('/')} className="w-full sm:w-auto">
          <Button variant="ghost" size="md" className="w-full sm:w-auto text-xs">
            <span>{t.confirmation.returnHome}</span>
          </Button>
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
            <p className="font-serif text-lg text-char">{t.confirmation.loadingOrder}</p>
          </div>
        }
      >
        <ConfirmationContent />
      </Suspense>
    </div>
  );
}
