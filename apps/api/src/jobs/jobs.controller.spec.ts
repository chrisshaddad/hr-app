import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';

const mockJobsService = {
  findAll: jest.fn().mockResolvedValue({ jobs: [], total: 0 }),
  findOne: jest.fn().mockResolvedValue({ id: 'job-1' }),
  create: jest.fn().mockResolvedValue({ id: 'job-1' }),
  update: jest.fn().mockResolvedValue({ id: 'job-1' }),
  delete: jest.fn().mockResolvedValue(undefined),
};

const userWithOrg = {
  id: 'user-1',
  organizationId: 'org-1',
  role: 'ORG_ADMIN',
} as any;

const userWithoutOrg = {
  id: 'user-2',
  organizationId: null,
  role: 'EMPLOYEE',
} as any;

describe('JobsController', () => {
  let controller: JobsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobsController],
      providers: [{ provide: JobsService, useValue: mockJobsService }],
    }).compile();

    controller = module.get<JobsController>(JobsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should pass organizationId from user to service', async () => {
      await controller.findAll(userWithOrg);

      expect(mockJobsService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ organizationId: 'org-1' }),
      );
    });

    it('should throw ForbiddenException if user has no organization', async () => {
      await expect(controller.findAll(userWithoutOrg)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findOne', () => {
    it('should scope findOne by organizationId', async () => {
      await controller.findOne('job-1', userWithOrg);

      expect(mockJobsService.findOne).toHaveBeenCalledWith('job-1', 'org-1');
    });
  });

  describe('create', () => {
    it('should scope create by organizationId', async () => {
      const dto = {
        title: 'Test',
        department: 'DEVELOPMENT',
        employmentType: 'FULL_TIME',
      } as any;

      await controller.create(dto, userWithOrg);

      expect(mockJobsService.create).toHaveBeenCalledWith('org-1', dto);
    });

    it('should throw ForbiddenException if user has no organization', async () => {
      await expect(
        controller.create({} as any, userWithoutOrg),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('delete', () => {
    it('should scope delete by organizationId', async () => {
      await controller.delete('job-1', userWithOrg);

      expect(mockJobsService.delete).toHaveBeenCalledWith('job-1', 'org-1');
    });
  });
});
