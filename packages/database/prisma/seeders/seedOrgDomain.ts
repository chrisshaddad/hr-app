import { PrismaClient } from '../../src/generated/prisma/client';
import type { SeededUsers } from './seedUsers';
import type { SeededOrganizations } from './seedOrganizations';
import { seedId } from './factories';
import { seedOrgStructure } from './seedOrgStructure';
import { seedEmployeeData } from './seedEmployeeData';
import { seedOrgScheduling } from './seedOrgScheduling';
import { seedOrgGovernance } from './seedOrgGovernance';

interface SeededOrgDomain {
  scheduleId: string;
  adminRoleId: string;
  employeeRoleId: string;
}

export async function seedOrgDomain(
  prisma: PrismaClient,
  users: SeededUsers,
  organizations: SeededOrganizations,
): Promise<SeededOrgDomain> {
  const organizationId = organizations.activeOrg.id;
  const now = new Date();
  const in180Days = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);

  const structure = await seedOrgStructure(prisma, organizationId);
  await seedEmployeeData(prisma, users, organizationId, structure);
  const { scheduleId } = await seedOrgScheduling(prisma, users, organizationId);
  const { adminRoleId, employeeRoleId } = await seedOrgGovernance(
    prisma,
    users,
    organizationId,
  );

  await prisma.auditLog.upsert({
    where: { id: seedId('audit', 'bulk-seed-org-domain') },
    update: {
      organizationId,
      userId: users.johnOrgAdmin.id,
      action: 'SETTINGS_UPDATED',
      entityType: 'OrganizationSeed',
      entityId: organizationId,
      metadata: {
        employeesSeeded: users.employees.length,
        contractsSeeded: users.employees.length,
        runAt: now.toISOString(),
      },
    },
    create: {
      id: seedId('audit', 'bulk-seed-org-domain'),
      organizationId,
      userId: users.johnOrgAdmin.id,
      action: 'SETTINGS_UPDATED',
      entityType: 'OrganizationSeed',
      entityId: organizationId,
      metadata: {
        employeesSeeded: users.employees.length,
        contractsSeeded: users.employees.length,
        runAt: now.toISOString(),
      },
    },
  });

  await prisma.magicLink.upsert({
    where: { token: 'seed-magic-john-org-domain' },
    update: {
      userId: users.johnOrgAdmin.id,
      expiresAt: in180Days,
      usedAt: null,
    },
    create: {
      userId: users.johnOrgAdmin.id,
      token: 'seed-magic-john-org-domain',
      expiresAt: in180Days,
      usedAt: null,
    },
  });

  return {
    scheduleId,
    adminRoleId,
    employeeRoleId,
  };
}
