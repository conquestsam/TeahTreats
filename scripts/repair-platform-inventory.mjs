import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const platformProductRepairs = [
  { slug: 'teshtreats-signature-zobo', expiresInDays: 14 },
  { slug: 'puff-puff-tray', expiresInDays: 3 },
  { slug: 'mini-samosa-spring-roll-tray', expiresInDays: 3 },
  { slug: 'classic-meat-pie-tray', expiresInDays: 3 },
  { slug: 'scotch-egg-bites', expiresInDays: 3 },
  { slug: 'party-snack-combo', expiresInDays: 3 },
  { slug: 'black-gold-celebration-cake', expiresInDays: 5 },
  { slug: 'custom-photo-anniversary-cake', expiresInDays: 5 },
  { slug: 'kids-custom-birthday-cake', expiresInDays: 5 },
  { slug: 'custom-celebration-cakes', expiresInDays: 5 },
  { slug: 'fresh-meat-pie', expiresInDays: 3 }
];

async function main() {
  const tenant = await prisma.tenant.findUnique({ where: { slug: 'platform' } });
  if (!tenant) {
    throw new Error('Platform tenant was not found.');
  }

  const results = [];
  for (const repair of platformProductRepairs) {
    const product = await prisma.product.findUnique({
      where: {
        tenantId_slug: {
          tenantId: tenant.id,
          slug: repair.slug
        }
      },
      include: {
        skus: {
          include: {
            batches: true
          }
        }
      }
    });

    if (!product) {
      results.push({ slug: repair.slug, status: 'missing' });
      continue;
    }

    const expiresAt = new Date(Date.now() + repair.expiresInDays * 24 * 60 * 60 * 1000);
    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: product.id },
        data: { status: 'active' }
      });

      for (const sku of product.skus) {
        await tx.sku.update({
          where: { id: sku.id },
          data: { active: true }
        });

        for (const batch of sku.batches) {
          await tx.inventoryBatch.update({
            where: { id: batch.id },
            data: {
              reserved: 0,
              expiredAt: null,
              expiresAt
            }
          });
        }
      }
    });

    results.push({
      slug: repair.slug,
      status: 'repaired',
      skus: product.skus.length,
      batches: product.skus.reduce((total, sku) => total + sku.batches.length, 0),
      expiresAt: expiresAt.toISOString()
    });
  }

  console.log(JSON.stringify({ repairedAt: new Date().toISOString(), results }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
