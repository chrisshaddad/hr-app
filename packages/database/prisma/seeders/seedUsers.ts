import {
  PrismaClient,
  Prisma,
  UserRole,
  Gender,
} from '../../src/generated/prisma/client';
import * as bcrypt from 'bcryptjs';

const GLOBAL_PASSWORD = 'admin123';

/* ===================== EDIT SUPER ADMINS START ===================== */
const SUPER_ADMINS: Array<{ email: string; name: string }> = [
  { email: 'zahraa.kassir@humanline.com', name: 'Zahraa Kassir' },
  { email: 'super2@humanline.com', name: 'Maya Superadmin' },
];
/* ===================== EDIT SUPER ADMINS END ===================== */

/* ===================== EDIT ORG ADMINS START ===================== */
// Must be 12 (1 per organization)
const ORG_ADMINS: Array<{ email: string; name: string }> = [
  { email: 'admin@techcorp.example.com', name: 'Sarah Chen' },
  { email: 'admin@greenenergy.example.com', name: 'Michael Green' },
  { email: 'admin@healthfirst.example.com', name: 'Dr. Emily Watson' },
  { email: 'admin@urbanconstruction.example.com', name: 'Robert Martinez' },
  { email: 'admin@datasync.example.com', name: 'Anna Data' },
  { email: 'admin@cedarretail.example.com', name: 'Noura Saleh' },
  { email: 'admin@atlaslogistics.example.com', name: 'Omar Haddad' },
  { email: 'admin@levantfintech.example.com', name: 'Lina Mansour' },
  { email: 'admin@skylinehospitality.example.com', name: 'Karim Farah' },
  { email: 'admin@fraudulent.example.com', name: 'John Suspicious' },
  { email: 'admin@amberpharma.example.com', name: 'Rita Elias' },
  { email: 'admin@pulsefitness.example.com', name: 'Hadi Karam' },
];
/* ===================== EDIT ORG ADMINS END ===================== */

function makePhone(i: number) {
  const base = 70000000 + (i % 9000000);
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
  d.setMonth((years * 3) % 12);
  d.setDate(((years * 7) % 28) + 1);
  return d;
}

async function upsertUserWithPasswordAndProfile(
  prisma: PrismaClient,
  input: {
    email: string;
    name: string;
    role: UserRole;
    isConfirmed: boolean;
    organizationId: string | null;
    departmentId: string | null;
    profileIndex: number;
    hashedPassword: string;
  },
) {
  const user = await prisma.user.upsert({
    where: { email: input.email },
    update: {
      name: input.name,
      role: input.role,
      isConfirmed: input.isConfirmed,
      organizationId: input.organizationId,
      departmentId: input.departmentId,
    },
    create: {
      email: input.email,
      name: input.name,
      role: input.role,
      isConfirmed: input.isConfirmed,
      organizationId: input.organizationId,
      departmentId: input.departmentId,
    },
  });

  // Fill ALL profile columns (no nulls)
  await prisma.userProfile.upsert({
    where: { userId: user.id },
    update: {
      dateOfBirth: dateYearsAgo(24 + (input.profileIndex % 10)),
      gender: pickGender(input.profileIndex),
      bio: `Seeded profile for ${input.name}.`,
      phoneNumber: makePhone(input.profileIndex),

      street1: `Building ${1 + (input.profileIndex % 40)}, Street ${1 + (input.profileIndex % 60)}`,
      street2: `Floor ${1 + (input.profileIndex % 10)}`,
      city: input.profileIndex % 2 === 0 ? 'Beirut' : 'Jounieh',
      state: input.profileIndex % 2 === 0 ? 'Beirut' : 'Mount Lebanon',
      postalCode: `11${(100 + (input.profileIndex % 900)).toString()}`,
      country: 'Lebanon',

      emergencyContactName: `Emergency Contact ${input.profileIndex}`,
      emergencyContactPhone: makePhone(input.profileIndex + 999),
      emergencyContactRelation:
        input.profileIndex % 2 === 0 ? 'Sibling' : 'Parent',

      nationality: 'Lebanese',
      profilePictureUrl: `https://example.com/avatars/${input.profileIndex}.png`,
    },
    create: {
      userId: user.id,
      dateOfBirth: dateYearsAgo(24 + (input.profileIndex % 10)),
      gender: pickGender(input.profileIndex),
      bio: `Seeded profile for ${input.name}.`,
      phoneNumber: makePhone(input.profileIndex),

      street1: `Building ${1 + (input.profileIndex % 40)}, Street ${1 + (input.profileIndex % 60)}`,
      street2: `Floor ${1 + (input.profileIndex % 10)}`,
      city: input.profileIndex % 2 === 0 ? 'Beirut' : 'Jounieh',
      state: input.profileIndex % 2 === 0 ? 'Beirut' : 'Mount Lebanon',
      postalCode: `11${(100 + (input.profileIndex % 900)).toString()}`,
      country: 'Lebanon',

      emergencyContactName: `Emergency Contact ${input.profileIndex}`,
      emergencyContactPhone: makePhone(input.profileIndex + 999),
      emergencyContactRelation:
        input.profileIndex % 2 === 0 ? 'Sibling' : 'Parent',

      nationality: 'Lebanese',
      profilePictureUrl: `https://example.com/avatars/${input.profileIndex}.png`,
    },
  });

  // Password (private schema)
  await prisma.password.upsert({
    where: { userId: user.id },
    update: { hashedPassword: input.hashedPassword },
    create: { userId: user.id, hashedPassword: input.hashedPassword },
  });

  return user;
}

export async function seedSuperAdmins(prisma: PrismaClient) {
  console.log('Seeding super admins...');

  const hashedPassword = await bcrypt.hash(GLOBAL_PASSWORD, 10);

  for (let i = 0; i < SUPER_ADMINS.length; i++) {
    const admin = SUPER_ADMINS[i];
    await upsertUserWithPasswordAndProfile(prisma, {
      email: admin.email,
      name: admin.name,
      role: UserRole.SUPER_ADMIN,
      isConfirmed: true,
      organizationId: null,
      departmentId: null,
      profileIndex: 10 + i,
      hashedPassword,
    });
  }

  console.log(
    `Super admins seeded: ${SUPER_ADMINS.map((u) => u.email).join(', ')}`,
  );
}

export async function seedOrgAdmins(prisma: PrismaClient) {
  console.log('Seeding org admins...');

  const hashedPassword = await bcrypt.hash(GLOBAL_PASSWORD, 10);

  for (let i = 0; i < ORG_ADMINS.length; i++) {
    const admin = ORG_ADMINS[i];
    await upsertUserWithPasswordAndProfile(prisma, {
      email: admin.email,
      name: admin.name,
      role: UserRole.ORG_ADMIN,
      isConfirmed: true,
      organizationId: null, // assigned later by seedOrganizations
      departmentId: null,
      profileIndex: 100 + i,
      hashedPassword,
    });
  }

  console.log(
    `Org admins seeded: ${ORG_ADMINS.map((u) => u.email).join(', ')}`,
  );
}
