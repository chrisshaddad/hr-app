import { z } from 'zod';

export const userCreateRequestSchema = z.object({
  email: z.email(),
  name: z.string().min(1).max(255),
  departmentId: z.string().uuid().optional(),
});

export type UserCreateRequest = z.infer<typeof userCreateRequestSchema>;
