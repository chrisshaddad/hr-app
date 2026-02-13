import { z } from 'zod';
import { documentTypeSchema } from './document-type.schema';

export const createDocumentRequestSchema = z.object({
  userId: z.string().uuid(),
  documentType: documentTypeSchema,
  fileName: z.string().min(1, 'File name is required'),
  fileUrl: z.string().url('Invalid file URL'),
  fileSize: z.number().optional(),
  mimeType: z.string().optional(),
});

export type CreateDocumentRequest = z.infer<typeof createDocumentRequestSchema>;
