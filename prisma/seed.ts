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
    slug: 'teshtreats-signature-zobo',
    name: 'TeshTreats Signature Zobo',
    description: 'Naturally refreshing sorrel drink crafted with real sorrel, fruit, dates, pineapple, and watermelon notes.',
    brand: 'TeshTreats LLC',
    category: 'Signature Drinks',
    flavor: 'Sorrel fruit',
    occasion: 'Everyday refreshment',
    priceCents: 350000,
    skuName: '330 ml can',
    quantity: 120,
    size: '330 ml',
    packCount: 1,
    unitLabel: 'can',
    isPerishable: true,
    expiresInDays: 14,
    tags: ['signature', 'zobo', 'drink', 'popular', 'fresh-pick'],
    dietaryLabels: ['vegan-friendly', 'no refined sugar'],
    ingredients: ['filtered water', 'dried sorrel hibiscus', 'dates', 'pineapple', 'watermelon', 'monk fruit extract', 'natural flavors'],
    allergens: [],
    images: [
      {
        url: '/brand/products/signature-zobo-label.jpeg',
        alt: 'TeshTreats Signature Zobo sorrel drink label and can design'
      },
      {
        url: '/brand/products/party-snack-combo.jpg',
        alt: 'Party tray with puff puff and savory snacks for pairing with zobo'
      }
    ]
  },
  {
    slug: 'puff-puff-tray',
    name: 'Puff Puff Tray',
    description: 'Golden Nigerian puff puff prepared for parties, office sharing, and family gatherings.',
    brand: 'TeshTreats Kitchen',
    category: 'Fresh Pastries',
    flavor: 'Sweet golden dough',
    occasion: 'Party tray',
    priceCents: 1200000,
    skuName: 'Small tray',
    quantity: 45,
    size: 'small tray',
    packCount: 35,
    unitLabel: 'tray',
    isPerishable: true,
    expiresInDays: 3,
    tags: ['popular', 'fresh', 'party', 'african-inspired', 'bundle-ready'],
    dietaryLabels: ['fresh-made'],
    ingredients: ['wheat flour', 'yeast', 'sugar', 'nutmeg', 'sunflower oil'],
    allergens: ['wheat'],
    images: [
      {
        url: '/brand/products/puff-puff-tray.jpg',
        alt: 'Tray of golden puff puff bites'
      },
      {
        url: '/brand/products/party-snack-combo.jpg',
        alt: 'Assorted party tray with puff puff and savory pastries'
      }
    ]
  },
  {
    slug: 'mini-samosa-spring-roll-tray',
    name: 'Mini Samosa & Spring Roll Tray',
    description: 'Crisp mini samosas and spring rolls packed for easy party serving.',
    brand: 'TeshTreats Kitchen',
    category: 'Party Trays',
    flavor: 'Savory spiced vegetable',
    occasion: 'Events and meetings',
    priceCents: 1550000,
    skuName: 'Assorted tray',
    quantity: 34,
    size: 'assorted tray',
    packCount: 40,
    unitLabel: 'tray',
    isPerishable: true,
    expiresInDays: 3,
    tags: ['party', 'savory', 'bundle-ready', 'office'],
    dietaryLabels: ['fresh-made'],
    ingredients: ['wheat pastry', 'vegetables', 'onion', 'pepper', 'spices', 'sunflower oil'],
    allergens: ['wheat'],
    images: [
      {
        url: '/brand/products/samosa-spring-roll-tray.jpg',
        alt: 'Tray of mini samosas and spring rolls'
      },
      {
        url: '/brand/products/party-snack-combo.jpg',
        alt: 'Assorted puff puff, samosa, and spring roll party tray'
      }
    ]
  },
  {
    slug: 'classic-meat-pie-tray',
    name: 'Classic Meat Pie Tray',
    description: 'Fresh baked meat pies with flaky golden pastry and savory beef filling.',
    brand: 'TeshTreats Bakery',
    category: 'Fresh Pastries',
    flavor: 'Savory beef',
    occasion: 'Lunch and events',
    priceCents: 1800000,
    skuName: 'Dozen tray',
    quantity: 40,
    size: '12 pieces',
    packCount: 12,
    unitLabel: 'tray',
    isPerishable: true,
    expiresInDays: 3,
    tags: ['fresh', 'savory', 'popular', 'office', 'bundle-ready'],
    dietaryLabels: ['fresh-baked'],
    ingredients: ['wheat flour', 'beef', 'butter', 'potato', 'carrot', 'onion', 'pepper'],
    allergens: ['wheat', 'milk'],
    images: [
      {
        url: '/brand/products/classic-meat-pie-tray.jpg',
        alt: 'Tray of fresh golden meat pies'
      },
      {
        url: '/brand/products/party-snack-combo.jpg',
        alt: 'Assorted party tray with meat pies and puff puff'
      }
    ]
  },
  {
    slug: 'scotch-egg-bites',
    name: 'Scotch Egg Bites',
    description: 'Savory egg bites wrapped in seasoned meat and crisp golden coating.',
    brand: 'TeshTreats Kitchen',
    category: 'Fresh Pastries',
    flavor: 'Seasoned beef and egg',
    occasion: 'Brunch and party trays',
    priceCents: 900000,
    skuName: 'Six piece pack',
    quantity: 38,
    size: '6 pieces',
    packCount: 6,
    unitLabel: 'pack',
    isPerishable: true,
    expiresInDays: 3,
    tags: ['fresh', 'savory', 'protein', 'party'],
    dietaryLabels: ['fresh-made'],
    ingredients: ['eggs', 'beef', 'breadcrumbs', 'spices', 'sunflower oil'],
    allergens: ['egg', 'wheat'],
    images: [
      {
        url: '/brand/products/scotch-egg-bites.jpg',
        alt: 'Plate of scotch egg bites with one cut open'
      },
      {
        url: '/brand/products/classic-meat-pie-tray.jpg',
        alt: 'Fresh meat pie tray for savory snack pairing'
      }
    ]
  },
  {
    slug: 'party-snack-combo',
    name: 'Party Snack Combo',
    description: 'A crowd-ready mix of puff puff, mini samosas, and spring rolls for celebrations and office events.',
    brand: 'TeshTreats Kitchen',
    category: 'Party Trays',
    flavor: 'Sweet and savory mix',
    occasion: 'Parties and office planning',
    priceCents: 2650000,
    skuName: 'Large combo tray',
    quantity: 28,
    size: 'large tray',
    packCount: 75,
    unitLabel: 'tray',
    isPerishable: true,
    expiresInDays: 3,
    tags: ['bundle', 'party', 'office', 'popular', 'fresh'],
    dietaryLabels: ['mixed'],
    ingredients: ['puff puff', 'mini samosas', 'spring rolls', 'vegetables', 'spices'],
    allergens: ['wheat'],
    images: [
      {
        url: '/brand/products/party-snack-combo.jpg',
        alt: 'Assorted party tray with puff puff, samosas, and spring rolls'
      },
      {
        url: '/brand/products/samosa-spring-roll-tray.jpg',
        alt: 'Mini samosa and spring roll tray close up'
      },
      {
        url: '/brand/products/puff-puff-tray.jpg',
        alt: 'Puff puff tray close up'
      }
    ]
  },
  {
    slug: 'black-gold-celebration-cake',
    name: 'Aso Ebi Black & Gold Celebration Cake',
    description: 'Nigerian celebration cake finished with black, cream, and gold styling for birthdays, introductions, and premium owambe tables.',
    brand: 'TeshTreats Cakes',
    category: 'African Celebration Cakes',
    flavor: 'Vanilla and malt sponge',
    occasion: 'Owambe celebration',
    priceCents: 6500000,
    skuName: 'Two-tier cake',
    quantity: 12,
    size: 'two-tier',
    packCount: 1,
    unitLabel: 'cake',
    isPerishable: true,
    expiresInDays: 5,
    tags: ['cake', 'custom', 'premium', 'owambe', 'gifting'],
    dietaryLabels: ['made-to-order'],
    ingredients: ['vanilla sponge', 'malted milk crumb', 'buttercream', 'fondant accents', 'edible gold detail'],
    allergens: ['wheat', 'milk', 'egg'],
    images: [
      {
        url: '/brand/products/black-gold-celebration-cake.jpg',
        alt: 'Black and cream celebration cake with gold drip and flowers'
      },
      {
        url: '/brand/products/black-gold-birthday-cake.jpg',
        alt: 'White birthday cake with black and gold balloon details'
      },
      {
        url: '/brand/products/red-black-gold-birthday-cake.jpg',
        alt: 'Red black and gold birthday cake'
      }
    ]
  },
  {
    slug: 'aso-ebi-photo-celebration-cake',
    name: 'Aso Ebi Photo Celebration Cake',
    description: 'Made-to-order photo cake for Nigerian anniversaries, family thanksgiving events, introductions, and milestone parties.',
    brand: 'TeshTreats Cakes',
    category: 'African Celebration Cakes',
    flavor: 'Coconut and vanilla sponge',
    occasion: 'Family celebration',
    priceCents: 9500000,
    skuName: 'Custom tiered cake',
    quantity: 8,
    size: 'custom tiered',
    packCount: 1,
    unitLabel: 'cake',
    isPerishable: true,
    expiresInDays: 5,
    tags: ['cake', 'custom', 'photo-cake', 'aso-ebi', 'gifting'],
    dietaryLabels: ['made-to-order'],
    ingredients: ['coconut sponge', 'vanilla sponge', 'buttercream', 'edible print', 'floral accents'],
    allergens: ['wheat', 'milk', 'egg'],
    images: [
      {
        url: '/brand/products/custom-photo-anniversary-cake.jpg',
        alt: 'Custom anniversary photo cake with floral decorations'
      },
      {
        url: '/brand/products/custom-celebration-cakes-hero.jpg',
        alt: 'Custom PlayStation and rainbow birthday cakes'
      }
    ]
  },
  {
    slug: 'ankara-kids-birthday-cake',
    name: 'Ankara Kids Birthday Cake',
    description: 'Bright children’s birthday cake customized with Ankara-inspired colors, age toppers, and family celebration details.',
    brand: 'TeshTreats Cakes',
    category: 'African Celebration Cakes',
    flavor: 'Vanilla and coconut celebration',
    occasion: 'Kids birthday',
    priceCents: 4200000,
    skuName: 'One-tier custom cake',
    quantity: 10,
    size: 'one-tier',
    packCount: 1,
    unitLabel: 'cake',
    isPerishable: true,
    expiresInDays: 5,
    tags: ['cake', 'custom', 'kids-party', 'ankara-inspired', 'new-arrival'],
    dietaryLabels: ['made-to-order'],
    ingredients: ['vanilla sponge', 'coconut sponge', 'buttercream', 'fondant decoration', 'food coloring'],
    allergens: ['wheat', 'milk', 'egg'],
    images: [
      {
        url: '/brand/products/custom-celebration-cakes-hero.jpg',
        alt: 'Custom colorful birthday cakes for African family celebrations'
      }
    ]
  },
  {
    slug: 'custom-celebration-cakes',
    name: 'Custom African Celebration Cakes',
    description: 'A custom cake booking product for birthdays, graduations, naming ceremonies, introductions, anniversaries, and themed African events.',
    brand: 'TeshTreats Cakes',
    category: 'African Celebration Cakes',
    flavor: 'Custom African-inspired flavor',
    occasion: 'Made-to-order African celebration',
    priceCents: 5000000,
    skuName: 'Starting custom order',
    quantity: 15,
    size: 'custom',
    packCount: 1,
    unitLabel: 'order',
    isPerishable: true,
    expiresInDays: 5,
    tags: ['cake', 'custom', 'african-celebration', 'gifting', 'bundle-ready'],
    dietaryLabels: ['made-to-order'],
    ingredients: ['custom cake base', 'buttercream', 'fondant or edible African-inspired decor'],
    allergens: ['wheat', 'milk', 'egg'],
    images: [
      {
        url: '/brand/products/custom-celebration-cakes-hero.jpg',
        alt: 'Two custom birthday cakes with game and rainbow themes'
      },
      {
        url: '/brand/products/black-gold-birthday-cake.jpg',
        alt: 'White and black birthday cake with gold balloon details'
      },
      {
        url: '/brand/products/red-black-gold-birthday-cake.jpg',
        alt: 'Red black and gold birthday cake'
      }
    ]
  }
];

const retiredPlatformStorefrontSlugs = [
  'fresh-meat-pie',
  'dark-truffle-almonds',
  'saffron-pistachio-mix',
  'midnight-berry-bark',
  'smoked-cashew-reserve',
  'gold-caramel-wafers',
  'honey-roasted-pecans',
  'black-sesame-praline',
  'coconut-plantain-crisps',
  'suya-spice-cashews',
  'zobo-berry-gummies',
  'chin-chin-crunch-box',
  'salted-date-energy-bites',
  'hibiscus-glazed-popcorn',
  'chocolate-wafer-minis',
  'office-snack-sampler',
  'premium-gifting-box',
  'campus-trail-mix'
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
      businessEmail: 'ops@teshtreats.local',
      businessPhone: '+2348030001000',
      active: true,
      delegatedRoleApprovalRequired: true,
      manualPaymentEnabled: true,
      defaultCurrency: 'NGN',
      timezone: 'Africa/Lagos',
      metadata: {
        businessAddress: {
          line1: 'Lekki Phase 1 Kitchen',
          city: 'Lagos',
          state: 'Lagos',
          postalCode: '105102',
          country: 'NG'
        },
        orderReadinessNotificationChannels: ['email', 'sms']
      }
    },
    create: {
      slug: 'platform',
      name: 'TeshTreats Lagos Kitchen',
      businessEmail: 'ops@teshtreats.local',
      businessPhone: '+2348030001000',
      active: true,
      delegatedRoleApprovalRequired: true,
      manualPaymentEnabled: true,
      defaultCurrency: 'NGN',
      timezone: 'Africa/Lagos',
      metadata: {
        businessAddress: {
          line1: 'Lekki Phase 1 Kitchen',
          city: 'Lagos',
          state: 'Lagos',
          postalCode: '105102',
          country: 'NG'
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

  await prisma.tenant.updateMany({
    where: { slug: 'campus-cafeteria' },
    data: { active: false }
  });

  const vendorTenant = await prisma.tenant.upsert({
    where: { slug: 'lekki-kitchen-partner' },
    update: {
      name: 'Lekki Small Chops Partner',
      businessEmail: 'partner@teshtreats.local',
      businessPhone: '+2348030002000',
      active: true,
      delegatedRoleApprovalRequired: true,
      manualPaymentEnabled: true,
      defaultCurrency: 'NGN',
      timezone: 'Africa/Lagos',
      metadata: {
        businessAddress: {
          line1: 'Admiralty Way Prep Studio',
          city: 'Lekki',
          state: 'Lagos',
          postalCode: '105102',
          country: 'NG'
        },
        orderReadinessNotificationChannels: ['email', 'whatsapp']
      }
    },
    create: {
      slug: 'lekki-kitchen-partner',
      name: 'Lekki Small Chops Partner',
      businessEmail: 'partner@teshtreats.local',
      businessPhone: '+2348030002000',
      active: true,
      delegatedRoleApprovalRequired: true,
      manualPaymentEnabled: true,
      defaultCurrency: 'NGN',
      timezone: 'Africa/Lagos',
      metadata: {
        businessAddress: {
          line1: 'Admiralty Way Prep Studio',
          city: 'Lekki',
          state: 'Lagos',
          postalCode: '105102',
          country: 'NG'
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
      name: 'Lekki Kitchen Partner',
      phone: '+2348030003000',
      userType: 'admin',
      passwordHash
    },
    create: {
      email: 'vendor@snacks.local',
      name: 'Lekki Kitchen Partner',
      phone: '+2348030003000',
      userType: 'admin',
      passwordHash
    }
  });

  await prisma.user.upsert({
    where: {
      email: 'customer@snacks.local'
    },
    update: {
      name: 'Amaka Okafor',
      phone: '+2348031234567',
      userType: 'customer',
      passwordHash
    },
    create: {
      email: 'customer@snacks.local',
      name: 'Amaka Okafor',
      phone: '+2348031234567',
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
    brand: 'TeshTreats Bakery',
    category: 'Fresh Nigerian Pastries',
    flavor: 'Savory beef',
    occasion: 'Lunch and small chops tray',
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
    seoTitle: 'Nigerian Beef Meat Pie',
    seoDescription: 'Order fresh Nigerian beef meat pies with live availability and secure checkout.'
  };

  const meatPie = await prisma.product.upsert({
    where: {
      tenantId_slug: {
        tenantId: tenant.id,
        slug: 'fresh-meat-pie'
      }
    },
    update: {
      description: 'Warm Nigerian snack pie prepared fresh with spiced beef, carrot, and potato filling.',
      brand: 'TeshTreats Bakery',
      category: 'Fresh Nigerian Pastries',
      status: 'active',
      metadata: meatPieMetadata
    },
    create: {
      tenantId: tenant.id,
      name: 'Nigerian Beef Meat Pie',
      slug: 'fresh-meat-pie',
      description: 'Warm Nigerian snack pie prepared fresh with spiced beef, carrot, and potato filling.',
      brand: 'TeshTreats Bakery',
      category: 'Fresh Nigerian Pastries',
      status: 'active',
      metadata: meatPieMetadata,
      skus: {
        create: [
          {
            tenantId: tenant.id,
            name: 'Single pie',
            priceCents: 180000,
            currency: 'NGN',
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
      url: '/brand/products/classic-meat-pie-tray.jpg',
      alt: 'Tray of fresh golden meat pies',
      sortOrder: 0,
      storageProvider: 'local',
      contentType: 'image/jpeg'
    },
    create: {
      id: 'seed-meat-pie-image',
      productId: meatPie.id,
      url: '/brand/products/classic-meat-pie-tray.jpg',
      alt: 'Tray of fresh golden meat pies',
      sortOrder: 0,
      storageProvider: 'local',
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
            currency: 'NGN',
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
            currency: 'NGN',
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
          storageProvider: 'local',
          contentType: 'image/jpeg'
        },
        create: {
          id: `seed-${seedProduct.slug}-image-${imageIndex + 1}`,
          productId: product.id,
          url: image.url,
          objectKey: `seed/products/${seedProduct.slug}/${imageIndex + 1}.jpg`,
          alt: image.alt,
          sortOrder: imageIndex,
          storageProvider: 'local',
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

    const seedBatchExpiry = seedProduct.expiresInDays
      ? new Date(Date.now() + seedProduct.expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    if (existingSeedBatch) {
      await prisma.inventoryBatch.update({
        where: { id: existingSeedBatch.id },
        data: {
          quantity: Math.max(existingSeedBatch.quantity, seedProduct.quantity),
          reserved: 0,
          expiredAt: null,
          expiresAt: seedBatchExpiry
        }
      });
    } else {
      await prisma.inventoryBatch.create({
        data: {
          tenantId: tenant.id,
          skuId: sku.id,
          quantity: seedProduct.quantity,
          reserved: 0,
          expiresAt: seedBatchExpiry,
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

  await prisma.product.updateMany({
    where: {
      tenantId: tenant.id,
      slug: {
        in: retiredPlatformStorefrontSlugs
      }
    },
    data: {
      status: 'archived'
    }
  });

  await prisma.product.updateMany({
    where: {
      tenantId: tenant.id,
      slug: {
        notIn: seededStorefrontProducts.map((product) => product.slug)
      }
    },
    data: {
      status: 'archived'
    }
  });

  const ijebuCrunch = await prisma.product.upsert({
    where: {
      tenantId_slug: {
        tenantId: vendorTenant.id,
        slug: 'ijebu-garri-groundnut-crunch'
      }
    },
    update: {
      name: 'Ijebu Garri & Groundnut Crunch',
      description: 'A crisp Nigerian snack mix of roasted groundnuts, lightly sweetened garri clusters, coconut chips, and chin chin crumbs.',
      brand: 'Lekki Small Chops Partner',
      category: 'African Pantry Snacks',
      status: 'active',
      metadata: {
        isPerishable: false,
        brand: 'Lekki Small Chops Partner',
        category: 'African Pantry Snacks',
        flavor: 'Roasted groundnut and coconut',
        occasion: 'Office pantry and family snacking',
        ingredients: ['ijebu garri', 'roasted groundnuts', 'coconut chips', 'chin chin crumbs', 'date sugar'],
        allergens: ['peanuts', 'wheat'],
        nutritionFacts: {
          calories: '240',
          protein: '6g'
        },
        dietaryLabels: ['grab-and-go', 'african-owned'],
        tags: ['garri', 'groundnut', 'chin-chin', 'office', 'african-pantry'],
        storageInstructions: 'Store in a cool, dry place.',
        shelfLifeNotes: 'Best within 45 days.',
        bundleEligible: true,
        seoTitle: 'Ijebu Garri & Groundnut Crunch',
        seoDescription: 'Order an African pantry snack mix with garri, groundnuts, coconut chips, and chin chin crumbs.'
      }
    },
    create: {
      tenantId: vendorTenant.id,
      name: 'Ijebu Garri & Groundnut Crunch',
      slug: 'ijebu-garri-groundnut-crunch',
      description: 'A crisp Nigerian snack mix of roasted groundnuts, lightly sweetened garri clusters, coconut chips, and chin chin crumbs.',
      brand: 'Lekki Small Chops Partner',
      category: 'African Pantry Snacks',
      status: 'active',
      metadata: {
        isPerishable: false,
        brand: 'Lekki Small Chops Partner',
        category: 'African Pantry Snacks',
        flavor: 'Roasted groundnut and coconut',
        occasion: 'Office pantry and family snacking',
        ingredients: ['ijebu garri', 'roasted groundnuts', 'coconut chips', 'chin chin crumbs', 'date sugar'],
        allergens: ['peanuts', 'wheat'],
        nutritionFacts: {
          calories: '240',
          protein: '6g'
        },
        dietaryLabels: ['grab-and-go', 'african-owned'],
        tags: ['garri', 'groundnut', 'chin-chin', 'office', 'african-pantry'],
        storageInstructions: 'Store in a cool, dry place.',
        shelfLifeNotes: 'Best within 45 days.',
        bundleEligible: true,
        seoTitle: 'Ijebu Garri & Groundnut Crunch',
        seoDescription: 'Order an African pantry snack mix with garri, groundnuts, coconut chips, and chin chin crumbs.'
      },
      skus: {
        create: [
          {
            tenantId: vendorTenant.id,
            name: 'Snack pouch',
            priceCents: 250000,
            currency: 'NGN',
            active: true,
            metadata: {
              size: '120 g',
              packCount: 1,
              unitLabel: 'pouch'
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
      productId: ijebuCrunch.id,
      url: '/brand/products/chin-chin-crunch-box.jpg',
      alt: 'African pantry snack mix with chin chin and roasted groundnuts',
      sortOrder: 0,
      storageProvider: 'local',
      contentType: 'image/jpeg'
    },
    create: {
      id: 'seed-campus-trail-mix-image',
      productId: ijebuCrunch.id,
      url: '/brand/products/chin-chin-crunch-box.jpg',
      alt: 'African pantry snack mix with chin chin and roasted groundnuts',
      sortOrder: 0,
      storageProvider: 'local',
      contentType: 'image/jpeg'
    }
  });

  await prisma.product.updateMany({
    where: {
      tenantId: vendorTenant.id,
      slug: 'campus-trail-mix'
    },
    data: {
      status: 'archived'
    }
  });

  const ijebuCrunchSku = await prisma.sku.findFirstOrThrow({
    where: {
      tenantId: vendorTenant.id,
      productId: ijebuCrunch.id,
      name: 'Snack pouch'
    }
  });

  const existingIjebuCrunchBatch = await prisma.inventoryBatch.findFirst({
    where: {
      tenantId: vendorTenant.id,
      skuId: ijebuCrunchSku.id
    }
  });

  if (!existingIjebuCrunchBatch) {
    await prisma.inventoryBatch.create({
      data: {
        tenantId: vendorTenant.id,
        skuId: ijebuCrunchSku.id,
        quantity: 24,
        reserved: 0,
        adjustments: {
          create: {
            tenantId: vendorTenant.id,
            skuId: ijebuCrunchSku.id,
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
