# New SWR Hook

Create a data fetching hook for: {{entity_name}}

## File Location

`apps/web/hooks/use-{{entity_name}}.ts`

## Hook Structure

```typescript
'use client';

import useSWR, { mutate } from 'swr';
import { useCallback } from 'react';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';
import type { EntityType } from '@repo/contracts';

interface UseEntityOptions {
  enabled?: boolean;
}

interface UseEntityReturn {
  data: EntityType | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
  // CRUD methods
}

export function useEntity(
  id: string,
  options: UseEntityOptions = {},
): UseEntityReturn {
  // Implementation
}
```

## Requirements

### Features to Include

- [ ] Conditional fetching with `enabled` option
- [ ] Loading state
- [ ] Error handling
- [ ] Cache invalidation on mutations
- [ ] Optimistic updates where applicable

### CRUD Operations

Include methods for:

- `create` - POST new entity
- `update` - PATCH existing entity
- `delete` - DELETE entity
- Each should invalidate related caches

### Type Safety

- Import types from `@repo/contracts`
- Type all function parameters and returns
- Use generics where appropriate

### Cache Invalidation Pattern

```typescript
// Invalidate related queries after mutation
mutate(
  (key) => typeof key === 'string' && key.startsWith('/{{entity_name}}'),
  undefined,
  { revalidate: true },
);
```
