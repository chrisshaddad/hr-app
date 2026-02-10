import { z } from 'zod';
import { employeeStatusSchema } from './employee-status.schema';

export const employeeListQuerySchema = z.strictObject({
  search: z.string().optional(),
  statuses: z.array(employeeStatusSchema).optional(),
  branchIds: z.array(z.string().trim().min(1)).optional(),
  jobTitles: z.array(z.string().trim().min(1)).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type EmployeeListQuery = z.infer<typeof employeeListQuerySchema>;
