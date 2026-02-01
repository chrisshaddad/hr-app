# New Dashboard Page

Create a new dashboard page at: `/dashboard/{{page_name}}`

## Requirements

### Page Structure

1. Create `apps/web/app/dashboard/{{page_name}}/page.tsx`
2. Follow existing dashboard page patterns
3. Use server component with client components as needed

### Components to Include

- Page header with title and description
- Data table (use shadcn Table if listing data)
- Loading skeleton states
- Empty state when no data
- Error boundary/handling

### Data Fetching

- Create or use existing SWR hook from `hooks/`
- Handle loading, error, and empty states
- Implement optimistic updates where applicable

### UI Requirements

- Use shadcn/ui components (check if component exists before creating)
- Follow Tailwind CSS v4 patterns (no pixel values, use theme variables)
- Ensure responsive design with Tailwind breakpoints
- Add proper accessibility attributes

### Role-Based Access

Consider which roles should access this page:

- [ ] SUPER_ADMIN only
- [ ] ORG_ADMIN and above
- [ ] All authenticated users (EMPLOYEE and above)
