import type { Product } from '@/types';
import productsData from '@/data/products.json';
import { POSTS } from '@/data/blog';
import { PAPER_GUIDE } from '@/data/paperGuide';
import { absoluteUrl, SITE_URL } from '@/lib/seo';
import { getLegalDoc } from '@/lib/legal';
import { WHATSAPP_NUMBER, INSTAGRAM_URL, DELIVERY_DAYS_MIN, DELIVERY_DAYS_MAX } from '@/lib/constants';

/**
 * /llms.txt (llmstxt.org): a plain-Markdown map of the site for AI assistants.
 * Google Search ignores it; ChatGPT, Perplexity and Claude can use it to answer
 * "where do I buy a sketchbook in Egypt" with the right pages.
 *
 * Generated from the same catalog, posts and policy copy as the pages, so it
 * cannot drift from them. Prices are left out on purpose: they are runtime data
 * from the Sheet, and a stale price quoted by an assistant is worse than none.
 */
export const dynamic = 'force-static';

const products = productsData as Product[];

/** First sentence of a description, for a one-line summary. */
function firstSentence(text: string): string {
  const s = String(text || '').replace(/\s*—\s*/g, ', ').trim();
  const end = s.search(/\.(\s|$)/);
  return end > 0 ? s.slice(0, end) : s;
}

export function GET() {
  const shop = [...products]
    .filter((p) => p.status !== 'Hidden')
    .sort((a, b) => a.gsm - b.gsm || a.name.localeCompare(b.name))
    .map((p) => `- [${p.name}](${absoluteUrl('en', `/product/${p.slug}`)}): ${firstSentence(p.description)}`);

  const guide = PAPER_GUIDE.en;
  const posts = [...POSTS]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((p) => `- [${p.en.title}](${absoluteUrl('en', `/blog/${p.slug}`)}): ${p.en.description}`);

  const policy = (slug: 'shipping' | 'returns' | 'privacy' | 'terms') => {
    const doc = getLegalDoc('en', slug);
    return `- [${doc.title}](${absoluteUrl('en', `/${slug}`)}): ${doc.description}`;
  };

  const body = `# Waraqa (ورقة)

> Waraqa is a sketchbook and art-paper brand from Cairo, Egypt, selling ${products.length} sketchbooks on 150–320 gsm drawing, kraft and mixed media paper. It ships only within Egypt and is paid cash on delivery. Every page exists in English under /en and in Egyptian Arabic under /ar.

- Delivery: Egypt only. Cairo and Giza pay one flat fee (free above a set order value); every other governorate pays a second flat fee. ${DELIVERY_DAYS_MIN}–${DELIVERY_DAYS_MAX} working days after the order is confirmed on WhatsApp.
- Payment: cash on delivery.
- Prices are in Egyptian pounds (EGP) and change; read them from the product pages.
- Contact: WhatsApp +${WHATSAPP_NUMBER} · Instagram ${INSTAGRAM_URL}

## Shop

- [All sketchbooks](${absoluteUrl('en', '/shop')}): the full catalog, filterable by size and searchable by paper weight
${shop.join('\n')}

## Guides

- [${guide.h1}](${absoluteUrl('en', '/paper-guide')}): ${guide.description}
${posts.join('\n')}

## Policies

${policy('shipping')}
${policy('returns')}
- [About Waraqa](${absoluteUrl('en', '/about')})

## Optional

- [Arabic home page](${absoluteUrl('ar', '/')}): every URL above also exists with /ar in place of /en
${policy('privacy')}
${policy('terms')}
- [Sitemap](${SITE_URL}/sitemap.xml)
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
