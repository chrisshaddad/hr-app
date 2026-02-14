import { z } from 'zod';

export const clockOutRequestSchema = z.object({
  location: z.string().optional(),
  timezone: z.string().optional(),
  notes: z.string().optional(),
});

export type ClockOutRequest = z.infer<typeof clockOutRequestSchema>;
