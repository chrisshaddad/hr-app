import { Controller, Get, ForbiddenException } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { Roles, CurrentUser } from '../auth/decorators';
import type { User } from '@repo/db';
import type { BranchListResponse } from '@repo/contracts';

@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get()
  @Roles('ORG_ADMIN', 'EMPLOYEE')
  async findAll(@CurrentUser() user: User): Promise<BranchListResponse> {
    if (!user.organizationId) {
      throw new ForbiddenException(
        'User is not associated with an organization',
      );
    }
    return this.branchesService.findAll(user.organizationId);
  }
}
