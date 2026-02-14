# Web (Next.js Frontend)

This is a Next.js web application for the HR app using App Router.

## Project Description

React frontend with Tailwind CSS and Shadcn UI components for HR management.

## Key Paths

- **Pages**: [`app/`](app/) - Next.js App Router pages
- **Components**: [`components/`](components/) - React components
- **UI Components**: [`components/ui/`](components/ui/) - Shadcn UI components
- **Hooks**: [`hooks/`](hooks/) - Custom React hooks
- **Lib**: [`lib/`](lib/) - Utilities and API client

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

# Build
# Add actual turborepo specific commands
```

## Dos and Don'ts

### Do

- Use existing UI components from [`components/ui/`](components/ui/)
- Use Tailwind CSS for styling
- Use the typed API client from [`lib/api.ts`](lib/api.ts)
- Follow the component patterns in existing pages

### Don't

- Create new UI components if existing ones work
- Use hardcoded colors (use Tailwind tokens)
- Use class components (use functional components with hooks)
- Add heavy dependencies without approval

## Rendering Patterns

- Use Server Components by default
- Use Client Components only when needed ( interactivity, hooks)
- Fetch data in Server Components when possible

## See Also

- [Root AGENTS.md](../AGENTS.md)
- [Contracts Package](../packages/contracts/AGENTS.md)
