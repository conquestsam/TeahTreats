import type { Metadata } from 'next';

export const seoConfig = {
  siteName: 'TeshTreats',
  siteUrl: normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL ?? process.env.WEB_APP_URL ?? defaultSiteUrl()),
  logoPath: '/brand/teshtreats-logo.jpg',
  defaultTitle: 'TeshTreats | African Snacks, Custom Cakes, and Signature Zobo',
  defaultDescription:
    'Order puff puff, meat pies, samosas, spring rolls, custom cakes, and TeshTreats Signature Zobo with clear prices, secure checkout, and readiness updates.',
  keywords: [
    'TeshTreats',
    'African snacks',
    'Nigerian snacks',
    'puff puff',
    'meat pies',
    'samosas',
    'spring rolls',
    'custom cakes',
    'zobo',
    'party trays',
    'office snack trays'
  ]
} as const;

export const publicSeoRoutes = [
  {
    path: '/',
    title: 'TeshTreats | African Snacks, Custom Cakes, and Signature Zobo',
    description: seoConfig.defaultDescription,
    priority: 1
  },
  {
    path: '/products',
    title: 'TeshTreats Menu | Snacks, Cakes, Zobo, and Party Trays',
    description: 'Browse TeshTreats snacks, cakes, drinks, and party trays with current availability and prices.',
    priority: 0.9
  },
  {
    path: '/search',
    title: 'Search TeshTreats Snacks and Cakes',
    description: 'Search TeshTreats products by snack type, flavor, occasion, and category.',
    priority: 0.7
  },
  {
    path: '/bundles',
    title: 'Snack Bundles and Party Trays | TeshTreats',
    description: 'Build snack bundles and party trays with puff puff, samosas, spring rolls, meat pies, and zobo.',
    priority: 0.8
  },
  {
    path: '/office-snack-planner',
    title: 'Office Snack Planner | TeshTreats',
    description: 'Plan office snack trays by headcount, budget, dietary notes, and pickup or delivery timing.',
    priority: 0.75
  },
  {
    path: '/login',
    title: 'Sign In | TeshTreats',
    description: 'Sign in to track TeshTreats orders, saved account details, rewards, and readiness updates.',
    priority: 0.4
  },
  {
    path: '/signup',
    title: 'Create Account | TeshTreats',
    description: 'Create a TeshTreats account for faster checkout, order history, and customer rewards.',
    priority: 0.4
  },
  {
    path: '/privacy',
    title: 'Privacy Policy | TeshTreats',
    description: 'Read how TeshTreats handles customer information, orders, payments, support, and account access.',
    priority: 0.3
  },
  {
    path: '/terms',
    title: 'Terms of Service | TeshTreats',
    description: 'Review the terms for using TeshTreats ordering, payments, accounts, and support.',
    priority: 0.3
  },
  {
    path: '/refund-policy',
    title: 'Refund Policy | TeshTreats',
    description: 'Understand TeshTreats refund rules for fresh snacks, custom cakes, manual payments, and prepared orders.',
    priority: 0.3
  },
  {
    path: '/allergy-disclaimer',
    title: 'Allergy Disclaimer | TeshTreats',
    description: 'Review allergy and cross-contact guidance before ordering TeshTreats snacks, cakes, and drinks.',
    priority: 0.3
  }
] as const;

export function createPageMetadata(input: {
  title: string;
  description: string;
  path?: string;
  image?: string | null;
  keywords?: string[];
}): Metadata {
  const url = absoluteUrl(input.path ?? '/');
  const imageUrl = absoluteUrl(input.image ?? seoConfig.logoPath);

  return {
    title: {
      absolute: input.title
    },
    description: input.description,
    keywords: [...seoConfig.keywords, ...(input.keywords ?? [])],
    alternates: {
      canonical: url
    },
    openGraph: {
      type: 'website',
      siteName: seoConfig.siteName,
      title: input.title,
      description: input.description,
      url,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${seoConfig.siteName} brand`
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: input.title,
      description: input.description,
      images: [imageUrl]
    }
  };
}

export function privatePageMetadata(title: string, description: string): Metadata {
  return {
    title: {
      absolute: title
    },
    description,
    robots: {
      index: false,
      follow: false,
      nocache: true
    }
  };
}

export function absoluteUrl(path: string) {
  if (/^https?:\/\//.test(path)) {
    return path;
  }

  return `${seoConfig.siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

function normalizeSiteUrl(url: string) {
  const value = url.trim().replace(/\/+$/, '');
  if (!/^https?:\/\//i.test(value)) {
    return `https://${value}`;
  }

  return value;
}

function defaultSiteUrl() {
  return process.env.NODE_ENV === 'production' ? 'https://teshtreats.com' : 'http://localhost:3000';
}
