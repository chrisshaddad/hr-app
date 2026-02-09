# HumanLine HR Application - Copilot Instructions

## Project Overview

**HumanLine** is a multi-tenant HR/Employee Management SaaS platform that enables companies to manage their workforce. The platform handles employee onboarding, talent management, performance reviews, PTO tracking, company holidays, and reporting.

### Business Model

- **Super Admins** own and manage the entire system, including approving/denying company registration requests
- **Companies** register on the platform and await approval from super admins before becoming operational
- **Organization Admins** manage their company's employees, departments, and branches
- **Employees** can only access the system through invitations from their companies

## Tech Stack

### Monorepo Structure

This is a Turborepo monorepo with the following structure:

```
apps/
  api/          # NestJS backend API (Port 3001)
  web/          # Next.js 16 frontend (Port 3000)
packages/
  database/     # Prisma ORM + PostgreSQL (@repo/db)
  contracts/    # Shared Zod schemas for API contracts (@repo/contracts)
  eslint-config/      # Shared ESLint configurations
  typescript-config/  # Shared TypeScript configurations
```

### Backend (apps/api)

- **Framework**: NestJS 11
- **Database**: PostgreSQL 18 via Prisma ORM
- **Queue System**: BullMQ with Redis for background job processing
- **Email**: Mailpit (development) - production email service TBD
- **Validation**: Zod schemas from `@repo/contracts`

### Frontend (apps/web)

- **Framework**: Next.js 16 (App Router)
- **UI Components**: Radix UI primitives with shadcn/ui patterns
- **Styling**: Tailwind CSS v4
- **Font**: Manrope (Google Fonts)
- **Toast Notifications**: Sonner

### Infrastructure (Docker Compose)

- PostgreSQL on port 5433
- Redis on port 6380
- Mailpit on ports 8025 (UI) and 1025 (SMTP)

## Database Schema

### User Roles

```typescript
enum UserRole {
  SUPER_ADMIN  // System-wide admin, can approve organizations
  ORG_ADMIN    // Organization admin, can invite employees
  EMPLOYEE     // Regular employee, invited by org admins
}
```

### Organization Status

```typescript
enum OrganizationStatus {
  PENDING    // Awaiting super admin approval
  ACTIVE     // Approved and operational
  SUSPENDED  // Temporarily disabled
  INACTIVE   // Deactivated
}
```

### Key Models

- **User**: Core user entity with role-based access, linked to organization and department
- **UserProfile**: Extended user information (personal details, emergency contacts, address)
- **Organization**: Company entity with approval workflow (createdBy, approvedBy, status)
- **Branch**: Physical locations within an organization
- **Department**: Organizational units within branches
- **Session**: User authentication sessions
- **Password**: Securely stored password hashes (private schema)
- **MagicLink**: Passwordless authentication tokens (private schema)

### Database Schemas

The database uses PostgreSQL schemas for data separation:

- `public`: User-facing data (users, organizations, profiles)
- `private`: Sensitive data (passwords, sessions, magic links)

## Authentication

The application supports two authentication methods:

1. **Password-based authentication**
2. **Magic link authentication** (passwordless email login)

## Background Jobs

Email sending is processed asynchronously via BullMQ:

- `SEND_MAGIC_LINK`: Sends authentication magic links
- `SEND_INVITATION`: Sends employee invitation emails

## Key Workflows

### Company Registration Flow

1. Company admin signs up and creates an organization (status: PENDING)
2. Super admin reviews and approves/denies the request
3. Upon approval, organization becomes ACTIVE and admin can invite employees

### Employee Invitation Flow

1. Org admin invites employee via email
2. System sends invitation with registration link
3. Employee creates account and is linked to organization

## Development Commands

```bash
# Start infrastructure services
npm run services:init

# Run all apps in development mode
npm run dev

# Database commands (from root)
npx turbo db:migrate    # Run migrations
npx turbo db:reset      # Reset database
npx turbo db:seed       # Seed initial data

# NestJS CLI (from apps/api)
nest generate module <name>
nest generate service <name>
nest generate controller <name>
```

## Environment Variables

Key environment variables required:

- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `MAILPIT_URL`: Mailpit API URL (development)
- `APP_URL`: Application base URL
- `NODE_ENV`: Environment (development/production)

## Code Conventions

### API Structure

Each feature module in NestJS follows this pattern:

```
feature/
  feature.module.ts      # Module definition
  feature.service.ts     # Business logic
  feature.controller.ts  # HTTP endpoints
  feature.service.spec.ts
  feature.controller.spec.ts
```

### Frontend Structure

```
app/                     # Next.js App Router pages
components/
  ui/                    # Reusable UI components (shadcn/ui)
lib/
  utils.ts               # Utility functions (cn for class merging)
```

### Shared Packages

- Import database client: `import { prisma } from '@repo/db'`
- Import Prisma types: `import { User, Organization } from '@repo/db'`
- Import validation schemas: `import { ... } from '@repo/contracts'`

## Testing

- Unit tests: Jest
- E2E tests: Jest with supertest (apps/api/test/)

---

## Best Practices & Guidelines for AI Assistants

### General Principles

1. Always use the shared database package (`@repo/db`) for Prisma operations
2. Validation schemas should be defined in `@repo/contracts` and shared between frontend and backend
3. Background jobs should be processed via BullMQ queues, not synchronously
4. Follow the existing NestJS module structure for new features
5. Use Radix UI + Tailwind for frontend components, following shadcn/ui patterns
6. Respect the multi-tenant architecture - always scope queries by organizationId for non-super-admin users
7. Sensitive data (passwords, tokens) belongs in the `private` schema

---

### shadcn/ui Components

**IMPORTANT**: Before implementing any UI component, check if shadcn/ui provides it.

1. **Always check shadcn/ui first**: Visit [ui.shadcn.com](https://ui.shadcn.com/docs/components) to find the installation command
2. **Use the CLI to add components**: Run the install command from the shadcn docs:
   ```bash
   # From apps/web directory
   npx shadcn@latest add <component-name>
   ```
3. **Do NOT create custom implementations** of components that shadcn/ui already provides (Button, Dialog, Card, Table, etc.)
4. **Existing components** are located in `apps/web/components/ui/`
5. **Configuration** is defined in `apps/web/components.json` (style: new-york, icons: lucide)

```bash
# Examples
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add form
```

---

### Tailwind CSS v4 Guidelines

**IMPORTANT**: This project uses Tailwind CSS v4 with CSS-first configuration.

#### Units & Sizing

1. **NEVER use pixel values** (`px`) - use relative units instead:
   - Use `rem` for consistent scaling: `text-[1.125rem]` instead of `text-[18px]`
   - Use Tailwind spacing scale: `p-4` (1rem), `m-6` (1.5rem), `gap-2` (0.5rem)
   - Use fractional/percentage for responsive layouts: `w-1/2`, `w-full`

2. **Prioritize theme variables** defined in `globals.css`:

   ```css
   /* Use these CSS variables via Tailwind classes */
   --radius, --radius-sm, --radius-md, --radius-lg
   --color-background, --color-foreground
   --color-primary, --color-secondary
   --color-muted, --color-accent
   --color-destructive
   ```

3. **Preferred Tailwind patterns**:

   ```tsx
   // ✅ Good - uses theme variables
   className = 'bg-background text-foreground rounded-lg p-4';

   // ❌ Bad - hardcoded pixels
   className = 'bg-white rounded-[8px] p-[16px]';
   ```

4. **Responsive design**: Use Tailwind breakpoints (`sm:`, `md:`, `lg:`, `xl:`) not media queries with pixels

---

### Zod v4 Schema Guidelines

**IMPORTANT**: This project uses Zod v4. Many APIs have changed from v3.

#### Deprecated Methods (Do NOT Use)

```typescript
// ❌ DEPRECATED - Don't use these method chains
z.string().uuid();
z.string().email();
z.string().url();
z.string().datetime();

// ✅ CORRECT - Use top-level functions instead
z.uuid();
z.email();
z.url();
z.iso.datetime();
```

#### Key Zod v4 Changes

1. **String format validators are now top-level**:

   ```typescript
   // ✅ Zod v4 style
   import { z } from 'zod';

   const schema = z.object({
     id: z.uuid(),
     email: z.email(),
     website: z.url().optional(),
     createdAt: z.iso.datetime(),
   });
   ```

2. **Error customization uses `error` instead of `message`**:

   ```typescript
   // ✅ Zod v4
   z.string().min(5, { error: 'Too short' });

   // ❌ Deprecated
   z.string().min(5, { message: 'Too short' });
   ```

3. **Use `z.strictObject()` and `z.looseObject()`**:

   ```typescript
   // ✅ Zod v4
   z.strictObject({ name: z.string() });
   z.looseObject({ name: z.string() });

   // ❌ Deprecated
   z.object({ ... }).strict();
   z.object({ ... }).passthrough();
   ```

4. **Use `.extend()` instead of `.merge()`**:

   ```typescript
   // ✅ Recommended
   const Extended = Base.extend(Additional.shape);

   // ❌ Deprecated
   const Extended = Base.merge(Additional);
   ```

5. **Records require two arguments**:

   ```typescript
   // ✅ Zod v4
   z.record(z.string(), z.number());

   // ❌ No longer valid
   z.record(z.number());
   ```

6. **`z.nativeEnum()` is deprecated** - use `z.enum()` instead:

   ```typescript
   enum Color {
     Red = 'red',
     Blue = 'blue',
   }

   // ✅ Zod v4
   const ColorSchema = z.enum(Color);
   ```

**Reference**: [Zod v4 Migration Guide](https://zod.dev/v4/changelog)

---

### Contracts Package Organization

**IMPORTANT**: Organize contracts into logical, separate files - do NOT dump everything into one file.

#### File Structure

```
packages/contracts/src/
  index.ts                    # Re-exports only
  common/
    index.ts
    date.schema.ts            # Shared date schema for Prisma compatibility
  auth/
    index.ts
    magic-link.request.ts     # Request DTOs use .request.ts suffix
    magic-link-verify.request.ts
  users/
    index.ts
    user-role.schema.ts       # Shared enums use .schema.ts suffix
    user.response.ts          # Response DTOs use .response.ts suffix
  organizations/
    index.ts
    organization-status.schema.ts
    organization-list.response.ts
    organization-detail.response.ts
    organization-action.response.ts
```

#### Naming Conventions

1. **File names**: Use kebab-case with appropriate suffix:
   - `.request.ts` for request/input DTOs
   - `.response.ts` for response/output DTOs
   - `.schema.ts` for shared schemas (enums, common types)

2. **Schema names**: Use camelCase with `Schema` suffix
3. **Type names**: Infer from schemas using `z.infer<>`

```typescript
// organization-detail.response.ts
export const organizationDetailResponseSchema = z.object({...});
export type OrganizationDetailResponse = z.infer<typeof organizationDetailResponseSchema>;

// magic-link.request.ts
export const magicLinkRequestSchema = z.object({...});
export type MagicLinkRequest = z.infer<typeof magicLinkRequestSchema>;
```

4. **Index files should only re-export**:

   ```typescript
   // auth/index.ts
   export * from './magic-link.request';
   export * from './magic-link-verify.request';
   ```

5. **Use `dateSchema` for date fields** to handle Prisma `Date` objects:

   ```typescript
   import { dateSchema } from '../common';

   const schema = z.object({
     createdAt: dateSchema, // Accepts Date | string
     updatedAt: dateSchema,
     deletedAt: dateSchema.nullable(),
   });
   ```

---

### SWR & Data Fetching Patterns

**IMPORTANT**: Create custom hooks for related entities instead of using SWR directly in components.

#### Custom Hook Structure

```typescript
// hooks/use-<entity>.ts
'use client';

import useSWR, { mutate } from 'swr';
import { useCallback } from 'react';
import { apiPost, apiPatch, apiDelete } from '@/lib/api';
import type {
  EntityDetailResponse,
  UpdateEntityRequest,
} from '@repo/contracts';

interface UseEntityOptions {
  enabled?: boolean;
  // Add relevant filters
}

interface UseEntityReturn {
  data: EntityDetailResponse | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
  // Add action methods
}

export function useEntity(
  id: string,
  options: UseEntityOptions = {},
): UseEntityReturn {
  const { enabled = true } = options;

  const {
    data,
    error,
    isLoading,
    mutate: swrMutate,
  } = useSWR<EntityDetailResponse>(enabled ? `/entities/${id}` : null);

  // Include related mutations with cache invalidation
  const update = useCallback(
    async (updateData: UpdateEntityRequest) => {
      const result = await apiPatch<EntityDetailResponse>(
        `/entities/${id}`,
        updateData,
      );
      swrMutate(); // Invalidate this entity
      // Invalidate related caches
      mutate(
        (key) => typeof key === 'string' && key.startsWith('/entities'),
        undefined,
        { revalidate: true },
      );
      return result;
    },
    [id, swrMutate],
  );

  return { data, isLoading, error, mutate: swrMutate, update };
}
```

#### Key Patterns

1. **One hook per entity domain**: `useUser`, `useOrganizations`, `useEmployees`
2. **Include CRUD operations** in the hook when applicable
3. **Handle cache invalidation** for related queries
4. **Support conditional fetching** with `enabled` option
5. **Type everything** with contracts from `@repo/contracts`

```typescript
// ✅ Good - using custom hook
const { organization, isLoading, approve, reject } = useOrganization(id);

// ❌ Bad - raw SWR in component
const { data } = useSWR(`/organizations/${id}`);
```

---

### NestJS Backend Patterns

#### Module Structure

```
feature/
  feature.module.ts        # Module definition with imports/exports
  feature.service.ts       # Business logic (inject PrismaService)
  feature.controller.ts    # HTTP endpoints with decorators
  feature.service.spec.ts  # Service unit tests
  feature.controller.spec.ts
  dto/                     # If DTOs are needed beyond contracts
    create-feature.dto.ts
  guards/                  # Feature-specific guards
```

#### Controller Best Practices

```typescript
@ApiTags('feature')
@Controller('feature')
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}

  @Get()
  @ApiOperation({ summary: 'List features' })
  @ApiOkResponse({ description: 'Features retrieved successfully' })
  async findAll(@Query() query: ListFeaturesQuery) {
    return this.featureService.findAll(query);
  }

  @Post()
  @UsePipes(new ZodValidationPipe(createFeatureSchema))
  async create(@Body() dto: CreateFeatureDto) {
    return this.featureService.create(dto);
  }
}
```

#### Service Best Practices

1. **Always inject PrismaService** from `../database/prisma.service`
2. **Use transactions** for multi-step operations
3. **Throw appropriate NestJS exceptions** (NotFoundException, ForbiddenException, etc.)
4. **Scope queries by organizationId** for tenant isolation

```typescript
@Injectable()
export class FeatureService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForOrg(organizationId: string) {
    return this.prisma.feature.findMany({
      where: { organizationId }, // Always scope by org!
    });
  }
}
```

#### Validation with Zod

Use the shared `ZodValidationPipe` from `../common/pipes`:

```typescript
import { ZodValidationPipe } from '../common/pipes';
import { createFeatureRequestSchema, type CreateFeatureRequest } from '@repo/contracts';

@Post()
@UsePipes(new ZodValidationPipe(createFeatureRequestSchema))
async create(@Body() dto: CreateFeatureRequest) { ... }
```

#### Return Types with Contracts

Always add return type annotations using contract response types:

```typescript
import type { FeatureListResponse, FeatureDetailResponse } from '@repo/contracts';

@Get()
async findAll(): Promise<FeatureListResponse> {
  return this.featureService.findAll();
}

@Get(':id')
async findOne(@Param('id') id: string): Promise<FeatureDetailResponse> {
  return this.featureService.findOne(id);
}
```

---

### Security Reminders

1. **Never expose sensitive data** - passwords, tokens go in `private` schema
2. **Always validate session** before returning user data
3. **Scope all tenant data** by organizationId
4. **Use guards** for role-based access (`@Roles()`, `@Public()`)
5. **Sanitize user input** - Zod handles this via schema validation
