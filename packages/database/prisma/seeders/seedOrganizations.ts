import { PrismaClient } from '../../src/generated/prisma/client';

interface OrganizationSeed {
  name: string;
  description: string;
  website: string | null;
  status: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED' | 'INACTIVE';
  createdAt: Date;
  approvedAt?: Date;
  adminEmail: string; // Email of the org admin who created this org
}

// Sample organizations with varied statuses
const ORGANIZATIONS: OrganizationSeed[] = [
  {
    name: 'TechCorp Solutions',
    description:
      'A leading technology company specializing in enterprise software solutions and cloud infrastructure.',
    website: 'https://techcorp.example.com',
    status: 'ACTIVE',
    createdAt: new Date('2025-10-15'),
    approvedAt: new Date('2025-10-18'),
    adminEmail: 'admin@techcorp.example.com',
  },
  {
    name: 'Green Energy Partners',
    description:
      'Sustainable energy consulting firm focused on renewable energy solutions for businesses.',
    website: 'https://greenenergy.example.com',
    status: 'ACTIVE',
    createdAt: new Date('2025-11-01'),
    approvedAt: new Date('2025-11-03'),
    adminEmail: 'admin@greenenergy.example.com',
  },
  {
    name: 'HealthFirst Medical Group',
    description:
      'Healthcare management organization operating multiple clinics and medical facilities.',
    website: 'https://healthfirst.example.com',
    status: 'PENDING',
    createdAt: new Date('2026-01-20'),
    adminEmail: 'admin@healthfirst.example.com',
  },
  {
    name: 'Urban Construction Ltd',
    description:
      'Commercial and residential construction company with projects across the region.',
    website: 'https://urbanconstruction.example.com',
    status: 'PENDING',
    createdAt: new Date('2026-01-28'),
    adminEmail: 'admin@urbanconstruction.example.com',
  },
  {
    name: 'Fraudulent Enterprises Inc',
    description:
      'Application rejected due to suspicious business practices and unverifiable information.',
    website: null,
    status: 'REJECTED',
    createdAt: new Date('2025-12-10'),
    adminEmail: 'admin@fraudulent.example.com',
  },
  {
    name: 'DataSync Analytics',
    description:
      'Business intelligence and data analytics firm helping companies make data-driven decisions.',
    website: 'https://datasync.example.com',
    status: 'SUSPENDED',
    createdAt: new Date('2025-09-05'),
    approvedAt: new Date('2025-09-08'),
    adminEmail: 'admin@datasync.example.com',
  },
];

export async function seedOrganizations(prisma: PrismaClient) {


  // Get the super admin who will approve organizations
  const superAdmin = await prisma.user.findFirst({
    where: {
      roles: {
        some: {
          role: 'SUPER_ADMIN',
        },
      },
    },
  });

  if (!superAdmin) {
    throw new Error('No super admin found. Seed super admins first.');
  }

  // Create organizations, linking each to its specific org admin by email
  for (const org of ORGANIZATIONS) {
    // Find the org admin by email
    const orgAdmin = await prisma.user.findUnique({
      where: { email: org.adminEmail },
      include: { roles: true },
    });

    if (!orgAdmin) {
      console.warn(
        `  Warning: Org admin ${org.adminEmail} not found. Skipping ${org.name}.`
      );
      continue;
    }

    // Check if they actually have the ORG_ADMIN role
    const hasOrgAdminRole = orgAdmin.roles.some(r => r.role === 'ORG_ADMIN');
    /* if (!hasOrgAdminRole) {
       console.warn(
         `  Warning: User ${org.adminEmail} does not have ORG_ADMIN role. Skipping ${org.name}.`
       );
       continue;
     }*/
    if (!hasOrgAdminRole) {
      await prisma.userRoleAssignment.create({
        data: {
          userId: orgAdmin.id,
          role: 'ORG_ADMIN',
        },
      });
    }


    const createdOrg = await prisma.organization.create({
      data: {
        name: org.name,
        description: org.description,
        website: org.website,
        status: org.status,
        createdAt: org.createdAt,
        createdById: orgAdmin.id,
        // Link approvedBy for ACTIVE and SUSPENDED orgs
        approvedById:
          org.status === 'ACTIVE' || org.status === 'SUSPENDED'
            ? superAdmin.id
            : null,
        approvedAt: org.approvedAt || null,
      },
    });


    // Update the org admin to be a member of their organization
    await prisma.user.update({
      where: { id: orgAdmin.id },
      data: { organizationId: createdOrg.id },
    });


  }


}
