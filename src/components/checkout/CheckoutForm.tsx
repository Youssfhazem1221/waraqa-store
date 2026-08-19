'use client';

import React from 'react';
import type { CustomerInfo } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { GOVERNORATES } from '@/lib/constants';
import { GOVERNORATES_AR } from '@/lib/translations';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

interface CheckoutFormProps {
  customer: CustomerInfo;
  onChange: (field: keyof CustomerInfo, value: string) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  errors: Partial<Record<keyof CustomerInfo, string>>;
}

export default function CheckoutForm({
  customer,
  onChange,
  notes,
  onNotesChange,
  errors,
}: CheckoutFormProps) {
  const { t, isRTL } = useLanguage();

  const governorateOptions = [
    { value: '', label: t.checkout.governoratePlaceholder },
    ...GOVERNORATES.map((g) => ({
      value: g,
      label: isRTL ? (GOVERNORATES_AR[g] || g) : g,
    })),
  ];

  return (
    <div className="bg-white border border-line rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
      <div className="flex items-center gap-3 pb-4 border-b border-line">
        <div className="w-8 h-8 rounded-full bg-maroon text-cream flex items-center justify-center text-xs font-serif font-bold shrink-0">
          {t.checkout.deliveryStep}
        </div>
        <div>
          <h2 className="font-serif text-xl font-semibold text-char">
            {t.checkout.deliveryTitle}
          </h2>
          <p className="text-xs text-muted">
            {t.checkout.deliverySubtitle}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Full Name */}
        <Input
          label={t.checkout.fullName}
          required
          placeholder={t.checkout.fullNamePlaceholder}
          value={customer.name}
          onChange={(e) => onChange('name', e.target.value)}
          error={errors.name}
        />

        {/* Phone & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={t.checkout.phone}
            required
            type="tel"
            placeholder={t.checkout.phonePlaceholder}
            hint={t.checkout.phoneHint}
            value={customer.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            error={errors.phone}
          />

          <Input
            label={t.checkout.email}
            type="email"
            placeholder={t.checkout.emailPlaceholder}
            hint={t.checkout.emailHint}
            value={customer.email}
            onChange={(e) => onChange('email', e.target.value)}
          />
        </div>

        {/* Governorate & City */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label={t.checkout.governorate}
            required
            options={governorateOptions}
            value={customer.governorate}
            onChange={(e) => onChange('governorate', e.target.value)}
            error={errors.governorate}
          />

          <Input
            label={t.checkout.city}
            placeholder={t.checkout.cityPlaceholder}
            value={customer.city}
            onChange={(e) => onChange('city', e.target.value)}
          />
        </div>

        {/* Street Address */}
        <Input
          label={t.checkout.address}
          required
          placeholder={t.checkout.addressPlaceholder}
          value={customer.address}
          onChange={(e) => onChange('address', e.target.value)}
          error={errors.address}
        />

        {/* Order Notes */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-char mb-1.5">
            {t.checkout.notes}
          </label>
          <textarea
            rows={2}
            placeholder={t.checkout.notesPlaceholder}
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            className="w-full bg-white text-char border border-line rounded-xl p-3 text-sm transition-colors focus:border-maroon focus:ring-2 focus:ring-maroon/15 focus:outline-none"
          />
        </div>
      </div>

      {/* Payment method selector */}
      <div className="pt-4 border-t border-line space-y-3">
        <div className="flex items-center gap-3 pb-2">
          <div className="w-8 h-8 rounded-full bg-maroon text-cream flex items-center justify-center text-xs font-serif font-bold shrink-0">
            {t.checkout.paymentStep}
          </div>
          <div>
            <h3 className="font-serif text-lg font-semibold text-char">
              {t.checkout.paymentTitle}
            </h3>
            <p className="text-xs text-muted">{t.checkout.paymentSubtitle}</p>
          </div>
        </div>

        <div className="border-2 border-maroon bg-cream/50 rounded-2xl p-4 flex items-start gap-3.5">
          <div className="w-5 h-5 rounded-full border-2 border-maroon flex items-center justify-center mt-0.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-maroon" />
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-char text-sm">{t.checkout.codTitle}</span>
              <span className="bg-sage text-[#20301a] text-[10px] font-bold px-2 py-0.5 rounded-md">
                {t.checkout.codBadge}
              </span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              {t.checkout.codDesc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
