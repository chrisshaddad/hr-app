# API (NestJS Backend)

This is a NestJS REST API for the HR app.

## Project Description

NestJS backend providing authentication, organizations management, and HR-related endpoints.

## Key Paths

- **Controllers**: [`src/`](src/) - API route handlers
- **Services**: [`src/`](src/) - Business logic
- **Modules**: [`src/`](src/) - NestJS modules
- **Database**: Uses Prisma client from `@hr-app/database`

## Commands

```bash
# Type check single file
npx tsc --noEmit --skipLibCheck path/to/file.ts

# Format single file
# Add actual turborepo specific commands

# Lint single file
# Add actual turborepo specific commands

# Run development server
# Add actual turborepo specific commands
```

## Dos and Don'ts

<!-- TODO Validate that this doc align with the already present nest implementation -->

### Do

- Use dependency injection (NestJS patterns)
- Use Zod validation pipes from [`src/common/pipes/`](src/common/pipes/)
- Follow existing controller/service/module patterns
- Use Prisma for database operations

### Don't

- Skip Zod validation on endpoints
- Add heavy dependencies without approval
- Create large rewrites without confirmation

## See Also

- [Root AGENTS.md](../AGENTS.md)
- [Database Package](../packages/database/AGENTS.md)
- [Contracts Package](../packages/contracts/AGENTS.md)
