import { faker } from '@faker-js/faker';
import { prisma } from '../../src/client';
import { seedUsers } from './seedUsers';
import { seedOrganizations } from './seedOrganizations';
import { seedOrgDomain } from './seedOrgDomain';
import { seedBusinessDomain } from './seedBusinessDomain';

async function main() {
  faker.seed(20260214);

  console.log('Seeding users...');
  const users = await seedUsers(prisma);

  console.log('Seeding organizations...');
  const organizations = await seedOrganizations(prisma, users);

  console.log('Seeding org domain data...');
  await seedOrgDomain(prisma, users, organizations);

  console.log('Seeding business domain data...');
  await seedBusinessDomain(prisma, users, organizations);

  console.log('Seed complete.');
  console.log('Login password for seeded users: Password123!');
  console.log(`Org admin: ${users.johnOrgAdmin.email}`);
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
