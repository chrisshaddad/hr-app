import { z } from 'zod';

export const departmentUpdateRequestSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  branchId: z.string().uuid().optional(),
  description: z.string().optional(),
});

export type DepartmentUpdateRequest = z.infer<
  typeof departmentUpdateRequestSchema
>;
