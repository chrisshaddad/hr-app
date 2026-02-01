import { z } from 'zod';

export const requestMagicLinkSchema = z.object({
  email: z.email().transform((email) => email.toLowerCase().trim()),
});

export type RequestMagicLinkDto = z.infer<typeof requestMagicLinkSchema>;
