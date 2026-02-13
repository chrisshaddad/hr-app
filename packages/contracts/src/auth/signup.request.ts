import { z } from 'zod';

// Request for POST /auth/signup
export const signupRequestSchema = z.object({
  email: z
    .string()
    .email()
    .transform((email) => email.toLowerCase().trim()),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
  organizationName: z.string().min(1, 'Organization name is required'),
});

export type SignupRequest = z.infer<typeof signupRequestSchema>;
