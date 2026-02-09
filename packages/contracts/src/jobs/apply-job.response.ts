import { z } from 'zod';

export const applyJobResponseSchema = z.object({
  message: z.string(),
  applicationId: z.string().uuid(),
});

export type ApplyJobResponse = z.infer<typeof applyJobResponseSchema>;
