import { z } from 'zod';

// Request for POST /auth/login
export const loginRequestSchema = z.object({
  email: z
    .string()
    .email()
    .transform((email) => email.toLowerCase().trim()),
  password: z.string().min(1, 'Password is required'),
});
export type LoginRequest = z.infer<typeof loginRequestSchema>;
