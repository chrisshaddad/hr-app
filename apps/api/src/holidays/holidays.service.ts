import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type {
  CreateHolidayRequest,
  UpdateHolidayRequest,
  HolidayResponse,
  HolidayListResponse,
} from '@repo/contracts';

@Injectable()
export class HolidaysService {
  constructor(private readonly prisma: PrismaService) {}

  private async verifyHolidayExists(
    organizationId: string,
    id: string,
  ): Promise<void> {
    const existing = await this.prisma.holiday.findFirst({
      where: { id, organizationId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException(`Holiday with ID ${id} not found`);
    }
  }

  async create(
    organizationId: string,
    data: CreateHolidayRequest,
  ): Promise<HolidayResponse> {
    return this.prisma.holiday.create({
      data: {
        name: data.name,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        organizationId,
      },
    });
  }

  async findAll(organizationId: string): Promise<HolidayListResponse> {
    const [holidays, total] = await Promise.all([
      this.prisma.holiday.findMany({
        where: { organizationId },
        orderBy: { startDate: 'asc' },
      }),
      this.prisma.holiday.count({
        where: { organizationId },
      }),
    ]);

    return { holidays, total };
  }

  async findOne(organizationId: string, id: string): Promise<HolidayResponse> {
    const holiday = await this.prisma.holiday.findFirst({
      where: { id, organizationId },
    });

    if (!holiday) {
      throw new NotFoundException(`Holiday with ID ${id} not found`);
    }

    return holiday;
  }

  async update(
    organizationId: string,
    id: string,
    data: UpdateHolidayRequest,
  ): Promise<HolidayResponse> {
    await this.verifyHolidayExists(organizationId, id);

    return this.prisma.holiday.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate && { endDate: new Date(data.endDate) }),
      },
    });
  }

  async remove(organizationId: string, id: string): Promise<void> {
    await this.verifyHolidayExists(organizationId, id);

    await this.prisma.holiday.delete({
      where: { id },
    });
  }
}
