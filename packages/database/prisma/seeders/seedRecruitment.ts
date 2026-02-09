import { PrismaClient } from '../../src/generated/prisma/client';

interface JobSeedInput {
  jobTitle: string;
  status: 'ACTIVE' | 'CLOSED' | 'UNACTIVE';
  department: string;
  location: string;
  candidatesApplied: number;
}

const JOBS: JobSeedInput[] = [
  {
    jobTitle: '3D Designer',
    status: 'ACTIVE',
    department: 'Designer',
    location: 'Unpixel HQ',
    candidatesApplied: 0,
  },
  {
    jobTitle: 'UI UX Designer',
    status: 'ACTIVE',
    department: 'Designer',
    location: 'Unpixel HQ',
    candidatesApplied: 10,
  },
  {
    jobTitle: 'Senior Android Developer',
    status: 'CLOSED',
    department: 'IT',
    location: 'Unpixel Indonesia',
    candidatesApplied: 115,
  },
  {
    jobTitle: 'Senior Android Developer',
    status: 'UNACTIVE',
    department: 'IT',
    location: 'Unpixel Indonesia',
    candidatesApplied: 115,
  },
];

const lockedStages = ['Applied', 'Offered', 'Hired', 'Rejected'];

function statusToPrismaStatus(status: JobSeedInput['status']) {
  if (status === 'UNACTIVE') return 'PAUSED';
  return status;
}

export async function seedRecruitment(prisma: PrismaClient) {
  console.log('Seeding recruitment data...');

  const org = await prisma.organization.findFirst({
    where: { status: 'ACTIVE' },
  });
  if (!org) {
    console.warn('No active organization found. Recruitment seeding skipped.');
    return;
  }

  const orgAdmin = await prisma.user.findFirst({
    where: {
      organizationId: org.id,
      role: 'ORG_ADMIN',
    },
  });
  if (!orgAdmin) {
    console.warn(
      `No ORG_ADMIN found in organization ${org.name}. Recruitment seeding skipped.`,
    );
    return;
  }

  const branchMap = new Map<string, string>();
  for (const location of Array.from(new Set(JOBS.map((job) => job.location)))) {
    let branch = await prisma.branch.findFirst({
      where: { organizationId: org.id, name: location },
    });

    if (!branch) {
      branch = await prisma.branch.create({
        data: {
          organizationId: org.id,
          name: location,
          country: 'Indonesia',
          city: 'Jakarta',
          state: 'DKI Jakarta',
        },
      });
    }
    branchMap.set(location, branch.id);
  }

  const departmentMap = new Map<string, string>();
  for (const departmentName of Array.from(
    new Set(JOBS.map((job) => job.department)),
  )) {
    const branchId =
      branchMap.get('Unpixel HQ') || Array.from(branchMap.values())[0];
    if (!branchId) continue;
    let department = await prisma.department.findFirst({
      where: { branchId, name: departmentName },
    });

    if (!department) {
      department = await prisma.department.create({
        data: {
          branchId,
          name: departmentName,
          description: `${departmentName} department`,
        },
      });
    }
    departmentMap.set(departmentName, department.id);
  }

  const createdAt = new Date(Date.now() - 3 * 60 * 1000);
  const createdJobs: { title: string; id: string }[] = [];

  for (const [index, job] of JOBS.entries()) {
    const departmentId = departmentMap.get(job.department);
    const officeId = branchMap.get(job.location);
    if (!departmentId) continue;

    const existingJob = await prisma.jobListing.findFirst({
      where: {
        organizationId: org.id,
        title: job.jobTitle,
        departmentId,
        officeId: officeId || null,
      },
    });

    if (existingJob) {
      createdJobs.push({ title: existingJob.title, id: existingJob.id });
      continue;
    }

    const createdJob = await prisma.jobListing.create({
      data: {
        organizationId: org.id,
        departmentId,
        officeId,
        title: job.jobTitle,
        description: `${job.jobTitle} role seeded for recruitment UI testing.`,
        status: statusToPrismaStatus(job.status),
        employmentType: index === 2 ? 'CONTRACT' : 'FULL_TIME',
        openingsQuantity: index === 0 ? 2 : 1,
        closingDate: new Date('2026-03-30'),
        createdById: orgAdmin.id,
        createdAt,
        publishedAt: new Date(),
        skills: [],
        benefits: [],
      },
    });

    const stages =
      createdJob.title === 'Senior Android Developer' &&
      createdJob.status === 'PAUSED'
        ? [
            'Applied',
            'Portfolio Review',
            'Interview',
            'Offered',
            'Hired',
            'Rejected',
          ]
        : ['Applied', 'Screening', 'Interview', 'Offered', 'Hired', 'Rejected'];

    for (const [rank, title] of stages.entries()) {
      await prisma.workflowStage.create({
        data: {
          jobListingId: createdJob.id,
          title,
          rank: rank + 1,
          isLocked: lockedStages.includes(title),
        },
      });
    }

    createdJobs.push({ title: createdJob.title, id: createdJob.id });
  }

  const uiUxJob = createdJobs.find((job) => job.title === 'UI UX Designer');
  const designerJob = createdJobs.find((job) => job.title === '3D Designer');

  if (uiUxJob) {
    const candidates = [
      {
        id: 'C-001',
        firstName: 'Alex',
        lastName: 'Johnson',
        email: 'alex.j@example.com',
        phoneNumber: '081234551234',
        cvUrl: 'https://example.com/alex-johnson-cv.pdf',
        appliedDate: new Date('2024-05-10'),
        stageTitle: 'Applied',
      },
      {
        id: 'C-005',
        firstName: 'Sarah',
        lastName: 'Miller',
        email: 's.miller@webmail.com',
        phoneNumber: '082222110009',
        cvUrl: 'https://example.com/sarah-miller-cv.pdf',
        appliedDate: new Date('2024-05-08'),
        stageTitle: 'Interview',
      },
    ];

    for (const candidateSeed of candidates) {
      let candidate = await prisma.candidate.findFirst({
        where: { email: candidateSeed.email },
      });

      if (!candidate) {
        candidate = await prisma.candidate.create({
          data: {
            firstName: candidateSeed.firstName,
            lastName: candidateSeed.lastName,
            email: candidateSeed.email,
            phoneNumber: candidateSeed.phoneNumber,
            cvUrl: candidateSeed.cvUrl,
            source: 'DIRECT_APPLICATION',
          },
        });
      }

      const stage = await prisma.workflowStage.findFirst({
        where: { jobListingId: uiUxJob.id, title: candidateSeed.stageTitle },
      });
      if (!stage) continue;

      const existingPlacement = await prisma.workflowStageCandidate.findFirst({
        where: {
          candidateId: candidate.id,
          jobListingId: uiUxJob.id,
          workflowStageId: stage.id,
          isActive: true,
        },
      });

      if (!existingPlacement) {
        await prisma.workflowStageCandidate.create({
          data: {
            candidateId: candidate.id,
            jobListingId: uiUxJob.id,
            workflowStageId: stage.id,
            isActive: true,
            addedAt: candidateSeed.appliedDate,
          },
        });
      }
    }
  }

  if (designerJob) {
    let candidate = await prisma.candidate.findFirst({
      where: { email: 'pristia@gmail.com' },
    });

    if (!candidate) {
      candidate = await prisma.candidate.create({
        data: {
          firstName: 'Pristia',
          lastName: 'Candra',
          email: 'pristia@gmail.com',
          phoneNumber: '089318298493',
          cvUrl: 'https://example.com/pristia-candra-cv.pdf',
          source: 'DIRECT_APPLICATION',
          coverLetter: 'You are have talented, love your work!',
        },
      });
    }

    const appliedStage = await prisma.workflowStage.findFirst({
      where: { jobListingId: designerJob.id, title: 'Applied' },
    });
    if (appliedStage) {
      const existingPlacement = await prisma.workflowStageCandidate.findFirst({
        where: {
          candidateId: candidate.id,
          jobListingId: designerJob.id,
          workflowStageId: appliedStage.id,
          isActive: true,
        },
      });
      if (!existingPlacement) {
        await prisma.workflowStageCandidate.create({
          data: {
            candidateId: candidate.id,
            jobListingId: designerJob.id,
            workflowStageId: appliedStage.id,
            isActive: true,
          },
        });
      }

      await prisma.boardActivity.create({
        data: {
          candidateId: candidate.id,
          memberId: orgAdmin.id,
          toStageId: appliedStage.id,
          fromStageId: null,
          activityType: 'MOVED',
          occurredAt: new Date(),
          notes: 'Seeded move to Applied',
        },
      });
    }
  }

  console.log('Recruitment data seeded successfully.');
}
