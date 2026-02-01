# API

NestJS backend API running on port 3001.

## Development

```bash
npm run dev          # Start in watch mode
npm run test         # Run unit tests
npm run test:e2e     # Run e2e tests
```

## Generate Module

```bash
nest generate module <name>
nest generate service <name>
nest generate controller <name>
```

## Structure

```
src/
  auth/           # Authentication (password & magic link)
  organizations/  # Organization management
  mail/           # Email processing (BullMQ)
  database/       # Prisma service
```
