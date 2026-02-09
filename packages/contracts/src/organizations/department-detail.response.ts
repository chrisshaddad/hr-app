import { z } from 'zod';
import { dateSchema } from '../common';

export const departmentDetailResponseSchema = z.object({
  id: z.string().uuid(),
  branchId: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
  userCount: z.number().optional(),
});

export type DepartmentDetailResponse = z.infer<
  typeof departmentDetailResponseSchema
>;
