import { z } from 'zod';

export const zQueryArray = <T extends z.ZodTypeAny>(item: T) =>
  z.preprocess((val) => {
    if (val == null) return undefined; // allow missing
    if (Array.isArray(val)) return val; // already array
    if (typeof val === 'string') return [val]; // single -> array
    return val; // let zod error
  }, z.array(item));
