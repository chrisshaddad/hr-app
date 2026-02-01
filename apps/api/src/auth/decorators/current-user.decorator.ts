import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { User } from '@repo/db';
import type { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: User;
}

/**
 * Decorator to extract the current authenticated user from the request
 * The user is attached to the request by the AuthGuard
 *
 * @example
 * @Get('profile')
 * getProfile(@CurrentUser() user: User) {
 *   return user;
 * }
 *
 * @example
 * // Get specific property
 * @Get('my-id')
 * getMyId(@CurrentUser('id') userId: string) {
 *   return userId;
 * }
 */
export const CurrentUser = createParamDecorator(
  (
    data: keyof User | undefined,
    ctx: ExecutionContext,
  ): User | User[keyof User] | null => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);
