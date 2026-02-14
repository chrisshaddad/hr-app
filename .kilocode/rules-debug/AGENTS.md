# AGENTS.md - Debug Mode

This file provides debugging-specific guidance for this repository.

## Non-Obvious Debugging Rules

### Database Issues (packages/database)
- Prisma 7 requires driver adapter - if you see connection errors, check `prisma.config.ts`
- Run `npm run db:generate` after schema changes before restarting API
- Database must be seeded manually after migrations: `npm run db:seed`

### API Issues (apps/api)
- API runs on port 3001, not 3000
- Check `.env` file exists with required variables (see `.env.example`)
- Session issues often related to cookie configuration - check `apps/api/src/auth/session.service.ts`

### Next.js 16 Issues (apps/web)
- If params seem undefined, you likely forgot to `await params` in Server Components
- Web runs on port 3000
- Check `.env` file exists with required variables (see `.env.example`)

### Auth Issues
- Magic link verification requires valid token in URL
- Session auth uses cookies - CORS must include credentials
- Check API response headers for session cookie set
