import { Except } from 'type-fest';

import type {
  Organization,
  Prisma,
  PrismaClient,
} from '../../src/generated/prisma/client';

type IOrganizationSeed = Except<
  Prisma.OrganizationCreateManyInput,
  'createdById' | 'approvedById'
> & {
  adminEmail: string;
};

type IEmployeeSeed = (Except<
  Prisma.EmployeeCreateManyInput,
  | 'id'
  | 'organizationId'
  | 'personalInfoId'
  | 'lineManagerId'
  | 'userId'
  | 'departmentId'
  | 'branchId'
> & {
  organizationName: string;
  createdByEmail: string;
  userEmail?: string;
}) & {
  personalInfo: Except<Prisma.EmployeePersonalInfoCreateInput, 'employee'>;
};

export class Seeder {
  prisma: PrismaClient;

  constructor(args: { prisma: PrismaClient }) {
    this.prisma = args.prisma;
  }

  superAdmins: Prisma.UserCreateManyInput[] = [
    {
      email: 'chris.haddad@humanline.com',
      name: 'Chris Haddad',
    },
    {
      email: 'aliiharkous@humanline.com',
      name: 'Ali Harkous',
    },
  ];
  orgAdmins: Prisma.UserCreateManyInput[] = [
    {
      email: 'admin@techcorp.example.com',
      name: 'Sarah Chen',
    },
  ];
  organizations: IOrganizationSeed[] = [
    {
      name: 'TechCorp Solutions',
      description:
        'A leading technology company specializing in enterprise software solutions and cloud infrastructure.',
      website: 'https://techcorp.example.com',
      status: 'ACTIVE',
      approvedAt: new Date('2025-10-18'),
      adminEmail: this.orgAdmins[0].email,
    },
  ];

  employees: IEmployeeSeed[] = [
    {
      status: 'ACTIVE' as const,
      jobTitle: 'Software Engineer',
      joinDate: new Date('2025-11-01'),
      timezone: 'America/New_York',
      createdByEmail: this.orgAdmins[0].email,
      organizationName: this.organizations[0].name,
      personalInfo: {
        lastName: 'Doe',
        firstName: 'John',
        email: 'employee@techcorp.example.com',
      },
    },
    {
      status: 'ACTIVE' as const,
      jobTitle: 'Product Manager',
      joinDate: new Date('2025-11-15'),
      timezone: 'America/New_York',
      createdByEmail: this.orgAdmins[0].email,
      organizationName: this.organizations[0].name,
      personalInfo: {
        lastName: 'Smith',
        firstName: 'Jane',
        email: 'jane.smith@techcorp.example.com',
      },
    },
    {
      status: 'ACTIVE' as const,
      jobTitle: 'Senior Developer',
      joinDate: new Date('2025-10-15'),
      timezone: 'America/Chicago',
      createdByEmail: this.orgAdmins[0].email,
      organizationName: this.organizations[0].name,
      personalInfo: {
        lastName: 'Johnson',
        firstName: 'Michael',
        email: 'michael.johnson@techcorp.example.com',
      },
    },
    {
      status: 'ACTIVE' as const,
      jobTitle: 'UX Designer',
      joinDate: new Date('2025-11-08'),
      timezone: 'America/Los_Angeles',
      createdByEmail: this.orgAdmins[0].email,
      organizationName: this.organizations[0].name,
      personalInfo: {
        lastName: 'Williams',
        firstName: 'Emma',
        email: 'emma.williams@techcorp.example.com',
      },
    },
    {
      status: 'ACTIVE' as const,
      jobTitle: 'DevOps Engineer',
      joinDate: new Date('2025-10-22'),
      timezone: 'America/Denver',
      createdByEmail: this.orgAdmins[0].email,
      organizationName: this.organizations[0].name,
      personalInfo: {
        lastName: 'Brown',
        firstName: 'David',
        email: 'david.brown@techcorp.example.com',
      },
    },
    {
      status: 'ACTIVE' as const,
      jobTitle: 'QA Engineer',
      joinDate: new Date('2025-11-03'),
      timezone: 'America/New_York',
      createdByEmail: this.orgAdmins[0].email,
      organizationName: this.organizations[0].name,
      personalInfo: {
        lastName: 'Martinez',
        firstName: 'Sofia',
        email: 'sofia.martinez@techcorp.example.com',
      },
    },
    {
      status: 'ACTIVE' as const,
      jobTitle: 'Frontend Developer',
      joinDate: new Date('2025-11-10'),
      timezone: 'America/Chicago',
      createdByEmail: this.orgAdmins[0].email,
      organizationName: this.organizations[0].name,
      personalInfo: {
        lastName: 'Garcia',
        firstName: 'Carlos',
        email: 'carlos.garcia@techcorp.example.com',
      },
    },
    {
      status: 'ACTIVE' as const,
      jobTitle: 'Backend Developer',
      joinDate: new Date('2025-10-29'),
      timezone: 'America/New_York',
      createdByEmail: this.orgAdmins[0].email,
      organizationName: this.organizations[0].name,
      personalInfo: {
        lastName: 'Taylor',
        firstName: 'Jessica',
        email: 'jessica.taylor@techcorp.example.com',
      },
    },
    {
      status: 'ACTIVE' as const,
      jobTitle: 'Data Analyst',
      joinDate: new Date('2025-11-12'),
      timezone: 'America/Los_Angeles',
      createdByEmail: this.orgAdmins[0].email,
      organizationName: this.organizations[0].name,
      personalInfo: {
        lastName: 'Anderson',
        firstName: 'Robert',
        email: 'robert.anderson@techcorp.example.com',
      },
    },
    {
      status: 'ACTIVE' as const,
      jobTitle: 'Business Analyst',
      joinDate: new Date('2025-10-20'),
      timezone: 'America/New_York',
      createdByEmail: this.orgAdmins[0].email,
      organizationName: this.organizations[0].name,
      personalInfo: {
        lastName: 'Thomas',
        firstName: 'Rachel',
        email: 'rachel.thomas@techcorp.example.com',
      },
    },
    {
      status: 'ACTIVE' as const,
      jobTitle: 'Project Manager',
      joinDate: new Date('2025-11-05'),
      timezone: 'America/Chicago',
      createdByEmail: this.orgAdmins[0].email,
      organizationName: this.organizations[0].name,
      personalInfo: {
        lastName: 'Jackson',
        firstName: 'Christopher',
        email: 'christopher.jackson@techcorp.example.com',
      },
    },
    {
      status: 'ACTIVE' as const,
      jobTitle: 'Security Engineer',
      joinDate: new Date('2025-10-25'),
      timezone: 'America/New_York',
      createdByEmail: this.orgAdmins[0].email,
      organizationName: this.organizations[0].name,
      personalInfo: {
        lastName: 'White',
        firstName: 'Amanda',
        email: 'amanda.white@techcorp.example.com',
      },
    },
    {
      status: 'ACTIVE' as const,
      jobTitle: 'Cloud Architect',
      joinDate: new Date('2025-11-02'),
      timezone: 'America/Denver',
      createdByEmail: this.orgAdmins[0].email,
      organizationName: this.organizations[0].name,
      personalInfo: {
        lastName: 'Harris',
        firstName: 'Kevin',
        email: 'kevin.harris@techcorp.example.com',
      },
    },
    {
      status: 'ACTIVE' as const,
      jobTitle: 'Tech Lead',
      joinDate: new Date('2025-10-18'),
      timezone: 'America/New_York',
      createdByEmail: this.orgAdmins[0].email,
      organizationName: this.organizations[0].name,
      personalInfo: {
        lastName: 'Martin',
        firstName: 'Lauren',
        email: 'lauren.martin@techcorp.example.com',
      },
    },
    {
      status: 'ACTIVE' as const,
      jobTitle: 'Database Administrator',
      joinDate: new Date('2025-11-07'),
      timezone: 'America/Chicago',
      createdByEmail: this.orgAdmins[0].email,
      organizationName: this.organizations[0].name,
      personalInfo: {
        lastName: 'Clark',
        firstName: 'Daniel',
        email: 'daniel.clark@techcorp.example.com',
      },
    },
    {
      status: 'ACTIVE' as const,
      jobTitle: 'Solutions Architect',
      joinDate: new Date('2025-10-24'),
      timezone: 'America/Los_Angeles',
      createdByEmail: this.orgAdmins[0].email,
      organizationName: this.organizations[0].name,
      personalInfo: {
        lastName: 'Rodriguez',
        firstName: 'Michelle',
        email: 'michelle.rodriguez@techcorp.example.com',
      },
    },
    {
      status: 'ACTIVE' as const,
      jobTitle: 'ML Engineer',
      joinDate: new Date('2025-11-09'),
      timezone: 'America/New_York',
      createdByEmail: this.orgAdmins[0].email,
      organizationName: this.organizations[0].name,
      personalInfo: {
        lastName: 'Lee',
        firstName: 'James',
        email: 'james.lee@techcorp.example.com',
      },
    },
    {
      status: 'ACTIVE' as const,
      jobTitle: 'Systems Administrator',
      joinDate: new Date('2025-10-30'),
      timezone: 'America/Chicago',
      createdByEmail: this.orgAdmins[0].email,
      organizationName: this.organizations[0].name,
      personalInfo: {
        lastName: 'Walker',
        firstName: 'Sarah',
        email: 'sarah.walker@techcorp.example.com',
      },
    },
    {
      status: 'ACTIVE' as const,
      jobTitle: 'API Developer',
      joinDate: new Date('2025-11-04'),
      timezone: 'America/Denver',
      createdByEmail: this.orgAdmins[0].email,
      organizationName: this.organizations[0].name,
      personalInfo: {
        lastName: 'Hall',
        firstName: 'Matthew',
        email: 'matthew.hall@techcorp.example.com',
      },
    },
    {
      status: 'ACTIVE' as const,
      jobTitle: 'Mobile Developer',
      joinDate: new Date('2025-11-06'),
      timezone: 'America/New_York',
      createdByEmail: this.orgAdmins[0].email,
      organizationName: this.organizations[0].name,
      personalInfo: {
        lastName: 'Young',
        firstName: 'Ashley',
        email: 'ashley.young@techcorp.example.com',
      },
    },
  ];

  async seedUsers() {
    console.log('Seeding super admins...');

    await this.prisma.user.createMany({
      data: this.superAdmins.map((admin) => ({
        ...admin,
        isConfirmed: true,
        role: 'SUPER_ADMIN',
      })),
    });

    console.log(
      `Super admins: ${this.superAdmins.map((u) => u.email).join(', ')} seeded.`,
    );

    await this.prisma.user.createMany({
      data: this.orgAdmins.map((admin) => ({
        ...admin,
        isConfirmed: true,
        role: 'ORG_ADMIN',
      })),
    });

    console.log(
      `Org admins: ${this.orgAdmins.map((u) => u.email).join(', ')} seeded.`,
    );
  }

  async seedOrganizations() {
    console.log('Seeding organizations...');
    // Get the super admin who will approve organizations
    const superAdmin = await this.prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' },
    });

    if (superAdmin == null) {
      throw new Error('No super admin found. Seed super admins first.');
    }

    const res = await Promise.all(
      this.organizations.map(async (org) => {
        // Find the org admin by email
        const orgAdmin = await this.prisma.user.findUnique({
          where: { email: org.adminEmail },
        });

        if (orgAdmin == null) {
          throw new Error(
            `Org admin with email ${org.adminEmail} not found. Seed org admins first and ensure the email matches.`,
          );
        }

        const { adminEmail, ...trueOrg } = org;
        const organization = await this.prisma.organization.create({
          data: {
            ...trueOrg,
            createdById: orgAdmin.id,
            // Link approvedBy for ACTIVE and SUSPENDED orgs
            approvedById:
              org.status === 'ACTIVE' || org.status === 'SUSPENDED'
                ? superAdmin.id
                : null,
          },
        });

        console.log(
          `  Created organization: ${org.name} (${org.status}) - Admin: ${orgAdmin.email}`,
        );

        await this.prisma.user.update({
          where: { id: orgAdmin.id },
          data: {
            organizationId: organization.id,
          },
        });

        console.log(
          `  Linked org admin ${orgAdmin.email} to organization ${org.name}`,
        );

        return organization;
      }),
    ).then((results) => results.filter((org) => org != null));

    console.log(`Organizations seeded: ${this.organizations.length} total`);
    return res;
  }

  async seedEmployees(args: { organizations: Organization[] }) {
    const { organizations } = args;
    console.log('Seeding employees...');

    await Promise.all(
      this.employees.map(async (emp) => {
        const {
          createdByEmail,
          organizationName,
          personalInfo,
          userEmail,
          ...empData
        } = emp;

        const creator = await this.prisma.user.findUnique({
          where: { email: createdByEmail },
        });

        if (creator == null) {
          console.warn(
            `  Warning: Creator ${createdByEmail} not found. Skipping employee ${personalInfo.firstName} ${personalInfo.lastName}.`,
          );
          return;
        }

        const organization = organizations.find(
          (org) => org.name === organizationName,
        );

        if (organization == null) {
          console.warn(
            `  Warning: Organization ${organizationName} not found. Skipping employee ${personalInfo.firstName} ${personalInfo.lastName}.`,
          );
          return;
        }

        const user = userEmail
          ? await this.prisma.user.findUnique({ where: { email: userEmail } })
          : null;

        await this.prisma.employee.create({
          data: {
            ...empData,
            organization: { connect: { id: organization.id } },
            ...(user ? { user: { connect: { id: user.id } } } : {}),
            personalInfo: { create: personalInfo },
            // ...(empData.branchId
            //   ? { branch: { connect: { id: empData.branchId } } }
            //   : {}),
            // ...(empData.departmentId
            //   ? { department: { connect: { id: empData.departmentId } } }
            //   : {}),
            // ...(empData.lineManagerId
            //   ? { lineManager: { connect: { id: empData.lineManagerId } } }
            //   : {}),
          },
        });

        console.log(
          `  Created employee: ${personalInfo.firstName} ${personalInfo.lastName} - ${empData.jobTitle}`,
        );
      }),
    );

    console.log(`Employees seeded: ${this.employees.length} total`);
  }

  async run() {
    await this.seedUsers();
    const organizations = await this.seedOrganizations();

    await this.seedEmployees({ organizations });
  }
}

//     {
//   name: 'Green Energy Partners',
//   description:
//     'Sustainable energy consulting firm focused on renewable energy solutions for businesses.',
//   website: 'https://greenenergy.example.com',
//   status: 'ACTIVE',
//   createdAt: new Date('2025-11-01'),
//   approvedAt: new Date('2025-11-03'),
//   adminEmail: 'admin@greenenergy.example.com',
// },
// {
//   name: 'HealthFirst Medical Group',
//   description:
//     'Healthcare management organization operating multiple clinics and medical facilities.',
//   website: 'https://healthfirst.example.com',
//   status: 'PENDING',
//   createdAt: new Date('2026-01-20'),
//   adminEmail: 'admin@healthfirst.example.com',
// },
// {
//   name: 'Urban Construction Ltd',
//   description:
//     'Commercial and residential construction company with projects across the region.',
//   website: 'https://urbanconstruction.example.com',
//   status: 'PENDING',
//   createdAt: new Date('2026-01-28'),
//   adminEmail: 'admin@urbanconstruction.example.com',
// },
// {
//   name: 'Fraudulent Enterprises Inc',
//   description:
//     'Application rejected due to suspicious business practices and unverifiable information.',
//   website: null,
//   status: 'REJECTED',
//   createdAt: new Date('2025-12-10'),
//   adminEmail: 'admin@fraudulent.example.com',
// },
// {
//   name: 'DataSync Analytics',
//   description:
//     'Business intelligence and data analytics firm helping companies make data-driven decisions.',
//   website: 'https://datasync.example.com',
//   status: 'SUSPENDED',
//   createdAt: new Date('2025-09-05'),
//   approvedAt: new Date('2025-09-08'),
//   adminEmail: 'admin@datasync.example.com',
// },
