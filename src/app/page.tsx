'use client';

import React, { useState, useEffect } from 'react';
import type { Product } from '@/types';
import { fetchProducts } from '@/lib/api';
import HeroSection from '@/components/home/HeroSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import BrandStory from '@/components/home/BrandStory';
import TrustRow from '@/components/home/TrustRow';
import NewsletterCapture from '@/components/home/NewsletterCapture';
import fallbackProducts from '@/data/products.json';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>(fallbackProducts as Product[]);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const live = await fetchProducts();
        if (isMounted) setProducts(live);
      } catch (err) {
        console.warn('Home: using fallback products', err);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <HeroSection />
      <FeaturedProducts products={products} />
      <BrandStory />
      <TrustRow />
      <NewsletterCapture />
    </>
  );
}
