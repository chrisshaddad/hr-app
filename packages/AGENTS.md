# Packages

Shared packages for the monorepo.

## Packages

- `packages/contracts/` - Zod schemas for API validation
- `packages/database/` - Prisma client and database utilities
- `packages/eslint-config/` - ESLint configurations
- `packages/typescript-config/` - TypeScript configurations

## Commands

```bash
cd packages/database && npm run db:generate  # Generate Prisma client
cd packages/database && npm run db:migrate  # Run migrations
cd packages/database && npm run db:seed     # Seed database
```

## See Also
- [Root AGENTS.md](../AGENTS.md)
- [Contracts Package](packages/contracts/AGENTS.md)
- [Database Package](packages/database/AGENTS.md)
