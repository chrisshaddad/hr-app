import { z } from 'zod';
import { employeeStatusSchema } from './employee-status.schema';
import { zQueryArray } from '../common/query-array.schema';

export const employeeListQuerySchema = z.object({
  search: z.string().optional(),
  statuses: zQueryArray(employeeStatusSchema).optional(),
  branchIds: zQueryArray(z.string().trim().min(1)).optional(),
  jobTitles: zQueryArray(z.string().trim().min(1)).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type EmployeeListQuery = z.infer<typeof employeeListQuerySchema>;
