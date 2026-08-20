'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Icon from '@/components/ui/Icon';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);

  const displayList = images && images.length > 0 ? images : ['/products/wrq-a5-kft.jpeg'];
  const activeImage = displayList[selectedIdx] || displayList[0];

  useEffect(() => {
    setImageFailed(false);
  }, [activeImage]);

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-white border border-line shadow-sm">
        {imageFailed ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted bg-[#FAF5EE]">
            <Icon name="box" size={40} />
            <span className="text-sm font-medium">Photo coming soon</span>
          </div>
        ) : (
          <Image
            src={activeImage}
            alt={productName}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            onError={() => setImageFailed(true)}
            className="object-cover object-center"
          />
        )}
      </div>

      {/* Thumbnails (if multiple) */}
      {displayList.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {displayList.map((img, idx) => {
            const isSelected = selectedIdx === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'border-maroon ring-2 ring-maroon/20 scale-105'
                    : 'border-line opacity-70 hover:opacity-100'
                }`}
              >
                <Image
                  src={img}
                  alt={`${productName} thumbnail ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover object-center"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
