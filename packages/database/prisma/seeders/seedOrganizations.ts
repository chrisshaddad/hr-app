import { faker } from '@faker-js/faker';
import { PrismaClient } from '../../src/generated/prisma/client';
import type { SeededUsers } from './seedUsers';

export interface SeededOrganizations {
  activeOrg: { id: string; name: string };
  pendingOrg: { id: string; name: string };
}

export async function seedOrganizations(
  prisma: PrismaClient,
  users: SeededUsers,
): Promise<SeededOrganizations> {
  const activeOrg = await prisma.organization.upsert({
    where: { createdById: users.johnOrgAdmin.id },
    update: {
      name: 'Pork Foods LLC',
      status: 'ACTIVE',
      description: faker.company.catchPhrase(),
      website: 'https://porkfoods.example.com',
      contactEmail: 'contact@porkfoods.example.com',
      contactNumber: faker.phone.number(),
      approvedById: users.superAdmin.id,
      approvedAt: new Date(),
    },
    create: {
      name: 'Pork Foods LLC',
      status: 'ACTIVE',
      description: faker.company.catchPhrase(),
      website: 'https://porkfoods.example.com',
      contactEmail: 'contact@porkfoods.example.com',
      contactNumber: faker.phone.number(),
      createdById: users.johnOrgAdmin.id,
      approvedById: users.superAdmin.id,
      approvedAt: new Date(),
    },
  });

  const pendingOrg = await prisma.organization.upsert({
    where: { createdById: users.pendingOrgAdmin.id },
    update: {
      name: 'Acme Robotics',
      status: 'PENDING',
      description: faker.company.catchPhrase(),
      website: 'https://acme-robotics.example.com',
      contactEmail: 'hello@acme-robotics.example.com',
      contactNumber: faker.phone.number(),
      approvedById: null,
      approvedAt: null,
    },
    create: {
      name: 'Acme Robotics',
      status: 'PENDING',
      description: faker.company.catchPhrase(),
      website: 'https://acme-robotics.example.com',
      contactEmail: 'hello@acme-robotics.example.com',
      contactNumber: faker.phone.number(),
      createdById: users.pendingOrgAdmin.id,
    },
  });

  await prisma.user.update({
    where: { id: users.johnOrgAdmin.id },
    data: { organizationId: activeOrg.id },
  });

  await prisma.user.update({
    where: { id: users.pendingOrgAdmin.id },
    data: { organizationId: pendingOrg.id },
  });

  for (const employee of users.employees) {
    await prisma.user.update({
      where: { id: employee.id },
      data: { organizationId: activeOrg.id },
    });
  }

  return {
    activeOrg: { id: activeOrg.id, name: activeOrg.name },
    pendingOrg: { id: pendingOrg.id, name: pendingOrg.name },
  };
}
