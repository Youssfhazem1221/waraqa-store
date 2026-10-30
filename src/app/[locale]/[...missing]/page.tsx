import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale, DEFAULT_LOCALE } from '@/lib/seo';
import { translations } from '@/lib/translations';

type Params = { params: Promise<{ locale: string }> };

// A 404 reached by a link inside the store shows this page's title; a full
// page load takes it from not-found.tsx.
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  const l = isLocale(locale) ? locale : DEFAULT_LOCALE;
  return { title: translations[l].notFound.eyebrow };
}

/**
 * Any /en or /ar path no other route claims.
 *
 * Unmatched URLs used to get Next's bare built-in 404: white page, no header
 * or footer, English even under /ar, because that page renders outside the
 * [locale] layout. Calling notFound() from inside the segment renders
 * [locale]/not-found.tsx within the layout, with a real 404 status.
 */
export default function MissingPage() {
  notFound();
}
