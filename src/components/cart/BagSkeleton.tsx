'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

const block = 'bg-line/70 motion-safe:animate-pulse';

/**
 * What the bag page and checkout show until the bag is read from this
 * browser: blocks where its lines, fields and totals will land, in the same
 * cards and columns. The page used to show one "Loading..." line, so the
 * footer sat high on the first screen and jumped once the bag rendered
 * (CLS 0.16 on the bag, 0.19 at checkout).
 */
export default function BagSkeleton({ variant }: { variant: 'bag' | 'checkout' }) {
  const { t } = useLanguage();
  const bag = variant === 'bag';

  return (
    <>
      <p role="status" className="sr-only">
        {t.common.loading}
      </p>
      <div aria-hidden="true" className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        <div className="lg:col-span-7 bg-white border border-line rounded-3xl p-6 sm:p-8">
          {bag ? <LineBlocks /> : <FieldBlocks />}
        </div>

        {/* The order summary (bag) or review (checkout) */}
        <div className="lg:col-span-5 bg-white border border-line rounded-3xl p-6 sm:p-8 space-y-6">
          <div className={`h-7 w-2/5 ${block}`} />
          {bag ? (
            <div className="h-16 bg-cream/80 border border-line" />
          ) : (
            <div className="flex items-center gap-3 py-3 border-y border-line">
              <div className={`w-12 h-12 shrink-0 ${block}`} />
              <div className="flex-1 space-y-2">
                <div className={`h-3 w-3/5 ${block}`} />
                <div className={`h-3 w-1/4 ${block}`} />
              </div>
            </div>
          )}
          <div className="space-y-3">
            <div className={`h-4 ${block}`} />
            <div className={`h-4 w-4/5 ${block}`} />
            <div className={`h-3 w-3/4 ${block}`} />
            <div className="pt-3 border-t border-line">
              <div className={`h-7 ${block}`} />
            </div>
            {bag && <div className={`h-3 w-2/3 ${block}`} />}
          </div>
          <div className="space-y-3 pt-2">
            <div className={`h-14 ${block}`} />
            <div className={`h-3 w-1/3 mx-auto ${block}`} />
          </div>
          <div className={`space-y-2 ${bag ? 'pt-4 border-t border-line' : ''}`}>
            <div className={`h-3 w-3/4 ${bag ? '' : 'mx-auto'} ${block}`} />
            <div className={`h-3 w-2/3 ${bag ? '' : 'mx-auto'} ${block}`} />
          </div>
        </div>
      </div>
    </>
  );
}

/** One bag line (image · name, specs, stepper and total), then the "Keep shopping" row. */
function LineBlocks() {
  return (
    <>
      <div className="flex items-start gap-4 py-6">
        <div className={`w-16 h-16 sm:w-24 sm:h-24 shrink-0 ${block}`} />
        <div className="flex-1 min-w-0">
          <div className={`h-5 w-1/2 ${block}`} />
          <div className={`mt-2 h-3 w-2/3 ${block}`} />
          <div className="mt-5 flex items-center justify-between gap-3">
            <div className={`h-11 w-32 ${block}`} />
            <div className={`h-6 w-16 ${block}`} />
          </div>
        </div>
      </div>
      <div className="mt-8 pt-6 border-t border-line">
        <div className={`h-4 w-28 ${block}`} />
      </div>
    </>
  );
}

/** A label, a field the height of an input, and the lines of its hint. */
function Field({ hintLines = 0 }: { hintLines?: number }) {
  return (
    <div>
      <div className={`my-0.5 h-3 w-1/3 ${block}`} />
      <div className="mt-1.5 h-11.5 border border-line" />
      {hintLines > 0 && (
        <div className="mt-1.5 space-y-1">
          {Array.from({ length: hintLines }, (_, i) => (
            <div key={i} className={`h-3 ${i ? 'w-1/2' : 'w-4/5'} ${block}`} />
          ))}
        </div>
      )}
    </div>
  );
}

/** The delivery step's header and its fields, in the form's rows. */
function FieldBlocks() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-line">
        <div className={`w-8 h-8 rounded-full shrink-0 ${block}`} />
        <div className="flex-1 space-y-2">
          <div className={`h-5 w-2/5 ${block}`} />
          <div className={`h-3 w-3/5 ${block}`} />
        </div>
      </div>
      <div className="space-y-4">
        <Field />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field hintLines={2} />
          <Field hintLines={2} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field />
          <Field />
        </div>
        <Field />
      </div>
    </div>
  );
}
