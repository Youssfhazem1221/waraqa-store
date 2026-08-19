'use client';

import React from 'react';
import Icon from '@/components/ui/Icon';
import { useLanguage } from '@/context/LanguageContext';

export default function TrustRow() {
  const { t } = useLanguage();

  const trustList = [
    {
      icon: 'truck' as const,
      title: t.trust.shippingTitle,
      description: t.trust.shippingDesc,
    },
    {
      icon: 'leaf' as const,
      title: t.trust.ecoTitle,
      description: t.trust.ecoDesc,
    },
    {
      icon: 'card' as const,
      title: t.trust.secureTitle,
      description: t.trust.secureDesc,
    },
  ];

  return (
    <section className="py-12 sm:py-16 border-b border-line bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {trustList.map((item, idx) => (
            <div
              key={idx}
              className="bg-white border border-line rounded-2xl p-6 sm:p-8 flex items-start gap-4 shadow-xs hover:shadow-sm transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-cream border border-line flex items-center justify-center text-maroon shrink-0">
                <Icon name={item.icon} size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-char text-base">{item.title}</h3>
                <p className="text-muted text-xs sm:text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
