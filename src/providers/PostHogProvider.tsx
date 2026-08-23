'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef } from 'react';

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;

/**
 * Send a pageview on every client-side navigation.
 *
 * The App Router never triggers a document load after the first one, so
 * PostHog's automatic pageview capture only ever recorded the landing page —
 * every route a shopper visited afterwards was invisible. Capturing manually
 * on pathname/search changes is the supported pattern for this router.
 */
function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastUrl = useRef<string | null>(null);

  useEffect(() => {
    if (!POSTHOG_KEY || !pathname) return;

    const query = searchParams?.toString();
    const url = query ? `${pathname}?${query}` : pathname;

    // React can run an effect twice in development; don't double-count.
    if (lastUrl.current === url) return;
    lastUrl.current = url;

    posthog.capture('$pageview', { $current_url: window.location.origin + url });
  }, [pathname, searchParams]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!POSTHOG_KEY) return;
    // Guard against a second init across a fast refresh / remount.
    if (posthog.__loaded) return;

    posthog.init(POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      person_profiles: 'identified_only',
      // We capture pageviews ourselves (see PageViewTracker) — leaving this on
      // as well would record every route twice.
      capture_pageview: false,
      capture_pageleave: true,
      // Nothing is worth breaking the storefront over.
      autocapture: true,
    });
  }, []);

  return (
    <PHProvider client={posthog}>
      {/* useSearchParams needs a Suspense boundary; keeping it around only the
          tracker means analytics can never suspend the page itself. */}
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      {children}
    </PHProvider>
  );
}
