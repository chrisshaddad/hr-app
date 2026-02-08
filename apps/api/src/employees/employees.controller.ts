import { Controller, Get, Query } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { Roles, CurrentUser } from '../auth/decorators';
import type { User, EmployeeStatus } from '@repo/db';
import type { EmployeeListItem } from '@repo/contracts';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  @Roles('ORG_ADMIN')
  async findAll(
    @CurrentUser() user: User,
    @Query('search') search?: string,
    @Query('statuses') statuses?: string[],
    @Query('branchIds') branchIds?: string[],
    @Query('jobTitles') jobTitles?: string[],
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<{ employees: Array<EmployeeListItem>; total: number }> {
    const statusList = (
      Array.isArray(statuses) ? statuses : statuses ? [statuses] : []
    ).filter(Boolean) as EmployeeStatus[];
    const branchIdList = (
      Array.isArray(branchIds) ? branchIds : branchIds ? [branchIds] : []
    ).filter(Boolean);
    const jobTitleList = (
      Array.isArray(jobTitles) ? jobTitles : jobTitles ? [jobTitles] : []
    ).filter(Boolean);

    const organizationId = user.organizationId ?? undefined;

    if (organizationId == null) {
      throw new Error('Organization ID required');
    }

    return this.employeesService.findAll({
      organizationId,
      search,
      statuses: statusList.length ? statusList : undefined,
      branchIds: branchIdList.length ? branchIdList : undefined,
      jobTitles: jobTitleList.length ? jobTitleList : undefined,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }
}
