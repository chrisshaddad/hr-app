# New API Endpoint

Add a new endpoint to: {{controller_name}}

## Endpoint Details

- **Method**: {{http_method}}
- **Path**: {{endpoint_path}}
- **Description**: {{description}}

## Requirements

### Controller Method

```typescript
@{{http_method}}('{{endpoint_path}}')
@ApiOperation({ summary: '{{description}}' })
@ApiOkResponse({ description: 'Success response description' })
@UsePipes(new ZodValidationPipe(schemaName))
async methodName(@Body() dto: DtoType) {
  return this.service.method(dto);
}
```

### Validation

- Create Zod schema in `@repo/contracts` if needed
- Use `ZodValidationPipe` for request validation
- Follow Zod v4 syntax

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

### OpenAPI Documentation

- Add `@ApiTags()` if new tag needed
- Add `@ApiOperation()` with summary
- Add `@ApiResponse()` decorators for all response types
- Document request body with `@ApiBody()` if complex
