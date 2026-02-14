# Development Guidelines

You're working on creating the performance review module for a fullstack HR app as part of a advanced fullstack development bootcamp.

This project follows a monorepo structure set up using turborepo, its tech stack is made up of ReactJS, NestJS, Tailwind CSS, and Shadcn components.

Development of the performance review module has a timeframe of 3 weeks total. There are two people working on this repo, both participants in the bootcamp. Your task is to facilitate feature focused development with a utilitarian approach focused on code quality and limited feature scope.

## Implementation Approach

- **Keep the implementation granular and don't clutter with AI generated code and features.** "Granular" means to keep the AI work limited and validate all technical decisions before shipping code through keeping the human in the loop.
- **PRs can be as granular as you want to go, don't let the PR size be limiting.**

## Code Review

- **In the initial stage a senior engineer will be reviewing changes.**

---

## Core Dos and Don'ts

### Do

- Use the project's established patterns (see existing code in [`apps/`](apps/) and [`packages/`](packages/))
- Write self-documenting code with clear naming conventions
- Follow the project's code style (enforced by ESLint and Prettier)
- Keep components small and focused on a single responsibility
- Use existing UI components from [`apps/web/components/ui/`](apps/web/components/ui/) before creating new ones

### Don't

- Add heavy dependencies without approval from the human
- Create large rewrites without confirmation from the human
- Introduce new patterns without discussing them first
- Skip linting, type checking, or tests before committing
- Push directly to main branch (use feature branches)

---

## Commands

Use these file-scoped commands for fast validation:

### Type Check Single File

```bash
 # Add actual turborepo specific commands
```

### Format Single File

```bash
 # Add actual turborepo specific commands
```

### Lint Single File

```bash
 # Add actual turborepo specific commands
```

### Unit Tests

Unit tests are out of scope of this project

### Full Build (Only When Explicitly Requested)

```bash
 # Add actual turborepo specific commands
```

---

## Safety and Permissions

### Allowed Without Prompt

- Read files
- List files and directories
- Run TypeScript type checking on single files
- Run Prettier formatting on single files
- Run ESLint on single files
- Run unit tests for specific files

### Ask First

- Package installs (`npm install`, `npm install <package>`)
- Git push operations
- Deleting files or directories
- Running full builds
- Making changes to configuration files
- Adding new dependencies

---

## Project Structure

Quick reference for the monorepo layout:

```diagram
hr-app/
├── apps/
│   ├── api/          # NestJS backend (port 3001)
│   └── web/          # Next.js frontend (port 3000)
├── packages/
│   ├── contracts/    # Shared TypeScript interfaces and Zod schemas
│   └── database/     # Database schema and Prisma client
└── turbo.json        # Turborepo configuration
```

### Key Paths

- **Backend API**: [`apps/api/src/`](apps/api/src/) - NestJS application
- **Frontend Web**: [`apps/web/app/`](apps/web/app/) - Next.js App Router pages
- **Shared Contracts**: [`packages/contracts/src/`](packages/contracts/src/) - TypeScript types and Zod schemas
- **UI Components**: [`apps/web/components/ui/`](apps/web/components/ui/) - Radix UI based components

---

## PR Checklist

Before submitting a pull request, ensure:

- [ ] Title follows format: `feat scope: short description` (e.g., `feat auth: add login endpoint`)
- [ ] Lint passes: `npm run lint` (or app-specific lint)
- [ ] Type check passes: `npm run check-types` or file-scoped tsc
- [ ] Unit tests pass: `npm run test` for affected package
- [ ] Diff is small and focused (one feature/fix per PR)
- [ ] No debug console.logs or commented-out code
- [ ] PR description explains what and why, not just what

---

## When Stuck

- **Ask clarifying questions** - Don't assume requirements. Ask the user to clarify ambiguous points.
- **Check existing patterns** - Look at similar code in the codebase to understand the established conventions.
- **Validate early** - Run type checks, lint, and tests frequently to catch issues early.
- **Break it down** - If a task feels overwhelming, break it into smaller, manageable steps.

---

## Additional Resources

- See [`apps/api/AGENTS.md`](apps/api/AGENTS.md) for API-specific guidelines
- See [`apps/web/AGENTS.md`](apps/web/AGENTS.md) for Web-specific guidelines
- See [`packages/AGENTS.md`](packages/AGENTS.md) for shared packages guidelines
