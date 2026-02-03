import { z } from 'zod';

// Accepts both Date objects (from Prisma) and ISO strings (from JSON)
// JSON serialization automatically converts Date → string
export const dateSchema = z.union([z.string(), z.date()]);
export type DateField = z.infer<typeof dateSchema>;
