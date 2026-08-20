'use client';

import React, { useState } from 'react';
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

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, shipping, total, isHydrated, clearCart } = useCart();
  const { t, isRTL } = useLanguage();

  const [customer, setCustomer] = useState<CustomerInfo>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('waraqa-customer');
        if (saved) return JSON.parse(saved);
      } catch {
        // Ignore parse error
      }
    }
    return {
      name: '',
      phone: '',
      email: '',
      governorate: '',
      city: '',
      address: '',
    };
  });
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerInfo, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>();

  const handleCustomerChange = (field: keyof CustomerInfo, value: string) => {
    setCustomer((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const errs: Partial<Record<keyof CustomerInfo, string>> = {};

    if (!customer.name.trim()) errs.name = t.checkout.errors.name;
    if (!customer.phone.trim()) {
      errs.phone = t.checkout.errors.phone;
    } else if (!/^(\+20|0)?1[0125][0-9]{8}$/.test(customer.phone.replace(/\s+/g, ''))) {
      errs.phone = t.checkout.errors.phoneValid;
    }

    if (!customer.email.trim()) {
      errs.email = t.checkout.errors.email;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim())) {
      errs.email = t.checkout.errors.emailValid;
    }

    if (!customer.governorate) errs.governorate = t.checkout.errors.governorate;
    if (!customer.address.trim()) errs.address = t.checkout.errors.address;

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleConfirmAndBuy = async () => {
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    setSubmitError(undefined);

    // Save customer info locally for future convenience
    try {
      localStorage.setItem('waraqa-customer', JSON.stringify(customer));
    } catch {
      // Ignore
    }

    const payload: OrderPayload = {
      action: 'createOrder',
      customer: {
        name: customer.name.trim(),
        phone: customer.phone.trim(),
        email: customer.email.trim(),
        governorate: customer.governorate,
        city: customer.city.trim(),
        address: customer.address.trim(),
      },
      items: items.map((i) => ({
        sku: i.product.sku,
        name: i.product.name,
        qty: i.qty,
        price: i.product.price,
      })),
      shipping,
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
        setSubmitError(t.checkout.submitError);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // Store in session for the confirmation page
      sessionStorage.setItem(
        'waraqa-last-order',
        JSON.stringify({
          orderId: res.orderId,
          customer,
          items,
          subtotal,
          shipping,
          total,
          notes,
          isLoggedToSheet: true,
        })
      );

      // Clear the cart and go to confirmation
      clearCart();
      router.push(`/confirmation?orderId=${res.orderId}`);
    } catch (err) {
      console.error('Order submission error:', err);
      setSubmitError(t.checkout.submitError);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
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
          />
        </div>
      </div>
    </div>
  );
}
