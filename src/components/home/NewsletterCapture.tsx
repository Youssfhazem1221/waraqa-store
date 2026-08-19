'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { useLanguage } from '@/context/LanguageContext';

export default function NewsletterCapture() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <section className="py-16 sm:py-20 bg-esp text-cream/90 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="w-12 h-12 rounded-2xl bg-cream/10 border border-white/10 flex items-center justify-center mx-auto text-cream">
          <Icon name="mail" size={24} />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-kraft">
            {t.newsletter.badge}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-white">
            {t.newsletter.title}
          </h2>
          <p className="text-cream/70 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            {t.newsletter.description}
          </p>
        </div>

        {submitted ? (
          <div className="bg-white/10 border border-white/20 rounded-2xl p-6 max-w-md mx-auto animate-fadeIn">
            <p className="font-semibold text-white text-base">{t.newsletter.successTitle}</p>
            <p className="text-cream/70 text-xs mt-1">
              {t.newsletter.successDesc}
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              required
              placeholder={t.newsletter.placeholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder:text-cream/40 focus:outline-none focus:border-kraft focus:ring-2 focus:ring-kraft/20"
            />
            <Button
              type="submit"
              variant="light"
              className="w-full sm:w-auto shrink-0"
            >
              <span>{t.newsletter.subscribe}</span>
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
