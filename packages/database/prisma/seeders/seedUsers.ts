import { faker } from '@faker-js/faker';
import { PrismaClient } from '../../src/generated/prisma/client';

const DEFAULT_PASSWORD_HASH =
  '$2b$10$HDRkGk8GxHkbii.6kCCQ7.qEM5U60GXq5tkP9jOtWRvQSVW0ZjEde'; // Password123!

export interface SeededUsers {
  superAdmin: { id: string; email: string };
  johnOrgAdmin: { id: string; email: string };
  pendingOrgAdmin: { id: string; email: string };
  extraOrgAdmins: Array<{ id: string; email: string }>;
  employees: Array<{ id: string; email: string; name: string }>;
}

const EMPLOYEE_STATUSES = [
  'ACTIVE',
  'ON_BOARDING',
  'PROBATION',
  'ON_LEAVE',
] as const;

const EXTRA_ORG_ADMINS = [
  { email: 'admin1@northstar.admin', name: 'Northstar Admin' },
  { email: 'admin2@lumen.admin', name: 'Lumen Admin' },
  { email: 'admin3@cascade.admin', name: 'Cascade Admin' },
  { email: 'admin4@atlas.admin', name: 'Atlas Admin' },
  { email: 'admin5@harbor.admin', name: 'Harbor Admin' },
  { email: 'admin6@summit.admin', name: 'Summit Admin' },
] as const;

export async function seedUsers(prisma: PrismaClient): Promise<SeededUsers> {
  const superAdmin = await prisma.user.upsert({
    where: { email: 'chris.haddad@humanline.com' },
    update: {
      name: 'Chris Haddad',
      role: 'SUPER_ADMIN',
      isConfirmed: true,
      organizationId: null,
      departmentId: null,
      employeeStatus: null,
    },
    create: {
      email: 'chris.haddad@humanline.com',
      name: 'Chris Haddad',
      role: 'SUPER_ADMIN',
      isConfirmed: true,
    },
  });

  const johnOrgAdmin = await prisma.user.upsert({
    where: { email: 'john@pork.admin' },
    update: {
      name: 'John Pork',
      role: 'ORG_ADMIN',
      isConfirmed: true,
      organizationId: null,
      departmentId: null,
      employeeStatus: null,
    },
    create: {
      email: 'john@pork.admin',
      name: 'John Pork',
      role: 'ORG_ADMIN',
      isConfirmed: true,
    },
  });

  const pendingOrgAdmin = await prisma.user.upsert({
    where: { email: 'dana@acme.admin' },
    update: {
      name: 'Dana Wright',
      role: 'ORG_ADMIN',
      isConfirmed: true,
      organizationId: null,
      departmentId: null,
      employeeStatus: null,
    },
    create: {
      email: 'dana@acme.admin',
      name: 'Dana Wright',
      role: 'ORG_ADMIN',
      isConfirmed: true,
    },
  });

  const employees: Array<{ id: string; email: string; name: string }> = [];
  const extraOrgAdmins: Array<{ id: string; email: string }> = [];

  for (const extraAdmin of EXTRA_ORG_ADMINS) {
    const user = await prisma.user.upsert({
      where: { email: extraAdmin.email },
      update: {
        name: extraAdmin.name,
        role: 'ORG_ADMIN',
        isConfirmed: true,
        organizationId: null,
        departmentId: null,
        employeeStatus: null,
      },
      create: {
        email: extraAdmin.email,
        name: extraAdmin.name,
        role: 'ORG_ADMIN',
        isConfirmed: true,
      },
    });

    extraOrgAdmins.push({ id: user.id, email: user.email });
  }

  for (let i = 1; i <= 8; i += 1) {
    const fullName = faker.person.fullName();
    const employee = await prisma.user.upsert({
      where: { email: `employee${i}@pork.admin` },
      update: {
        name: fullName,
        role: 'EMPLOYEE',
        isConfirmed: true,
        employeeStatus: EMPLOYEE_STATUSES[i % EMPLOYEE_STATUSES.length],
      },
      create: {
        email: `employee${i}@pork.admin`,
        name: fullName,
        role: 'EMPLOYEE',
        isConfirmed: true,
        employeeStatus: EMPLOYEE_STATUSES[i % EMPLOYEE_STATUSES.length],
      },
    });

    employees.push({
      id: employee.id,
      email: employee.email,
      name: employee.name,
    });
  }

  const authUsers = [
    superAdmin.id,
    johnOrgAdmin.id,
    pendingOrgAdmin.id,
    ...extraOrgAdmins.map((u) => u.id),
    ...employees.map((u) => u.id),
  ];

  for (const userId of authUsers) {
    await prisma.password.upsert({
      where: { userId },
      update: {
        hashedPassword: DEFAULT_PASSWORD_HASH,
        failedLoginCount: 0,
      },
      create: {
        userId,
        hashedPassword: DEFAULT_PASSWORD_HASH,
        failedLoginCount: 0,
      },
    });
  }

  return {
    superAdmin: { id: superAdmin.id, email: superAdmin.email },
    johnOrgAdmin: { id: johnOrgAdmin.id, email: johnOrgAdmin.email },
    pendingOrgAdmin: { id: pendingOrgAdmin.id, email: pendingOrgAdmin.email },
    extraOrgAdmins,
    employees,
  };
}
