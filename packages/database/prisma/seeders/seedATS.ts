import { PrismaClient, User } from '../../src/generated/prisma/client';

export async function seedATS(prisma: PrismaClient) {
  console.log('\n🌱 Seeding ATS data...\n');

  // 1. Create or get Onramp organization
  let onrampOrg = await prisma.organization.findFirst({
    where: { name: 'Onramp' },
  });

  if (!onrampOrg) {
    const superAdmin = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' },
    });
    if (!superAdmin) {
      throw new Error('No SUPER_ADMIN found. Please seed super admins first.');
    }

    // Create a temporary user to be the creator (required by schema)
    // We'll update this after creating the org
    const tempCreator = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' },
    });

    onrampOrg = await prisma.organization.create({
      data: {
        name: 'Onramp',
        description: 'Onramp ATS Demo Company',
        website: 'https://onramp.example.com',
        status: 'ACTIVE',
        createdById: tempCreator!.id,
        approvedById: superAdmin.id,
        approvedAt: new Date(),
      },
    });
    console.log(`  ✓ Created organization: ${onrampOrg.name}`);
  } else {
    console.log(`  ✓ Organization already exists: ${onrampOrg.name}`);
  }

  // 2. Create team members for Onramp
  const teamMembers = [
    { email: 'ali@onramp.com', name: 'Ali', role: 'ADMIN' as const },
    { email: 'dana@onramp.com', name: 'Dana', role: 'HR' as const },
    { email: 'dima@onramp.com', name: 'Dima', role: 'EMPLOYEE' as const },
  ];

  const createdUsers: User[] = [];
  for (const member of teamMembers) {
    const user = await prisma.user.upsert({
      where: { email: member.email },
      update: {
        organizationId: onrampOrg.id,
        role: member.role,
        isConfirmed: true,
        name: member.name,
      },
      create: {
        email: member.email,
        name: member.name,
        role: member.role,
        organizationId: onrampOrg.id,
        isConfirmed: true,
      },
    });
    createdUsers.push(user);
    console.log(`  ✓ Created/updated user: ${member.email} (${member.role})`);
  }

  // 3. Create a Job
  const job = await prisma.job.upsert({
    where: {
      // Use a unique constraint or create with a known ID
      id: '00000000-0000-0000-0000-000000000001', // Fixed ID for upsert
    },
    update: {
      title: 'Senior Software Engineer',
      description:
        'We are looking for an experienced software engineer to join our team. You will work on cutting-edge projects and collaborate with a talented team.',
      location: 'Remote',
      employmentType: 'Full Time',
      department: 'Development',
      experienceLevel: 'Senior',
      expectedClosingDate: '2026-03-31',
      status: 'published',
      organizationId: onrampOrg.id,
    },
    create: {
      id: '00000000-0000-0000-0000-000000000001', // Fixed ID for upsert
      organizationId: onrampOrg.id,
      title: 'Senior Software Engineer',
      description:
        'We are looking for an experienced software engineer to join our team. You will work on cutting-edge projects and collaborate with a talented team.',
      location: 'Remote',
      employmentType: 'Full Time',
      department: 'Development',
      experienceLevel: 'Senior',
      expectedClosingDate: '2026-03-31',
      status: 'published',
    },
  });
  console.log(`  ✓ Created/updated job: ${job.title}`);

  // 4. Create a Candidate
  const candidate = await prisma.candidate.upsert({
    where: { email: 'john.doe@example.com' },
    update: {
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
    },
    create: {
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
    },
  });
  console.log(`  ✓ Created/updated candidate: ${candidate.email}`);

  // 5. Create a JobApplication
  const application = await prisma.jobApplication.upsert({
    where: {
      jobId_candidateId: {
        jobId: job.id,
        candidateId: candidate.id,
      },
    },
    update: {
      organizationId: onrampOrg.id,
      status: 'APPLIED',
      coverLetter:
        'I am very interested in this position and believe my experience aligns well with your requirements.',
    },
    create: {
      jobId: job.id,
      candidateId: candidate.id,
      organizationId: onrampOrg.id,
      status: 'APPLIED',
      coverLetter:
        'I am very interested in this position and believe my experience aligns well with your requirements.',
    },
  });
  console.log(
    `  ✓ Created/updated application: ${application.id} (Status: ${application.status})`,
  );

  // 6. Create an ApplicationStatusHistory entry (if it doesn't exist)
  const existingHistory = await prisma.applicationStatusHistory.findFirst({
    where: {
      applicationId: application.id,
      status: 'APPLIED',
    },
  });

  if (!existingHistory) {
    await prisma.applicationStatusHistory.create({
      data: {
        applicationId: application.id,
        status: 'APPLIED',
        changedById: createdUsers.find((u) => u.role === 'HR')?.id,
        notes: 'Application received and moved to Applied status.',
      },
    });
    console.log(`  ✓ Created status history entry`);
  } else {
    console.log(`  ✓ Status history entry already exists`);
  }

  console.log('\n✅ ATS seeding completed!');
}
