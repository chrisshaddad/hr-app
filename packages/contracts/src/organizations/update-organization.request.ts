import { z } from 'zod';

export const updateOrganizationRequestSchema = z.object({
  name: z.string().min(2, {
    error: 'Company name must be at least 2 characters.',
  }),
  website: z.url({
    error: 'Please enter a valid URL.',
  }),
  phone: z.string().min(5, {
    error: 'Contact number must be at least 5 characters.',
  }),
  email: z.email({
    error: 'Please enter a valid email address.',
  }),
  overview: z.string().optional(),
});

export type UpdateOrganizationRequest = z.infer<
  typeof updateOrganizationRequestSchema
>;
