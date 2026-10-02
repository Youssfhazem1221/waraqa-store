'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Icon from '@/components/ui/Icon';
import { useLanguage } from '@/context/LanguageContext';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const { t } = useLanguage();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);

  const displayList = images && images.length > 0 ? images : ['/products/wrq-a5-kft.jpeg'];

  // Reset during render rather than in an effect. Client-side navigation
  // between two products reuses this component, so a thumbnail selected on the
  // previous product used to carry over — and index past the end of a shorter
  // image list. Adjusting here also avoids painting one frame of the wrong
  // image, which the effect version could not.
  const [trackedImages, setTrackedImages] = useState(images);
  if (trackedImages !== images) {
    setTrackedImages(images);
    setSelectedIdx(0);
    setImageFailed(false);
  }

  const activeImage = displayList[selectedIdx] || displayList[0];

  // Same idea for the error state: a new image deserves a fresh attempt.
  const [trackedImage, setTrackedImage] = useState(activeImage);
  if (trackedImage !== activeImage) {
    setTrackedImage(activeImage);
    setImageFailed(false);
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#EFE5D6]">
        {imageFailed ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted">
            <Icon name="box" size={40} />
            <span className="text-sm font-medium">{t.common.photoComingSoon}</span>
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
        <div className="flex items-center gap-2 overflow-x-auto">
          {displayList.map((img, idx) => {
            const isSelected = selectedIdx === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                aria-pressed={isSelected}
                className={`relative w-20 h-20 overflow-hidden border transition-opacity shrink-0 cursor-pointer ${
                  isSelected ? 'border-maroon' : 'border-transparent opacity-60 hover:opacity-100'
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
