import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UsePipes,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { HolidaysService } from './holidays.service';
import { Roles } from '../auth/decorators';
import { OrganizationGuard } from '../auth/guards/organization.guard';
import {
  createHolidayRequestSchema,
  updateHolidayRequestSchema,
  type CreateHolidayRequest,
  type UpdateHolidayRequest,
  type HolidayResponse,
  type HolidayListResponse,
} from '@repo/contracts';
import { ZodValidationPipe } from '../common';

@Controller('organizations/:organizationId/holidays')
@Roles('ORG_ADMIN', 'SUPER_ADMIN')
@UseGuards(OrganizationGuard)
export class HolidaysController {
  constructor(private readonly holidaysService: HolidaysService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createHolidayRequestSchema))
  async create(
    @Param('organizationId') organizationId: string,
    @Body() createHolidayRequest: CreateHolidayRequest,
  ): Promise<HolidayResponse> {
    return this.holidaysService.create(organizationId, createHolidayRequest);
  }

  @Get()
  async findAll(
    @Param('organizationId') organizationId: string,
  ): Promise<HolidayListResponse> {
    return this.holidaysService.findAll(organizationId);
  }

  @Get(':id')
  async findOne(
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
  ): Promise<HolidayResponse> {
    return this.holidaysService.findOne(organizationId, id);
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(updateHolidayRequestSchema))
  async update(
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
    @Body() updateHolidayRequest: UpdateHolidayRequest,
  ): Promise<HolidayResponse> {
    return this.holidaysService.update(
      organizationId,
      id,
      updateHolidayRequest,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.holidaysService.remove(organizationId, id);
  }
}
