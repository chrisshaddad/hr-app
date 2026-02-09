import { z } from 'zod';

export const createJobRequestSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  location: z.string().min(1, { message: 'Location is required' }),
  department: z.string().min(1, { message: 'Department is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
  employmentType: z.string().min(1, { message: 'Employment type is required' }),
  experienceLevel: z
    .string()
    .min(1, { message: 'Experience level is required' }),
  expectedClosingDate: z
    .string()
    .min(1, { message: 'Expected closing date is required' }),
});

export type CreateJobRequest = z.infer<typeof createJobRequestSchema>;
