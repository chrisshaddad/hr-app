import { prisma } from '../../src/client';
import { seedSuperAdmins, seedOrgAdmins } from './seedUsers';
import { seedOrganizations } from './seedOrganizations';

async function main() {
  // Seed users first (org admins need to exist before organizations)
  await seedSuperAdmins(prisma);
  await seedOrgAdmins(prisma);

  // Seed organizations (links org admins to their orgs)
  await seedOrganizations(prisma);
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
