# AGENTS.md - Architect Mode

This file provides architectural guidance for this repository.

## Non-Obvious Architectural Constraints

### Monorepo Structure
- Turborepo with npm workspaces - packages must be published to use across apps
- Shared configs in `packages/` (eslint-config, typescript-config)
- Contracts in `packages/contracts` - single source of truth for validation

### Database Layer (Prisma 7)
- Driver adapter pattern required (e.g., `@prisma/adapter-pg`)
- Schema in `packages/database/prisma/schema.prisma`
- Config separated to `prisma.config.ts`
- No auto-seeding - requires manual seed command after migrations

### API Layer (NestJS)
- Custom ZodValidationPipe for request validation
- Schemas imported from `@repo/contracts`
- Session-based auth with cookie configuration

### Frontend Layer (Next.js 16)
- App Router with route groups `(authenticated)` for protected pages
- Server Components require async params
- API client helpers in `lib/api.ts` with typed fetch functions

### Version-Specific Gotchas
- Zod 4: Different error handling than v3
- Prisma 7: Requires driver adapter (breaking change)
- Next.js 16: Async params/searchParams (breaking change)
