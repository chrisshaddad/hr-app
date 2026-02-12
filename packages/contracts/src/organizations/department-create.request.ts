import { z } from 'zod';

export const departmentCreateRequestSchema = z.object({
  name: z.string().min(1).max(255),
  branchId: z.string().uuid(),
  description: z.string().optional(),
});

export type DepartmentCreateRequest = z.infer<
  typeof departmentCreateRequestSchema
>;
