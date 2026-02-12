import { z } from 'zod';

export const createDepartmentRequestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  parentDepartmentId: z.uuid().optional(),
});

export type CreateDepartmentRequest = z.infer<
  typeof createDepartmentRequestSchema
>;
