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
import { DepartmentsService } from './departments.service';
import { Roles } from '../auth/decorators';
import { OrganizationGuard } from '../auth/guards/organization.guard';
import {
  createDepartmentRequestSchema,
  updateDepartmentRequestSchema,
  type CreateDepartmentRequest,
  type UpdateDepartmentRequest,
  type DepartmentResponse,
  type DepartmentListResponse,
} from '@repo/contracts';
import { ZodValidationPipe } from '../common';

@Controller('organizations/:organizationId/departments')
@Roles('ORG_ADMIN', 'SUPER_ADMIN')
@UseGuards(OrganizationGuard)
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createDepartmentRequestSchema))
  async create(
    @Param('organizationId') organizationId: string,
    @Body() createDepartmentRequest: CreateDepartmentRequest,
  ): Promise<DepartmentResponse> {
    return this.departmentsService.create(
      organizationId,
      createDepartmentRequest,
    );
  }

  @Get()
  async findAll(
    @Param('organizationId') organizationId: string,
  ): Promise<DepartmentListResponse> {
    return this.departmentsService.findAll(organizationId);
  }

  @Get(':id')
  async findOne(
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
  ): Promise<DepartmentResponse> {
    return this.departmentsService.findOne(organizationId, id);
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(updateDepartmentRequestSchema))
  async update(
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
    @Body() updateDepartmentRequest: UpdateDepartmentRequest,
  ): Promise<DepartmentResponse> {
    return this.departmentsService.update(
      organizationId,
      id,
      updateDepartmentRequest,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.departmentsService.remove(organizationId, id);
  }
}
