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

## Notes for AI Assistants

1. Always use the shared database package (`@repo/db`) for Prisma operations
2. Validation schemas should be defined in `@repo/contracts` and shared between frontend and backend
3. Background jobs should be processed via BullMQ queues, not synchronously
4. Follow the existing NestJS module structure for new features
5. Use Radix UI + Tailwind for frontend components, following shadcn/ui patterns
6. Respect the multi-tenant architecture - always scope queries by organizationId for non-super-admin users
7. Sensitive data (passwords, tokens) belongs in the `private` schema
