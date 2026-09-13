import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo/metadata';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/vendor',
          '/account',
          '/cart',
          '/payment',
          '/orders',
          '/api'
        ]
      }
    ],
    sitemap: absoluteUrl('/sitemap.xml')
  };
}
