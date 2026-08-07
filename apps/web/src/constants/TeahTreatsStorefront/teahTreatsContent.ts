export const teahTreatsImages = {
  hero: 'https://images.unsplash.com/photo-1627647227768-705244233b56?w=1800&h=1400&fit=crop&auto=format',
  chocolates: 'https://images.unsplash.com/photo-1646151067116-80a86e5eee69?w=900&h=1100&fit=crop&auto=format',
  nuts: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=900&h=1100&fit=crop&auto=format',
  pastries: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=900&h=1100&fit=crop&auto=format',
  seeds: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=900&h=1100&fit=crop&auto=format',
  story: 'https://images.unsplash.com/photo-1571826945830-5423b80a986c?w=1200&h=1200&fit=crop&auto=format',
  office: 'https://images.unsplash.com/photo-1514517220038-15d9cfb7034c?w=1200&h=900&fit=crop&auto=format',
  gifting: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=1200&h=900&fit=crop&auto=format',
  fallbackProduct: 'https://images.unsplash.com/photo-1599599810694-b5b37304c041?w=800&h=1000&fit=crop&auto=format'
} as const;

export const teahTreatsCategories = [
  { name: 'Artisan Chocolates', count: '48', image: teahTreatsImages.chocolates, href: '/products?category=Chocolates' },
  { name: 'Gourmet Nuts', count: '34', image: teahTreatsImages.nuts, href: '/products?category=Nuts' },
  { name: 'Luxury Pastries', count: '22', image: teahTreatsImages.pastries, href: '/products?category=Pastry' },
  { name: 'Seed Blends', count: '19', image: teahTreatsImages.seeds, href: '/products?category=Seeds' }
] as const;

export const teahTreatsMarqueeItems = [
  'Dark Truffle Almonds',
  'Reserve Cacao Collection',
  'Saffron Pistachio Mix',
  'Gold Caramel Wafers',
  'Midnight Berry Bark',
  'Smoked Cashew Reserve',
  'Himalayan Pink Salt Bark',
  'Black Sesame Praline',
  'Honey Roasted Pecans'
] as const;

export const teahTreatsTestimonials = [
  {
    name: 'Marcus Oyelaran',
    title: 'Founder, Studio Volta',
    initials: 'MO',
    text: "I've gifted TeahTreats collections for three years. The presentation is polished, the flavors are memorable, and the freshness is consistent."
  },
  {
    name: 'Alexandra Chen',
    title: 'Operations Lead, Meridian Group',
    initials: 'AC',
    text: 'The office snack planning flow makes ordering feel calm. Our team gets premium treats without spreadsheets or last-minute stock surprises.'
  }
] as const;

export const teahTreatsStats = [
  { value: '4,800+', label: 'Curated snacks' },
  { value: '98%', label: 'Freshness score' },
  { value: '120+', label: 'Office plans' }
] as const;
