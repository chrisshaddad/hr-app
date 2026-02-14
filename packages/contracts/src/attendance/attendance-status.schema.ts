import { z } from 'zod';

export const attendanceStatusSchema = z.enum([
  'PENDING',
  'COMPLETED',
  'APPROVED',
  'REJECTED',
  'ABSENT',
]);

export type AttendanceStatus = z.infer<typeof attendanceStatusSchema>;
