# AGENTS.md - Code Mode

This file provides coding-specific guidance for this repository.

## Non-Obvious Coding Rules

### Zod 4 Validation (packages/contracts)
- Use `error` param, NOT `message`: `z.string().min(5, { error: 'Too short' })`
- No `required_error`/`invalid_type_error` - use `z.string({ error: ... })` instead
- Use new format validators: `z.email()`, `z.uuid()`, `z.url()` NOT `z.string().email()`

### Prisma 7 Database (packages/database)
- Requires driver adapter: `new PrismaPg({ connectionString })` wrapper
- Database config in `prisma.config.ts`, NOT in schema.prisma
- Auto-seeding removed - run `npm run db:seed` manually after migrate

### Next.js 16 Server Components (apps/web)
- `params` and `searchParams` are async - MUST await in Server Components:
  ```tsx
  // DO
  const { id } = await params;
  // DON'T
  const { id } = params; // Will fail in Next.js 16
  ```

### NestJS API Validation (apps/api)
- Use ZodValidationPipe with `@UsePipes` decorator on endpoints
- Import schemas from `@repo/contracts` package

### Frontend API Calls (apps/web)
- Always use `credentials: 'include'` for fetch calls (session auth)
- Use typed `fetcher<T>()` and `apiPost<T>()` from `lib/api.ts`
