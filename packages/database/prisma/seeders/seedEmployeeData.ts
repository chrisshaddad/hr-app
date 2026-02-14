import { faker } from '@faker-js/faker';
import { PrismaClient } from '../../src/generated/prisma/client';
import type { SeededUsers } from './seedUsers';
import type { OrgStructureResult } from './seedOrgStructure';
import {
  employeeCode,
  randomAttendanceWindow,
  randomDocumentType,
  randomEmploymentType,
  randomProfileData,
  seedId,
} from './factories';

export async function seedEmployeeData(
  prisma: PrismaClient,
  users: SeededUsers,
  organizationId: string,
  structure: OrgStructureResult,
): Promise<void> {
  const now = new Date();

  await prisma.user.update({
    where: { id: users.johnOrgAdmin.id },
    data: { departmentId: structure.peopleDepartmentId },
  });

  await prisma.jobAssignment.upsert({
    where: { id: seedId('job', 'john-org-admin') },
    update: {
      userId: users.johnOrgAdmin.id,
      organizationId,
      employeeId: employeeCode(1),
      jobTitleId: structure.adminTitleId,
      employmentType: 'FULLTIME',
      lineManagerId: null,
      departmentId: structure.peopleDepartmentId,
      branchId: structure.hqBranchId,
      effectiveDate: now,
      endDate: null,
      isActive: true,
    },
    create: {
      id: seedId('job', 'john-org-admin'),
      userId: users.johnOrgAdmin.id,
      organizationId,
      employeeId: employeeCode(1),
      jobTitleId: structure.adminTitleId,
      employmentType: 'FULLTIME',
      lineManagerId: null,
      departmentId: structure.peopleDepartmentId,
      branchId: structure.hqBranchId,
      effectiveDate: now,
      isActive: true,
    },
  });

  for (const [index, employee] of users.employees.entries()) {
    const department =
      structure.departments[index % structure.departments.length];
    const branch = structure.branches[index % structure.branches.length];
    const title = structure.titles[(index + 1) % structure.titles.length];
    const employmentType = randomEmploymentType();
    const profileData = randomProfileData(employee.name);

    await prisma.user.update({
      where: { id: employee.id },
      data: { departmentId: department.id },
    });

    const employeeNumber = index % 2 === 0 ? employeeCode(index + 2) : null;

    await prisma.jobAssignment.upsert({
      where: { id: seedId('job', employee.email) },
      update: {
        userId: employee.id,
        organizationId,
        employeeId: employeeNumber,
        jobTitleId: title.id,
        employmentType,
        lineManagerId: users.johnOrgAdmin.id,
        departmentId: department.id,
        branchId: branch.id,
        effectiveDate: now,
        endDate: null,
        isActive: true,
      },
      create: {
        id: seedId('job', employee.email),
        userId: employee.id,
        organizationId,
        employeeId: employeeNumber,
        jobTitleId: title.id,
        employmentType,
        lineManagerId: users.johnOrgAdmin.id,
        departmentId: department.id,
        branchId: branch.id,
        effectiveDate: now,
        isActive: true,
      },
    });

    await prisma.contract.upsert({
      where: {
        contractNumber: `PORK-CONTRACT-${String(index + 1).padStart(4, '0')}`,
      },
      update: {
        userId: employee.id,
        contractName: `${employee.name} Employment Contract`,
        contractType: 'FULLTIME_PERMANENT',
        startDate: now,
        endDate: null,
        isActive: true,
        deletedAt: null,
      },
      create: {
        userId: employee.id,
        contractNumber: `PORK-CONTRACT-${String(index + 1).padStart(4, '0')}`,
        contractName: `${employee.name} Employment Contract`,
        contractType: 'FULLTIME_PERMANENT',
        startDate: now,
        isActive: true,
      },
    });

    await prisma.employeeProfile.upsert({
      where: { userId: employee.id },
      update: profileData,
      create: {
        userId: employee.id,
        ...profileData,
      },
    });

    for (const row of randomAttendanceWindow(15)) {
      await prisma.attendance.upsert({
        where: { userId_date: { userId: employee.id, date: row.date } },
        update: {
          clockIn: row.clockIn,
          clockOut: row.clockOut,
          scheduledHours: '8.00',
          loggedHours: '8.00',
          paidHours: '8.00',
          deficitHours: '0.00',
          overtimeHours: row.overtimeHours,
          status: 'COMPLETED',
          deletedAt: null,
        },
        create: {
          userId: employee.id,
          date: row.date,
          clockIn: row.clockIn,
          clockOut: row.clockOut,
          scheduledHours: '8.00',
          loggedHours: '8.00',
          paidHours: '8.00',
          deficitHours: '0.00',
          overtimeHours: row.overtimeHours,
          status: 'COMPLETED',
        },
      });
    }

    for (let docIndex = 1; docIndex <= 2; docIndex += 1) {
      const documentType = randomDocumentType();
      const fileSlug = employee.name.toLowerCase().replace(/\s+/g, '-');

      await prisma.document.upsert({
        where: { id: seedId('doc', `${employee.email}-${docIndex}`) },
        update: {
          userId: employee.id,
          organizationId,
          documentType,
          fileName: `${fileSlug}-${docIndex}.pdf`,
          fileUrl: faker.internet.url(),
          fileSize: faker.number.int({ min: 90_000, max: 650_000 }),
          mimeType: 'application/pdf',
          deletedAt: null,
        },
        create: {
          id: seedId('doc', `${employee.email}-${docIndex}`),
          userId: employee.id,
          organizationId,
          documentType,
          fileName: `${fileSlug}-${docIndex}.pdf`,
          fileUrl: faker.internet.url(),
          fileSize: faker.number.int({ min: 90_000, max: 650_000 }),
          mimeType: 'application/pdf',
        },
      });
    }
  }
}
