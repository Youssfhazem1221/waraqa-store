'use client';

import React, { useState, useEffect, useMemo, useDeferredValue } from 'react';
import type { Product } from '@/types';
import { fetchProducts } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import FilterBar from '@/components/shop/FilterBar';
import ProductGrid from '@/components/shop/ProductGrid';
import EmptyState from '@/components/shop/EmptyState';
import fallbackProducts from '@/data/products.json';

const BUNDLED = fallbackProducts as Product[];

export default function ShopClient() {
  const { t, locale, isRTL } = useLanguage();
  const [products, setProducts] = useState<Product[]>(BUNDLED);
  const [selectedSize, setSelectedSize] = useState('All');
  const [selectedSort, setSelectedSort] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');

  // Typing filters a small list, but deferring keeps the input responsive as
  // the catalog grows.
  const deferredQuery = useDeferredValue(searchQuery);

  // Refresh from the live catalog in the background. The bundled snapshot is
  // already rendered, so there is nothing to wait for — the page used to hide
  // it behind a full-page spinner until Apps Script answered, which cost a
  // second or more of blank screen for data we already had.
  useEffect(() => {
    let active = true;
    fetchProducts()
      .then((live) => {
        if (active && live.length > 0) setProducts(live);
      })
      .catch((err) => console.warn('Using bundled products fallback', err));
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

    const q = deferredQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((p) => {
        const haystack = [
          p.name,
          p.nameAr,
          p.sku,
          p.description,
          p.descriptionAr,
          p.paperType,
          p.size,
          p.category,
          `${p.gsm}gsm`,
          `${p.gsm} gsm`,
          `${p.sheets} sheets`,
          `${p.sheets}`,
        ]
          .join(' ')
          .toLowerCase();
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Header */}
      <div className="mb-10 text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-maroon">
          {t.shop.tag}
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-semibold text-maroon">
          {t.shop.title}
        </h1>
        <p className="text-muted text-sm sm:text-base leading-relaxed">
          {t.shop.description}
        </p>
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

      {/* Grid or Empty */}
      {filteredProducts.length > 0 ? (
        <ProductGrid products={filteredProducts} />
      ) : (
        <EmptyState
          title={t.shop.emptyTitle}
          message={t.shop.emptyMessage}
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
