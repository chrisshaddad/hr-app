You are generating backend APIs + DTOs for the HR app's Performance Review module.

### Prisma entities involved:
- User
- ReviewCycle
- ReviewAssignment
- Review

### Auth rules:
- ORG_ADMIN can create/update review cycles; everyone in the org can view cycles.
- ORG_ADMIN can create/delete review assignments and view all assignments in org.
- Employees can only view assignments they must write (reviewerId = me). They can view/edit only the reviews they wrote.
- ORG_ADMIN can view all reviews in the org.
- Reviewee can view ALL reviews about them only AFTER the cycle ends, and PEER reviews must be anonymized (no reviewer identity in response).
- All queries are scoped by organizationId.

### Tech requirements:
- Include pagination for list endpoints (size, page).
- Use clean DTO naming: Request/Response. Name files with .request.ts or .response.ts suffix appropriately
- Add return type annotations to controller/service methods
- Responses should be JSON, with consistent envelope:
  { data: ..., meta?: ... }
- Use Prisma include/select to avoid overfetching.
- Use dateSchema from common for date fields
- Register module in app.module.ts
- Export schemas from packages/contracts/src/index.ts
- Implement service-layer authorization checks (do not trust client filters). Use the following guards:
  - [ ] `@Public()` - No authentication required
  - [ ] `@Roles(UserRole.SUPER_ADMIN)` - Super admin only
  - [ ] `@Roles(UserRole.ORG_ADMIN)` - Org admin and above
  - [ ] Default - Any authenticated user

### Controller Method

```typescript
import type { FeatureDetailResponse } from '@repo/contracts';

@{{http_method}}('{{endpoint_path}}')
@UsePipes(new ZodValidationPipe(createFeatureRequestSchema))
async methodName(@Body() dto: CreateFeatureRequest): Promise<FeatureDetailResponse> {
  return this.service.method(dto);
}
```

### Validation

- Create Zod schema in `@repo/contracts` with `.request.ts` suffix
- Use `ZodValidationPipe` for request validation (z.uuid(), z.email(), not z.string().uuid())
- Follow Zod v4 syntax
- Add return type annotation using contract response types


### Service Method

- Implement business logic in service
- Scope queries by organizationId for tenant isolation
- Use transactions for multi-step operations
- Throw appropriate NestJS exceptions (NotFoundException, ForbiddenException)
- Add return type annotation using contract response types

# Define these APIs:


## Review Cycles APIs


### GET /review-cycles
Purpose: list review cycles in the current user's organization. Everyone can access.
Query params:
- page?: number (default 0)
- size?: number (default 20)
- activeOnly?: boolean (if true, only cycles where now is between startDate and endDate)
Response 200:
{
  data: ReviewCycleListItem[],
  meta: { page: number, size: number, total: number }
}
ReviewCycleListItem:
- id: string
- name: string
- startDate: string ISO
- endDate: string ISO
- createdAt: string ISO
- updatedAt: string ISO

### GET /review-cycles/:id
Purpose: get one cycle details. Everyone in org can access.
Response 200:
{ data: ReviewCycleDetails }
ReviewCycleDetails same fields as model (no organizationId needed in response).

### POST /review-cycles
Auth: ORG_ADMIN only.
Request body: CreateReviewCycleRequest
- name: string (1..200)
- startDate: string ISO (required)
- endDate: string ISO (required, must be after startDate)
Response 201:
{ data: ReviewCycleDetails }

### PATCH /review-cycles/:id
Auth: ORG_ADMIN only.
Request body: UpdateReviewCycleRequest
- name?: string
- startDate?: string ISO
- endDate?: string ISO
Validation: if both dates present, endDate > startDate.
Response 200:
{ data: ReviewCycleDetails }


## Review Assignments APIs


### GET /review-assignments
Purpose:
- ORG_ADMIN: list all assignments in org with filters
- Employee: list ONLY my assignments (reviewerId = me); ignore reviewerId query param if provided by employee.
Query params (all optional):
- cycleId?: string
- type?: "MANAGER" | "PEER" | "SELF"
- revieweeId?: string (ORG_ADMIN only)
- reviewerId?: string (ORG_ADMIN only)
- page?: number (default 0)
- size?: number (default 20)
Response 200:
{
  data: ReviewAssignmentListItem[],
  meta: { page, size, total }
}
ReviewAssignmentListItem:
- id: string
- cycle: { id, name, startDate, endDate }
- type: ReviewType
- reviewer: { id, name, email }   (for employee view, ok to return reviewer as self)
- reviewee: { id, name, email, departmentId? }
- createdAt, updatedAt: ISO
- hasReview: boolean (computed: exists Review where assignmentId = this.id)

Implementation detail: include Review relation or do existence check.

### POST /review-assignments/bulk
Auth: ORG_ADMIN only.
Purpose: bulk generate assignments for a given cycle. Supports 3 modes: SELF, MANAGER (from managerId), PEER (manual).
Request body: BulkCreateReviewAssignmentsRequest
- cycleId: string
- self: { enabled: boolean, revieweeIds: string[] }  // if enabled, create type=SELF assignments where reviewerId=revieweeId for each revieweeId
- manager: { enabled: boolean, revieweeIds: string[] } // if enabled, for each revieweeId, look up reviewee.managerId; if null skip and return in warnings; create type=MANAGER assignment reviewerId=managerId, revieweeId=revieweeId
- peer: { enabled: boolean, pairs: Array<{ revieweeId: string, reviewerIds: string[] }> } // create type=PEER assignments for each reviewer in reviewerIds
Response 201:
{
  data: {
    createdCount: number,
    skippedCount: number,
    createdAssignmentIds: string[],
    warnings: Array<{ code: string, message: string, details?: any }>
  }
}
Validation:
- all users must belong to org
- cycle must belong to org
- enforce unique constraint; when duplicates happen, treat as skipped with warning rather than failing whole request.

### DELETE /review-assignments/:id
Auth: ORG_ADMIN only.
Purpose: delete an assignment (and cascading delete Review if exists via relation).
Response 204 no content.


## Reviewer "My Tasks" APIs


### GET /my/review-tasks
Auth: any logged in user.
Purpose: list assignments I must write, optionally filtered by cycle/type, including existing review draft (if any).
Query params:
- cycleId?: string
- type?: ReviewType
- page?: number
- size?: number
Response 200:
{
  data: ReviewTaskItem[],
  meta: { page, size, total }
}
ReviewTaskItem:
- assignmentId: string
- type: ReviewType
- cycle: { id, name, startDate, endDate }
- reviewee: { id, name, email }
- review: ReviewEditableDto | null

ReviewEditableDto:
- id: string
- summary?: string|null
- strengths?: string|null
- areasToImprove?: string|null
- accomplishments?: string|null
- rating?: number|null
- createdAt: ISO
- updatedAt: ISO


## Reviews (write/update) APIs


### PUT /reviews/by-assignment/:assignmentId
Auth: reviewer only (assignment.reviewerId == me).
Purpose: upsert the review for that assignmentId.
Request body: UpsertReviewRequest
- summary?: string|null
- strengths?: string|null
- areasToImprove?: string|null
- accomplishments?: string|null
- rating?: number|null (validate range e.g. 1..5 or 1..10; pick 1..5)
Response 200:
{ data: ReviewEditableDto }

Rules:
- Set organizationId/cycleId/reviewerId/revieweeId/type from assignment (ignore anything client tries to send).
- If review exists, update; else create.
- validate that now is within cycle window (startDate <= now <= endDate); if outside, reject with 400 unless ORG_ADMIN.

### GET /reviews/:id
Auth:
- ORG_ADMIN can view any in org
- reviewer can view if review.reviewerId == me
Purpose: fetch one review (non-anonymized).
Response 200:
{ data: ReviewFullDto }
ReviewFullDto:
- id, assignmentId, cycleId, type
- reviewer: { id, name, email }
- reviewee: { id, name, email }
- summary, strengths, areasToImprove, accomplishments, rating
- createdAt, updatedAt


## Admin Reviews APIs


### GET /admin/reviews
Auth: ORG_ADMIN only.
Purpose: list all reviews in org with filters.
Query params:
- cycleId?: string
- type?: ReviewType
- reviewerId?: string
- revieweeId?: string
- page?: number
- size?: number
Response 200:
{
  data: AdminReviewListItem[],
  meta: { page, size, total }
}
AdminReviewListItem similar to ReviewFullDto but can be smaller.


## Reviewee Received Feedback APIs (anonymized)


### GET /me/reviews-received
Auth: any logged in user.
Purpose: after cycle ends, allow reviewee to see all reviews about them (type SELF/MANAGER/PEER), but PEER must be anonymized.
Query params:
- cycleId: string (required)
Response 200:
{
  data: ReceivedReviewDto[]
}
ReceivedReviewDto:
- id: string
- type: ReviewType
- cycle: { id, name, startDate, endDate }
- summary, strengths, areasToImprove, accomplishments, rating
- createdAt, updatedAt
- reviewerDisplay: null | { label: string }   // For PEER return null; for SELF return {label:"You"}; for MANAGER either null or {label:"Manager"} depending on anonymization choice.

Rules:
- Enforce now > cycle.endDate; otherwise return 403 with message "Feedback available after cycle ends".
- Only return reviews where revieweeId == me AND cycleId matches.
- Do not return reviewerId or reviewer personal data for PEER reviews.


## Error Handling

- Use consistent error response:
{ error: { code: string, message: string, details?: any } }
- 401 unauthenticated
- 403 unauthorized
- 404 not found (resource not in org or not exist)
- 400 validation


## Implementation details

- Always scope by organizationId from auth context.
- Never accept organizationId, reviewerId, revieweeId in write endpoints except where explicitly allowed for ORG_ADMIN bulk generation.
- Use transactions for bulk operations.
- For employee endpoints, ignore admin-only filters.

Generate:
- Route handlers/controllers
- DTOs
- Service layer with authorization
- Prisma queries
- Minimal unit tests for authorization + anonymization
