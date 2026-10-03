import React from 'react';
import Link from 'next/link';
import type { Locale } from '@/lib/translations';
import { translations } from '@/lib/translations';
import { getLegalDoc, LEGAL_SLUGS, LEGAL_UPDATED, type LegalSlug } from '@/lib/legal';
import { localePath } from '@/lib/seo';
import { COMMERCIAL_REGISTRATION, TAX_CARD_NUMBER } from '@/lib/constants';

/** Group consecutive "• " paragraphs into one list. */
function renderBody(body: string[]) {
  const out: React.ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) {
      out.push(
        <ul key={`ul-${out.length}`} className="list-disc ps-5 space-y-1.5 marker:text-muted">
          {list.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
      list = [];
    }
  };
  for (const p of body) {
    if (p.startsWith('• ')) {
      list.push(p.slice(2));
    } else {
      flush();
      out.push(<p key={p}>{p}</p>);
    }
  }
  flush();
  return out;
}

export default function LegalDocument({ locale, slug }: { locale: Locale; slug: LegalSlug }) {
  const doc = getLegalDoc(locale, slug);
  const t = translations[locale];

  const seller = [
    COMMERCIAL_REGISTRATION && `${t.legal.commercialRegistration}: ${COMMERCIAL_REGISTRATION}`,
    TAX_CARD_NUMBER && `${t.legal.taxCard}: ${TAX_CARD_NUMBER}`,
  ].filter(Boolean) as string[];

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <header className="pb-8 border-b border-line">
        <p className="text-sm text-muted">
          {t.legal.updated} {LEGAL_UPDATED[locale]}
        </p>
        <h1 className="mt-2 font-serif text-4xl sm:text-5xl font-semibold text-maroon">{doc.title}</h1>
        <p className="mt-4 text-lg text-char/85 leading-relaxed">{doc.intro}</p>
      </header>

      <div className="divide-y divide-line">
        {doc.sections.map((section) => (
          <section key={section.heading} className="py-8">
            <h2 className="font-serif text-2xl font-semibold text-char">{section.heading}</h2>
            <div className="mt-3 space-y-3 text-char/85 leading-relaxed">{renderBody(section.body)}</div>
          </section>
        ))}
        {seller.length > 0 && (slug === 'terms' || slug === 'privacy') && (
          <section className="py-8">
            <h2 className="font-serif text-2xl font-semibold text-char">{t.legal.sellerDetails}</h2>
            <ul className="mt-3 space-y-1 text-char/85">
              {seller.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <nav aria-label={t.footer.help} className="mt-4 pt-8 border-t border-line">
        <p className="text-sm text-muted">{t.legal.otherPolicies}</p>
        <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
          {LEGAL_SLUGS.filter((s) => s !== slug).map((s) => (
            <li key={s}>
              <Link
                href={localePath(locale, `/${s}`)}
                className="text-maroon underline underline-offset-4 decoration-1 hover:decoration-2"
              >
                {getLegalDoc(locale, s).title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </article>
  );
}
