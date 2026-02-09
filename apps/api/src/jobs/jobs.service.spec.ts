import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { PrismaService } from '../database/prisma.service';

const ORG_ID = 'org-1';
const OTHER_ORG_ID = 'org-2';
const JOB_ID = 'job-1';

const baseJob = {
  id: JOB_ID,
  organizationId: ORG_ID,
  title: 'Frontend Developer',
  department: 'DEVELOPMENT',
  employmentType: 'FULL_TIME',
  description: null,
  status: 'ACTIVE',
  hiringManagerId: null,
  quantity: 1,
  expectedClosingDate: null,
  location: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  User: null,
  JobTag: [],
  JobHiringStage: [],
  Application: [],
  _count: { Application: 0 },
};

function createMockPrisma() {
  return {
    job: {
      findMany: jest.fn().mockResolvedValue([baseJob]),
      findUnique: jest.fn().mockResolvedValue(baseJob),
      findUniqueOrThrow: jest.fn().mockResolvedValue(baseJob),
      count: jest.fn().mockResolvedValue(1),
      create: jest.fn().mockResolvedValue(baseJob),
      update: jest.fn().mockResolvedValue(baseJob),
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      delete: jest.fn().mockResolvedValue(baseJob),
    },
    jobTag: {
      createMany: jest.fn().mockResolvedValue({ count: 0 }),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    jobHiringStage: {
      createMany: jest.fn().mockResolvedValue({ count: 0 }),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    hiringStage: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    $transaction: jest.fn((fn: (tx: any) => Promise<any>) => {
      // The transaction callback receives the same mock prisma
      return fn(createMockPrisma());
    }),
  };
}

describe('JobsService', () => {
  let service: JobsService;
  let prisma: ReturnType<typeof createMockPrisma>;

  beforeEach(async () => {
    prisma = createMockPrisma();

    const module: TestingModule = await Test.createTestingModule({
      providers: [JobsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<JobsService>(JobsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return jobs scoped to the organization', async () => {
      const result = await service.findAll({ organizationId: ORG_ID });

      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ organizationId: ORG_ID }),
        }),
      );
      expect(result.jobs).toHaveLength(1);
      expect(result.jobs[0]!.id).toBe(JOB_ID);
    });

    it('should filter by status when provided', async () => {
      await service.findAll({
        organizationId: ORG_ID,
        status: 'ACTIVE' as any,
      });

      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'ACTIVE' }),
        }),
      );
    });

    it('should filter by search term when provided', async () => {
      await service.findAll({ organizationId: ORG_ID, search: 'frontend' });

      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            title: { contains: 'frontend', mode: 'insensitive' },
          }),
        }),
      );
    });

    it('should paginate results', async () => {
      await service.findAll({ organizationId: ORG_ID, page: 2, limit: 10 });

      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a job by id within the organization', async () => {
      const result = await service.findOne(JOB_ID, ORG_ID);
      expect(result.id).toBe(JOB_ID);
    });

    it('should throw NotFoundException when job does not exist', async () => {
      prisma.job.findUnique.mockResolvedValueOnce(null);

      await expect(service.findOne('nonexistent', ORG_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException for cross-org access', async () => {
      await expect(service.findOne(JOB_ID, OTHER_ORG_ID)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('create', () => {
    it('should create a job within a transaction', async () => {
      const dto = {
        title: 'Backend Developer',
        department: 'DEVELOPMENT' as any,
        employmentType: 'FULL_TIME' as any,
      };

      const result = await service.create(ORG_ID, dto);
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should create job tags when tagIds are provided', async () => {
      const txPrisma = createMockPrisma();
      prisma.$transaction.mockImplementationOnce((fn: any) => fn(txPrisma));

      const dto = {
        title: 'Designer',
        department: 'DESIGN' as any,
        employmentType: 'FULL_TIME' as any,
        tagIds: ['tag-1', 'tag-2'],
      };

      await service.create(ORG_ID, dto);
      expect(txPrisma.jobTag.createMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({ tagId: 'tag-1' }),
            expect.objectContaining({ tagId: 'tag-2' }),
          ]),
        }),
      );
    });

    it('should use custom hiring stages when provided', async () => {
      const txPrisma = createMockPrisma();
      prisma.$transaction.mockImplementationOnce((fn: any) => fn(txPrisma));

      const dto = {
        title: 'PM',
        department: 'MANAGEMENT' as any,
        employmentType: 'FULL_TIME' as any,
        hiringStages: [
          { hiringStageId: 'hs-1', orderIndex: 0 },
          { hiringStageId: 'hs-2', orderIndex: 1 },
        ],
      };

      await service.create(ORG_ID, dto);
      expect(txPrisma.jobHiringStage.createMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({ hiringStageId: 'hs-1', orderIndex: 0 }),
            expect.objectContaining({ hiringStageId: 'hs-2', orderIndex: 1 }),
          ]),
        }),
      );
    });

    it('should fall back to global stages when no custom stages provided', async () => {
      const txPrisma = createMockPrisma();
      txPrisma.hiringStage.findMany.mockResolvedValueOnce([
        { id: 'global-1', organizationId: ORG_ID, orderIndex: 0 },
        { id: 'global-2', organizationId: ORG_ID, orderIndex: 1 },
      ]);
      prisma.$transaction.mockImplementationOnce((fn: any) => fn(txPrisma));

      const dto = {
        title: 'QA',
        department: 'DEVELOPMENT' as any,
        employmentType: 'FULL_TIME' as any,
      };

      await service.create(ORG_ID, dto);
      expect(txPrisma.hiringStage.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { organizationId: ORG_ID },
        }),
      );
      expect(txPrisma.jobHiringStage.createMany).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a job within the organization', async () => {
      const result = await service.update(JOB_ID, ORG_ID, { title: 'Updated' });
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when job does not exist', async () => {
      prisma.job.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.update('nonexistent', ORG_ID, { title: 'X' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for cross-org update', async () => {
      await expect(
        service.update(JOB_ID, OTHER_ORG_ID, { title: 'X' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('delete', () => {
    it('should soft-delete a job within the organization', async () => {
      await service.delete(JOB_ID, ORG_ID);
      expect(prisma.job.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: JOB_ID },
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        }),
      );
    });

    it('should throw NotFoundException when job does not exist', async () => {
      prisma.job.findUnique.mockResolvedValueOnce(null);

      await expect(service.delete('nonexistent', ORG_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException for cross-org delete', async () => {
      await expect(service.delete(JOB_ID, OTHER_ORG_ID)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
