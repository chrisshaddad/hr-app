import { prisma } from '../../src/client';
import { seedSuperAdmins, seedOrgAdmins } from './seedUsers';
import { seedOrganizations } from './seedOrganizations';
import { seedATS } from './seedATS';

async function main() {
  console.log('🌱 Starting full database seed...\n');

  console.log('1️⃣ Seeding users...');
  await seedSuperAdmins(prisma);
  await seedOrgAdmins(prisma);

  console.log('\n2️⃣ Seeding organizations...');
  await seedOrganizations(prisma);

  console.log('\n3️⃣ Seeding ATS data...');
  await seedATS(prisma);

  console.log('\n✅ All seeding completed successfully!');
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
