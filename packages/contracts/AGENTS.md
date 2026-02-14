# Contracts Package

Shared TypeScript interfaces and Zod schemas for the HR app.

## Project Description

This package contains type definitions and validation schemas shared between the API and web applications.

## Key Paths

- [`src/`](src/) - TypeScript types and Zod schemas
- [`src/auth/`](src/auth/) - Authentication-related types
- [`src/users/`](src/users/) - User-related types
- [`src/organizations/`](src/organizations/) - Organization-related types
- [`src/common/`](src/common/) - Common types (dates, etc.)

## Commands

```bash
# Type check
npx tsc --noEmit

# Format
# Add actual turborepo specific commands

# Lint
# Add actual turborepo specific commands
```

## Dos and Don'ts

### Do

- Use Zod for request/response validation schemas
- Export types that are used by both API and web
- Keep schemas in sync with Prisma schema

### Don't

- Add types only used by one application
- Duplicate types that exist in other packages

## See Also

- [Root AGENTS.md](../../AGENTS.md)
- [Database Package](../database/AGENTS.md)
