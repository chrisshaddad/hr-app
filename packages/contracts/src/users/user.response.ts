import { z } from 'zod';
import { userRoleSchema } from './user-role.schema';

//department (optional nested object)
const departmentSchema = z.object({
  id: z.uuid(),
  name: z.string(),
});
// User profile (optional nested object)
const userProfileSchema = z.object({
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  phone: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  dateOfBirth: z.string().nullable(),
  hireDate: z.string().nullable(),
  jobTitle: z.string().nullable(),
});

export const userResponseSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string().nullable(),
  role: userRoleSchema,
  organizationId: z.uuid().nullable(),
  departmentId: z.uuid().nullable(),
  isConfirmed: z.boolean(),
  profile: userProfileSchema.nullable().optional(),
  createdAt: z.string(),
  department: departmentSchema.nullable().optional(),
});
export type UserResponse = z.infer<typeof userResponseSchema>;

// Response from GET /employees
export const employeeListResponseSchema = z.object({
  employees: z.array(userResponseSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});
export type EmployeeListResponse = z.infer<typeof employeeListResponseSchema>;
