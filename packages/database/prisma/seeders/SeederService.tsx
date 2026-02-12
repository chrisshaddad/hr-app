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

export class SeederService {
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
      name: 'Sarah Chen (Admin)',
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
      status: 'ON_BOARDING' as const,
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
      status: 'OFF_BOARDING' as const,
      jobTitle: 'UX Designer',
      joinDate: new Date('2025-09-01'),
      timezone: 'America/New_York',
      createdByEmail: this.orgAdmins[0].email,
      organizationName: this.organizations[0].name,
      personalInfo: {
        lastName: 'Brown',
        firstName: 'Charlie',
        email: 'charlie.brown@techcorp.example.com',
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

        const findOrgAdminSeedInput = this.orgAdmins.find(
          (admin) => admin.email === org.adminEmail,
        );

        await this.prisma.employee.create({
          data: {
            organization: { connect: { id: organization.id } },
            user: { connect: { id: orgAdmin.id } },
            jobTitle: 'Organization Admin',
            joinDate: new Date(),
            timezone: 'UTC',
            status: 'ACTIVE',
            personalInfo: {
              create: {
                firstName: findOrgAdminSeedInput?.name.split(' ')[0] || 'Org',
                lastName: findOrgAdminSeedInput?.name.split(' ')[1] || 'Admin',
                email: orgAdmin.email,
              },
            },
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
