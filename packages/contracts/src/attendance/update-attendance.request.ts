import { z } from 'zod';
import { attendanceStatusSchema } from './attendance-status.schema';

export const updateAttendanceRequestSchema = z.object({
  clockIn: z.string().datetime().optional(),
  clockOut: z.string().datetime().optional(),
  status: attendanceStatusSchema.optional(),
  notes: z.string().nullable().optional(),
  paidHours: z.number().optional(),
});

export type UpdateAttendanceRequest = z.infer<
  typeof updateAttendanceRequestSchema
>;
