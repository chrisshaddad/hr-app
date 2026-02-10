import { z } from 'zod';
import { employeePersonalInfoSchema } from './employee-personal-info.schema';

export const lineManagerListItemSchema = z.object({
  id: z.uuid(),
  personalInfo: employeePersonalInfoSchema
    .pick({
      firstName: true,
      lastName: true,
      email: true,
    })
    .nullable(),
});

export type LineManagerListItem = z.infer<typeof lineManagerListItemSchema>;
