import { PrismaClient, Prisma } from '../../src/generated/prisma/client';
import { UserRole } from '@repo/db';

const SUPER_ADMINS: Prisma.UserCreateManyInput[] = [
  {
    email: 'chris.haddad@humanline.com',
    name: 'Chris Haddad',
  },
  // Add more super admins as needed
];

// Org admins - these will be linked to organizations in seedOrganizations.ts
// The order here matches the order in seedOrganizations.ts
const ORG_ADMINS: Prisma.UserCreateManyInput[] = [
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
      role: 'SUPER_ADMIN',
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
      role: 'ORG_ADMIN',
    })),
  });

  console.log(
    `Org admins: ${ORG_ADMINS.map((u) => u.email).join(', ')} seeded.`,
  );
}

const ORGS_FOR_EMPLOYEES = [
  {
    orgAdminEmail: 'admin@techcorp.example.com',
    label: 'TechCorp',
    employees: [
      { email: 'maya.manager@techcorp.example.com', name: 'Maya Johnson', isManager: true },
      { email: 'liam.park@techcorp.example.com', name: 'Liam Park' },
      { email: 'noor.hassan@techcorp.example.com', name: 'Noor Hassan' },
      { email: 'daniel.ross@techcorp.example.com', name: 'Daniel Ross' },
      { email: 'sophia.kim@techcorp.example.com', name: 'Sophia Kim' },
    ],
  },
  {
    orgAdminEmail: 'admin@greenenergy.example.com',
    label: 'GreenEnergy',
    employees: [
      { email: 'omar.manager@greenenergy.example.com', name: 'Omar Ali', isManager: true },
      { email: 'lina.saleh@greenenergy.example.com', name: 'Lina Saleh' },
      { email: 'eva.brown@greenenergy.example.com', name: 'Eva Brown' },
      { email: 'hassan.najib@greenenergy.example.com', name: 'Hassan Najib' },
      { email: 'julia.morris@greenenergy.example.com', name: 'Julia Morris' },
    ],
  },
] as const;

export async function seedEmployees(prisma: PrismaClient) {
  console.log('Seeding employees (2 orgs, 5 each, with manager + organization)...');

  for (const org of ORGS_FOR_EMPLOYEES) {
    // ✅ Find the organization directly (don’t rely on user.organizationId being set)
    const organization = await prisma.organization.findFirst({
      where: {
        createdBy: { email: org.orgAdminEmail },
      },
      select: { id: true, name: true },
    });

    if (!organization) {
      throw new Error(
        `Organization not found for ${org.label}. Expected an Organization whose createdBy is ${org.orgAdminEmail}. ` +
          `Make sure seedOrganizations ran and used that org admin as createdBy.`,
      );
    }

    const organizationId = organization.id;

    // 1) Manager employee
    const managerSeed = org.employees.find((e) => e.isManager);
    if (!managerSeed) throw new Error(`No manager employee defined for org: ${org.label}`);

    const managerUser = await prisma.user.upsert({
      where: { email: managerSeed.email },
      create: {
        email: managerSeed.email,
        name: managerSeed.name,
        role: 'EMPLOYEE',
        isConfirmed: true,
        organization: { connect: { id: organizationId } },
      },
      update: {
        name: managerSeed.name,
        role: 'EMPLOYEE',
        isConfirmed: true,
        organization: { connect: { id: organizationId } },
        manager: { disconnect: true }, // keep null
      },
      select: { id: true, email: true },
    });

    // 2) Direct reports
    const directReports = org.employees.filter((e) => !e.isManager);

    for (const emp of directReports) {
      await prisma.user.upsert({
        where: { email: emp.email },
        create: {
          email: emp.email,
          name: emp.name,
          role: 'EMPLOYEE',
          isConfirmed: true,
          organization: { connect: { id: organizationId } },
          manager: { connect: { id: managerUser.id } },
        },
        update: {
          name: emp.name,
          role: 'EMPLOYEE',
          isConfirmed: true,
          organization: { connect: { id: organizationId } },
          manager: { connect: { id: managerUser.id } },
        },
      });
    }

    console.log(
      `Seeded ${org.employees.length} employees for ${org.label} (orgId=${organizationId}). ` +
        `Manager: ${managerUser.email}`,
    );
  }

  console.log('Employees seeding done.');
}
