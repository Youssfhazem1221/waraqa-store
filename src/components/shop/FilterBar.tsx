'use client';

import React from 'react';
import { SIZE_OPTIONS } from '@/lib/constants';
import { useLanguage } from '@/context/LanguageContext';
import { plural, sizeLabel } from '@/lib/format';

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
  const { t, locale } = useLanguage();

  const sortOptions = [
    { value: 'featured', label: t.shop.sortFeatured },
    { value: 'price-asc', label: t.shop.sortPriceAsc },
    { value: 'price-desc', label: t.shop.sortPriceDesc },
    { value: 'name-asc', label: t.shop.sortNameAsc },
  ];

  // One row from lg up: sizes and search at the start, count and sort at the
  // end. Narrower screens wrap what doesn't fit under the sizes.
  return (
    <div className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-4">
      {/* Padding instead of a gap, so each size is a whole tap target ("A5"
          was 18px wide); -mx-2 keeps the labels where the gap had them. */}
      <div className="-mx-2 flex flex-wrap items-center sm:gap-x-1 gap-y-2" role="group" aria-label={t.shop.formatLabel}>
        {SIZE_OPTIONS.map((size) => {
          const isSelected = selectedSize === size;
          const displayLabel = size === 'All' ? t.shop.all : sizeLabel(size, locale);
          return (
            <button
              key={size}
              type="button"
              onClick={() => onSelectSize(size)}
              aria-pressed={isSelected}
              className={`text-sm px-2 py-1.5 whitespace-nowrap underline-offset-[6px] decoration-1 cursor-pointer transition-colors ${
                isSelected ? 'text-maroon underline' : 'text-char/70 hover:text-maroon'
              }`}
            >
              {displayLabel}
            </button>
          );
        })}
      </div>

      <div className="relative w-full sm:w-64">
        <input
          type="search"
          placeholder={t.shop.searchPlaceholder}
          aria-label={t.nav.search}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          // 16px on phones: iOS Safari zooms the page into any field smaller than that.
          // Chrome's own clear button (a blue ✕) sat beside our "Clear".
          className="w-full bg-transparent text-char border-0 border-b border-char/30 py-2 pe-12 text-base sm:text-sm placeholder:text-muted focus:border-maroon focus:shadow-none focus:outline-none [&::-webkit-search-cancel-button]:appearance-none"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute end-0 top-1/2 -translate-y-1/2 -me-2 px-2 min-h-11 inline-flex items-center text-xs text-muted hover:text-char cursor-pointer"
          >
            {t.shop.clearSearch}
          </button>
        )}
      </div>

      <div className="flex w-full sm:w-auto sm:ms-auto items-center justify-between gap-4 text-sm">
        <span className="text-muted tabular-nums whitespace-nowrap">
          {plural(locale, totalCount, t.shop.sketchbookCount)}
        </span>
        <select
          value={selectedSort}
          onChange={(e) => onSelectSort(e.target.value)}
          aria-label={t.shop.sortLabel}
          className="bg-transparent text-char border-0 border-b border-char/30 py-2 pe-6 text-base sm:text-sm cursor-pointer focus:border-maroon focus:shadow-none focus:outline-none"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
