# API (NestJS Backend)

NestJS REST API for the HR app.

## API Description

NestJS backend providing authentication, organizations management, and HR-related endpoints.

### Validation

- Use ZodValidationPipe with `@UsePipes` decorator on endpoints
- Import schemas from `@repo/contracts` package

### Key Paths

- `src/auth/` - Authentication (magic links, sessions)
- `src/organizations/` - Organization management
- `src/common/pipes/zod-validation.pipe.ts` - Custom validation pipe

## Commands

```bash
cd apps/api && npm run dev      # Port 3001
cd apps/api && npm run lint
cd apps/api && npm run test
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
