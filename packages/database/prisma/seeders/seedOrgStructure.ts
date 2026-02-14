import { faker } from '@faker-js/faker';
import { PrismaClient } from '../../src/generated/prisma/client';

export interface OrgStructureResult {
  branches: Array<{ id: string; name: string }>;
  departments: Array<{ id: string; name: string }>;
  titles: Array<{ id: string; title: string }>;
  hqBranchId: string;
  peopleDepartmentId: string;
  adminTitleId: string;
}

export async function seedOrgStructure(
  prisma: PrismaClient,
  organizationId: string,
): Promise<OrgStructureResult> {
  const branchSpecs = [
    { name: 'HQ', email: 'hq@porkfoods.example.com' },
    { name: 'Warehouse West', email: 'warehouse@porkfoods.example.com' },
    { name: 'Distribution East', email: 'distribution@porkfoods.example.com' },
  ] as const;

  for (const branch of branchSpecs) {
    const existing = await prisma.branch.findFirst({
      where: { organizationId, name: branch.name },
      select: { id: true },
    });

    const data = {
      city: faker.location.city(),
      state: faker.location.state({ abbreviated: true }),
      country: 'US',
      street1: faker.location.streetAddress(),
      postalCode: faker.location.zipCode(),
      phoneNumber: faker.phone.number(),
      email: branch.email,
    };

    if (existing) {
      await prisma.branch.update({ where: { id: existing.id }, data });
    } else {
      await prisma.branch.create({
        data: { organizationId, name: branch.name, ...data },
      });
    }
  }

  const departmentNames = ['Operations', 'People', 'Finance', 'IT'] as const;
  for (const name of departmentNames) {
    const existing = await prisma.department.findFirst({
      where: { organizationId, name },
      select: { id: true },
    });

    if (existing) {
      await prisma.department.update({
        where: { id: existing.id },
        data: { description: faker.company.buzzPhrase() },
      });
    } else {
      await prisma.department.create({
        data: {
          organizationId,
          name,
          description: faker.company.buzzPhrase(),
        },
      });
    }
  }

  const titleNames = [
    'HR Manager',
    'Operations Specialist',
    'Payroll Specialist',
    'Talent Coordinator',
    'Support Analyst',
  ] as const;

  for (const title of titleNames) {
    await prisma.jobTitle.upsert({
      where: { organizationId_title: { organizationId, title } },
      update: { description: faker.person.jobDescriptor(), isActive: true },
      create: {
        organizationId,
        title,
        description: faker.person.jobDescriptor(),
        isActive: true,
      },
    });
  }

  const branches = await prisma.branch.findMany({ where: { organizationId } });
  const departments = await prisma.department.findMany({
    where: { organizationId },
  });
  const titles = await prisma.jobTitle.findMany({ where: { organizationId } });

  const hqBranch = branches.find((branch) => branch.name === 'HQ');
  const peopleDepartment = departments.find(
    (department) => department.name === 'People',
  );
  const adminTitle = titles.find((title) => title.title === 'HR Manager');

  if (!hqBranch || !peopleDepartment || !adminTitle) {
    throw new Error(
      'seedOrgStructure failed to create required default records',
    );
  }

  return {
    branches: branches.map((branch) => ({ id: branch.id, name: branch.name })),
    departments: departments.map((department) => ({
      id: department.id,
      name: department.name,
    })),
    titles: titles.map((title) => ({ id: title.id, title: title.title })),
    hqBranchId: hqBranch.id,
    peopleDepartmentId: peopleDepartment.id,
    adminTitleId: adminTitle.id,
  };
}
