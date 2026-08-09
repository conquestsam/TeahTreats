import { PrismaClient } from '@prisma/client';
import { permissions } from '../packages/shared/src/permissions/index.ts';
import { createRequire } from 'node:module';

const prisma = new PrismaClient();
const require = createRequire(import.meta.url);
const argon2 = require('../apps/api/node_modules/argon2') as {
  hash(value: string): Promise<string>;
};

type StorefrontSeedProduct = {
  slug: string;
  name: string;
  description: string;
  brand: string;
  category: string;
  flavor: string;
  occasion: string;
  priceCents: number;
  skuName: string;
  quantity: number;
  size: string;
  packCount: number;
  unitLabel: string;
  isPerishable?: boolean;
  expiresInDays?: number;
  tags: string[];
  dietaryLabels: string[];
  ingredients: string[];
  allergens: string[];
  images: Array<{
    url: string;
    alt: string;
  }>;
};

const seededStorefrontProducts: StorefrontSeedProduct[] = [
  {
    slug: 'dark-truffle-almonds',
    name: 'Dark Truffle Almonds',
    description: 'Roasted almonds dusted with dark cocoa and a quiet truffle finish.',
    brand: 'TeahTreats Reserve',
    category: 'Nuts',
    flavor: 'Dark cocoa',
    occasion: 'Gifting',
    priceCents: 2800,
    skuName: '8 oz tin',
    quantity: 64,
    size: '8 oz',
    packCount: 1,
    unitLabel: 'tin',
    tags: ['popular', 'premium', 'gifting'],
    dietaryLabels: ['vegetarian'],
    ingredients: ['almonds', 'dark cocoa', 'cane sugar', 'sea salt'],
    allergens: ['tree nuts'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=1200&q=85',
        alt: 'Premium almonds and mixed nuts in a dark bowl'
      },
      {
        url: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=1200&q=85',
        alt: 'Chocolate covered nuts on a warm background'
      }
    ]
  },
  {
    slug: 'saffron-pistachio-mix',
    name: 'Saffron Pistachio Mix',
    description: 'A fragrant pistachio blend with golden saffron and light sea salt.',
    brand: 'TeahTreats Reserve',
    category: 'Nuts',
    flavor: 'Saffron salted',
    occasion: 'Office snack',
    priceCents: 3400,
    skuName: '10 oz pouch',
    quantity: 52,
    size: '10 oz',
    packCount: 1,
    unitLabel: 'pouch',
    tags: ['new-arrival', 'office', 'nuts'],
    dietaryLabels: ['gluten-free', 'vegetarian'],
    ingredients: ['pistachios', 'saffron', 'sea salt', 'olive oil'],
    allergens: ['tree nuts'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=1200&q=85',
        alt: 'Pistachios in a ceramic bowl'
      },
      {
        url: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=1200&q=85',
        alt: 'Assorted roasted nuts arranged on a table'
      }
    ]
  },
  {
    slug: 'midnight-berry-bark',
    name: 'Midnight Berry Bark',
    description: 'Dark chocolate bark layered with dried berries and roasted almonds.',
    brand: 'TeahTreats Chocolatier',
    category: 'Chocolates',
    flavor: 'Berry dark chocolate',
    occasion: 'Dessert',
    priceCents: 2200,
    skuName: '6 piece box',
    quantity: 46,
    size: '6 pieces',
    packCount: 6,
    unitLabel: 'box',
    tags: ['popular', 'chocolate', 'fresh-pick'],
    dietaryLabels: ['vegetarian'],
    ingredients: ['dark chocolate', 'cranberries', 'blueberries', 'almonds'],
    allergens: ['milk', 'tree nuts'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1549590143-d5855148a9d5?auto=format&fit=crop&w=1200&q=85',
        alt: 'Chocolate bar with fruit and nuts'
      },
      {
        url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1200&q=85',
        alt: 'Dark chocolate dessert pieces on a plate'
      }
    ]
  },
  {
    slug: 'smoked-cashew-reserve',
    name: 'Smoked Cashew Reserve',
    description: 'Slow-roasted cashews with smoked paprika, honey, and sea salt.',
    brand: 'TeahTreats Reserve',
    category: 'Nuts',
    flavor: 'Smoked honey',
    occasion: 'Game night',
    priceCents: 3000,
    skuName: '9 oz jar',
    quantity: 58,
    size: '9 oz',
    packCount: 1,
    unitLabel: 'jar',
    tags: ['popular', 'savory', 'bundle-ready'],
    dietaryLabels: ['vegetarian'],
    ingredients: ['cashews', 'honey', 'smoked paprika', 'sea salt'],
    allergens: ['tree nuts'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1563412885-139e4045eb35?auto=format&fit=crop&w=1200&q=85',
        alt: 'Cashews in a white bowl on a wooden table'
      },
      {
        url: 'https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?auto=format&fit=crop&w=1200&q=85',
        alt: 'Roasted cashews and spices on a dark surface'
      }
    ]
  },
  {
    slug: 'gold-caramel-wafers',
    name: 'Gold Caramel Wafers',
    description: 'Crisp layered wafers filled with caramel cream and gold sugar.',
    brand: 'TeahTreats Bakery',
    category: 'Pastry',
    flavor: 'Caramel cream',
    occasion: 'Tea break',
    priceCents: 1800,
    skuName: '12 wafer box',
    quantity: 72,
    size: '12 wafers',
    packCount: 12,
    unitLabel: 'box',
    tags: ['fresh-pick', 'tea-time', 'sweet'],
    dietaryLabels: ['vegetarian'],
    ingredients: ['wheat flour', 'caramel', 'milk cream', 'cane sugar'],
    allergens: ['wheat', 'milk'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1587248720327-8eb72564be1e?auto=format&fit=crop&w=1200&q=85',
        alt: 'Sweet wafer cookies stacked on a plate'
      },
      {
        url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=1200&q=85',
        alt: 'Cookies and sweet snacks arranged on a table'
      }
    ]
  },
  {
    slug: 'honey-roasted-pecans',
    name: 'Honey Roasted Pecans',
    description: 'Buttery pecans glazed with wildflower honey and a pinch of salt.',
    brand: 'TeahTreats Reserve',
    category: 'Nuts',
    flavor: 'Honey roasted',
    occasion: 'Corporate gifting',
    priceCents: 3200,
    skuName: '8 oz tin',
    quantity: 48,
    size: '8 oz',
    packCount: 1,
    unitLabel: 'tin',
    tags: ['gifting', 'premium', 'bundle-ready'],
    dietaryLabels: ['gluten-free', 'vegetarian'],
    ingredients: ['pecans', 'honey', 'cane sugar', 'sea salt'],
    allergens: ['tree nuts'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=1200&q=85',
        alt: 'Pecans and mixed nuts in a bowl'
      },
      {
        url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=1200&q=85',
        alt: 'Roasted nuts on a rustic surface'
      }
    ]
  },
  {
    slug: 'black-sesame-praline',
    name: 'Black Sesame Praline',
    description: 'Nutty black sesame praline squares with a crisp caramel snap.',
    brand: 'TeahTreats Chocolatier',
    category: 'Chocolates',
    flavor: 'Sesame caramel',
    occasion: 'After dinner',
    priceCents: 2600,
    skuName: '10 piece box',
    quantity: 40,
    size: '10 pieces',
    packCount: 10,
    unitLabel: 'box',
    tags: ['limited', 'chocolate', 'artisan'],
    dietaryLabels: ['vegetarian'],
    ingredients: ['black sesame', 'caramel', 'dark chocolate', 'sea salt'],
    allergens: ['sesame', 'milk'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?auto=format&fit=crop&w=1200&q=85',
        alt: 'Artisan chocolate pieces on a dark plate'
      },
      {
        url: 'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=1200&q=85',
        alt: 'Chocolate pralines arranged in rows'
      }
    ]
  },
  {
    slug: 'coconut-plantain-crisps',
    name: 'Coconut Plantain Crisps',
    description: 'Thin plantain crisps tossed with toasted coconut and mild spice.',
    brand: 'TeahTreats Market',
    category: 'Fresh Picks',
    flavor: 'Coconut spice',
    occasion: 'Movie night',
    priceCents: 1400,
    skuName: '5 oz pouch',
    quantity: 80,
    size: '5 oz',
    packCount: 1,
    unitLabel: 'pouch',
    tags: ['fresh-pick', 'crunchy', 'african-inspired'],
    dietaryLabels: ['vegan', 'gluten-free'],
    ingredients: ['plantain', 'coconut', 'sunflower oil', 'chili', 'salt'],
    allergens: ['coconut'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=1200&q=85',
        alt: 'Crispy chips in a bowl'
      },
      {
        url: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=1200&q=85',
        alt: 'Golden snack crisps on a dark table'
      }
    ]
  },
  {
    slug: 'suya-spice-cashews',
    name: 'Suya Spice Cashews',
    description: 'Cashews coated with a warm suya-inspired pepper and peanut spice.',
    brand: 'TeahTreats Market',
    category: 'Nuts',
    flavor: 'Suya spice',
    occasion: 'Party',
    priceCents: 2400,
    skuName: '7 oz pouch',
    quantity: 60,
    size: '7 oz',
    packCount: 1,
    unitLabel: 'pouch',
    tags: ['popular', 'savory', 'african-inspired'],
    dietaryLabels: ['vegan'],
    ingredients: ['cashews', 'peanut spice', 'ginger', 'chili', 'salt'],
    allergens: ['tree nuts', 'peanuts'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1563412885-139e4045eb35?auto=format&fit=crop&w=1200&q=85',
        alt: 'Cashews ready for snacking'
      },
      {
        url: 'https://images.unsplash.com/photo-1590080877777-3bd7b18d7f43?auto=format&fit=crop&w=1200&q=85',
        alt: 'Spiced nuts in a serving bowl'
      }
    ]
  },
  {
    slug: 'zobo-berry-gummies',
    name: 'Zobo Berry Gummies',
    description: 'Soft berry gummies with hibiscus brightness and a light sugar dusting.',
    brand: 'TeahTreats Candy',
    category: 'Fresh Picks',
    flavor: 'Hibiscus berry',
    occasion: 'Kids party',
    priceCents: 1200,
    skuName: '6 oz bag',
    quantity: 76,
    size: '6 oz',
    packCount: 1,
    unitLabel: 'bag',
    tags: ['new-arrival', 'sweet', 'african-inspired'],
    dietaryLabels: ['gelatin-free'],
    ingredients: ['hibiscus extract', 'berry juice', 'pectin', 'cane sugar'],
    allergens: [],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?auto=format&fit=crop&w=1200&q=85',
        alt: 'Colorful gummy candy in a pile'
      },
      {
        url: 'https://images.unsplash.com/photo-1571506165871-ee72a35bc9d4?auto=format&fit=crop&w=1200&q=85',
        alt: 'Red candy sweets in a bowl'
      }
    ]
  },
  {
    slug: 'chin-chin-crunch-box',
    name: 'Chin Chin Crunch Box',
    description: 'Golden bite-size chin chin with nutmeg, vanilla, and crisp edges.',
    brand: 'TeahTreats Bakery',
    category: 'Pastry',
    flavor: 'Vanilla nutmeg',
    occasion: 'Family sharing',
    priceCents: 1600,
    skuName: '12 oz box',
    quantity: 66,
    size: '12 oz',
    packCount: 1,
    unitLabel: 'box',
    tags: ['popular', 'african-inspired', 'crunchy'],
    dietaryLabels: ['vegetarian'],
    ingredients: ['wheat flour', 'milk', 'butter', 'nutmeg', 'sugar'],
    allergens: ['wheat', 'milk'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=1200&q=85',
        alt: 'Golden pastry bites in a serving bowl'
      },
      {
        url: 'https://images.unsplash.com/photo-1605807646983-377bc5a76493?auto=format&fit=crop&w=1200&q=85',
        alt: 'Small sweet pastries on a tray'
      }
    ]
  },
  {
    slug: 'salted-date-energy-bites',
    name: 'Salted Date Energy Bites',
    description: 'Chewy date bites with oats, cocoa, almond butter, and sea salt.',
    brand: 'TeahTreats Wellness',
    category: 'Fresh Picks',
    flavor: 'Cocoa date',
    occasion: 'Workout snack',
    priceCents: 1900,
    skuName: '8 bite pack',
    quantity: 55,
    size: '8 bites',
    packCount: 8,
    unitLabel: 'pack',
    tags: ['fresh-pick', 'wellness', 'office'],
    dietaryLabels: ['vegan'],
    ingredients: ['dates', 'oats', 'almond butter', 'cocoa', 'sea salt'],
    allergens: ['tree nuts'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=1200&q=85',
        alt: 'Energy bites arranged in a bowl'
      },
      {
        url: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=1200&q=85',
        alt: 'Chocolate snack bites on a plate'
      }
    ]
  },
  {
    slug: 'hibiscus-glazed-popcorn',
    name: 'Hibiscus Glazed Popcorn',
    description: 'Airy popcorn glazed with tart hibiscus, vanilla, and a red sugar sheen.',
    brand: 'TeahTreats Market',
    category: 'Fresh Picks',
    flavor: 'Hibiscus vanilla',
    occasion: 'Movie night',
    priceCents: 1500,
    skuName: '7 oz bag',
    quantity: 70,
    size: '7 oz',
    packCount: 1,
    unitLabel: 'bag',
    tags: ['new-arrival', 'sweet', 'crunchy'],
    dietaryLabels: ['vegetarian'],
    ingredients: ['popcorn', 'hibiscus', 'vanilla', 'cane sugar', 'butter'],
    allergens: ['milk'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&w=1200&q=85',
        alt: 'Popcorn in a bowl for movie night'
      },
      {
        url: 'https://images.unsplash.com/photo-1585647347384-2593bc35786b?auto=format&fit=crop&w=1200&q=85',
        alt: 'Sweet popcorn in a paper container'
      }
    ]
  },
  {
    slug: 'chocolate-wafer-minis',
    name: 'Chocolate Wafer Minis',
    description: 'Mini chocolate wafers built for quick cravings and desk drawers.',
    brand: 'TeahTreats Bakery',
    category: 'Chocolates',
    flavor: 'Chocolate cream',
    occasion: 'Desk snack',
    priceCents: 1300,
    skuName: '18 mini pack',
    quantity: 88,
    size: '18 minis',
    packCount: 18,
    unitLabel: 'pack',
    tags: ['office', 'bundle-ready', 'chocolate'],
    dietaryLabels: ['vegetarian'],
    ingredients: ['wheat flour', 'cocoa', 'milk cream', 'sugar'],
    allergens: ['wheat', 'milk'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?auto=format&fit=crop&w=1200&q=85',
        alt: 'Chocolate wafer cookies stacked together'
      },
      {
        url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=1200&q=85',
        alt: 'Assorted cookies and wafers on a table'
      }
    ]
  },
  {
    slug: 'office-snack-sampler',
    name: 'Office Snack Sampler',
    description: 'A balanced sampler with nuts, wafers, popcorn, and chocolate bites.',
    brand: 'TeahTreats Office',
    category: 'Bundles',
    flavor: 'Mixed',
    occasion: 'Office planning',
    priceCents: 5200,
    skuName: '24 piece bundle',
    quantity: 35,
    size: '24 pieces',
    packCount: 24,
    unitLabel: 'bundle',
    tags: ['bundle', 'office', 'popular'],
    dietaryLabels: ['mixed'],
    ingredients: ['mixed nuts', 'wafers', 'popcorn', 'chocolate bites'],
    allergens: ['tree nuts', 'wheat', 'milk'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=1200&q=85',
        alt: 'Assorted snack board with nuts and sweets'
      },
      {
        url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=85',
        alt: 'Packed assortment of snacks for sharing'
      }
    ]
  },
  {
    slug: 'premium-gifting-box',
    name: 'Premium Gifting Box',
    description: 'A polished gift box with chocolates, nuts, wafers, and berry treats.',
    brand: 'TeahTreats Gifting',
    category: 'Bundles',
    flavor: 'Curated assortment',
    occasion: 'Gifting',
    priceCents: 6800,
    skuName: 'Gift box',
    quantity: 28,
    size: 'large',
    packCount: 1,
    unitLabel: 'box',
    tags: ['bundle', 'gifting', 'premium'],
    dietaryLabels: ['mixed'],
    ingredients: ['dark chocolate', 'cashews', 'pecans', 'wafers', 'berry gummies'],
    allergens: ['tree nuts', 'wheat', 'milk'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=1200&q=85',
        alt: 'Gift box with premium snacks and sweets'
      },
      {
        url: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=1200&q=85',
        alt: 'Wrapped gift box and treats'
      }
    ]
  }
];

async function main() {
  for (const key of Object.values(permissions)) {
    await prisma.permission.upsert({
      where: { key },
      update: {},
      create: { key }
    });
  }

  await prisma.tenant.upsert({
    where: { slug: 'platform' },
    update: {
      businessEmail: 'ops@snacks.local',
      businessPhone: '+15550001000',
      active: true,
      delegatedRoleApprovalRequired: true,
      manualPaymentEnabled: true,
      defaultCurrency: 'USD',
      timezone: 'America/New_York',
      metadata: {
        businessAddress: {
          line1: '100 Market Street',
          city: 'Austin',
          state: 'TX',
          postalCode: '78701',
          country: 'US'
        },
        orderReadinessNotificationChannels: ['email', 'sms']
      }
    },
    create: {
      slug: 'platform',
      name: 'Platform Store',
      businessEmail: 'ops@snacks.local',
      businessPhone: '+15550001000',
      active: true,
      delegatedRoleApprovalRequired: true,
      manualPaymentEnabled: true,
      defaultCurrency: 'USD',
      timezone: 'America/New_York',
      metadata: {
        businessAddress: {
          line1: '100 Market Street',
          city: 'Austin',
          state: 'TX',
          postalCode: '78701',
          country: 'US'
        },
        orderReadinessNotificationChannels: ['email', 'sms']
      }
    }
  });

  const tenant = await prisma.tenant.findUniqueOrThrow({
    where: { slug: 'platform' }
  });

  const superAdminRole = await prisma.role.upsert({
    where: {
      tenantId_name: {
        tenantId: tenant.id,
        name: 'super-admin'
      }
    },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'super-admin'
    }
  });

  const adminRole = await prisma.role.upsert({
    where: {
      tenantId_name: {
        tenantId: tenant.id,
        name: 'admin'
      }
    },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'admin'
    }
  });

  const vendorRole = await prisma.role.upsert({
    where: {
      tenantId_name: {
        tenantId: tenant.id,
        name: 'vendor'
      }
    },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'vendor'
    }
  });

  const supportRole = await prisma.role.upsert({
    where: {
      tenantId_name: {
        tenantId: tenant.id,
        name: 'support'
      }
    },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'support'
    }
  });

  const allPermissions = await prisma.permission.findMany();
  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: permission.id
        }
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: permission.id
      }
    });
  }

  const permissionByKey = new Map(allPermissions.map((permission) => [permission.key, permission]));
  const assignRolePermissions = async (roleId: string, keys: string[]) => {
    for (const key of keys) {
      const permission = permissionByKey.get(key);
      if (!permission) {
        continue;
      }
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId,
            permissionId: permission.id
          }
        },
        update: {},
        create: {
          roleId,
          permissionId: permission.id
        }
      });
    }
  };

  await assignRolePermissions(adminRole.id, [
    permissions.productsRead,
    permissions.productsWrite,
    permissions.inventoryRead,
    permissions.inventoryWrite,
    permissions.ordersRead,
    permissions.ordersWrite,
    permissions.promotionsRead,
    permissions.promotionsWrite,
    permissions.manualPaymentsReview,
    permissions.notificationsRead,
    permissions.dashboardRead,
    permissions.reportsRead,
    permissions.usersManage,
    permissions.auditRead
  ]);

  await assignRolePermissions(vendorRole.id, [
    permissions.productsRead,
    permissions.productsWrite,
    permissions.promotionsRead,
    permissions.inventoryRead,
    permissions.inventoryWrite,
    permissions.ordersRead
  ]);

  await assignRolePermissions(supportRole.id, [
    permissions.productsRead,
    permissions.ordersRead,
    permissions.notificationsRead,
    permissions.dashboardRead,
    permissions.reportsRead,
    permissions.manualPaymentsReview
  ]);

  const vendorTenant = await prisma.tenant.upsert({
    where: { slug: 'campus-cafeteria' },
    update: {
      name: 'Campus Cafeteria',
      businessEmail: 'vendor@campus-snacks.local',
      businessPhone: '+15550002000',
      active: true,
      delegatedRoleApprovalRequired: true,
      manualPaymentEnabled: true,
      defaultCurrency: 'USD',
      timezone: 'America/New_York',
      metadata: {
        businessAddress: {
          line1: '12 College Walk',
          city: 'Raleigh',
          state: 'NC',
          postalCode: '27695',
          country: 'US'
        },
        orderReadinessNotificationChannels: ['email', 'whatsapp']
      }
    },
    create: {
      slug: 'campus-cafeteria',
      name: 'Campus Cafeteria',
      businessEmail: 'vendor@campus-snacks.local',
      businessPhone: '+15550002000',
      active: true,
      delegatedRoleApprovalRequired: true,
      manualPaymentEnabled: true,
      defaultCurrency: 'USD',
      timezone: 'America/New_York',
      metadata: {
        businessAddress: {
          line1: '12 College Walk',
          city: 'Raleigh',
          state: 'NC',
          postalCode: '27695',
          country: 'US'
        },
        orderReadinessNotificationChannels: ['email', 'whatsapp']
      }
    }
  });

  const vendorTenantRole = await prisma.role.upsert({
    where: {
      tenantId_name: {
        tenantId: vendorTenant.id,
        name: 'vendor'
      }
    },
    update: {},
    create: {
      tenantId: vendorTenant.id,
      name: 'vendor'
    }
  });

  await assignRolePermissions(vendorTenantRole.id, [
    permissions.productsRead,
    permissions.productsWrite,
    permissions.inventoryRead,
    permissions.inventoryWrite,
    permissions.ordersRead
  ]);

  const passwordHash = await argon2.hash('Password#23');
  const superAdmin = await prisma.user.upsert({
    where: {
      email: 'admin@snacks.local'
    },
    update: {
      passwordHash,
      userType: 'admin'
    },
    create: {
      email: 'admin@snacks.local',
      name: 'Platform Admin',
      userType: 'admin',
      passwordHash
    }
  });

  const vendorUser = await prisma.user.upsert({
    where: {
      email: 'vendor@snacks.local'
    },
    update: {
      name: 'Campus Vendor',
      phone: '+15551230000',
      userType: 'admin',
      passwordHash
    },
    create: {
      email: 'vendor@snacks.local',
      name: 'Campus Vendor',
      phone: '+15551230000',
      userType: 'admin',
      passwordHash
    }
  });

  await prisma.user.upsert({
    where: {
      email: 'customer@snacks.local'
    },
    update: {
      name: 'Sample Customer',
      phone: '+15551234567',
      userType: 'customer',
      passwordHash
    },
    create: {
      email: 'customer@snacks.local',
      name: 'Sample Customer',
      phone: '+15551234567',
      userType: 'customer',
      passwordHash
    }
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId_tenantId: {
        userId: superAdmin.id,
        roleId: superAdminRole.id,
        tenantId: tenant.id
      }
    },
    update: {},
    create: {
      userId: superAdmin.id,
      roleId: superAdminRole.id,
      tenantId: tenant.id
    }
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId_tenantId: {
        userId: vendorUser.id,
        roleId: vendorTenantRole.id,
        tenantId: vendorTenant.id
      }
    },
    update: {},
    create: {
      userId: vendorUser.id,
      roleId: vendorTenantRole.id,
      tenantId: vendorTenant.id
    }
  });

  const meatPieMetadata = {
    isPerishable: true,
    brand: 'Snacks Kitchen',
    category: 'Fresh Bites',
    flavor: 'Savory beef',
    occasion: 'Lunch',
    ingredients: ['flour', 'beef', 'butter', 'onion', 'pepper'],
    allergens: ['wheat', 'milk'],
    nutritionFacts: {
      calories: '420',
      protein: '14g',
      sodium: '610mg'
    },
    dietaryLabels: ['fresh-baked'],
    tags: ['fresh', 'savory', 'warm'],
    storageInstructions: 'Keep refrigerated. Reheat before serving.',
    shelfLifeNotes: 'Best within 2 days of preparation.',
    bundleEligible: true,
    seoTitle: 'Fresh Meat Pie',
    seoDescription: 'Order fresh meat pies with live availability and secure checkout.'
  };

  const meatPie = await prisma.product.upsert({
    where: {
      tenantId_slug: {
        tenantId: tenant.id,
        slug: 'fresh-meat-pie'
      }
    },
    update: {
      description: 'Warm snack pie prepared fresh.',
      brand: 'Snacks Kitchen',
      category: 'Fresh Bites',
      status: 'active',
      metadata: meatPieMetadata
    },
    create: {
      tenantId: tenant.id,
      name: 'Fresh Meat Pie',
      slug: 'fresh-meat-pie',
      description: 'Warm snack pie prepared fresh.',
      brand: 'Snacks Kitchen',
      category: 'Fresh Bites',
      status: 'active',
      metadata: meatPieMetadata,
      skus: {
        create: [
          {
            tenantId: tenant.id,
            name: 'Single pie',
            priceCents: 450,
            currency: 'USD',
            active: true,
            metadata: {
              size: '6 oz',
              packCount: 1,
              unitLabel: 'pie',
              perishableOverride: true
            }
          }
        ]
      }
    }
  });

  await prisma.productImage.upsert({
    where: {
      id: 'seed-meat-pie-image'
    },
    update: {
      productId: meatPie.id,
      url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80',
      alt: 'Fresh golden meat pie on a plate',
      sortOrder: 0,
      storageProvider: 'cloudinary',
      contentType: 'image/jpeg'
    },
    create: {
      id: 'seed-meat-pie-image',
      productId: meatPie.id,
      url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80',
      alt: 'Fresh golden meat pie on a plate',
      sortOrder: 0,
      storageProvider: 'cloudinary',
      contentType: 'image/jpeg'
    }
  });

  const meatPieSku = await prisma.sku.findFirstOrThrow({
    where: {
      tenantId: tenant.id,
      productId: meatPie.id,
      name: 'Single pie'
    }
  });

  await prisma.sku.update({
    where: {
      id: meatPieSku.id
    },
    data: {
      metadata: {
        size: '6 oz',
        packCount: 1,
        unitLabel: 'pie',
        perishableOverride: true
      }
    }
  });

  const existingBatch = await prisma.inventoryBatch.findFirst({
    where: {
      tenantId: tenant.id,
      skuId: meatPieSku.id
    }
  });

  if (!existingBatch) {
    await prisma.inventoryBatch.create({
      data: {
        tenantId: tenant.id,
        skuId: meatPieSku.id,
        quantity: 40,
        reserved: 0,
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        adjustments: {
          create: {
            tenantId: tenant.id,
            skuId: meatPieSku.id,
            type: 'initial',
            quantityDelta: 40,
            reason: 'Seed stock for local development.'
          }
        }
      }
    });
  }

  for (const seedProduct of seededStorefrontProducts) {
    const metadata = {
      isPerishable: seedProduct.isPerishable ?? false,
      brand: seedProduct.brand,
      category: seedProduct.category,
      flavor: seedProduct.flavor,
      occasion: seedProduct.occasion,
      ingredients: seedProduct.ingredients,
      allergens: seedProduct.allergens,
      nutritionFacts: {
        calories: seedProduct.category === 'Bundles' ? 'varies' : '180-340',
        protein: seedProduct.category === 'Nuts' ? '6g' : '3g'
      },
      dietaryLabels: seedProduct.dietaryLabels,
      tags: seedProduct.tags,
      storageInstructions: seedProduct.isPerishable
        ? 'Keep refrigerated and enjoy fresh.'
        : 'Store sealed in a cool, dry place.',
      shelfLifeNotes: seedProduct.isPerishable ? 'Best within 3 days.' : 'Best within 90 days.',
      bundleEligible: seedProduct.tags.includes('bundle-ready') || seedProduct.category === 'Bundles',
      seoTitle: seedProduct.name,
      seoDescription: seedProduct.description
    };

    const product = await prisma.product.upsert({
      where: {
        tenantId_slug: {
          tenantId: tenant.id,
          slug: seedProduct.slug
        }
      },
      update: {
        name: seedProduct.name,
        description: seedProduct.description,
        brand: seedProduct.brand,
        category: seedProduct.category,
        status: 'active',
        metadata
      },
      create: {
        tenantId: tenant.id,
        name: seedProduct.name,
        slug: seedProduct.slug,
        description: seedProduct.description,
        brand: seedProduct.brand,
        category: seedProduct.category,
        status: 'active',
        metadata
      }
    });

    const existingSku = await prisma.sku.findFirst({
      where: {
        tenantId: tenant.id,
        productId: product.id,
        name: seedProduct.skuName
      }
    });

    const skuMetadata = {
      size: seedProduct.size,
      packCount: seedProduct.packCount,
      unitLabel: seedProduct.unitLabel,
      perishableOverride: seedProduct.isPerishable ?? false
    };

    const sku = existingSku
      ? await prisma.sku.update({
          where: { id: existingSku.id },
          data: {
            priceCents: seedProduct.priceCents,
            currency: 'USD',
            active: true,
            metadata: skuMetadata
          }
        })
      : await prisma.sku.create({
          data: {
            tenantId: tenant.id,
            productId: product.id,
            name: seedProduct.skuName,
            priceCents: seedProduct.priceCents,
            currency: 'USD',
            active: true,
            metadata: skuMetadata
          }
        });

    for (const [imageIndex, image] of seedProduct.images.entries()) {
      await prisma.productImage.upsert({
        where: {
          id: `seed-${seedProduct.slug}-image-${imageIndex + 1}`
        },
        update: {
          productId: product.id,
          url: image.url,
          objectKey: `seed/products/${seedProduct.slug}/${imageIndex + 1}.jpg`,
          alt: image.alt,
          sortOrder: imageIndex,
          storageProvider: 'unsplash',
          contentType: 'image/jpeg'
        },
        create: {
          id: `seed-${seedProduct.slug}-image-${imageIndex + 1}`,
          productId: product.id,
          url: image.url,
          objectKey: `seed/products/${seedProduct.slug}/${imageIndex + 1}.jpg`,
          alt: image.alt,
          sortOrder: imageIndex,
          storageProvider: 'unsplash',
          contentType: 'image/jpeg'
        }
      });
    }

    const existingSeedBatch = await prisma.inventoryBatch.findFirst({
      where: {
        tenantId: tenant.id,
        skuId: sku.id
      }
    });

    if (!existingSeedBatch) {
      await prisma.inventoryBatch.create({
        data: {
          tenantId: tenant.id,
          skuId: sku.id,
          quantity: seedProduct.quantity,
          reserved: 0,
          expiresAt: seedProduct.expiresInDays
            ? new Date(Date.now() + seedProduct.expiresInDays * 24 * 60 * 60 * 1000)
            : null,
          adjustments: {
            create: {
              tenantId: tenant.id,
              skuId: sku.id,
              type: 'initial',
              quantityDelta: seedProduct.quantity,
              reason: 'Seed storefront stock for local development.'
            }
          }
        }
      });
    }
  }

  const trailMix = await prisma.product.upsert({
    where: {
      tenantId_slug: {
        tenantId: vendorTenant.id,
        slug: 'campus-trail-mix'
      }
    },
    update: {
      description: 'Sweet and salty snack mix for study breaks.',
      brand: 'Campus Cafeteria',
      category: 'Packaged Snacks',
      status: 'active',
      metadata: {
        isPerishable: false,
        brand: 'Campus Cafeteria',
        category: 'Packaged Snacks',
        flavor: 'Sweet and salty',
        occasion: 'Study break',
        ingredients: ['peanuts', 'raisins', 'pretzels', 'chocolate chips'],
        allergens: ['peanuts', 'wheat', 'milk'],
        nutritionFacts: {
          calories: '260',
          protein: '7g'
        },
        dietaryLabels: ['grab-and-go'],
        tags: ['campus', 'packaged', 'study'],
        storageInstructions: 'Store in a cool, dry place.',
        shelfLifeNotes: 'Best within 90 days.',
        bundleEligible: true,
        seoTitle: 'Campus Trail Mix',
        seoDescription: 'Order campus trail mix for quick study snacks.'
      }
    },
    create: {
      tenantId: vendorTenant.id,
      name: 'Campus Trail Mix',
      slug: 'campus-trail-mix',
      description: 'Sweet and salty snack mix for study breaks.',
      brand: 'Campus Cafeteria',
      category: 'Packaged Snacks',
      status: 'active',
      metadata: {
        isPerishable: false,
        brand: 'Campus Cafeteria',
        category: 'Packaged Snacks',
        flavor: 'Sweet and salty',
        occasion: 'Study break',
        ingredients: ['peanuts', 'raisins', 'pretzels', 'chocolate chips'],
        allergens: ['peanuts', 'wheat', 'milk'],
        nutritionFacts: {
          calories: '260',
          protein: '7g'
        },
        dietaryLabels: ['grab-and-go'],
        tags: ['campus', 'packaged', 'study'],
        storageInstructions: 'Store in a cool, dry place.',
        shelfLifeNotes: 'Best within 90 days.',
        bundleEligible: true,
        seoTitle: 'Campus Trail Mix',
        seoDescription: 'Order campus trail mix for quick study snacks.'
      },
      skus: {
        create: [
          {
            tenantId: vendorTenant.id,
            name: 'Single pack',
            priceCents: 325,
            currency: 'USD',
            active: true,
            metadata: {
              size: '4 oz',
              packCount: 1,
              unitLabel: 'pack'
            }
          }
        ]
      }
    }
  });

  await prisma.productImage.upsert({
    where: {
      id: 'seed-campus-trail-mix-image'
    },
    update: {
      productId: trailMix.id,
      url: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=900&q=80',
      alt: 'Trail mix snack bowl with nuts and dried fruit',
      sortOrder: 0,
      storageProvider: 'cloudinary',
      contentType: 'image/jpeg'
    },
    create: {
      id: 'seed-campus-trail-mix-image',
      productId: trailMix.id,
      url: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=900&q=80',
      alt: 'Trail mix snack bowl with nuts and dried fruit',
      sortOrder: 0,
      storageProvider: 'cloudinary',
      contentType: 'image/jpeg'
    }
  });

  const trailMixSku = await prisma.sku.findFirstOrThrow({
    where: {
      tenantId: vendorTenant.id,
      productId: trailMix.id,
      name: 'Single pack'
    }
  });

  const existingTrailMixBatch = await prisma.inventoryBatch.findFirst({
    where: {
      tenantId: vendorTenant.id,
      skuId: trailMixSku.id
    }
  });

  if (!existingTrailMixBatch) {
    await prisma.inventoryBatch.create({
      data: {
        tenantId: vendorTenant.id,
        skuId: trailMixSku.id,
        quantity: 24,
        reserved: 0,
        adjustments: {
          create: {
            tenantId: vendorTenant.id,
            skuId: trailMixSku.id,
            type: 'initial',
            quantityDelta: 24,
            reason: 'Seed vendor stock for local development.'
          }
        }
      }
    });
  }

  const manualPaymentMethods = [
    {
      key: 'cashapp',
      label: 'Cash App',
      instructions: 'Send payment to $SnackDemo and upload your receipt.'
    },
    {
      key: 'venmo',
      label: 'Venmo',
      instructions: 'Send payment to @SnackDemo and upload your receipt.'
    },
    {
      key: 'zelle',
      label: 'Zelle',
      instructions: 'Send payment to payments@snacks.local and upload your receipt.'
    }
  ];

  for (const targetTenantId of [tenant.id, vendorTenant.id]) {
    for (const method of manualPaymentMethods) {
      await prisma.manualPaymentMethod.upsert({
        where: {
          tenantId_key: {
            tenantId: targetTenantId,
            key: method.key
          }
        },
        update: {
          label: method.label,
          instructions: method.instructions,
          active: true
        },
        create: {
          tenantId: targetTenantId,
          key: method.key,
          label: method.label,
          instructions: method.instructions,
          active: true
        }
      });
    }
  }

  const welcomePromotion = await prisma.promotion.upsert({
    where: { id: 'seed-welcome-promotion' },
    update: {
      tenantId: tenant.id,
      name: 'Welcome Snack Discount',
      status: 'active',
      discountType: 'percentage',
      discountValue: 10,
      targetType: 'all_products',
      perCustomerLimit: 1,
      minimumOrderAmountCents: 1000,
      stackable: false
    },
    create: {
      id: 'seed-welcome-promotion',
      tenantId: tenant.id,
      name: 'Welcome Snack Discount',
      description: 'A simple first coupon for local checkout testing.',
      status: 'active',
      discountType: 'percentage',
      discountValue: 10,
      targetType: 'all_products',
      perCustomerLimit: 1,
      minimumOrderAmountCents: 1000,
      stackable: false
    }
  });

  await prisma.couponCode.upsert({
    where: {
      tenantId_code: {
        tenantId: tenant.id,
        code: 'WELCOME10'
      }
    },
    update: {
      promotionId: welcomePromotion.id,
      active: true,
      usageLimit: 500
    },
    create: {
      tenantId: tenant.id,
      promotionId: welcomePromotion.id,
      code: 'WELCOME10',
      active: true,
      usageLimit: 500
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
