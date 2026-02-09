import { z } from 'zod';
import { departmentDetailResponseSchema } from './department-detail.response';

export const departmentListResponseSchema = z.object({
  data: z.array(departmentDetailResponseSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  hasMore: z.boolean(),
});

export type DepartmentListResponse = z.infer<
  typeof departmentListResponseSchema
>;
