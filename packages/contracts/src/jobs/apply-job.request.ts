import { z } from 'zod';

export const applyJobRequestSchema = z.object({
  phone: z.string().optional(),
  coverLetter: z.string().optional(),
  email: z.string().email('Invalid email address'),
  fullName: z.string().min(1, 'Full name is required'),
});

export type ApplyJobRequest = z.infer<typeof applyJobRequestSchema>;
