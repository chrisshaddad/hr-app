import { z } from 'zod';

import { dateSchema } from '../common';

export const jobResponseSchema = z.object({
  id: z.string().uuid(),
  organization: z.object({
    id: z.string().uuid(),
    name: z.string(),
  }),
  title: z.string(),
  updatedAt: dateSchema,
  createdAt: dateSchema,
  employmentType: z.string(),
  applyUrl: z.string().url(),
  location: z.string().nullable(),
  department: z.string().nullable(),
  description: z.string().nullable(),
  experienceLevel: z.string().nullable(),
  expectedClosingDate: z.string().nullable(),
  numberOfCandidates: z.number().int().min(0),
  status: z.enum(['draft', 'published', 'closed']),
});

export type JobResponse = z.infer<typeof jobResponseSchema>;
