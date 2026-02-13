import { type Prisma } from '@repo/db';

/**
 * User type that includes roles.
 * Use this type anywhere you access `user.roles`.
 */
export type UserWithRoles = Prisma.UserGetPayload<{
  include: { roles: true };
}>;