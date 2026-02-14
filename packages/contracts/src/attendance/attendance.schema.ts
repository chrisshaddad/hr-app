import { z } from 'zod';
import { dateSchema } from '../common';
import { attendanceStatusSchema } from './attendance-status.schema';

export const attendanceSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  date: dateSchema,
  clockIn: dateSchema.nullable(),
  clockInLocation: z.string().nullable(),
  clockInTimezone: z.string().nullable(),
  clockOut: dateSchema.nullable(),
  clockOutLocation: z.string().nullable(),
  clockOutTimezone: z.string().nullable(),
  scheduledHours: z.number(),
  loggedHours: z.number(),
  paidHours: z.number(),
  deficitHours: z.number(),
  overtimeHours: z.number(),
  status: attendanceStatusSchema,
  notes: z.string().nullable(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
  deletedAt: dateSchema.nullable(),
});

export type Attendance = z.infer<typeof attendanceSchema>;

export const attendanceResponseSchema = attendanceSchema;

export type AttendanceResponse = z.infer<typeof attendanceResponseSchema>;

export const attendanceListResponseSchema = z.object({
  attendances: z.array(attendanceResponseSchema),
  total: z.number(),
});

export type AttendanceListResponse = z.infer<
  typeof attendanceListResponseSchema
>;
