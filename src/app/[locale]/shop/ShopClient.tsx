'use client';

import React, { useState, useEffect, useMemo, useDeferredValue, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Product } from '@/types';
import { fetchLiveProducts } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/lib/translations';
import { mediumFor } from '@/lib/paper';
import { paperTypeLabel, sizeLabel } from '@/lib/format';
import { SIZE_SLUGS } from '@/lib/constants';
import FilterBar from '@/components/shop/FilterBar';
import ProductGrid from '@/components/shop/ProductGrid';
import EmptyState from '@/components/shop/EmptyState';

/**
 * Fold the differences a shopper should not have to match exactly: case,
 * spacing, Arabic-Indic digits (٣٢٠ = 320), US/UK spelling ("watercolor" found
 * nothing, the copy says "watercolour") and the Arabic letters people type
 * interchangeably (الوان مائيه = ألوان مائية).
 */
function normalizeSearch(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/colour/g, 'color')
    .replace(/[\u064B-\u0652\u0640]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي');
}

/** The size a ?size= value names; a missing or unknown one is All. */
function sizeFromSlug(slug: string | null): string {
  const value = (slug || '').trim().toLowerCase();
  return Object.keys(SIZE_SLUGS).find((size) => SIZE_SLUGS[size] === value) ?? 'All';
}

export default function ShopClient({ initialProducts }: { initialProducts: Product[] }) {
  const { t, locale, isRTL } = useLanguage();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [selectedSort, setSelectedSort] = useState('featured');

  // The size lives in the URL (/shop?size=a5), so a filtered shelf can be
  // shared, survives a reload and the language switch, and Back undoes it.
  // This page renders per request, so the server's HTML already has it.
  // pushState goes through Next's router: useSearchParams follows it with no
  // server round trip.
  const searchParams = useSearchParams();
  const selectedSize = sizeFromSlug(searchParams.get('size'));
  const setSelectedSize = useCallback((size: string) => {
    const params = new URLSearchParams(window.location.search);
    if (sizeFromSlug(params.get('size')) === size) return;
    if (size === 'All') params.delete('size');
    else params.set('size', SIZE_SLUGS[size]);
    const query = params.toString();
    window.history.pushState(null, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`);
  }, []);
  const [searchQuery, setSearchQuery] = useState('');

  // Typing filters a small list, but deferring keeps the input responsive as
  // the catalog grows.
  const deferredQuery = useDeferredValue(searchQuery);

  // Refresh from the live catalog in the background. The server-rendered list is
  // already rendered, so there is nothing to wait for — the page used to hide
  // it behind a full-page spinner until Apps Script answered, which cost a
  // second or more of blank screen for data we already had.
  useEffect(() => {
    let active = true;
    fetchLiveProducts().then((live) => {
      if (active && live) setProducts(live);
    });
    return () => {
      active = false;
    };
  }, []);

  // Collator built once per locale instead of per comparison — localeCompare
  // with no locale also sorted Arabic names by the browser's default, not the
  // language actually on screen.
  const collator = useMemo(
    () => new Intl.Collator(locale === 'ar' ? 'ar-EG' : 'en', { numeric: true, sensitivity: 'base' }),
    [locale]
  );

  const filteredProducts = useMemo(() => {
    let result = products;

    if (selectedSize !== 'All') {
      result = result.filter((p) => p.size === selectedSize);
    }

    const q = normalizeSearch(deferredQuery.trim());
    if (q) {
      result = result.filter((p) => {
        const medium = mediumFor(p.gsm);
        const haystack = normalizeSearch(
          [
            p.name,
            p.nameAr,
            p.sku,
            p.description,
            p.descriptionAr,
            p.paperType,
            p.size,
            // The labels the cards show, so «خامات جافة» or «سم» finds them.
            paperTypeLabel(p.paperType, 'ar'),
            sizeLabel(p.size, 'ar'),
            p.category,
            `${p.gsm}gsm`,
            `${p.gsm} gsm`,
            `${p.sheets} sheets`,
            `${p.sheets}`,
            // What the paper is for, in both languages, so "markers" or
            // "ألوان مائية" find books whose names never say it.
            translations.en.guide[`${medium}Title`],
            translations.ar.guide[`${medium}Title`],
          ].join(' ')
        );
        return haystack.includes(q);
      });
    }

    // Copy before sorting: sorting `products` in place would mutate state.
    const sorted = [...result];
    switch (selectedSort) {
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        sorted.sort((a, b) =>
          collator.compare(isRTL ? a.nameAr || a.name : a.name, isRTL ? b.nameAr || b.name : b.name)
        );
        break;
      case 'featured':
      default:
        // Featured first, then in-stock, then cheapest — so the default view
        // never leads with a sold-out book.
        sorted.sort((a, b) => {
          if (a.featured !== b.featured) return a.featured ? -1 : 1;
          const aIn = a.stock > 0 && a.status === 'Active';
          const bIn = b.stock > 0 && b.status === 'Active';
          if (aIn !== bIn) return aIn ? -1 : 1;
          return a.price - b.price;
        });
        break;
    }

    return sorted;
  }, [products, selectedSize, selectedSort, deferredQuery, isRTL, collator]);

  return (
    // A short header, so the first screen reaches the first prices: the title,
    // intro, rule and two filter rows took ~450 px on desktop and ~520 px on
    // phones before the first card. Phones skip the intro.
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-10 sm:pt-8 sm:pb-14">
      <div className="mb-5 pb-5 sm:mb-6 sm:pb-6 border-b border-line max-w-2xl">
        <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-maroon">{t.shop.title}</h1>
        <p className="hidden sm:block mt-2 text-muted leading-relaxed">{t.shop.description}</p>
      </div>

      {/* Filter Bar */}
      <FilterBar
        selectedSize={selectedSize}
        onSelectSize={setSelectedSize}
        selectedSort={selectedSort}
        onSelectSort={setSelectedSort}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalCount={filteredProducts.length}
      />

      {/* The cards are h3s; without an h2 the outline jumped straight from the
          page h1 to them. Hidden because the filter bar already labels the grid. */}
      <h2 className="sr-only">{t.shop.gridHeading}</h2>

      {/* Grid or Empty */}
      {filteredProducts.length > 0 ? (
        <ProductGrid products={filteredProducts} />
      ) : (
        <EmptyState
          title={t.shop.emptyTitle}
          message={t.shop.emptyMessage}
          resetLabel={t.shop.resetFilters}
          onReset={() => {
            setSelectedSize('All');
            setSearchQuery('');
            setSelectedSort('featured');
          }}
        />
      )}
    </div>
  );
}
