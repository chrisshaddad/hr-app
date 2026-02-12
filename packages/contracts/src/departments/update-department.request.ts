import { z } from 'zod';
import { createDepartmentRequestSchema } from './create-department.request';

export const updateDepartmentRequestSchema = createDepartmentRequestSchema;

export type UpdateDepartmentRequest = z.infer<
  typeof updateDepartmentRequestSchema
>;
