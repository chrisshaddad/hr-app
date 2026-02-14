import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import type {
  JobResponse,
  JobListResponse,
  ApplyJobRequest,
  ApplyJobResponse,
  CreateJobRequest,
  PublicJobResponse,
  JobApplicationsResponse,
} from '@repo/contracts';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../database/prisma.service';
import { JobStatus, ApplicationStatus, CommunicationType } from '@repo/db';

@Injectable()
export class JobsService {
  private readonly publicAppUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {
    this.publicAppUrl = process.env.PUBLIC_APP_URL || 'http://localhost:3000';
  }

  private getApplyUrl(jobId: string): string {
    return `${this.publicAppUrl}/apply/jobs/${jobId}`;
  }

  private mapToJobResponse(job: any): JobResponse {
    return {
      ...job,
      applyUrl: this.getApplyUrl(job.id),
      numberOfCandidates: job._count?.applications || 0,
    };
  }

  // Create job
  async create(
    data: CreateJobRequest,
    organizationId: string,
  ): Promise<JobResponse> {
    const job = await this.prisma.job.create({
      data: {
        organizationId,
        title: data.title,
        status: JobStatus.draft,
        description: data.description,
        location: data.location || null,
        employmentType: data.employmentType,
        department: data.department || null,
        experienceLevel: data.experienceLevel || null,
        expectedClosingDate: data.expectedClosingDate || null,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    return this.mapToJobResponse(job);
  }

  async updateStatus(
    jobId: string,
    status: string,
    organizationId: string,
  ): Promise<JobResponse> {
    const job = await this.prisma.job.findFirst({
      where: {
        id: jobId,
        organizationId,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const updatedJob = await this.prisma.job.update({
      where: { id: jobId },
      data: { status: status as any },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    return this.mapToJobResponse(updatedJob);
  }

  // Get all jobs by organization id
  async findAll(
    organizationId: string,
    options: { page?: number; limit?: number } = {},
  ): Promise<JobListResponse> {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where: { organizationId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              applications: true,
            },
          },
        },
      }),
      this.prisma.job.count({ where: { organizationId } }),
    ]);

    return {
      page,
      total,
      limit,
      totalPages: Math.ceil(total / limit),
      jobs: jobs.map((job) => this.mapToJobResponse(job)),
    };
  }

  // Get public job details (for apply page)
  async findPublicJob(jobId: string): Promise<PublicJobResponse> {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        title: true,
        description: true,
        location: true,
        employmentType: true,
        experienceLevel: true,
        department: true,
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return job as PublicJobResponse;
  }

  /**
   * Get all applications for a job
   * Multi-tenant: Only returns applications for jobs in the user's organization
   */
  async findApplicationsForJob(
    jobId: string,
    organizationId: string,
  ): Promise<JobApplicationsResponse> {
    const job = await this.prisma.job.findFirst({
      where: {
        id: jobId,
        organizationId,
      },
      select: {
        id: true,
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const applications = await this.prisma.jobApplication.findMany({
      where: {
        jobId,
        organizationId,
      },
      select: {
        id: true,
        status: true,
        appliedAt: true,
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            _count: {
              select: {
                communications: true,
              },
            },
          },
        },
      },
      orderBy: {
        appliedAt: 'desc',
      },
    });

    return {
      applications: applications.map((app) => ({
        status: app.status,
        applicationId: app.id,
        appliedAt: app.appliedAt,
        candidate: {
          firstName: app.candidate.firstName,
          lastName: app.candidate.lastName,
          email: app.candidate.email,
          phone: app.candidate.phone,
          communicationCount: app.candidate._count.communications || 0,
        },
      })),
    };
  }

  // Apply to a job (public endpoint)
  async applyToJob(
    jobId: string,
    data: ApplyJobRequest,
  ): Promise<ApplyJobResponse> {
    // 1. Resolve job and its organization (no tenant restriction here - public)
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        organizationId: true,
        status: true,
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // TODO: Enforce that only PUBLISHED jobs can accept applications
    // Uncomment when ready:
    // if (job.status !== JobStatus.published) {
    //   throw new BadRequestException('This job is not accepting applications');
    // }

    // This ensures candidates are scoped to the job's organization
    const organizationId = job.organizationId;
    if (!organizationId) {
      throw new NotFoundException('Job organization not found');
    }

    // 3. Normalize email for consistent lookup
    const normalizedEmail = data.email.toLowerCase().trim();

    // 4. Check for existing candidate in this organization
    const existingCandidate = await this.prisma.candidate.findUnique({
      where: {
        organizationId_email: {
          organizationId,
          email: normalizedEmail,
        },
      } as any,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
      },
    });

    // Check for duplicate application BEFORE creating anything
    if (existingCandidate) {
      const existingApplication = await this.prisma.jobApplication.findUnique({
        where: {
          jobId_candidateId: {
            jobId: job.id,
            candidateId: existingCandidate.id,
          },
        },
        select: { id: true },
      });

      if (existingApplication) {
        throw new ConflictException('Already applied to this job');
      }
    }

    // Parse fullName safely
    const nameParts = data.fullName.trim().split(/\s+/).filter(Boolean);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || firstName;

    //  Upsert Candidate safely (don't overwrite existing data)
    const candidate = await this.prisma.candidate.upsert({
      where: {
        organizationId_email: {
          organizationId,
          email: normalizedEmail,
        },
      } as any,
      update: {
        // Only update phone if existing is null and new value is provided
        phone: existingCandidate?.phone || data.phone || null,
      },
      create: {
        organizationId,
        email: normalizedEmail,
        firstName,
        lastName,
        phone: data.phone || null,
      } as any,
    });

    // Create JobApplication
    const application = await this.prisma.jobApplication.create({
      data: {
        organizationId,
        jobId: job.id,
        candidateId: candidate.id,
        status: ApplicationStatus.APPLIED,
        coverLetter: data.coverLetter || null,
      },
    });

    // Create ApplicationStatusHistory record
    await this.prisma.applicationStatusHistory.create({
      data: {
        applicationId: application.id,
        status: ApplicationStatus.APPLIED,
        notes: 'Application submitted via public apply form',
      },
    });

    // Create communication record for the application confirmation email
    const jobTitle = await this.prisma.job.findUnique({
      where: { id: jobId },
      select: { title: true },
    });

    await this.prisma.communication.create({
      data: {
        candidateId: candidate.id,
        applicationId: application.id,
        type: CommunicationType.EMAIL,
        subject: `Application Received - ${jobTitle?.title || 'Job Application'}`,
        body: `Dear ${firstName},\n\nThank you for applying to ${jobTitle?.title || 'our position'}. We have received your application and will review it shortly.\n\nBest regards,\nThe Hiring Team`,
        isAutoGenerated: true,
      },
    });

    await this.mailService.sendEmail({
      to: candidate.email,
      from: 'no-reply@humanline.com',
      subject: `Application Received - ${jobTitle?.title || 'Job Application'}`,
      text: `Dear ${firstName},\n\nThank you for applying to ${jobTitle?.title || 'our position'}. We have received your application and will review it shortly.\n\nBest regards,\nThe Hiring Team`,
    });

    return {
      applicationId: application.id,
      message: 'Application submitted successfully',
    };
  }

  /**
   * Apply to a job internally (HR/ADMIN adds a candidate to a job)
   *
   * - Multi-tenant safe: job must belong to the user's organization
   * - Reuses the same rules as public apply:
   *   - Candidate lookup by (organizationId, email)
   *   - Unique application per (jobId, candidateId)
   *   - Creates JobApplication + initial ApplicationStatusHistory
   */
  async applyToJobInternal(
    jobId: string,
    data: ApplyJobRequest,
    organizationId: string,
    createdByUserId: string,
  ): Promise<ApplyJobResponse> {
    // 1. Ensure the job exists and belongs to the user's organization
    const job = await this.prisma.job.findFirst({
      where: {
        id: jobId,
        organizationId,
      },
      select: {
        id: true,
        organizationId: true,
        status: true,
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // 2. Normalize email
    const normalizedEmail = data.email.toLowerCase().trim();

    // 3. Check for existing candidate in this organization
    const existingCandidate = await this.prisma.candidate.findUnique({
      where: {
        organizationId_email: {
          organizationId,
          email: normalizedEmail,
        },
      } as any,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
      },
    });

    // 4. Prevent duplicate applications
    if (existingCandidate) {
      const existingApplication = await this.prisma.jobApplication.findUnique({
        where: {
          jobId_candidateId: {
            jobId: job.id,
            candidateId: existingCandidate.id,
          },
        },
        select: { id: true },
      });

      if (existingApplication) {
        throw new ConflictException('Already applied to this job');
      }
    }

    // 5. Parse fullName safely
    const nameParts = data.fullName.trim().split(/\s+/).filter(Boolean);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || firstName;

    // 6. Upsert Candidate (same behavior as public apply)
    const candidate = await this.prisma.candidate.upsert({
      where: {
        organizationId_email: {
          organizationId,
          email: normalizedEmail,
        },
      } as any,
      update: {
        phone: existingCandidate?.phone || data.phone || null,
      },
      create: {
        organizationId,
        email: normalizedEmail,
        firstName,
        lastName,
        phone: data.phone || null,
      } as any,
    });

    // 7. Create JobApplication
    const application = await this.prisma.jobApplication.create({
      data: {
        organizationId,
        jobId: job.id,
        candidateId: candidate.id,
        status: ApplicationStatus.APPLIED,
        coverLetter: data.coverLetter || null,
        // If you later add createdById/source fields, this is where to set them
      },
    });

    // 8. Create ApplicationStatusHistory record
    await this.prisma.applicationStatusHistory.create({
      data: {
        applicationId: application.id,
        status: ApplicationStatus.APPLIED,
        notes: 'Application created internally by HR',
        // Prisma model uses changedById as the foreign key field
        changedById: createdByUserId,
      },
    });

    const jobTitle = await this.prisma.job.findUnique({
      where: { id: jobId },
      select: { title: true },
    });

    await this.prisma.communication.create({
      data: {
        candidateId: candidate.id,
        applicationId: application.id,
        type: CommunicationType.EMAIL,
        subject: `Application Received - ${jobTitle?.title || 'Job Application'}`,
        body: `Dear ${firstName},\n\nThank you for applying to ${jobTitle?.title || 'our position'}. We have received your application and will review it shortly.\n\nBest regards,\nThe Hiring Team`,
        isAutoGenerated: true,
        sentById: createdByUserId,
      },
    });

    // Send email to candidate
    await this.mailService.sendEmail({
      to: candidate.email,
      from: 'no-reply@humanline.com',
      subject: `Application Received - ${jobTitle?.title || 'Job Application'}`,
      text: `Dear ${firstName},\n\nThank you for applying to ${jobTitle?.title || 'our position'}. We have received your application and will review it shortly.\n\nBest regards,\nThe Hiring Team`,
    });

    return {
      applicationId: application.id,
      message: 'Application submitted successfully',
    };
  }

  /**
   * Update application status
   * Multi-tenant: Only updates applications for jobs in the user's organization
   */
  async updateApplicationStatus(
    applicationId: string,
    status: string,
    organizationId: string,
    userId: string,
  ): Promise<void> {
    const application = await this.prisma.jobApplication.findFirst({
      where: {
        id: applicationId,
        organizationId,
      },
      include: {
        job: {
          select: {
            id: true,
            organizationId: true,
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    await this.prisma.jobApplication.update({
      where: { id: applicationId },
      data: { status: status as any },
    });

    await this.prisma.applicationStatusHistory.create({
      data: {
        applicationId: application.id,
        status: status as any,
        notes: `Status changed to ${status}`,
        changedById: userId,
      },
    });
  }
}
