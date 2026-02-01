# New Prisma Model

Add a new database model for: {{model_name}}

## Requirements

### Schema Location

Add to `packages/database/prisma/schema.prisma`

### Model Structure

Include:

- `id` - UUID primary key with `@default(uuid())`
- `createdAt` - DateTime with `@default(now())`
- `updatedAt` - DateTime with `@updatedAt`
- `organizationId` - For multi-tenant data isolation (if applicable)

### Multi-Tenant Considerations

- Add `organizationId` field if data belongs to an organization
- Create relation to Organization model
- Add `@@index([organizationId])` for query performance

### Relations

- Define proper relations with `@relation`
- Use appropriate `onDelete` behavior (Cascade, SetNull, etc.)
- Add indexes for foreign keys

### Schema Selection

Choose appropriate schema:

- `@@schema("public")` - User-facing data
- `@@schema("private")` - Sensitive data (passwords, tokens)

## After Creation

1. Run `npx turbo db:migrate` to create migration
2. Update seed file if needed in `prisma/seeders/`
3. Create corresponding Zod schemas in `@repo/contracts`
