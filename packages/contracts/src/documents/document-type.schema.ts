import { z } from 'zod';

export const documentTypeSchema = z.enum([
  'ID_CARD',
  'PASSPORT',
  'DRIVERS_LICENSE',
  'BIRTH_CERTIFICATE',
  'SOCIAL_SECURITY_CARD',
  'TAX_DOCUMENT',
  'EMPLOYMENT_CONTRACT',
  'RESUME',
  'DEGREE_CERTIFICATE',
  'TRAINING_CERTIFICATE',
  'MEDICAL_CERTIFICATE',
  'BANK_STATEMENT',
  'PROOF_OF_ADDRESS',
  'OTHER',
]);

export type DocumentType = z.infer<typeof documentTypeSchema>;
