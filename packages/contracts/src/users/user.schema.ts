import { z } from 'zod';

// User roles enum
export const userRoleSchema = z.enum(['SUPER_ADMIN', 'ORG_ADMIN', 'EMPLOYEE']);
export type UserRole = z.infer<typeof userRoleSchema>;

// User profile (optional nested object from UserProfile model)
export const userProfileSchema = z.object({
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  phone: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  dateOfBirth: z.string().nullable(),
  hireDate: z.string().nullable(),
  jobTitle: z.string().nullable(),
});
export type UserProfile = z.infer<typeof userProfileSchema>;

// Base user response (from /auth/me endpoint)
export const userResponseSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string().nullable(),
  role: userRoleSchema,
  organizationId: z.uuid().nullable(),
  departmentId: z.uuid().nullable(),
  isConfirmed: z.boolean(),
  // Optional nested relations (when API includes them)
  profile: userProfileSchema.nullable().optional(),
});
export type UserResponse = z.infer<typeof userResponseSchema>;
