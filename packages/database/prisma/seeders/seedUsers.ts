import { PrismaClient } from '../../src/generated/prisma/client';

const SUPER_ADMINS: { email: string; name: string }[] = [
  {
    email: 'chris.haddad@humanline.com',
    name: 'Chris Haddad',
  },
  // Add more super admins as needed
];

// Org admins - these will be linked to organizations in seedOrganizations.ts
// The order here matches the order in seedOrganizations.ts
const ORG_ADMINS: { email: string; name: string }[] = [
  {
    email: 'mahmoud.kalekish@gmail.com',
    name: 'Mahmoud Kalekish',
  },
  {
    email: 'admin@techcorp.example.com',
    name: 'Sarah Chen',
  },
  {
    email: 'admin@greenenergy.example.com',
    name: 'Michael Green',
  },
  {
    email: 'admin@healthfirst.example.com',
    name: 'Dr. Emily Watson',
  },
  {
    email: 'admin@urbanconstruction.example.com',
    name: 'Robert Martinez',
  },
  {
    email: 'admin@fraudulent.example.com',
    name: 'John Suspicious',
  },
  {
    email: 'admin@datasync.example.com',
    name: 'Anna Data',
  },
];

export async function seedSuperAdmins(prisma: PrismaClient) {
  console.log('Seeding super admins...');

  await prisma.user.createMany({
    data: SUPER_ADMINS.map((admin) => ({
      ...admin,
      isConfirmed: true,
      role: 'SUPER_ADMIN' as const,
      updatedAt: new Date(),
    })),
  });

  console.log(
    `Super admins: ${SUPER_ADMINS.map((u) => u.email).join(', ')} seeded.`,
  );
}

export async function seedOrgAdmins(prisma: PrismaClient) {
  console.log('Seeding org admins...');

  await prisma.user.createMany({
    data: ORG_ADMINS.map((admin) => ({
      ...admin,
      isConfirmed: true,
      role: 'ORG_ADMIN' as const,
      updatedAt: new Date(),
    })),
  });

  console.log(
    `Org admins: ${ORG_ADMINS.map((u) => u.email).join(', ')} seeded.`,
  );
}
