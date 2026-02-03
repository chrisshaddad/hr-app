# New Zod Schema

Create validation schemas for: {{entity_name}}

## File Location

Use the appropriate suffix based on schema type:

- Request DTOs: `packages/contracts/src/{{entity_name}}/{{schema_name}}.request.ts`
- Response DTOs: `packages/contracts/src/{{entity_name}}/{{schema_name}}.response.ts`
- Shared schemas (enums, common types): `packages/contracts/src/{{entity_name}}/{{schema_name}}.schema.ts`

## Zod v4 Syntax Requirements

### ✅ Use These (Zod v4)

```typescript
z.uuid(); // NOT z.string().uuid()
z.email(); // NOT z.string().email()
z.url(); // NOT z.string().url()
z.iso.datetime(); // NOT z.string().datetime()
```

### ✅ Error Messages

```typescript
z.string().min(5, { error: 'Too short' }); // NOT { message: '...' }
```

### ✅ Object Variants

```typescript
z.strictObject({ ... })  // NOT z.object().strict()
z.looseObject({ ... })   // NOT z.object().passthrough()
```

### ✅ Extending Schemas

```typescript
const Extended = Base.extend(Additional.shape); // NOT Base.merge(Additional)
```

### ✅ Records

```typescript
z.record(z.string(), z.number()); // Always two arguments
```

### ✅ Enums from TypeScript

```typescript
z.enum(MyEnum); // NOT z.nativeEnum(MyEnum)
```

## Schema Pattern

### Response Schema Example

```typescript
// {{entity_name}}-detail.response.ts
import { z } from 'zod';
import { dateSchema } from '../common';

export const {{entity_name}}DetailResponseSchema = z.object({
  id: z.uuid(),
  // fields...
  createdAt: dateSchema,  // Use dateSchema for Prisma Date compatibility
  updatedAt: dateSchema,
});

export type {{EntityName}}DetailResponse = z.infer<typeof {{entity_name}}DetailResponseSchema>;
```

### Request Schema Example

```typescript
// create-{{entity_name}}.request.ts
import { z } from 'zod';

export const create{{EntityName}}RequestSchema = z.object({
  name: z.string().min(1, { error: 'Name is required' }),
  // fields (omit auto-generated like id, createdAt)
});

export type Create{{EntityName}}Request = z.infer<typeof create{{EntityName}}RequestSchema>;
```

## Export from Index

Add to `packages/contracts/src/{{entity_name}}/index.ts`:

```typescript
export * from './{{entity_name}}-detail.response';
export * from './create-{{entity_name}}.request';
```

Add to `packages/contracts/src/index.ts`:

```typescript
export * from './{{entity_name}}';
```
