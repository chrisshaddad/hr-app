import { z } from 'zod';
import { dateSchema } from '../common';

export const holidaySchema = z.object({
  id: z.uuid(),
  organizationId: z.uuid(),
  name: z.string().min(1, { error: 'Name is required' }),
  startDate: dateSchema,
  endDate: dateSchema,
  createdAt: dateSchema,
  updatedAt: dateSchema,
});

export type Holiday = z.infer<typeof holidaySchema>;

export const holidayResponseSchema = holidaySchema;

export type HolidayResponse = z.infer<typeof holidayResponseSchema>;

export const holidayListResponseSchema = z.object({
  holidays: z.array(holidayResponseSchema),
  total: z.number(),
});

export type HolidayListResponse = z.infer<typeof holidayListResponseSchema>;
