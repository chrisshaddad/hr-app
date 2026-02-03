# New API Endpoint

Add a new endpoint to: {{controller_name}}

## Endpoint Details

- **Method**: {{http_method}}
- **Path**: {{endpoint_path}}
- **Description**: {{description}}

## Requirements

### Controller Method

```typescript
import type { FeatureDetailResponse } from '@repo/contracts';

@{{http_method}}('{{endpoint_path}}')
@UsePipes(new ZodValidationPipe(createFeatureRequestSchema))
async methodName(@Body() dto: CreateFeatureRequest): Promise<FeatureDetailResponse> {
  return this.service.method(dto);
}
```

### Validation

- Create Zod schema in `@repo/contracts` with `.request.ts` suffix
- Use `ZodValidationPipe` for request validation
- Follow Zod v4 syntax
- Add return type annotation using contract response types

### Authorization

Consider required guards:

- [ ] `@Public()` - No authentication required
- [ ] `@Roles(UserRole.SUPER_ADMIN)` - Super admin only
- [ ] `@Roles(UserRole.ORG_ADMIN)` - Org admin and above
- [ ] Default - Any authenticated user

### Service Method

- Implement business logic in service
- Scope queries by organizationId for tenant isolation
- Use transactions for multi-step operations
- Throw appropriate NestJS exceptions (NotFoundException, ForbiddenException)
- Add return type annotation using contract response types
