'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type { Product } from '@/types';
import { fetchProducts } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import FilterBar from '@/components/shop/FilterBar';
import ProductGrid from '@/components/shop/ProductGrid';
import EmptyState from '@/components/shop/EmptyState';
import Spinner from '@/components/ui/Spinner';
import fallbackProducts from '@/data/products.json';

export default function ShopPage() {
  const { t, isRTL } = useLanguage();
  const [products, setProducts] = useState<Product[]>(fallbackProducts as Product[]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('All');
  const [selectedSort, setSelectedSort] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch live products on mount
  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const live = await fetchProducts();
        if (isMounted) {
          setProducts(live);
        }
      } catch (err) {
        console.warn('Using bundled products fallback', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter and sort logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by size
    if (selectedSize !== 'All') {
      result = result.filter((p) => p.size === selectedSize);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.nameAr.includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.paperType.toLowerCase().includes(q) ||
          `${p.gsm}gsm`.includes(q) ||
          `${p.sheets} sheets`.includes(q) ||
          p.size.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (selectedSort) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        result.sort((a, b) => {
          const nameA = isRTL ? a.nameAr : a.name;
          const nameB = isRTL ? b.nameAr : b.name;
          return nameA.localeCompare(nameB);
        });
        break;
      case 'featured':
      default:
        result.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return 0;
        });
        break;
    }

    return result;
  }, [products, selectedSize, selectedSort, searchQuery, isRTL]);

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
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Spinner size="lg" />
          <p className="text-xs text-muted font-medium">{t.shop.loadingLive}</p>
        </div>
      ) : filteredProducts.length > 0 ? (
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
