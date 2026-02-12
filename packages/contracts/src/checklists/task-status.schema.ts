import { z } from 'zod';

export const taskStatusSchema = z.enum([
  'TODO',
  'IN_PROGRESS',
  'DONE',
  'SKIPPED',
]);
export type TaskStatus = z.infer<typeof taskStatusSchema>;
