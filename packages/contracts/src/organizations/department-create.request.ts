import { z } from 'zod';
import { dateSchema } from '../common';

export const departmentCreateRequestSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
});

export type DepartmentCreateRequest = z.infer<
  typeof departmentCreateRequestSchema
>;
