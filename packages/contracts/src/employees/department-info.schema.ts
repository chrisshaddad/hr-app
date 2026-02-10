import { z } from 'zod';

export const departmentInfoSchema = z.object({
  id: z.uuid(),
  name: z.string(),
});

export type DepartmentInfo = z.infer<typeof departmentInfoSchema>;
