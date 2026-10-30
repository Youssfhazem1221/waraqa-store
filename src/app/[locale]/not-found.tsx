import type { Metadata } from 'next';
import { isLocale, DEFAULT_LOCALE } from '@/lib/seo';
import { translations } from '@/lib/translations';
import NotFoundClient from './NotFoundClient';

type Params = { params: Promise<{ locale: string }> };

// Next answers a 404 here with its error document, whose <head> takes its
// metadata from this file rather than from the page that called notFound().
// Without it, every 404 tab showed the site's default title.
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  const l = isLocale(locale) ? locale : DEFAULT_LOCALE;
  return { title: translations[l].notFound.eyebrow };
}

export default function NotFound() {
  return <NotFoundClient />;
}
