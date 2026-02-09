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

  // 4. Create a Candidate (scoped to Onramp organization)
  const candidate = await prisma.candidate.upsert({
    where: {
      organizationId_email: {
        organizationId: onrampOrg.id,
        email: 'john.doe@example.com',
      },
    },
    update: {
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      organizationId: onrampOrg.id,
    },
    create: {
      organizationId: onrampOrg.id,
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

  // 7. Create an Interview with interviewer and feedback
  const existingInterview = await prisma.interview.findFirst({
    where: { applicationId: application.id },
  });

  if (!existingInterview) {
    const interview = await prisma.interview.create({
      data: {
        applicationId: application.id,
        scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        duration: 60, // 60 minutes
        location: 'Virtual - Zoom',
        status: 'SCHEDULED',
        notes: 'Initial screening interview',
      },
    });
    console.log(`  ✓ Created interview: ${interview.id}`);

    // Assign interviewer (Dima - EMPLOYEE)
    const interviewer = createdUsers.find((u) => u.role === 'EMPLOYEE');
    if (interviewer) {
      await prisma.interviewInterviewer.create({
        data: {
          interviewId: interview.id,
          userId: interviewer.id,
        },
      });
      console.log(`  ✓ Assigned interviewer: ${interviewer.email}`);

      // Add interview feedback (simulate completed interview)
      await prisma.interviewFeedback.create({
        data: {
          interviewId: interview.id,
          userId: interviewer.id,
          rating: 4,
          notes:
            'Strong candidate with relevant experience. Good communication skills.',
          strengths: 'Technical skills, problem-solving ability',
          weaknesses: 'Could improve on system design knowledge',
          recommendation: 'HIRE',
        },
      });
      console.log(`  ✓ Created interview feedback`);
    }
  } else {
    console.log(`  ✓ Interview already exists`);
  }

  // 8. Create a Communication (email) record
  const existingCommunication = await prisma.communication.findFirst({
    where: { applicationId: application.id },
  });

  if (!existingCommunication) {
    const hrUser = createdUsers.find((u) => u.role === 'HR');
    await prisma.communication.create({
      data: {
        applicationId: application.id,
        type: 'EMAIL',
        subject: 'Application Received - Senior Software Engineer',
        body: 'Thank you for your interest in the Senior Software Engineer position. We have received your application and will review it shortly.',
        sentById: hrUser?.id,
        sentAt: new Date(),
      },
    });
    console.log(`  ✓ Created communication (email) record`);
  } else {
    console.log(`  ✓ Communication already exists`);
  }

  console.log('\n✅ ATS seeding completed!');
  console.log('\n📋 Onramp Team Login Credentials:');
  console.log(`   Organization: ${onrampOrg.name}`);
  console.log('   Ali:  ali@onramp.com (ADMIN)');
  console.log('   Dana: dana@onramp.com (HR)');
  console.log('   Dima: dima@onramp.com (EMPLOYEE - can conduct interviews)');
  console.log('\n💡 Use magic link authentication to log in.');
}
