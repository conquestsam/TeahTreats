import type { Metadata } from 'next';
import { AppShell } from '../../../components/layout/app-shell';
import { LegalPageContent } from '../../../contents/Legal/LegalPageContent';
import { createPageMetadata } from '../../../lib/seo/metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Allergy Disclaimer | TeshTreats',
  description: 'Review allergy and cross-contact guidance before ordering TeshTreats snacks, cakes, and drinks.',
  path: '/allergy-disclaimer'
});

export default function AllergyDisclaimerPage() {
  return (
    <AppShell>
      <LegalPageContent
        title="Allergy Disclaimer"
        updatedAt="August 5, 2026"
        intro="Snacks may contain or come into contact with common allergens. Please review product details before ordering."
        sections={[
          {
            heading: 'Common allergens',
            body: ['Products may include milk, eggs, fish, shellfish, tree nuts, peanuts, wheat, soy, sesame, or other allergens.']
          },
          {
            heading: 'Cross-contact',
            body: [
              'Even when a product does not list an allergen, shared kitchens, storage, equipment, or packaging can create cross-contact risk.',
              'Customers with severe allergies should contact the store before ordering.'
            ]
          },
          {
            heading: 'Product details',
            body: ['Ingredients, nutrition, and dietary labels are provided by the store or vendor and may change.']
          },
          {
            heading: 'Customer responsibility',
            body: ['Do not order products that may be unsafe for you or anyone you are buying for.']
          }
        ]}
      />
    </AppShell>
  );
}
