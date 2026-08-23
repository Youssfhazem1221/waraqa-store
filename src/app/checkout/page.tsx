'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { CustomerInfo, OrderPayload } from '@/types';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { createOrder } from '@/lib/api';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import OrderReview from '@/components/checkout/OrderReview';
import EmptyCart from '@/components/cart/EmptyCart';
import Icon from '@/components/ui/Icon';
import { useStoredJson, writeStored } from '@/lib/useStoredValue';

const EMPTY_CUSTOMER: CustomerInfo = {
  name: '',
  phone: '',
  email: '',
  governorate: '',
  city: '',
  address: '',
};

const CUSTOMER_KEY = 'waraqa-customer';

/**
 * Coerce whatever is in localStorage into a complete CustomerInfo.
 * Reading it raw meant a truncated or older-shape record produced an object
 * with missing keys, and validation then threw on `customer.name.trim()`.
 */
function parseStoredCustomer(raw: unknown): CustomerInfo | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === 'string' ? v : '');
  const customer: CustomerInfo = {
    name: str(r.name),
    phone: str(r.phone),
    email: str(r.email),
    governorate: str(r.governorate),
    city: str(r.city),
    address: str(r.address),
  };
  // Nothing worth restoring.
  if (!Object.values(customer).some((v) => v.trim())) return null;
  return customer;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, isHydrated, clearCart, quoteFor } = useCart();
  const { t, isRTL } = useLanguage();

  // Restored through an external-store read: `null` on the server and during
  // hydration, the saved details immediately after. Reading localStorage in the
  // useState initialiser made the first client render disagree with the server
  // HTML — a hydration mismatch React resolves by discarding the restored
  // values. `edits` holds anything typed since, so a restore never clobbers
  // what the shopper is in the middle of writing.
  const saved = useStoredJson(CUSTOMER_KEY, parseStoredCustomer);
  const [edits, setEdits] = useState<Partial<CustomerInfo>>({});
  const customer: CustomerInfo = { ...EMPTY_CUSTOMER, ...(saved ?? {}), ...edits };
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerInfo, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>();

  // A second click while the request is in flight would place a duplicate
  // order; React state alone can lag behind two fast clicks.
  const inFlight = useRef(false);

  const handleCustomerChange = useCallback(
    (field: keyof CustomerInfo, value: string) => {
      setEdits((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
    },
    []
  );

  const validate = (): boolean => {
    const errs: Partial<Record<keyof CustomerInfo, string>> = {};

    if (!customer.name.trim()) errs.name = t.checkout.errors.name;
    if (!customer.phone.trim()) {
      errs.phone = t.checkout.errors.phone;
    } else if (
      // Tolerate the separators people actually type: +20 10 1234 5678,
      // 010-123-45678, and Arabic-Indic digits pasted from a phone keypad.
      !/^(\+20|0020|20|0)?1[0125][0-9]{8}$/.test(normalizePhone(customer.phone))
    ) {
      errs.phone = t.checkout.errors.phoneValid;
    }

    if (!customer.email.trim()) {
      errs.email = t.checkout.errors.email;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(customer.email.trim())) {
      errs.email = t.checkout.errors.emailValid;
    }

    if (!customer.governorate) errs.governorate = t.checkout.errors.governorate;
    if (!customer.address.trim()) errs.address = t.checkout.errors.address;

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleConfirmAndBuy = async () => {
    if (inFlight.current) return;

    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (items.length === 0) {
      setSubmitError(t.checkout.submitError);
      return;
    }

    inFlight.current = true;
    setIsSubmitting(true);
    setSubmitError(undefined);

    const trimmed: CustomerInfo = {
      name: customer.name.trim(),
      phone: normalizePhone(customer.phone),
      email: customer.email.trim(),
      governorate: customer.governorate,
      city: customer.city.trim(),
      address: customer.address.trim(),
    };

    // Save customer info locally for future convenience. writeStored (rather
    // than a bare setItem) also notifies the read hook in this tab.
    writeStored(CUSTOMER_KEY, JSON.stringify(trimmed));

    const payload: OrderPayload = {
      action: 'createOrder',
      customer: trimmed,
      items: items.map((i) => ({
        sku: i.product.sku,
        name: i.product.name,
        qty: i.qty,
        price: i.product.price,
      })),
      shipping: quoteFor(trimmed.governorate).amount,
      payment: 'Cash on delivery',
      notes: notes.trim(),
    };

    try {
      const res = await createOrder(payload);

      // The order is only real once the backend confirms it (writes to the
      // sheet + sends the emails). If it failed, keep the customer on the page
      // with their cart intact so they can retry — never fake a success.
      if (!res.ok || !res.orderId) {
        console.error('Order was not logged:', res.error);
        // Surface the backend's own message when it has one — "that item just
        // sold out" is far more actionable than a generic failure.
        setSubmitError(res.error || t.checkout.submitError);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // Store in session for the confirmation page. Trust the backend's
      // totals over the client's when it returns them.
      try {
        sessionStorage.setItem(
          'waraqa-last-order',
          JSON.stringify({
            orderId: res.orderId,
            customer: trimmed,
            items,
            subtotal: res.subtotal ?? subtotal,
            shipping: res.shipping ?? quoteFor(trimmed.governorate).amount,
            total: res.total ?? subtotal + quoteFor(trimmed.governorate).amount,
            notes: notes.trim(),
            isLoggedToSheet: true,
          })
        );
      } catch {
        // A full sessionStorage must not lose a placed order — the
        // confirmation page falls back to the orderId in the URL.
      }

      // Clear the cart and go to confirmation
      clearCart();
      router.push(`/confirmation?orderId=${encodeURIComponent(res.orderId)}`);
    } catch (err) {
      console.error('Order submission error:', err);
      setSubmitError(t.checkout.submitError);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      inFlight.current = false;
      setIsSubmitting(false);
    }
  };

  if (!isHydrated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="animate-pulse font-serif text-lg text-muted">{t.common.loading}</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <EmptyCart />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs text-muted font-medium">
        <Link href="/cart" className="hover:text-maroon transition-colors flex items-center gap-1">
          <Icon name={isRTL ? 'chevron-right' : 'chevron-left'} size={14} />
          <span>{t.checkout.breadcrumbBag}</span>
        </Link>
        <span className="text-muted/40">/</span>
        <span className="text-char">{t.checkout.breadcrumbCheckout}</span>
      </nav>

      <div className="mb-8">
        <span className="text-xs font-semibold uppercase tracking-widest text-maroon">
          {t.checkout.badge}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-char mt-1">
          {t.checkout.title}
        </h1>
      </div>

      {/* Main Form & Review Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* Left: Form (7 cols) */}
        <div className="lg:col-span-7">
          <CheckoutForm
            customer={customer}
            onChange={handleCustomerChange}
            notes={notes}
            onNotesChange={setNotes}
            errors={errors}
          />
        </div>

        {/* Right: Review & Buy (5 cols) */}
        <div className="lg:col-span-5">
          <OrderReview
            onConfirm={handleConfirmAndBuy}
            isSubmitting={isSubmitting}
            errorMessage={submitError}
            governorate={customer.governorate}
          />
        </div>
      </div>
    </div>
  );
}

/** Strip spaces, dashes and parentheses, and fold Arabic-Indic digits to ASCII. */
function normalizePhone(raw: string): string {
  return raw
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[\s()\-.]/g, '')
    .trim();
}
