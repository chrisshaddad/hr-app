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
2. `src/{{feature_name}}/{{feature_name}}-list.response.ts` - List response schema
3. `src/{{feature_name}}/{{feature_name}}-detail.response.ts` - Detail response schema
4. `src/{{feature_name}}/create-{{feature_name}}.request.ts` - Create request schema
5. `src/{{feature_name}}/update-{{feature_name}}.request.ts` - Update request schema

### Frontend (apps/web)

1. `hooks/use-{{feature_name}}.ts` - SWR hook with CRUD operations

## Checklist

- [ ] Multi-tenant: Scope data by organizationId
- [ ] Use Zod v4 syntax (z.uuid(), z.email(), not z.string().uuid())
- [ ] Use dateSchema from common for date fields
- [ ] Name files with .request.ts or .response.ts suffix appropriately
- [ ] Add return type annotations to controller/service methods
- [ ] Include ZodValidationPipe for request validation
- [ ] Register module in app.module.ts
- [ ] Export schemas from packages/contracts/src/index.ts
