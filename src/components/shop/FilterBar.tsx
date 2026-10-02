'use client';

import React from 'react';
import { SIZE_OPTIONS } from '@/lib/constants';
import { useLanguage } from '@/context/LanguageContext';
import { SIZE_NAMES_AR } from '@/lib/translations';

interface FilterBarProps {
  selectedSize: string;
  onSelectSize: (size: string) => void;
  selectedSort: string;
  onSelectSort: (sort: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalCount: number;
}

export default function FilterBar({
  selectedSize,
  onSelectSize,
  selectedSort,
  onSelectSort,
  searchQuery,
  onSearchChange,
  totalCount,
}: FilterBarProps) {
  const { t, isRTL } = useLanguage();

  const sortOptions = [
    { value: 'featured', label: t.shop.sortFeatured },
    { value: 'price-asc', label: t.shop.sortPriceAsc },
    { value: 'price-desc', label: t.shop.sortPriceDesc },
    { value: 'name-asc', label: t.shop.sortNameAsc },
  ];

  return (
    <div className="mb-10 space-y-5">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2" role="group" aria-label={t.shop.formatLabel}>
        {SIZE_OPTIONS.map((size) => {
          const isSelected = selectedSize === size;
          const displayLabel = isRTL ? (SIZE_NAMES_AR[size] || size) : (size === 'All' ? t.shop.all : size);
          return (
            <button
              key={size}
              type="button"
              onClick={() => onSelectSize(size)}
              aria-pressed={isSelected}
              className={`text-sm py-1.5 whitespace-nowrap underline-offset-[6px] decoration-1 cursor-pointer transition-colors ${
                isSelected ? 'text-maroon underline' : 'text-char/70 hover:text-maroon'
              }`}
            >
              {displayLabel}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 sm:items-end justify-between">
        <div className="relative flex-1 max-w-sm">
          <input
            type="search"
            placeholder={t.shop.searchPlaceholder}
            aria-label={t.nav.search}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-transparent text-char border-0 border-b border-char/30 py-2 pe-12 text-sm placeholder:text-muted focus:border-maroon focus:shadow-none focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute end-0 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-char cursor-pointer"
            >
              {isRTL ? 'مسح' : 'Clear'}
            </button>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted tabular-nums whitespace-nowrap">
            {totalCount} {totalCount === 1 ? t.shop.sketchbookSingle : t.shop.sketchbooksCount}
          </span>
          <select
            value={selectedSort}
            onChange={(e) => onSelectSort(e.target.value)}
            aria-label="Sort"
            className="bg-transparent text-char border-0 border-b border-char/30 py-2 pe-6 cursor-pointer focus:border-maroon focus:shadow-none focus:outline-none"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
