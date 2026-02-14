# Web (Next.js Frontend)

Next.js 16 web application for the HR app.

## Frontend Description

React frontend with Tailwind CSS and Shadcn UI components for HR management.

### Server Components

- `params` and `searchParams` are async - MUST await:
  ```tsx
  const { id } = await params; // DO
  const { id } = params; // DON'T - will fail
  ```

### API Calls

- Always use `credentials: 'include'` for fetch calls
- Use typed `fetcher<T>()` and `apiPost<T>()` from `lib/api.ts`

### Key Paths

- `app/(authenticated)/` - Protected routes with layout
- `components/ui/` - Shadcn UI components
- `lib/api.ts` - API client utilities
- `hooks/` - Custom React hooks

## Commands

```bash
cd apps/web && npm run dev      # Port 3000
cd apps/web && npm run lint
cd apps/web && npm run build
```

## Dos and Don'ts

<!-- TODO Validate that this doc align with the already present react implementation -->

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
