# New Feature Module

Create a complete feature module for: {{feature_name}}

## Requirements

Generate the following files following existing project patterns:

### Backend (apps/api)

1. `src/{{feature_name}}/{{feature_name}}.module.ts` - NestJS module
2. `src/{{feature_name}}/{{feature_name}}.service.ts` - Business logic with PrismaService
3. `src/{{feature_name}}/{{feature_name}}.controller.ts` - REST endpoints with Swagger decorators
4. `src/{{feature_name}}/{{feature_name}}.service.spec.ts` - Unit tests
5. `src/{{feature_name}}/{{feature_name}}.controller.spec.ts` - Controller tests

### Contracts (packages/contracts)

1. `src/{{feature_name}}/index.ts` - Re-exports
2. `src/{{feature_name}}/{{feature_name}}.schema.ts` - Base Zod schemas (use Zod v4 syntax)
3. `src/{{feature_name}}/create-{{feature_name}}.schema.ts` - Create DTO schema
4. `src/{{feature_name}}/update-{{feature_name}}.schema.ts` - Update DTO schema

### Frontend (apps/web)

1. `hooks/use-{{feature_name}}.ts` - SWR hook with CRUD operations

## Checklist

- [ ] Multi-tenant: Scope data by organizationId
- [ ] Use Zod v4 syntax (z.uuid(), z.email(), not z.string().uuid())
- [ ] Add proper Swagger/OpenAPI decorators
- [ ] Include ZodValidationPipe for request validation
- [ ] Register module in app.module.ts
- [ ] Export schemas from packages/contracts/src/index.ts
