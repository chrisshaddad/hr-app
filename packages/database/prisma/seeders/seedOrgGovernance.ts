import { PrismaClient } from '../../src/generated/prisma/client';
import type { SeededUsers } from './seedUsers';
import { seedId } from './factories';

export interface GovernanceResult {
  adminRoleId: string;
  employeeRoleId: string;
}

export async function seedOrgGovernance(
  prisma: PrismaClient,
  users: SeededUsers,
  organizationId: string,
): Promise<GovernanceResult> {
  const adminRole = await prisma.orgRole.upsert({
    where: { organizationId_name: { organizationId, name: 'Admin' } },
    update: {
      description: 'Organization admin role',
      isDefault: false,
      isSystemRole: true,
      scope: 'ALL_EMPLOYEES',
    },
    create: {
      organizationId,
      name: 'Admin',
      description: 'Organization admin role',
      isDefault: false,
      isSystemRole: true,
      scope: 'ALL_EMPLOYEES',
    },
  });

  const employeeRole = await prisma.orgRole.upsert({
    where: { organizationId_name: { organizationId, name: 'Employee' } },
    update: {
      description: 'Default employee role',
      isDefault: true,
      isSystemRole: true,
      scope: 'SELF_ONLY',
    },
    create: {
      organizationId,
      name: 'Employee',
      description: 'Default employee role',
      isDefault: true,
      isSystemRole: true,
      scope: 'SELF_ONLY',
    },
  });

  const adminSections = [
    'PERSONAL_INFO',
    'ADDRESS',
    'EMERGENCY_CONTACT',
    'DOCUMENTS',
    'ATTENDANCE',
  ] as const;
  for (const section of adminSections) {
    await prisma.orgRolePermission.upsert({
      where: { roleId_section: { roleId: adminRole.id, section } },
      update: { level: 'VIEW_EDIT' },
      create: { roleId: adminRole.id, section, level: 'VIEW_EDIT' },
    });
  }

  const employeeSections = [
    'PERSONAL_INFO',
    'ADDRESS',
    'EMERGENCY_CONTACT',
    'DOCUMENTS',
  ] as const;
  for (const section of employeeSections) {
    await prisma.orgRolePermission.upsert({
      where: { roleId_section: { roleId: employeeRole.id, section } },
      update: { level: 'VIEW' },
      create: { roleId: employeeRole.id, section, level: 'VIEW' },
    });
  }

  await prisma.userOrgRole.upsert({
    where: {
      userId_roleId: { userId: users.johnOrgAdmin.id, roleId: adminRole.id },
    },
    update: { assignedBy: users.superAdmin.id },
    create: {
      userId: users.johnOrgAdmin.id,
      roleId: adminRole.id,
      assignedBy: users.superAdmin.id,
    },
  });

  for (const employee of users.employees) {
    await prisma.userOrgRole.upsert({
      where: {
        userId_roleId: { userId: employee.id, roleId: employeeRole.id },
      },
      update: { assignedBy: users.johnOrgAdmin.id },
      create: {
        userId: employee.id,
        roleId: employeeRole.id,
        assignedBy: users.johnOrgAdmin.id,
      },
    });
  }

  await prisma.organizationNotificationSettings.upsert({
    where: { organizationId },
    update: {
      jobInterviewReminder: true,
      emailInvitationToJoin: true,
      mentionInBoard: true,
      updateEmployeeStatus: true,
    },
    create: {
      organizationId,
      jobInterviewReminder: true,
      emailInvitationToJoin: true,
      mentionInBoard: true,
      updateEmployeeStatus: true,
    },
  });

  const now = new Date();
  const holidaySpecs = [
    {
      key: 'founders-day',
      name: 'Founders Day',
      date: new Date(now.getFullYear(), 10, 15),
    },
    {
      key: 'summer-break',
      name: 'Summer Break',
      date: new Date(now.getFullYear(), 6, 4),
    },
    {
      key: 'year-end',
      name: 'Year End Shutdown',
      date: new Date(now.getFullYear(), 11, 28),
    },
  ];

  for (const holiday of holidaySpecs) {
    await prisma.holiday.upsert({
      where: { id: seedId('holiday', holiday.key) },
      update: {
        organizationId,
        name: holiday.name,
        startDate: holiday.date,
        endDate: holiday.date,
      },
      create: {
        id: seedId('holiday', holiday.key),
        organizationId,
        name: holiday.name,
        startDate: holiday.date,
        endDate: holiday.date,
      },
    });
  }

  return {
    adminRoleId: adminRole.id,
    employeeRoleId: employeeRole.id,
  };
}
