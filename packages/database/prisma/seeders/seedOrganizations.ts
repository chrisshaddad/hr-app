import {
  PrismaClient,
  OrganizationStatus,
} from '../../src/generated/prisma/client';

interface OrganizationSeed {
  name: string;
  description: string;
  website: string | null;
  status: OrganizationStatus;
  createdAt: Date;
  approvedAt?: Date;
  adminEmail: string;
}

/* ===================== EDIT ORGANIZATIONS START ===================== */
// 12 organizations: 5 ACTIVE, 4 PENDING, 2 REJECTED, 1 SUSPENDED
const ORGANIZATIONS: OrganizationSeed[] = [
  // 5 ACTIVE
  {
    name: 'TechCorp Solutions',
    description: 'Enterprise software solutions and cloud infrastructure.',
    website: 'https://techcorp.example.com',
    status: OrganizationStatus.ACTIVE,
    createdAt: new Date('2025-10-15'),
    approvedAt: new Date('2025-10-18'),
    adminEmail: 'admin@techcorp.example.com',
  },
  {
    name: 'Green Energy Partners',
    description: 'Renewable energy consulting for businesses.',
    website: 'https://greenenergy.example.com',
    status: OrganizationStatus.ACTIVE,
    createdAt: new Date('2025-11-01'),
    approvedAt: new Date('2025-11-03'),
    adminEmail: 'admin@greenenergy.example.com',
  },
  {
    name: 'Cedar Retail Group',
    description: 'Multi-branch retail group for household and lifestyle goods.',
    website: 'https://cedarretail.example.com',
    status: OrganizationStatus.ACTIVE,
    createdAt: new Date('2025-08-10'),
    approvedAt: new Date('2025-08-15'),
    adminEmail: 'admin@cedarretail.example.com',
  },
  {
    name: 'Atlas Logistics',
    description: 'Regional logistics and last-mile delivery services.',
    website: 'https://atlaslogistics.example.com',
    status: OrganizationStatus.ACTIVE,
    createdAt: new Date('2025-09-12'),
    approvedAt: new Date('2025-09-16'),
    adminEmail: 'admin@atlaslogistics.example.com',
  },
  {
    name: 'Levant FinTech',
    description: 'Payments and fintech services for SMEs.',
    website: 'https://levantfintech.example.com',
    status: OrganizationStatus.ACTIVE,
    createdAt: new Date('2025-07-02'),
    approvedAt: new Date('2025-07-05'),
    adminEmail: 'admin@levantfintech.example.com',
  },

  // 4 PENDING
  {
    name: 'HealthFirst Medical Group',
    description:
      'Healthcare management organization operating multiple clinics.',
    website: 'https://healthfirst.example.com',
    status: OrganizationStatus.PENDING,
    createdAt: new Date('2026-01-20'),
    adminEmail: 'admin@healthfirst.example.com',
  },
  {
    name: 'Urban Construction Ltd',
    description: 'Commercial and residential construction services.',
    website: 'https://urbanconstruction.example.com',
    status: OrganizationStatus.PENDING,
    createdAt: new Date('2026-01-28'),
    adminEmail: 'admin@urbanconstruction.example.com',
  },
  {
    name: 'Skyline Hospitality',
    description: 'Hospitality group managing hotels and serviced apartments.',
    website: 'https://skylinehospitality.example.com',
    status: OrganizationStatus.PENDING,
    createdAt: new Date('2026-01-05'),
    adminEmail: 'admin@skylinehospitality.example.com',
  },
  {
    name: 'Amber Pharma Trading',
    description: 'Pharmaceutical distribution and trading services.',
    website: 'https://amberpharma.example.com',
    status: OrganizationStatus.PENDING,
    createdAt: new Date('2026-01-12'),
    adminEmail: 'admin@amberpharma.example.com',
  },

  // 2 REJECTED
  {
    name: 'Fraudulent Enterprises Inc',
    description: 'Rejected due to unverifiable information.',
    website: null,
    status: OrganizationStatus.REJECTED,
    createdAt: new Date('2025-12-10'),
    approvedAt: new Date('2025-12-12'),
    adminEmail: 'admin@fraudulent.example.com',
  },
  {
    name: 'Pulse Fitness Network',
    description: 'Rejected due to incomplete documentation.',
    website: 'https://pulsefitness.example.com',
    status: OrganizationStatus.REJECTED,
    createdAt: new Date('2025-12-20'),
    approvedAt: new Date('2025-12-22'),
    adminEmail: 'admin@pulsefitness.example.com',
  },

  // 1 SUSPENDED
  {
    name: 'DataSync Analytics',
    description: 'BI and analytics firm; temporarily suspended.',
    website: 'https://datasync.example.com',
    status: OrganizationStatus.SUSPENDED,
    createdAt: new Date('2025-09-05'),
    approvedAt: new Date('2025-09-08'),
    adminEmail: 'admin@datasync.example.com',
  },
];
/* ===================== EDIT ORGANIZATIONS END ===================== */

export async function seedOrganizations(prisma: PrismaClient) {
  console.log('Seeding organizations...');

  const superAdmin = await prisma.user.findFirst({
    where: { role: 'SUPER_ADMIN' },
  });

  if (!superAdmin) {
    throw new Error('No super admin found. Seed super admins first.');
  }

  for (const org of ORGANIZATIONS) {
    const orgAdmin = await prisma.user.findUnique({
      where: { email: org.adminEmail },
    });

    if (!orgAdmin) {
      console.warn(
        `Warning: Org admin ${org.adminEmail} not found. Skipping ${org.name}.`,
      );
      continue;
    }

    // Organization.createdById is UNIQUE, so upsert by createdById
    const createdOrg = await prisma.organization.upsert({
      where: { createdById: orgAdmin.id },
      update: {
        name: org.name,
        description: org.description,
        website: org.website,
        status: org.status,
        createdAt: org.createdAt,
        approvedById:
          org.status === 'ACTIVE' ||
          org.status === 'SUSPENDED' ||
          org.status === 'REJECTED'
            ? superAdmin.id
            : null,
        approvedAt: org.approvedAt || null,
      },
      create: {
        name: org.name,
        description: org.description,
        website: org.website,
        status: org.status,
        createdAt: org.createdAt,
        createdById: orgAdmin.id,
        approvedById:
          org.status === 'ACTIVE' ||
          org.status === 'SUSPENDED' ||
          org.status === 'REJECTED'
            ? superAdmin.id
            : null,
        approvedAt: org.approvedAt || null,
      },
    });

    // Link org admin to organization
    await prisma.user.update({
      where: { id: orgAdmin.id },
      data: { organizationId: createdOrg.id },
    });

    console.log(
      `Created organization: ${org.name} (${org.status}) - Admin: ${orgAdmin.email}`,
    );
  }

  console.log(`Organizations seeded: ${ORGANIZATIONS.length} total`);
}
