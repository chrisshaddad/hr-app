# @repo/database

Prisma ORM with PostgreSQL database client.

## Usage

```typescript
import { prisma } from '@repo/db';
import { User, Organization } from '@repo/db';
```

## Commands

```bash
npx turbo db:migrate   # Run migrations
npx turbo db:reset     # Reset database
npx turbo db:seed      # Seed initial data
```

## Schema

Located at `prisma/schema.prisma`. Uses two PostgreSQL schemas:

- `public` - User-facing data (users, organizations, profiles)
- `private` - Sensitive data (passwords, sessions, magic links)
