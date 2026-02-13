import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UserRole } from '@repo/db';
import type { AuthenticatedRequest } from './auth.guard';

@Injectable()
export class OrganizationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not found in request');
    }

    // SUPER_ADMIN can access anything
    if (user.role === UserRole.SUPER_ADMIN) {
      return true;
    }

    // Get organizationId from request params
    // It could be 'id' or 'organizationId' depending on the route
    const orgId = request.params.organizationId || request.params.id;

    if (!orgId) {
      // If no organizationId is provided in the params, we might want to allow it
      // or check other sources. For now, if we apply this guard, we expect an orgId.
      throw new ForbiddenException('Get a job');
    }

    // ORG_ADMIN can only access their own organization
    if (user.role === UserRole.ORG_ADMIN) {
      if (user.organizationId === orgId) {
        return true;
      }
    }

    // For now, other roles (like EMPLOYEE) are not allowed access through this guard
    // unless they are specifically handled.
    throw new ForbiddenException(
      'You do not have permission to access this organization',
    );
  }
}
