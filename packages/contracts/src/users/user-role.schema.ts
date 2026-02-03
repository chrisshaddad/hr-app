import { z } from 'zod';

export const userRoleSchema = z.enum(['SUPER_ADMIN', 'ORG_ADMIN', 'EMPLOYEE']);
export type UserRole = z.infer<typeof userRoleSchema>;
