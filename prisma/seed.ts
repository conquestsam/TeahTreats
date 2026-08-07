import { PrismaClient } from '@prisma/client';
import { permissions } from '../packages/shared/src/permissions/index.ts';
import { createRequire } from 'node:module';

const prisma = new PrismaClient();
const require = createRequire(import.meta.url);
const argon2 = require('../apps/api/node_modules/argon2') as {
  hash(value: string): Promise<string>;
};

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
