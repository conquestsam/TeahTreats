DATABASE_URL='postgresql://snacks:zra8nO5cSv3faiyqxxIfbCOYwFi1b3c0@dpg-d9s8v92fngtc73er6kc0-a.oregon-postgres.render.com/snacks_commerce' pnpm dev:db:push
DATABASE_URL='postgresql://snacks:zra8nO5cSv3faiyqxxIfbCOYwFi1b3c0@dpg-d9s8v92fngtc73er6kc0-a.oregon-postgres.render.com/snacks_commerce' pnpm db:seed







mac@Sam-D-CyberNuke e-commerce % DATABASE_URL='***********snacks_commerce' pnpm db:deploy
DATABASE_URL='*********nacks_commerce' pnpm db:seed
$ prisma migrate deploy
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "snacks_commerce", schema "public" at "dpg-d9s8v92fngtc73er6kc0-a.oregon-postgres.render.com"

No migration found in prisma/migrations


No pending migrations to apply.
$ tsx prisma/seed.ts
PrismaClientKnownRequestError: 
Invalid `prisma.permission.upsert()` invocation in
/Users/mac/Documents/e-commerce/prisma/seed.ts:13:29

  10 
  11 async function main() {
  12   for (const key of Object.values(permissions)) {
→ 13     await prisma.permission.upsert(
The table `public.Permission` does not exist in the current database.
    at ei.handleRequestError (/Users/mac/Documents/e-commerce/node_modules/.pnpm/@prisma+client@6.19.3_prisma@6.19.3_typescript@6.0.3__typescript@6.0.3/node_modules/@prisma/client/src/runtime/RequestHandler.ts:228:13)
    at ei.handleAndLogRequestError (/Users/mac/Documents/e-commerce/node_modules/.pnpm/@prisma+client@6.19.3_prisma@6.19.3_typescript@6.0.3__typescript@6.0.3/node_modules/@prisma/client/src/runtime/RequestHandler.ts:174:12)
    at ei.request (/Users/mac/Documents/e-commerce/node_modules/.pnpm/@prisma+client@6.19.3_prisma@6.19.3_typescript@6.0.3__typescript@6.0.3/node_modules/@prisma/client/src/runtime/RequestHandler.ts:143:12)
    at async a (/Users/mac/Documents/e-commerce/node_modules/.pnpm/@prisma+client@6.19.3_prisma@6.19.3_typescript@6.0.3__typescript@6.0.3/node_modules/@prisma/client/src/runtime/getPrismaClient.ts:833:24)
    at async main (/Users/mac/Documents/e-commerce/prisma/seed.ts:13:5) {
  code: 'P2021',
  meta: { modelName: 'Permission', table: 'public.Permission' },
  clientVersion: '6.19.3'
}
[ELIFECYCLE] Command failed with exit code 1.
mac@Sam-D-CyberNuke e-commerce % 