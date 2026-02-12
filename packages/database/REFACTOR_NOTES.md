# Database Schema Refactor: Review Cycles & 1-on-1 Meetings

**Date**: February 6, 2026
**Migration**: `20260206145944_refactor_review_cycles_and_one_on_ones`
**Branch**: `shadi-moussa-db-work`

## Overview

This refactor separates concerns in the performance management system by:

1. **Extracting ReviewCycle** from an enum to a proper model to represent formal review periods
2. **Creating a dedicated OneOnOne model** for 1-on-1 meetings (previously mixed into PerformanceReview)
3. **Slimming PerformanceReview** to focus exclusively on performance reviews, removing meeting-specific fields

This improves schema clarity, enables better querying, and prepares the system for future enhancements.

---

## Schema Changes

### 1. New Enum: OneOnOneStatus

**Purpose**: Track the state of 1-on-1 meetings

```prisma
enum OneOnOneStatus {
  SCHEDULED   // Meeting is scheduled but not yet held
  COMPLETED   // Meeting has occurred
  CANCELED    // Meeting was canceled
}
```

---

### 2. New Model: ReviewCycle

**Purpose**: Represent formal review periods/cycles (e.g., Q1 2026 review cycle)

```prisma
model ReviewCycle {
  id             String   @id @default(uuid())
  name           String                // e.g., "Q1 2026"
  startDate      DateTime              // Cycle start date
  endDate        DateTime              // Cycle end date
  organizationId String
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  organization       Organization      @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  performanceReviews PerformanceReview[]

  @@index([organizationId])
  @@index([startDate])
  @@index([endDate])
  @@schema("public")
}
```

**Key Details:**

- **Cascade delete**: Deleting a ReviewCycle will cascade-delete all associated PerformanceReviews
- **Indexes**: Optimized for lookups by organization and date range queries
- **Organization scoping**: Each cycle belongs to a single organization (multi-tenant support)

**Migration note**: Migration `20260206154240_remove_reviewcycle_updated_at` was applied to drop `updatedAt` from `ReviewCycle`.

**Note**: `updatedAt` was intentionally removed from `ReviewCycle` to keep the model simple. Review cycles are expected to be mostly immutable; if you need full edit history, use an audit table or event log instead of a last-modified timestamp.

---

### 3. New Model: OneOnOne

**Purpose**: Track 1-on-1 meetings between manager and employee (or any two users)

```prisma
model OneOnOne {
  id          String         @id @default(uuid())
  organizerId String         // Person scheduling/leading the meeting
  attendeeId  String         // Person attending the meeting
  scheduledAt DateTime       // When the meeting is scheduled
  duration    Int            // Duration in minutes
  status      OneOnOneStatus
  location    String?        // Physical location or video link (optional)
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  organizer User @relation("OneOnOnesOrganized", fields: [organizerId], references: [id], onDelete: Cascade)
  attendee  User @relation("OneOnOnesAttended", fields: [attendeeId], references: [id], onDelete: Cascade)

  @@index([organizerId])
  @@index([attendeeId])
  @@index([scheduledAt])
  @@schema("public")
}
```

**Key Details:**

- **Dual User relations**: Each OneOnOne links to the organizer and attendee via separate relation fields
- **Simple & historical**: Tracks individual meetings; no recurrence logic (keeps the model lean)
- **Cascade delete**: Deleting a User will cascade-delete their OneOnOne records
- **Indexes**: Optimized for querying meetings by organizer, attendee, and date

**Design Notes:**

- Recurrence patterns are NOT included. If recurring 1-on-1s are needed in the future, create a separate `OneOnOneTemplate` model
- `location` is optional to support both physical and virtual meetings

---

### 4. Modified Model: PerformanceReview

**Purpose**: Now focused exclusively on performance reviews, decoupled from meeting scheduling

**Removed Fields** (8 total):

- `reviewCycle: ReviewCycle?` (enum) → replaced by `reviewCycleId` relation
- `overallRating: SmallInt?` → simplification; rating logic deferred
- `strengths: Text?` → content simplification
- `achievements: Text?` → content simplification
- `notes: Text?` → content simplification
- `scheduledAt: DateTime?` → moved to OneOnOne
- `duration: Int?` → moved to OneOnOne
- `location: String?` → moved to OneOnOne
- `recurrence: MeetingRecurrence?` → removed (not needed)

**Added Fields** (1 total):

- `reviewCycleId: String` (non-nullable) → Foreign key to ReviewCycle model

**Current Model**:

```prisma
model PerformanceReview {
  id              String       @id @default(uuid())
  reviewType      ReviewType   // MANAGER, PEER, SELF, ONE_ON_ONE
  status          ReviewStatus @default(IN_PROGRESS)
  reviewCycleId   String       // Required relation to review cycle

  // Who is being reviewed
  revieweeId      String

  // Who is conducting the review
  reviewerId      String

  // Organization context
  organizationId  String

  // Review content
  areasForImprovement String? @db.Text

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  reviewCycle  ReviewCycle  @relation(fields: [reviewCycleId], references: [id], onDelete: Cascade)
  reviewee     User         @relation("ReviewsReceived", fields: [revieweeId], references: [id], onDelete: Cascade)
  reviewer     User         @relation("ReviewsGiven", fields: [reviewerId], references: [id], onDelete: Cascade)
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@index([reviewCycleId])
  @@index([revieweeId])
  @@index([reviewerId])
  @@index([organizationId])
  @@index([status])
  @@index([reviewType])
  @@schema("public")
}
```

**Updated Indexes:**

- ✅ Added: `@@index([reviewCycleId])`
- ❌ Removed: `@@index([scheduledAt])` (no longer applicable)

**Key Details:**

- `reviewCycleId` is **required** (non-nullable) to enforce referential integrity
- Cascade delete on reviewCycleId ensures data consistency
- Simplified to core review data: type, status, participants, feedback

---

### 5. Updated Model: User

**New Relation Fields** (2 total):

- `oneOnOnesOrganized: OneOnOne[]` (one-to-many, via `organizerId`)
- `oneOnOnesAttended: OneOnOne[]` (one-to-many, via `attendeeId`)

```prisma
// One-on-One relations
oneOnOnesOrganized OneOnOne[] @relation("OneOnOnesOrganized")
oneOnOnesAttended  OneOnOne[] @relation("OneOnOnesAttended")
```

**Use Cases:**

- Query all 1-on-1s a manager has scheduled: `user.oneOnOnesOrganized`
- Query all 1-on-1s an employee is attending: `user.oneOnOnesAttended`

---

### 6. Updated Model: Organization

**New Relation Field** (1 total):

- `reviewCycles: ReviewCycle[]` (one-to-many)

```prisma
// Review Cycle relations
reviewCycles ReviewCycle[]
```

**Use Cases:**

- Query all review cycles for an organization: `organization.reviewCycles`
- Manage review period workflows per organization

---

### 7. Removed Enums

**ReviewCycle** (formerly enum):

```prisma
// ❌ REMOVED
enum ReviewCycle {
  WEEKLY
  BI_WEEKLY
  MONTHLY
  SEMI_ANNUAL
  BI_ANNUAL
}
```

✅ Replaced with `model ReviewCycle` for flexibility (can add custom cycle names, metadata, etc.)

**MeetingRecurrence** (formerly enum):

```prisma
// ❌ REMOVED
enum MeetingRecurrence {
  NONE
  WEEKLY
  BI_WEEKLY
  MONTHLY
  BI_ANNUAL
}
```

✅ Removed: OneOnOne model does NOT include recurrence. Reason: Adds complexity to app code (generating future instances, handling overrides). If needed later, create a separate `OneOnOneTemplate` model.

---

## Migration Details

### Migration File

**Name**: `20260206145944_refactor_review_cycles_and_one_on_ones`
**Status**: ✅ Applied successfully
**Database**: Up to date

### SQL Operations

1. ✅ Created `OneOnOneStatus` enum
2. ✅ Dropped `MeetingRecurrence` enum
3. ✅ Dropped `ReviewCycle` enum
4. ✅ Dropped index on `PerformanceReview.scheduledAt`
5. ✅ Dropped 9 columns from `PerformanceReview` table
6. ✅ Added `reviewCycleId` column to `PerformanceReview` table
7. ✅ Created `ReviewCycle` table with indexes
8. ✅ Created `OneOnOne` table with indexes
9. ✅ Added foreign key constraints with cascade delete

### Data Considerations

**⚠️ Important for existing data:**

If the database already contains `PerformanceReview` records:

1. **Existing records with `reviewType = ONE_ON_ONE`**: These should be migrated to the new `OneOnOne` model. This requires:
   - Creating a `ReviewCycle` if none exists for the time period
   - Creating `OneOnOne` records from the `PerformanceReview` data
   - Deleting or archiving the old `PerformanceReview` rows with `reviewType = ONE_ON_ONE`

2. **Existing records with other `reviewType` values**: These retain their `PerformanceReview` entries but now require a `reviewCycleId`. Recommended approach:
   - Create a "Legacy" or "Unassigned" ReviewCycle for the organization
   - Assign all existing reviews to this cycle via migration script
   - Or assign each review to the most recent active cycle based on `createdAt` date

3. **Cascade delete behavior**: Deleting a `ReviewCycle` will automatically delete all associated `PerformanceReview` records. Use caution in production.

---

## Enums Retained

The following enums remain in the schema:

- **ReviewType**: MANAGER, PEER, SELF, ONE_ON_ONE
  - Note: `ONE_ON_ONE` is retained for backward compatibility and historical queries
  - New code should use the `OneOnOne` model instead
  - Can be removed in a future refactor once data is cleaned up

- **ReviewStatus**: IN_PROGRESS, COMPLETED, ACKNOWLEDGED
  - Used by `PerformanceReview` to track review workflow

- **UserRole**: SUPER_ADMIN, ORG_ADMIN, EMPLOYEE
  - Unchanged

- **OrganizationStatus**: PENDING, ACTIVE, REJECTED, SUSPENDED, INACTIVE
  - Unchanged

- **Gender**: MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY
  - Unchanged

---

## Index Summary

### ReviewCycle Indexes

```prisma
@@index([organizationId])    // Org lookups
@@index([startDate])         // Date range queries
@@index([endDate])           // Date range queries
```

### OneOnOne Indexes

```prisma
@@index([organizerId])       // Find meetings organized by user
@@index([attendeeId])        // Find meetings attended by user
@@index([scheduledAt])       // Time-based queries
```

### PerformanceReview Indexes (Updated)

```prisma
@@index([reviewCycleId])     // ✅ NEW: Cycle lookups
@@index([revieweeId])        // Who is being reviewed
@@index([reviewerId])        // Who is reviewing
@@index([organizationId])    // Org filtering
@@index([status])            // Workflow state
@@index([reviewType])        // Review type filtering
```

---

## Impact on Application Code

### Frontend (apps/web)

**Components/hooks that may need updates:**

- Review list/detail pages: Now requires `reviewCycleId` selection
- Review creation: Must select a ReviewCycle before creating a PerformanceReview
- Meeting scheduling: Use new `OneOnOne` model instead of PerformanceReview with `reviewType = ONE_ON_ONE`

**New features enabled:**

- 1-on-1 meeting management (separate from reviews)
- Review cycle management UI
- Review filtering by cycle

### Backend (apps/api)

**Services that may need updates:**

- **PerformanceReview service**: Add reviewCycleId validation and assignment
- **OneOnOne service**: NEW - create/read/update/delete for 1-on-1 meetings
- **ReviewCycle service**: NEW - manage review cycles (create, update, schedule)
- **User service**: Support new relation fields for querying meetings

**New controllers/routes needed:**

- `POST /review-cycles` - Create review cycle
- `GET /review-cycles/:id` - Get cycle details
- `GET /review-cycles?organizationId=...` - List cycles for org
- `POST /one-on-ones` - Schedule meeting
- `GET /one-on-ones/:id` - Get meeting details
- `PATCH /one-on-ones/:id` - Update meeting (reschedule, cancel)
- `GET /users/:id/one-on-ones` - Get user's 1-on-1s (both organized and attended)

**Contracts (@repo/contracts) updates:**

- Add `ReviewCycleResponse`, `ReviewCycleListResponse` DTOs
- Add `OneOnOneResponse`, `OneOnOneListResponse` DTOs
- Update `PerformanceReviewRequest` to include/require `reviewCycleId`
- Remove `overallRating`, `strengths`, `achievements`, `notes`, `scheduledAt`, `duration`, `location`, `recurrence` from review DTOs

---

## Validation & Testing

✅ **Schema validation**: Passed (`npx prisma validate`)
✅ **Migration status**: Up to date (`npx prisma migrate status`)
✅ **Database sync**: Complete

### Recommended Testing

1. [ ] Query PerformanceReviews by reviewCycleId
2. [ ] Create/read/delete OneOnOne meetings
3. [ ] Query OneOnOnes by organizer and attendee
4. [ ] Cascade delete: Delete ReviewCycle → verify PerformanceReviews are deleted
5. [ ] Cascade delete: Delete User → verify OneOnOnes are deleted
6. [ ] Cascade delete: Delete User → verify PerformanceReview relations are handled
7. [ ] Data migration: Assign existing PerformanceReviews to ReviewCycles

---

## Rollback Instructions

If rollback is needed before this is deployed to production:

```bash
cd packages/database
npx prisma migrate resolve --rolled-back 20260206145944_refactor_review_cycles_and_one_on_ones
```

This will mark the migration as rolled back locally. Run the previous migration if using in production:

```bash
npx prisma migrate deploy
```

---

## Next Steps

1. **Create ReviewCycle management endpoints** in backend (NestJS controllers/services)
2. **Create OneOnOne management endpoints** in backend
3. **Update PerformanceReview endpoints** to require reviewCycleId
4. **Build ReviewCycle UI** in frontend (create/list/edit cycles)
5. **Build OneOnOne meeting scheduler** UI in frontend
6. **Data migration script**: Assign existing PerformanceReviews to ReviewCycles
7. **Update API contracts** in `@repo/contracts` package
8. **Integration testing**: End-to-end review and meeting workflows

---

## References

- **Plan document**: `.github/prompts/plan-reviewCyclesAndOneOnOnes.prompt.md`
- **Migration file**: `prisma/migrations/20260206145944_refactor_review_cycles_and_one_on_ones/`
- **Schema file**: `prisma/schema.prisma`
- **Prisma docs**: https://www.prisma.io/docs/
