# Web

Next.js 16 frontend running on port 3000.

## Stack

- **UI**: [shadcn/ui](https://ui.shadcn.com/) (Radix UI + Tailwind CSS v4)
- **Font**: Manrope
- **Toasts**: Sonner

## Development

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # Run ESLint
```

## Add UI Components

```bash
npx shadcn@latest add <component>
```

Examples:

```bash
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add table
```

## Structure

```
app/              # Next.js App Router pages
components/ui/    # shadcn/ui components
hooks/            # Custom React hooks
lib/              # Utilities & API client
```
