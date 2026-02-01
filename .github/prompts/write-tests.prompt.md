# Write Tests

Generate tests for: {{file_or_feature}}

## Test Types

### Unit Tests (Services)

Location: `apps/api/src/{{module}}/{{module}}.service.spec.ts`

```typescript
describe('{{Service}}', () => {
  let service: {{Service}};
  let prisma: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {{Service}},
        { provide: PrismaService, useValue: mockDeep<PrismaService>() },
      ],
    }).compile();

    service = module.get({{Service}});
    prisma = module.get(PrismaService);
  });

  // Test cases...
});
```

### Controller Tests

Location: `apps/api/src/{{module}}/{{module}}.controller.spec.ts`

### E2E Tests

Location: `apps/api/test/{{feature}}.e2e-spec.ts`

## Test Scenarios to Cover

### Happy Path

- [ ] Successful creation
- [ ] Successful retrieval (single and list)
- [ ] Successful update
- [ ] Successful deletion

### Authorization

- [ ] Unauthenticated request rejected
- [ ] Wrong role rejected
- [ ] Cross-tenant access rejected

### Validation

- [ ] Invalid input rejected
- [ ] Missing required fields rejected
- [ ] Invalid formats rejected

### Edge Cases

- [ ] Not found scenarios
- [ ] Duplicate entries
- [ ] Empty results
- [ ] Pagination boundaries

### Multi-Tenant

- [ ] Data properly scoped to organization
- [ ] Cannot access other org's data
- [ ] SUPER_ADMIN can access all (if applicable)

## Mocking Patterns

- Use `jest-mock-extended` for Prisma mocking
- Mock external services (email, queues)
- Use factories for test data generation
