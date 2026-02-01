# New Zod Schema

Create validation schemas for: {{entity_name}}

## File Location

`packages/contracts/src/{{entity_name}}/{{schema_name}}.schema.ts`

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

```typescript
import { z } from 'zod';

// Base schema
export const {{entity_name}}Schema = z.object({
  id: z.uuid(),
  // fields...
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type {{EntityName}} = z.infer<typeof {{entity_name}}Schema>;

// Create schema (omit auto-generated fields)
export const create{{EntityName}}Schema = {{entity_name}}Schema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Create{{EntityName}} = z.infer<typeof create{{EntityName}}Schema>;
```

## Export from Index

Add to `packages/contracts/src/{{entity_name}}/index.ts`:

```typescript
export * from './{{schema_name}}.schema';
```

Add to `packages/contracts/src/index.ts`:

```typescript
export * from './{{entity_name}}';
```
