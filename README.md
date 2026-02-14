# HumanLine HR App

Multi-tenant HR/Employee Management SaaS platform. Turborepo monorepo with NestJS API, Next.js frontend, and PostgreSQL database.

## Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [Docker](https://www.docker.com/)

## Quick Start

```bash
# Copy environment files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp packages/database/.env.example packages/database/.env

# Start Docker services (PostgreSQL, Redis, Mailpit)
npm run services:init

# Install dependencies
npm install

# Run initial database setup (needed for prisma type generation when starting the app)
npx turbo db:migrate

# Run all apps in dev mode
npm run dev
```

- **Web**: http://localhost:3000
- **API**: http://localhost:3001
- **Mailpit**: http://localhost:8025
- **MinIo**: http://localhost:9000
## Database

```bash
npx turbo db:migrate   # Run migrations
npx turbo db:reset     # Reset database
npx turbo db:seed      # Seed initial data
```

## Project Structure

| Path                 | Description                   |
| -------------------- | ----------------------------- |
| `apps/api`           | NestJS backend API            |
| `apps/web`           | Next.js frontend              |
| `packages/database`  | Prisma schema & client        |
| `packages/contracts` | Shared Zod validation schemas |
