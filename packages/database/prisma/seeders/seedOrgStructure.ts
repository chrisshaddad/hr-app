import {
  PrismaClient,
  UserRole,
  Gender,
} from '../../src/generated/prisma/client';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const GLOBAL_PASSWORD = 'admin123';
const EMPLOYEES_PER_DEPARTMENT = 10;

/* ===================== EDIT STRUCTURE START ===================== */
const BRANCH_TEMPLATES = [
  {
    baseName: 'HQ - Beirut',
    country: 'Lebanon',
    city: 'Beirut',
    state: 'Beirut',
  },
  {
    baseName: 'Branch - Mount Lebanon',
    country: 'Lebanon',
    city: 'Jounieh',
    state: 'Mount Lebanon',
  },
];

const DEPARTMENT_TEMPLATES = [
  {
    baseName: 'Engineering',
    description: 'Software development and technical delivery.',
  },
  { baseName: 'HR', description: 'People operations and talent support.' },
  {
    baseName: 'Finance',
    description: 'Accounting, payroll, and financial planning.',
  },
];
/* ===================== EDIT STRUCTURE END ===================== */

function makePhone(i: number) {
  const base = 71000000 + (i % 9000000);
  return `+961${base}`;
}

function pickGender(i: number): Gender {
  const arr = [
    Gender.FEMALE,
    Gender.MALE,
    Gender.OTHER,
    Gender.PREFER_NOT_TO_SAY,
  ];
  return arr[i % arr.length];
}

function dateYearsAgo(years: number) {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  d.setMonth((years * 2) % 12);
  d.setDate(((years * 5) % 28) + 1);
  return d;
}

function isConfirmedDeterministic(i: number) {
  // deterministic mix: 1 out of 5 false (~80% true)
  return i % 5 !== 0;
}

async function createEmployee(
  prisma: PrismaClient,
  input: {
    email: string;
    name: string;
    organizationId: string;
    departmentId: string;
    hashedPassword: string;
    seedIndex: number;
  },
) {
  const user = await prisma.user.upsert({
    where: { email: input.email },
    update: {
      name: input.name,
      role: UserRole.EMPLOYEE,
      isConfirmed: isConfirmedDeterministic(input.seedIndex),
      organizationId: input.organizationId,
      departmentId: input.departmentId,
    },
    create: {
      email: input.email,
      name: input.name,
      role: UserRole.EMPLOYEE,
      isConfirmed: isConfirmedDeterministic(input.seedIndex),
      organizationId: input.organizationId,
      departmentId: input.departmentId,
    },
  });

  await prisma.userProfile.upsert({
    where: { userId: user.id },
    update: {
      dateOfBirth: dateYearsAgo(21 + (input.seedIndex % 15)),
      gender: pickGender(input.seedIndex),
      bio: `Seeded employee profile for ${input.name}.`,
      phoneNumber: makePhone(input.seedIndex),

      street1: `Building ${1 + (input.seedIndex % 50)}, Street ${1 + (input.seedIndex % 80)}`,
      street2: `Floor ${1 + (input.seedIndex % 12)}`,
      city: input.seedIndex % 2 === 0 ? 'Beirut' : 'Jounieh',
      state: input.seedIndex % 2 === 0 ? 'Beirut' : 'Mount Lebanon',
      postalCode: `12${(100 + (input.seedIndex % 900)).toString()}`,
      country: 'Lebanon',

      emergencyContactName: `Emergency ${input.seedIndex}`,
      emergencyContactPhone: makePhone(input.seedIndex + 2000),
      emergencyContactRelation:
        input.seedIndex % 2 === 0 ? 'Sibling' : 'Parent',

      nationality: 'Lebanese',
      profilePictureUrl: `https://example.com/employees/${input.seedIndex}.png`,
    },
    create: {
      userId: user.id,
      dateOfBirth: dateYearsAgo(21 + (input.seedIndex % 15)),
      gender: pickGender(input.seedIndex),
      bio: `Seeded employee profile for ${input.name}.`,
      phoneNumber: makePhone(input.seedIndex),

      street1: `Building ${1 + (input.seedIndex % 50)}, Street ${1 + (input.seedIndex % 80)}`,
      street2: `Floor ${1 + (input.seedIndex % 12)}`,
      city: input.seedIndex % 2 === 0 ? 'Beirut' : 'Jounieh',
      state: input.seedIndex % 2 === 0 ? 'Beirut' : 'Mount Lebanon',
      postalCode: `12${(100 + (input.seedIndex % 900)).toString()}`,
      country: 'Lebanon',

      emergencyContactName: `Emergency ${input.seedIndex}`,
      emergencyContactPhone: makePhone(input.seedIndex + 2000),
      emergencyContactRelation:
        input.seedIndex % 2 === 0 ? 'Sibling' : 'Parent',

      nationality: 'Lebanese',
      profilePictureUrl: `https://example.com/employees/${input.seedIndex}.png`,
    },
  });

  await prisma.password.upsert({
    where: { userId: user.id },
    update: { hashedPassword: input.hashedPassword },
    create: { userId: user.id, hashedPassword: input.hashedPassword },
  });

  // Fill Session table for a subset
  if (input.seedIndex % 30 === 0) {
    await prisma.session.create({
      data: {
        id: randomUUID(),
        userId: user.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // +7 days
      },
    });
  }

  // Fill MagicLink table for a subset
  if (input.seedIndex % 45 === 0) {
    await prisma.magicLink.create({
      data: {
        userId: user.id,
        token: `seed-token-${randomUUID().replace(/-/g, '')}`,
        expiresAt: new Date(Date.now() + 1000 * 60 * 20), // +20 mins
        usedAt: null,
      },
    });
  }
}

export async function seedOrgStructure(prisma: PrismaClient) {
  console.log('Seeding branches, departments, employees...');

  const hashedPassword = await bcrypt.hash(GLOBAL_PASSWORD, 10);

  const organizations = await prisma.organization.findMany({
    select: { id: true, name: true },
    orderBy: { createdAt: 'asc' },
  });

  if (!organizations.length) {
    throw new Error('No organizations found. Run seedOrganizations first.');
  }

  let seedIndex = 1;

  for (const org of organizations) {
    // Create 2 branches
    const branches = [];
    for (let b = 0; b < BRANCH_TEMPLATES.length; b++) {
      const t = BRANCH_TEMPLATES[b];
      const name = `${t.baseName} - ${org.name}`;

      const existing = await prisma.branch.findFirst({
        where: { organizationId: org.id, name },
      });

      const branch =
        existing ??
        (await prisma.branch.create({
          data: {
            organizationId: org.id,
            name,
            street1: `${10 + b} Main Street`,
            street2: `Suite ${100 + b}`,
            city: t.city,
            state: t.state,
            postalCode: `1${(1000 + seedIndex).toString()}`,
            country: t.country,
            phoneNumber: makePhone(3000 + seedIndex),
            email: `branch${b + 1}@${org.name.toLowerCase().replace(/\s+/g, '')}.example.com`,
          },
        }));

      branches.push(branch);
    }

    // Per branch: 3 departments, per department: 10 employees
    for (let b = 0; b < branches.length; b++) {
      const branch = branches[b];

      const departments = [];
      for (let d = 0; d < DEPARTMENT_TEMPLATES.length; d++) {
        const depT = DEPARTMENT_TEMPLATES[d];
        const depName = `${depT.baseName} - ${b === 0 ? 'HQ' : 'Branch'}`;

        const existingDep = await prisma.department.findFirst({
          where: { branchId: branch.id, name: depName },
        });

        const dep =
          existingDep ??
          (await prisma.department.create({
            data: {
              branchId: branch.id,
              name: depName,
              description: depT.description,
            },
          }));

        departments.push(dep);
      }

      for (let d = 0; d < departments.length; d++) {
        const dep = departments[d];

        for (let e = 0; e < EMPLOYEES_PER_DEPARTMENT; e++) {
          const email = `emp-${org.id.slice(0, 6)}-${b + 1}-${d + 1}-${e + 1}@example.com`;
          const name = `Employee ${org.name} ${b + 1}.${d + 1}.${e + 1}`;

          await createEmployee(prisma, {
            email,
            name,
            organizationId: org.id,
            departmentId: dep.id,
            hashedPassword,
            seedIndex,
          });

          seedIndex++;
        }
      }
    }

    console.log(`✅ Seeded structure for org: ${org.name}`);
  }

  console.log('✅ Branches/departments/employees seeded.');
}
