import { z } from 'zod';

export const createHolidayRequestSchema = z.object({
  name: z.string().min(1, { error: 'Name is required' }),
  startDate: z.string(),
  endDate: z.string(),
});

export type CreateHolidayRequest = z.infer<typeof createHolidayRequestSchema>;
