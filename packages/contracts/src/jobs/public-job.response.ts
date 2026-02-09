import { z } from 'zod';

export const publicJobResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  employmentType: z.string(),
  location: z.string().nullable(),
  department: z.string().nullable(),
  description: z.string().nullable(),
  experienceLevel: z.string().nullable(),
});

export type PublicJobResponse = z.infer<typeof publicJobResponseSchema>;
