import { PrismaClient, Prisma, UserRole } from '../../src/generated/prisma/client';

const SUPER_ADMINS: Prisma.UserCreateManyInput[] = [
  {
    email: 'chris.haddad@humanline.com',
    name: 'Chris Haddad',
  },
  // Add more super admins as needed
];

// Org admins
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

  for (const admin of SUPER_ADMINS) {
    // Use upsert to avoid unique constraint errors
    const user = await prisma.user.upsert({
      where: { email: admin.email },
      update: {}, // Do nothing if exists
      create: {
        ...admin,
        isConfirmed: true,
      },
    });

    // Assign SUPER_ADMIN role if not already assigned
    const existingRole = await prisma.userRoleAssignment.findUnique({
      where: { userId_role: { userId: user.id, role: UserRole.SUPER_ADMIN } },
    });

    if (!existingRole) {
      await prisma.userRoleAssignment.create({
        data: {
          userId: user.id,
          role: UserRole.SUPER_ADMIN,
        },
      });
    }

  }
}

export async function seedOrgAdmins(prisma: PrismaClient) {

  for (const admin of ORG_ADMINS) {
    // Upsert user
    const user = await prisma.user.upsert({
      where: { email: admin.email },
      update: {}, // Do nothing if exists
      create: {
        ...admin,
        isConfirmed: true,
      },
    });

    // Assign ORG_ADMIN role if not already assigned
    const existingRole = await prisma.userRoleAssignment.findUnique({
      where: { userId_role: { userId: user.id, role: UserRole.ORG_ADMIN } },
    });

    if (!existingRole) {
      await prisma.userRoleAssignment.create({
        data: {
          userId: user.id,
          role: UserRole.ORG_ADMIN,
        },
      });
    }

  }
}
