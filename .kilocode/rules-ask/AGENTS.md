# AGENTS.md - Ask Mode

This file provides guidance for understanding this repository.

## Non-Obvious Documentation Context

### Project Structure
- Turborepo monorepo with apps/ and packages/ directories
- `apps/api` - NestJS backend (port 3001)
- `apps/web` - Next.js 16 frontend (port 3000)
- `packages/contracts` - Zod schemas for validation
- `packages/database` - Prisma 7 with PostgreSQL

### Key Technologies
- **Zod 4** - Uses `error` param instead of `message` for validation errors
- **Prisma 7** - Requires driver adapter, config in separate file
- **Next.js 16** - Async params in Server Components
- **Tailwind CSS 4** - Using CSS-based configuration (not JS config)

### Important Files
- `apps/api/src/auth/` - Authentication logic including magic links
- `apps/web/app/(authenticated)/` - Protected routes with layout
- `packages/contracts/src/` - Zod schemas for API validation
- `packages/database/prisma/schema.prisma` - Database schema
