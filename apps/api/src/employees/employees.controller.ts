import { Controller, Get, Query, ForbiddenException } from '@nestjs/common';

import type { AuthenticatedUser } from '../auth/guards/auth.guard';
import { ZodValidationPipe } from '../common/pipes';
import { EmployeesService } from './employees.service';
import { Roles, CurrentUser } from '../auth/decorators';
import { employeeListQuerySchema } from '@repo/contracts';
import type { EmployeeListItem, EmployeeListQuery } from '@repo/contracts';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  @Roles('ORG_ADMIN')
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(employeeListQuerySchema))
    query: EmployeeListQuery,
  ): Promise<{ employees: Array<EmployeeListItem>; total: number }> {
    const { search, statuses, branchIds, jobTitles, page, limit } = query;

    const organizationId = user.employee?.organizationId ?? undefined;

    if (organizationId == null) {
      throw new ForbiddenException(
        'Organization context required. User must be part of an organization.',
      );
    }

    return this.employeesService.findAll({
      organizationId,
      search,
      statuses,
      branchIds,
      jobTitles,
      page,
      limit,
    });
  }
}
