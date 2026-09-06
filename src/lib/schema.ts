// ============================================================
// Waraqa Store — JSON-LD builders
// ============================================================
//
// One module so every page emits the same organisation identity and the same
// URL shapes. Answer engines cite whichever page they can parse; an entity that
// contradicts itself across pages gets cited as neither.

import type { Product } from '@/types';
import type { Locale } from '@/lib/translations';
import {
  BRAND,
  WHATSAPP_NUMBER,
  INSTAGRAM_URL,
  SHIPPING_CAIRO,
  SHIPPING_OUTSIDE,
  FREE_SHIP_OVER,
  DELIVERY_DAYS_MIN,
  DELIVERY_DAYS_MAX,
} from '@/lib/constants';
import { SITE_URL, absoluteUrl } from '@/lib/seo';

const ORG_ID = `${SITE_URL}/#organization`;
const RETURN_POLICY_ID = `${SITE_URL}/#return-policy`;
const SHIPPING_CAIRO_ID = `${SITE_URL}/#shipping-cairo`;
const SHIPPING_OUTSIDE_ID = `${SITE_URL}/#shipping-outside`;

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: BRAND.name,
    alternateName: BRAND.nameAr,
    url: SITE_URL,
    logo: `${SITE_URL}/logos/waraqa-1x1-dark-1024.png`,
    description: BRAND.description,
    slogan: BRAND.tagline,
    telephone: `+${WHATSAPP_NUMBER}`,
    areaServed: { '@type': 'Country', name: 'Egypt' },
    address: { '@type': 'PostalAddress', addressCountry: 'EG' },
    sameAs: [INSTAGRAM_URL, `https://wa.me/${WHATSAPP_NUMBER}`],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: `+${WHATSAPP_NUMBER}`,
      contactType: 'customer service',
      availableLanguage: ['English', 'Arabic'],
    },
  };
}

export function webSiteSchema(locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: absoluteUrl(locale, '/'),
    name: BRAND.name,
    inLanguage: locale === 'ar' ? 'ar-EG' : 'en',
    publisher: { '@id': ORG_ID },
  };
}

export function breadcrumbSchema(
  locale: Locale,
  trail: { name: string; path: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: absoluteUrl(locale, crumb.path),
    })),
  };
}

/** Availability must mirror the storefront's own in-stock rule exactly. */
function availability(product: Product) {
  return product.stock > 0 && product.status === 'Active'
    ? 'https://schema.org/InStock'
    : 'https://schema.org/OutOfStock';
}

export function productSchema(product: Product, locale: Locale) {
  const isAr = locale === 'ar';
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${absoluteUrl(locale, `/product/${product.slug}`)}#product`,
    name: isAr ? product.nameAr || product.name : product.name,
    alternateName: isAr ? product.name : product.nameAr || undefined,
    description: isAr
      ? product.descriptionAr || product.description
      : product.description,
    inLanguage: isAr ? 'ar-EG' : 'en',
    sku: product.sku,
    mpn: product.sku,
    image: product.images.map((src) => `${SITE_URL}${src}`),
    category: product.category,
    brand: { '@type': 'Brand', name: BRAND.name },
    material: product.paperType,
    size: product.size,
    // GSM and sheet count are the two specs Egyptian buyers actually search on,
    // so they are exposed as parseable properties rather than buried in prose.
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'Paper weight', value: `${product.gsm} gsm` },
      { '@type': 'PropertyValue', name: 'Sheets', value: String(product.sheets) },
      { '@type': 'PropertyValue', name: 'Paper type', value: product.paperType },
    ],
    offers: {
      '@type': 'Offer',
      url: absoluteUrl(locale, `/product/${product.slug}`),
      price: product.price,
      priceCurrency: 'EGP',
      availability: availability(product),
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@id': ORG_ID },
      areaServed: { '@type': 'Country', name: 'Egypt' },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        '@id': RETURN_POLICY_ID,
        applicableCountry: 'EG',
        returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
      },
      shippingDetails: [
        {
          '@type': 'OfferShippingDetails',
          '@id': SHIPPING_CAIRO_ID,
          shippingDestination: {
            '@type': 'DefinedRegion',
            addressCountry: 'EG',
            addressRegion: ['Cairo', 'Giza'],
          },
          shippingRate: {
            '@type': 'MonetaryAmount',
            value: product.price >= FREE_SHIP_OVER ? 0 : SHIPPING_CAIRO,
            currency: 'EGP',
          },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            handlingTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 2, unitCode: 'd' },
            transitTime: { '@type': 'QuantitativeValue', minValue: DELIVERY_DAYS_MIN, maxValue: DELIVERY_DAYS_MAX, unitCode: 'd' },
          },
        },
        {
          '@type': 'OfferShippingDetails',
          '@id': SHIPPING_OUTSIDE_ID,
          shippingDestination: {
            '@type': 'DefinedRegion',
            addressCountry: 'EG',
          },
          shippingRate: {
            '@type': 'MonetaryAmount',
            value: SHIPPING_OUTSIDE,
            currency: 'EGP',
          },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            handlingTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 2, unitCode: 'd' },
            transitTime: { '@type': 'QuantitativeValue', minValue: DELIVERY_DAYS_MIN, maxValue: DELIVERY_DAYS_MAX, unitCode: 'd' },
          },
        },
      ],
    },
  };
}

export function itemListSchema(products: Product[], locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: absoluteUrl(locale, `/product/${p.slug}`),
      name: locale === 'ar' ? p.nameAr || p.name : p.name,
    })),
  };
}

export function faqSchema(items: { q: string; a: string }[], locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: locale === 'ar' ? 'ar-EG' : 'en',
    mainEntity: items.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}
