import { prisma } from '../../src/client';
import { seedSuperAdmins, seedOrgAdmins } from './seedUsers';
import { seedOrganizations } from './seedOrganizations';
import { seedOrgStructure } from './seedOrgStructure';

async function main() {
  // 1) Users (super admins + org admins) including passwords + profiles
  await seedSuperAdmins(prisma);
  await seedOrgAdmins(prisma);

  // 2) Organizations (12 orgs) + link org admin to organizationId + approvals
  await seedOrganizations(prisma);

  // 3) Branches + departments + employees (and their passwords/profiles) + sessions/magiclinks
  await seedOrgStructure(prisma);
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
