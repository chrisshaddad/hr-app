import { z } from 'zod';

export const departmentUpdateRequestSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
});

export type DepartmentUpdateRequest = z.infer<
  typeof departmentUpdateRequestSchema
>;
