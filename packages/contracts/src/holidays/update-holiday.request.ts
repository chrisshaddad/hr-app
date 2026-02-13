import { z } from 'zod';

export const updateHolidayRequestSchema = z.object({
  name: z.string().min(1, { error: 'Name is required' }).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type UpdateHolidayRequest = z.infer<typeof updateHolidayRequestSchema>;
