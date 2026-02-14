import { Controller, Get, Query } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CurrentUser, Roles } from '../auth/decorators';
import type { User } from '@repo/db';
import { EmployeeListResponse } from '@repo/contracts';
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  // Get paginated list of employees per organization, only accessible by ORG_ADMIN
  @Get()
  @Roles('ORG_ADMIN')
  async findAll(
    @CurrentUser() user: User,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<EmployeeListResponse> {
    return await this.employeesService.findAll(user.organizationId, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
    });
  }
}
