'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { subscribeNewsletter } from '@/lib/api';

export default function NewsletterCapture() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const { t, locale } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;

    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      setStatus('error');
      setErrorMessage(t.newsletter.errorInvalid);
      return;
    }

    setStatus('sending');
    setErrorMessage('');

    // This form used to flip straight to the success panel without sending
    // anything anywhere — every address typed into it was discarded. Now the
    // confirmation only appears once the backend has actually stored it.
    const res = await subscribeNewsletter(value, locale);

    if (res.ok) {
      setStatus('done');
      setEmail('');
    } else {
      setStatus('error');
      setErrorMessage(t.newsletter.errorFailed);
    }
  };

  return (
    <section aria-labelledby="newsletter-title" className="bg-[#EFE5D6]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 grid lg:grid-cols-2 gap-8 items-end">
        <div>
          <h2 id="newsletter-title" className="font-serif text-2xl sm:text-3xl font-semibold text-char">
            {t.newsletter.title}
          </h2>
          <p className="mt-2 text-muted leading-relaxed max-w-md">{t.newsletter.description}</p>
        </div>

        {status === 'done' ? (
          <div role="status" className="border-t border-char/20 pt-4">
            <p className="font-semibold text-char">{t.newsletter.successTitle}</p>
            <p className="text-sm text-muted mt-1">{t.newsletter.successDesc}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="flex border-b border-char/40 focus-within:border-maroon">
              <input
                type="email"
                required
                autoComplete="email"
                aria-label={t.newsletter.placeholder}
                aria-invalid={status === 'error'}
                aria-describedby={status === 'error' ? 'newsletter-error' : undefined}
                placeholder={t.newsletter.placeholder}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === 'error') setStatus('idle');
                }}
                className="flex-1 min-w-0 bg-transparent py-3 text-char placeholder:text-muted focus:outline-none focus:shadow-none border-0"
              />
              <button
                type="submit"
                disabled={status === 'sending'}
                className="shrink-0 py-3 ps-4 text-maroon font-medium hover:text-esp disabled:opacity-60 cursor-pointer"
              >
                {status === 'sending' ? t.newsletter.submitting : t.newsletter.subscribe}
              </button>
            </div>

            {status === 'error' && (
              <p id="newsletter-error" role="alert" className="mt-2 text-sm text-error">
                {errorMessage}
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
