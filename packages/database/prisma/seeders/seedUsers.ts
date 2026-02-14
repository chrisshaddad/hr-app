import { faker } from '@faker-js/faker';
import { PrismaClient } from '../../src/generated/prisma/client';

const DEFAULT_PASSWORD_HASH =
  '$2b$10$HDRkGk8GxHkbii.6kCCQ7.qEM5U60GXq5tkP9jOtWRvQSVW0ZjEde'; // Password123!

export interface SeededUsers {
  superAdmin: { id: string; email: string };
  johnOrgAdmin: { id: string; email: string };
  pendingOrgAdmin: { id: string; email: string };
  employees: Array<{ id: string; email: string; name: string }>;
}

const EMPLOYEE_STATUSES = [
  'ACTIVE',
  'ON_BOARDING',
  'PROBATION',
  'ON_LEAVE',
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
    employees,
  };
}
