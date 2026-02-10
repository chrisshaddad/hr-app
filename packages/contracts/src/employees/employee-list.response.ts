import { z } from 'zod';
import { employeeStatusSchema } from './employee-status.schema';
import { branchInfoSchema } from './branch-info.schema';
import { departmentInfoSchema } from './department-info.schema';
import { employeePersonalInfoSchema } from './employee-personal-info.schema';
import { lineManagerListItemSchema } from './line-manager-list-item.schema';

export const employeeListItemSchema = z.object({
  id: z.uuid(),
  jobTitle: z.string(),
  status: employeeStatusSchema,
  userId: z.uuid().nullable(),
  personalInfo: employeePersonalInfoSchema.nullable(),
  lineManager: lineManagerListItemSchema.nullable(),
  department: departmentInfoSchema.nullable(),
  branch: branchInfoSchema.nullable(),
});

export type EmployeeListItem = z.infer<typeof employeeListItemSchema>;
