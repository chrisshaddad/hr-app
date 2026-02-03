import { z } from 'zod';

/**
 * Schema for updating user timezone
 */
export const updateTimezoneSchema = z.object({
  timezone: z.string().min(1, 'Timezone is required'),
});

export type UpdateTimezoneDto = z.infer<typeof updateTimezoneSchema>;
