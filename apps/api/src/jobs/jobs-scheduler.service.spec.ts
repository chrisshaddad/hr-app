import { Test, TestingModule } from '@nestjs/testing';
import { JobsSchedulerService } from './jobs-scheduler.service';
import { PrismaService } from '../database/prisma.service';

describe('JobsSchedulerService', () => {
  let service: JobsSchedulerService;
  let prisma: { job: { updateMany: jest.Mock } };

  beforeEach(async () => {
    prisma = {
      job: {
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsSchedulerService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<JobsSchedulerService>(JobsSchedulerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should auto-close expired ACTIVE and DRAFT jobs', async () => {
    prisma.job.updateMany.mockResolvedValueOnce({ count: 3 });

    await service.handleExpiredJobs();

    expect(prisma.job.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          expectedClosingDate: expect.objectContaining({
            lt: expect.any(Date),
          }),
          status: { in: ['ACTIVE', 'DRAFT'] },
        }),
        data: expect.objectContaining({ status: 'CLOSED' }),
      }),
    );
  });

  it('should not fail when no jobs are expired', async () => {
    prisma.job.updateMany.mockResolvedValueOnce({ count: 0 });

    await expect(service.handleExpiredJobs()).resolves.not.toThrow();
  });
});
