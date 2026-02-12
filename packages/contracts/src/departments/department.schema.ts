import { z } from 'zod';

export const departmentSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().nullish(),
  parentDepartmentId: z.string().uuid().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Department = z.infer<typeof departmentSchema>;

export const departmentResponseSchema = departmentSchema.extend({
  _count: z
    .object({
      users: z.number(),
    })
    .optional(),
});

export type DepartmentResponse = z.infer<typeof departmentResponseSchema>;

export const departmentListResponseSchema = z.object({
  departments: z.array(departmentResponseSchema),
  total: z.number(),
});

export type DepartmentListResponse = z.infer<
  typeof departmentListResponseSchema
>;
