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
  const now = new Date();

  const activeOrg = await prisma.organization.upsert({
    where: { createdById: users.johnOrgAdmin.id },
    update: {
      name: 'Pork Foods LLC',
      status: 'ACTIVE',
      description: faker.company.catchPhrase(),
      website: 'https://porkfoods.example.com',
      contactEmail: 'contact@porkfoods.example.com',
      contactNumber: '+1-415-555-0201',
      approvedById: users.superAdmin.id,
      approvedAt: now,
    },
    create: {
      name: 'Pork Foods LLC',
      status: 'ACTIVE',
      description: faker.company.catchPhrase(),
      website: 'https://porkfoods.example.com',
      contactEmail: 'contact@porkfoods.example.com',
      contactNumber: '+1-415-555-0201',
      createdById: users.johnOrgAdmin.id,
      approvedById: users.superAdmin.id,
      approvedAt: now,
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
      contactNumber: '+1-415-555-0202',
      approvedById: null,
      approvedAt: null,
    },
    create: {
      name: 'Acme Robotics',
      status: 'PENDING',
      description: faker.company.catchPhrase(),
      website: 'https://acme-robotics.example.com',
      contactEmail: 'hello@acme-robotics.example.com',
      contactNumber: '+1-415-555-0202',
      createdById: users.pendingOrgAdmin.id,
    },
  });

  const extraOrganizations = [
    {
      name: 'Northstar Logistics',
      status: 'ACTIVE',
      website: 'https://northstar-logistics.example.com',
      contactEmail: 'hello@northstar-logistics.example.com',
      contactNumber: '+1-415-555-0203',
    },
    {
      name: 'Lumen Health Group',
      status: 'ACTIVE',
      website: 'https://lumen-health.example.com',
      contactEmail: 'hello@lumen-health.example.com',
      contactNumber: '+1-415-555-0204',
    },
    {
      name: 'Cascade Manufacturing',
      status: 'PENDING',
      website: 'https://cascade-manufacturing.example.com',
      contactEmail: 'hello@cascade-manufacturing.example.com',
      contactNumber: '+1-415-555-0205',
    },
    {
      name: 'Atlas Retail Holdings',
      status: 'REJECTED',
      website: 'https://atlas-retail.example.com',
      contactEmail: 'hello@atlas-retail.example.com',
      contactNumber: '+1-415-555-0206',
    },
    {
      name: 'Harbor Financial Services',
      status: 'SUSPENDED',
      website: 'https://harbor-finance.example.com',
      contactEmail: 'hello@harbor-finance.example.com',
      contactNumber: '+1-415-555-0207',
    },
    {
      name: 'Summit Education Partners',
      status: 'INACTIVE',
      website: 'https://summit-education.example.com',
      contactEmail: 'hello@summit-education.example.com',
      contactNumber: '+1-415-555-0208',
    },
  ] as const;

  for (const [index, org] of extraOrganizations.entries()) {
    const admin = users.extraOrgAdmins[index];

    if (!admin) {
      break;
    }

    const createdOrg = await prisma.organization.upsert({
      where: { createdById: admin.id },
      update: {
        name: org.name,
        status: org.status,
        description: faker.company.catchPhrase(),
        website: org.website,
        contactEmail: org.contactEmail,
        contactNumber: org.contactNumber,
        approvedById:
          org.status === 'ACTIVE' || org.status === 'SUSPENDED'
            ? users.superAdmin.id
            : null,
        approvedAt:
          org.status === 'ACTIVE' || org.status === 'SUSPENDED' ? now : null,
      },
      create: {
        name: org.name,
        status: org.status,
        description: faker.company.catchPhrase(),
        website: org.website,
        contactEmail: org.contactEmail,
        contactNumber: org.contactNumber,
        createdById: admin.id,
        approvedById:
          org.status === 'ACTIVE' || org.status === 'SUSPENDED'
            ? users.superAdmin.id
            : null,
        approvedAt:
          org.status === 'ACTIVE' || org.status === 'SUSPENDED' ? now : null,
      },
    });

    await prisma.user.update({
      where: { id: admin.id },
      data: { organizationId: createdOrg.id },
    });
  }

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
