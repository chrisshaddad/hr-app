import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type {
  HiringStageListResponse,
  HiringStageItem,
  CreateHiringStageRequest,
  UpdateHiringStageRequest,
  ReorderHiringStagesRequest,
} from '@repo/contracts';

const DEFAULT_STAGES = [
  { name: 'Applied', orderIndex: 0, isDefault: true, isLocked: true },
  { name: 'Screening', orderIndex: 1, isDefault: true, isLocked: false },
  { name: '1st Interview', orderIndex: 2, isDefault: true, isLocked: false },
  { name: '2nd Interview', orderIndex: 3, isDefault: true, isLocked: false },
  { name: 'Offered', orderIndex: 4, isDefault: true, isLocked: true },
  { name: 'Hired', orderIndex: 5, isDefault: true, isLocked: true },
  { name: 'Rejected', orderIndex: 6, isDefault: true, isLocked: true },
];

@Injectable()
export class HiringStagesService {
  constructor(private readonly prisma: PrismaService) {}

  private mapStage(stage: {
    id: string;
    name: string;
    orderIndex: number;
    isDefault: boolean;
    isLocked: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): HiringStageItem {
    return {
      id: stage.id,
      name: stage.name,
      orderIndex: stage.orderIndex,
      isDefault: stage.isDefault,
      isLocked: stage.isLocked,
      createdAt: stage.createdAt,
      updatedAt: stage.updatedAt,
    } as unknown as HiringStageItem;
  }

  async findAll(organizationId: string): Promise<HiringStageListResponse> {
    let stages = await this.prisma.hiringStage.findMany({
      where: { organizationId },
      orderBy: { orderIndex: 'asc' },
    });

    // Seed default stages if none exist
    if (stages.length === 0) {
      const now = new Date();
      await this.prisma.hiringStage.createMany({
        data: DEFAULT_STAGES.map((s) => ({
          id: crypto.randomUUID(),
          organizationId,
          name: s.name,
          orderIndex: s.orderIndex,
          isDefault: s.isDefault,
          isLocked: s.isLocked,
          updatedAt: now,
        })),
      });
      stages = await this.prisma.hiringStage.findMany({
        where: { organizationId },
        orderBy: { orderIndex: 'asc' },
      });
    }

    return {
      stages: stages.map((s) => this.mapStage(s)),
      total: stages.length,
    } as unknown as HiringStageListResponse;
  }

  async create(
    organizationId: string,
    data: CreateHiringStageRequest,
  ): Promise<HiringStageItem> {
    const existing = await this.prisma.hiringStage.findUnique({
      where: {
        organizationId_name: { organizationId, name: data.name },
      },
    });
    if (existing) {
      throw new ConflictException(`Stage "${data.name}" already exists`);
    }

    // Shift stages at or after the target orderIndex
    await this.prisma.hiringStage.updateMany({
      where: {
        organizationId,
        orderIndex: { gte: data.orderIndex },
      },
      data: { orderIndex: { increment: 1 } },
    });

    const stage = await this.prisma.hiringStage.create({
      data: {
        id: crypto.randomUUID(),
        organizationId,
        name: data.name,
        orderIndex: data.orderIndex,
        isLocked: data.isLocked ?? false,
        updatedAt: new Date(),
      },
    });

    return this.mapStage(stage);
  }

  async update(
    id: string,
    organizationId: string,
    data: UpdateHiringStageRequest,
  ): Promise<HiringStageItem> {
    const existing = await this.prisma.hiringStage.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException(`Stage ${id} not found`);
    if (existing.organizationId !== organizationId)
      throw new ForbiddenException('Access denied');
    if (existing.isLocked)
      throw new ForbiddenException('Cannot modify a locked stage');

    const stage = await this.prisma.hiringStage.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
    });

    return this.mapStage(stage);
  }

  async reorder(
    organizationId: string,
    data: ReorderHiringStagesRequest,
  ): Promise<HiringStageListResponse> {
    await this.prisma.$transaction(
      data.stages.map((s) =>
        this.prisma.hiringStage.update({
          where: { id: s.id },
          data: { orderIndex: s.orderIndex, updatedAt: new Date() },
        }),
      ),
    );

    return this.findAll(organizationId);
  }

  async delete(id: string, organizationId: string): Promise<void> {
    const existing = await this.prisma.hiringStage.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException(`Stage ${id} not found`);
    if (existing.organizationId !== organizationId)
      throw new ForbiddenException('Access denied');
    if (existing.isLocked)
      throw new ForbiddenException('Cannot delete a locked stage');

    await this.prisma.hiringStage.delete({ where: { id } });
  }
}
