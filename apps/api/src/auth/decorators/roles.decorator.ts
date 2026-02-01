import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '@repo/db';

export const ROLES_KEY = 'roles';

/**
 * Decorator to restrict route access to specific user roles.
 * Use this on routes that require role-based authorization.
 *
 * @example
 * @Roles('SUPER_ADMIN')
 * @Get('admin-only')
 * getAdminData() { ... }
 *
 * @example
 * @Roles('SUPER_ADMIN', 'ORG_ADMIN')
 * @Get('admin-data')
 * getData() { ... }
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
