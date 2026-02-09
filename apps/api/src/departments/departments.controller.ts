import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UsePipes,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DepartmentsService } from './departments.service';
import { Roles, CurrentUser } from '../auth/decorators';
import { ZodValidationPipe } from '../common/pipes';
import type { User } from '@repo/db';
import type {
  DepartmentCreateRequest,
  DepartmentUpdateRequest,
  DepartmentDetailResponse,
  DepartmentListResponse,
} from '@repo/contracts';
import {
  departmentCreateRequestSchema,
  departmentUpdateRequestSchema,
} from '@repo/contracts';

@ApiTags('departments')
@Controller('branches/:branchId/departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  @Roles('ORG_ADMIN')
  @ApiOperation({ summary: 'List departments in branch' })
  async findAll(
    @Param('branchId') branchId: string,
  ): Promise<DepartmentListResponse> {
    return this.departmentsService.findAll(branchId);
  }

  @Get(':id')
  @Roles('ORG_ADMIN')
  @ApiOperation({ summary: 'Get department details' })
  async findOne(
    @Param('branchId') branchId: string,
    @Param('id') id: string,
  ): Promise<DepartmentDetailResponse> {
    return this.departmentsService.findOne(id, branchId);
  }

  @Post()
  @Roles('ORG_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(departmentCreateRequestSchema))
  @ApiOperation({ summary: 'Create department' })
  async create(
    @Param('branchId') branchId: string,
    @Body() data: DepartmentCreateRequest,
  ): Promise<DepartmentDetailResponse> {
    return this.departmentsService.create(branchId, data);
  }

  @Patch(':id')
  @Roles('ORG_ADMIN')
  @UsePipes(new ZodValidationPipe(departmentUpdateRequestSchema))
  @ApiOperation({ summary: 'Update department' })
  async update(
    @Param('branchId') branchId: string,
    @Param('id') id: string,
    @Body() data: DepartmentUpdateRequest,
  ): Promise<DepartmentDetailResponse> {
    return this.departmentsService.update(id, branchId, data);
  }

  @Delete(':id')
  @Roles('ORG_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete department' })
  async delete(
    @Param('branchId') branchId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.departmentsService.delete(id, branchId);
  }
}
