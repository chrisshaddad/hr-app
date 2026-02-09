import { z } from 'zod';

export const userUpdateRequestSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  departmentId: z.string().uuid().nullable().optional(),
});

export type UserUpdateRequest = z.infer<typeof userUpdateRequestSchema>;
