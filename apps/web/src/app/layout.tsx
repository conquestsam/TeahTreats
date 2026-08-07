import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import 'lenis/dist/lenis.css';
import '../styles/globals.css';

import type { Metadata } from 'next';
import { AppProviders } from '../providers/app-providers';

export const metadata: Metadata = {
  title: 'TeahTreats — Premium Curated Snacks',
  description: 'Discover premium curated snacks for personal treats, office planning, gifting, and curated discovery. Shop fresh bites, smart bundles, and artisan favorites at TeahTreats.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Playfair+Display:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
