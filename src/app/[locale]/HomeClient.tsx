'use client';

import React, { useState, useEffect } from 'react';
import type { Product } from '@/types';
import { fetchLiveProducts } from '@/lib/api';
import HeroSection from '@/components/home/HeroSection';
import PaperGuide from '@/components/home/PaperGuide';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import Audience from '@/components/home/Audience';
import BrandStory from '@/components/home/BrandStory';
import NewsletterCapture from '@/components/home/NewsletterCapture';

export default function HomeClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  // Only a successful read replaces the server-rendered list; a slow or failed
  // one leaves it alone (see fetchLiveProducts).
  useEffect(() => {
    let isMounted = true;
    fetchLiveProducts().then((live) => {
      if (isMounted && live) setProducts(live);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <HeroSection products={products} />
      <FeaturedProducts products={products} />
      <PaperGuide products={products} />
      <Audience />
      <BrandStory />
      <NewsletterCapture />
    </>
  );
}
