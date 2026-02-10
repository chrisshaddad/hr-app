import { z } from 'zod';

export const genderSchema = z.enum([
  'MALE',
  'FEMALE',
  'OTHER',
  'PREFER_NOT_TO_SAY',
]);

export type Gender = z.infer<typeof genderSchema>;
