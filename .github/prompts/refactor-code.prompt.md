# Refactor Code

Refactor the selected code following project best practices.

## Refactoring Guidelines

### Code Organization

- Extract reusable logic into separate functions/modules
- Follow single responsibility principle
- Keep functions small and focused
- Use meaningful names for variables and functions

### TypeScript Best Practices

- Add proper type annotations
- Avoid `any` type - use `unknown` or proper types
- Use interfaces for object shapes
- Leverage type inference where obvious

### NestJS Patterns

- Use dependency injection properly
- Keep controllers thin, services fat
- Use guards for authorization logic
- Use pipes for validation
- Use interceptors for cross-cutting concerns

### React/Next.js Patterns

- Extract reusable components
- Use custom hooks for shared logic
- Prefer server components when possible
- Colocate related code

### Performance Considerations

- Avoid N+1 queries (use Prisma includes)
- Memoize expensive computations
- Use proper React hooks (useMemo, useCallback)
- Lazy load components when appropriate

### Error Handling

- Use proper error types
- Provide meaningful error messages
- Handle edge cases gracefully
- Log errors with context

## Output

Provide:

1. Refactored code
2. Brief explanation of changes
3. Any potential breaking changes to note
