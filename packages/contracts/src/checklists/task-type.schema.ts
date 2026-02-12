import { z } from 'zod';

export const taskTypeSchema = z.enum([
  'CHECKLIST',
  'UPLOAD',
  'EMPLOYEE_INFORMATION',
]);
export type TaskType = z.infer<typeof taskTypeSchema>;
