# Database Package

Database schema and Prisma client for the HR app.

## Project Description

Prisma schema and client shared between API and web applications.

## Key Paths

- [`prisma/schema.prisma`](prisma/schema.prisma) - Database schema
- [`src/`](src/) - Prisma client exports

## Commands

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Type check
npx tsc --noEmit
```

## Dos and Don'ts

### Do

- Keep schema in sync with contracts package types
- Use migrations for schema changes
- Export typed clients for consumers

### Don't

- Add tables only used by one application
- Modify schema without discussing with team

## See Also

- [Root AGENTS.md](../../AGENTS.md)
- [Contracts Package](../contracts/AGENTS.md)
