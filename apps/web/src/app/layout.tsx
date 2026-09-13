import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import 'lenis/dist/lenis.css';
import '../styles/globals.css';

import type { Metadata } from 'next';
import { AppProviders } from '../providers/app-providers';
import { absoluteUrl, seoConfig } from '../lib/seo/metadata';

export const metadata: Metadata = {
  metadataBase: new URL(seoConfig.siteUrl),
  applicationName: seoConfig.siteName,
  title: {
    default: seoConfig.defaultTitle,
    template: `%s | ${seoConfig.siteName}`
  },
  description: seoConfig.defaultDescription,
  keywords: [...seoConfig.keywords],
  icons: {
    icon: [
      {
        url: '/favicon.png',
        type: 'image/png',
        sizes: '48x48'
      },
      {
        url: '/icon.png',
        type: 'image/png',
        sizes: '512x512'
      }
    ],
    apple: [
      {
        url: '/apple-icon.png',
        type: 'image/png',
        sizes: '180x180'
      }
    ]
  },
  openGraph: {
    type: 'website',
    siteName: seoConfig.siteName,
    title: seoConfig.defaultTitle,
    description: seoConfig.defaultDescription,
    url: absoluteUrl('/'),
    images: [
      {
        url: absoluteUrl(seoConfig.logoPath),
        width: 1200,
        height: 630,
        alt: `${seoConfig.siteName} logo`
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: seoConfig.defaultTitle,
    description: seoConfig.defaultDescription,
    images: [absoluteUrl(seoConfig.logoPath)]
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${seoConfig.siteUrl}/#organization`,
        name: seoConfig.siteName,
        url: seoConfig.siteUrl,
        logo: {
          '@type': 'ImageObject',
          url: absoluteUrl(seoConfig.logoPath),
          width: 738,
          height: 279
        },
        image: absoluteUrl(seoConfig.logoPath),
        email: 'info@mail.teshtreats.com'
      },
      {
        '@type': 'WebSite',
        '@id': `${seoConfig.siteUrl}/#website`,
        name: seoConfig.siteName,
        url: seoConfig.siteUrl,
        publisher: {
          '@id': `${seoConfig.siteUrl}/#organization`
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${seoConfig.siteUrl}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string'
        }
      }
    ]
  };

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Playfair+Display:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
