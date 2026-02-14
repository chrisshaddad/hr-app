import { z } from 'zod';

export const clockInRequestSchema = z.object({
  location: z.string().optional(),
  timezone: z.string().optional(),
  notes: z.string().optional(),
});

export type ClockInRequest = z.infer<typeof clockInRequestSchema>;
