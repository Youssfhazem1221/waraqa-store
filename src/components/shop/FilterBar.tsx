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
    <div className="space-y-4 mb-8">
      {/* Search and Sort row */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search bar */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder={t.shop.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`w-full bg-white text-char border border-line rounded-xl ${
              isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'
            } py-2.5 text-sm transition-colors focus:border-maroon focus:ring-2 focus:ring-maroon/15 focus:outline-none`}
          />
          <div className={`absolute ${isRTL ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-muted pointer-events-none`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="10.5" cy="10.5" r="6.5" strokeWidth="2" />
              <path d="M20 20l-4.8-4.8" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-xs text-muted hover:text-char`}
            >
              {isRTL ? 'مسح' : 'Clear'}
            </button>
          )}
        </div>

        {/* Sort and Count */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <span className="text-xs text-muted font-medium whitespace-nowrap">
            {totalCount} {totalCount === 1 ? t.shop.sketchbookSingle : t.shop.sketchbooksCount}
          </span>
          <div className="relative">
            <select
              value={selectedSort}
              onChange={(e) => onSelectSort(e.target.value)}
              className={`bg-white text-char border border-line rounded-xl ${
                isRTL ? 'pl-8 pr-3.5' : 'pr-8 pl-3.5'
              } py-2 text-xs sm:text-sm appearance-none cursor-pointer focus:border-maroon focus:outline-none`}
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className={`absolute ${isRTL ? 'left-2.5' : 'right-2.5'} top-1/2 -translate-y-1/2 pointer-events-none text-muted`}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Size Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted mr-1 shrink-0">
          {t.shop.formatLabel}
        </span>
        {SIZE_OPTIONS.map((size) => {
          const isSelected = selectedSize === size;
          const displayLabel = isRTL ? (SIZE_NAMES_AR[size] || size) : (size === 'All' ? t.shop.all : size);

          return (
            <button
              key={size}
              onClick={() => onSelectSize(size)}
              className={`px-3.5 py-1.5 rounded-none text-xs font-medium whitespace-nowrap transition-all select-none cursor-pointer ${
                isSelected
                  ? 'bg-maroon text-cream font-semibold shadow-xs'
                  : 'bg-white text-char/80 hover:bg-cream border border-line'
              }`}
            >
              {displayLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}
