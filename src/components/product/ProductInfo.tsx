'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { useRateText } from '@/context/ShippingContext';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import Price from '@/components/ui/Price';
import SpecLine from '@/components/ui/SpecLine';
import HeadingText from '@/components/ui/HeadingText';
import QuantityStepper from './QuantityStepper';
import { lineTotal } from '@/lib/money';
import { formatNumber, formatPriceAmount, paperTypeLabel, plural, sizeLabel } from '@/lib/format';
import { shortName } from '@/lib/api';
import { mediumFor } from '@/lib/paper';
import { MAX_LINE_QTY } from '@/lib/constants';

interface ProductInfoProps {
  product: Product;
  /** Offered when `product` is sold out: an in-stock book, picked on the server. */
  alternative?: Product;
}

export default function ProductInfo({ product, alternative }: ProductInfoProps) {
  const { addItem } = useCart();
  const { t, isRTL, lp, locale } = useLanguage();
  const rateText = useRateText();
  const [requestedQty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  // A live stock drop (or navigating to a product with less stock) must not
  // leave a quantity above what we can actually ship. Derived at render, so
  // there is no window in which a too-large quantity is displayed or added.
  const maxQty = Math.max(1, Math.min(MAX_LINE_QTY, product.stock));
  const qty = Math.min(Math.max(1, requestedQty), maxQty);

  const isOutOfStock = product.stock <= 0 || product.status === 'Out of stock';
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const fullName = isRTL ? (product.nameAr || product.name) : product.name;
  const displayName = shortName(fullName);
  const description = isRTL ? (product.descriptionAr || product.description) : product.description;
  const medium = mediumFor(product.gsm);
  const goodFor = t.guide[`${medium}Title`].split(/[,،]\s*/);
  // The paper guide's section for this weight band (its section ids).
  const guideAnchor = medium === 'wet' ? 'watercolour' : medium === 'ink' ? 'ink' : 'pencil';

  // Held in a ref so rapid clicks restart one timer instead of stacking
  // several, and so an unmount (navigating away) cancels it rather than
  // setting state on a component that is gone.
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (addedTimer.current) clearTimeout(addedTimer.current);
    },
    []
  );

  // The mobile bar only appears once the main button has scrolled away, so the
  // page never shows two add-to-bag buttons at once. The top margin is the
  // sticky header: a button scrolled up under it is out of sight too, and
  // used to leave neither button on screen.
  const buyRef = useRef<HTMLDivElement>(null);
  const [buyVisible, setBuyVisible] = useState(true);
  useEffect(() => {
    const el = buyRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setBuyVisible(entry.isIntersecting), {
      rootMargin: '-64px 0px 0px 0px',
    });
    io.observe(el);
    return () => io.disconnect();
  }, [isOutOfStock]);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, qty);
    setAdded(true);
    if (addedTimer.current) clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setAdded(false), 2000);
  };

  // The amount is held together, so a narrow phone breaks the line before the
  // price instead of between "220" and "EGP". No "·" before it: beside an
  // Arabic amount the dot read as one more zero («٢٢٠ ج.م» as ٢٢٠٠). The
  // divider shows from sm up, where the label and price always share a line.
  const buttonLabel = added ? (
    t.product.addedToBag
  ) : (
    <span className="inline-flex flex-wrap items-center justify-center gap-x-3">
      <span>{t.shop.addToBag}</span>
      <span aria-hidden className="hidden sm:block w-px h-4 bg-current opacity-40" />
      <Price value={lineTotal(product.price, qty)} locale={locale} />
    </span>
  );

  const size = sizeLabel(product.size, locale);
  const weight = `${formatNumber(product.gsm, locale)} ${t.common.gsm}`;
  const paperType = paperTypeLabel(product.paperType, locale);

  const facts: [string, string][] = [
    [t.product.sizeLabel, size],
    [t.common.sheetsCount, formatNumber(product.sheets, locale)],
    [t.common.paperWeight, weight],
  ];

  // Only what the fact grid above doesn't give: the list used to repeat the
  // size, weight and sheet count. The third field marks a code, kept left to
  // right in Latin characters.
  const specs: [string, string, boolean?][] = [
    [t.common.paperType, paperType],
    [t.product.codeLabel, product.sku, true],
  ];

  // Terracotta stays on the dot: as text on cream it was 3.32:1.
  const stock = isOutOfStock
    ? { text: t.common.soldOut, cls: 'text-error', dot: 'bg-current' }
    : isLowStock
    ? { text: plural(locale, product.stock, t.product.stockLeft), cls: 'text-char', dot: 'bg-terra' }
    : { text: t.common.inStock, cls: 'text-success', dot: 'bg-current' };

  const altHref = alternative ? lp(`/product/${alternative.slug}`) : '';
  const altName = alternative ? shortName(isRTL ? alternative.nameAr || alternative.name : alternative.name) : '';
  const altSamePaper =
    !!alternative && alternative.gsm === product.gsm && alternative.paperType === product.paperType;

  const trust = [
    { icon: 'truck' as const, text: t.product.deliveryNote },
    { icon: 'card' as const, text: t.product.codNote },
    { icon: 'shield' as const, text: t.product.checkedNote },
  ];

  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted">
        <SpecLine parts={[paperType, size]} locale={locale} />
      </p>
      <h1 className="mt-2 font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-char leading-[1.05] rtl:leading-[1.2]">
        <HeadingText text={displayName} locale={locale} />
      </h1>

      <div className="mt-5 flex items-baseline gap-3">
        <Price
          value={product.price}
          locale={locale}
          className="text-3xl font-semibold text-char"
          currencyClassName="text-base font-normal text-muted"
        />
        {product.compareAt > product.price && (
          <span className="text-lg text-muted line-through tabular-nums">
            {formatPriceAmount(product.compareAt, locale)}
          </span>
        )}
      </div>

      <p className={`mt-2 inline-flex items-center gap-2 text-sm ${stock.cls}`}>
        <span className={`w-2 h-2 rounded-full ${stock.dot}`} aria-hidden />
        {stock.text}
      </p>

      <p className="mt-6 text-char/85 leading-relaxed">{description}</p>

      <div className="mt-6">
        <p className="text-sm text-muted">{t.product.bestFor}</p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {goodFor.map((m) => (
            <li key={m} className="border border-char/20 px-3 py-1.5 text-sm text-char first-letter:uppercase">
              {m}
            </li>
          ))}
        </ul>
        {/* Product pages linked out to nothing editorial; this sends a buyer
            who is unsure about the weight to the guide section for it. */}
        <Link
          href={`${lp('/paper-guide')}#${guideAnchor}`}
          className="mt-2.5 inline-flex items-center min-h-6 text-sm text-maroon underline underline-offset-4 decoration-1 hover:decoration-2"
        >
          {t.product.guideLink}
        </Link>
      </div>

      <dl className="mt-6 grid grid-cols-3 border border-line divide-x divide-line rtl:divide-x-reverse text-center">
        {facts.map(([label, value]) => (
          <div key={label} className="py-3 px-2">
            <dt className="text-xs text-muted">{label}</dt>
            <dd className="mt-0.5 font-semibold text-char">
              <bdi>{value}</bdi>
            </dd>
          </div>
        ))}
      </dl>

      {isOutOfStock ? (
        // A sold-out page used to end at a disabled button (and the phone bar
        // repeated it). It now offers the nearest book we can send, and the
        // new-batch list on the home page.
        <div className="mt-8 space-y-4">
          {alternative && (
            <div className="border border-line bg-white/60 p-4 flex flex-wrap items-center gap-4">
              <Link href={altHref} className="group flex flex-1 min-w-0 items-center gap-4">
                <span className="relative w-14 aspect-4/5 shrink-0">
                  <Image src={alternative.image} alt={altName} fill sizes="56px" className="object-contain" />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold text-char group-hover:text-maroon group-hover:underline underline-offset-4">
                    {altSamePaper ? (
                      <>
                        {t.product.altSamePaper} <bdi>{sizeLabel(alternative.size, locale)}</bdi>
                      </>
                    ) : (
                      `${t.product.altClosest} ${altName}`
                    )}
                  </span>
                  <Price value={alternative.price} locale={locale} className="mt-0.5 block text-sm text-char/80" />
                </span>
              </Link>
              <Button onClick={() => addItem(alternative, 1)} className="w-full sm:w-auto">
                <Icon name="bag" size={16} />
                {t.shop.addToBag}
              </Button>
            </div>
          )}
          <Link
            href={`${lp('/')}#newsletter`}
            className="inline-flex items-center min-h-6 text-sm text-maroon underline underline-offset-4 decoration-1 hover:decoration-2"
          >
            {t.product.notifyBatch}
          </Link>
        </div>
      ) : (
        <div ref={buyRef} className="mt-8 flex items-stretch gap-3">
          <QuantityStepper qty={qty} max={maxQty} min={1} onChange={setQty} />
          <Button size="lg" onClick={handleAddToCart} className="flex-1" aria-live="polite">
            <Icon name={added ? 'check' : 'bag'} size={18} />
            {buttonLabel}
          </Button>
        </div>
      )}

      <ul className="mt-6 grid sm:grid-cols-3 gap-3 text-sm">
        {trust.map((item) => (
          <li key={item.icon} className="flex items-start gap-2 text-char/80">
            <Icon name={item.icon} size={18} className="text-maroon shrink-0 mt-0.5" />
            <span>{item.text}</span>
          </li>
        ))}
      </ul>

      <div className="mt-10 border-t border-line">
        {[
          {
            title: t.product.specsTitle,
            open: true,
            body: (
              <dl className="text-sm">
                {specs.map(([label, value, isCode]) => (
                  <div key={label} className="flex justify-between gap-6 py-2 border-b border-line last:border-b-0">
                    <dt className="text-muted">{label}</dt>
                    <dd className="text-char text-end">
                      {isCode ? <bdi dir="ltr" data-ident>{value}</bdi> : <bdi>{value}</bdi>}
                    </dd>
                  </div>
                ))}
              </dl>
            ),
          },
          { title: t.product.deliveryTitle, open: false, body: <p className="leading-relaxed">{rateText(t.product.deliveryBody)}</p> },
        ].map((section) => (
          <details key={section.title} open={section.open} className="group border-b border-line">
            <summary className="flex items-center justify-between py-4 cursor-pointer list-none font-medium text-char [&::-webkit-details-marker]:hidden">
              {section.title}
              <Icon name="plus" size={16} className="text-muted group-open:hidden" />
              <Icon name="minus" size={16} className="text-muted hidden group-open:block" />
            </summary>
            <div className="pb-5 text-char/80">{section.body}</div>
          </details>
        ))}
      </div>

      {/* Mobile: keep buying one thumb-tap away while reading the details.
          Nothing to buy on a sold-out page, so no bar. */}
      {!isOutOfStock && (
        <div
          className={`lg:hidden fixed inset-x-0 bottom-0 z-30 bg-cream/95 backdrop-blur-sm border-t border-line px-4 py-3 flex items-center gap-3 transition-transform duration-300 ${
            buyVisible ? 'translate-y-full' : 'translate-y-0'
          }`}
          aria-hidden={buyVisible}
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm text-char truncate">{displayName}</p>
            <p className="font-semibold">
              <Price value={product.price} locale={locale} />
            </p>
          </div>
          <Button onClick={handleAddToCart} tabIndex={buyVisible ? -1 : 0} className="shrink-0">
            <Icon name={added ? 'check' : 'bag'} size={16} />
            {added ? t.product.added : t.shop.addToBag}
          </Button>
        </div>
      )}
    </div>
  );
}
