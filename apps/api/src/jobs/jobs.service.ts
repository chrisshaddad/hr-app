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
import { JobStatus, ApplicationStatus } from '@repo/db';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class JobsService {
  private readonly publicAppUrl: string;

  constructor(private readonly prisma: PrismaService) {
    this.publicAppUrl = process.env.PUBLIC_APP_URL || 'http://localhost:3000';
  }

  private getApplyUrl(jobId: string): string {
    return `${this.publicAppUrl}/apply/jobs/${jobId}`;
  }

  private mapToJobResponse(job: any): JobResponse {
    return {
      ...job,
      applyUrl: this.getApplyUrl(job.id),
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
      },
    });

    return this.mapToJobResponse(job);
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
            firstName: true,
            lastName: true,
            email: true,
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
        },
      })),
    };
  }

  // Apply to a job (public endpoint)
  async applyToJob(
    jobId: string,
    data: ApplyJobRequest,
  ): Promise<ApplyJobResponse> {
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

    return {
      applicationId: application.id,
      message: 'Application submitted successfully',
    };
  }
}
