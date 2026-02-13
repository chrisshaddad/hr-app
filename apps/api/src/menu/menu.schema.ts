import { z } from 'zod';

export const MenuLinkSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.literal('LINK'),
  route: z.string(),
});

export const MenuGroupSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    id: z.string(),
    label: z.string(),
    type: z.literal('GROUP'),
    icon: z.string().optional(),
    children: z.array(z.union([MenuLinkSchema, MenuGroupSchema])),
  })
);

export const MenuSchema = z.array(MenuGroupSchema);

export type MenuResponse = z.infer<typeof MenuSchema>;
