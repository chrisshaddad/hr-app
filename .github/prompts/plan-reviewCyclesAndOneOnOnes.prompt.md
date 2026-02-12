# Plan: Refactor Prisma Schema – Review Cycles & 1-on-1 Meetings

This plan separates concerns by extracting ReviewCycle from an enum to a model, creating a dedicated OneOnOne model for 1-on-1 meetings (removing them from PerformanceReview), and slimming PerformanceReview to focus only on performance reviews. This improves schema clarity and maintainability with minimal app changes.

## Steps

1. **Create ReviewCycle model**: Add `id` (uuid), `name` (String), `startDate` (DateTime), `endDate` (DateTime), `organizationId` (String FK), `createdAt` (DateTime), `updatedAt` (DateTime); link to Organization with one-to-many relation; add indexes on `organizationId`, `startDate`, `endDate`.
   - **Note on `updatedAt`**: ReviewCycle is mostly immutable once created (start/end dates define review periods). `updatedAt` adds minimal complexity and is a standard pattern. **Decision: KEEP** for audit trail and potential admin corrections (e.g., extending a review cycle).
Gather current Prisma schema context

Read schema.prisma

Read migration.sql

Searched for text OneOnOne, no results

Perfect! I have all the context needed. Here's the plan:

Plan: Refactor Prisma Schema – Review Cycles & 1-on-1 Meetings
This plan separates concerns by extracting ReviewCycle from an enum to a model, creating a dedicated OneOnOne model for 1-on-1 meetings (removing them from PerformanceReview), and slimming PerformanceReview to focus only on performance reviews. This improves schema clarity and maintainability with minimal app changes.

Steps
Create ReviewCycle model in schema.prisma: Add id, name, startDate, endDate, organizationId, createdAt, updatedAt; link to Organization with one-to-many relation; add indexes on organizationId, startDate, endDate.

Create OneOnOne model in schema.prisma: Add id, organizerId, attendeeId, scheduledAt, duration, status, optional location and recurrence; create relations to User (organizer, attendee); add User relation fields oneOnOnesOrganized and oneOnOnesAttended; create OneOnOneStatus enum (SCHEDULED, COMPLETED, CANCELED); add indexes on organizerId, attendeeId, scheduledAt.

Modify PerformanceReview model in schema.prisma: Remove reviewCycle (enum), overallRating, strengths, achievements, notes, scheduledAt, duration, location, recurrence fields; add reviewCycleId foreign key relation to ReviewCycle with cascading delete; remove old indexes referencing deleted fields; add index on reviewCycleId.

Clean up enums in schema.prisma: Delete ReviewCycle enum; keep ReviewStatus (unchanged); verify MeetingRecurrence is no longer needed after OneOnOne refactor (remove if only used for meetings); keep ReviewType (unchanged—no longer has ONE_ON_ONE value unless app still needs it as a historical marker).

Update User model in schema.prisma: Add two new relation fields: oneOnOnesOrganized and oneOnOnesAttended (both one-to-many).

Add Organization relation in schema.prisma: Add reviewCycles one-to-many relation field to Organization.

Create and verify migration: Run npx prisma migrate dev --name refactor_review_cycles_and_one_on_ones to generate migration; verify npx prisma validate passes; review generated SQL migration for correctness.

Further Considerations
ReviewType enum adjustment — Should we remove ONE_ON_ONE from ReviewType now that meetings are separate, or keep it for historical reviews? Recommend: Keep for now unless existing data requires it; clarify if needed.

MeetingRecurrence enum deprecation — Currently only used by old PerformanceReview ONE_ON_ONE meetings. OneOnOne model will use the same enum. Recommend: Keep MeetingRecurrence in schema; it's small and used by OneOnOne.

PerformanceReview reviewCycleId nullability — Should all PerformanceReviews require a reviewCycleId, or allow null for legacy/manual reviews? Recommend: Make it required (reviewCycleId String, not nullable) for data integrity; existing reviews can be assigned to a default cycle if needed during app migration.

Cascading delete behavior — Chose onDelete: Cascade for ReviewCycle→PerformanceReview and OneOnOne relations (consistent with existing User→PerformanceReview pattern). Confirm this is acceptable; alternative is onDelete: Restrict to prevent

2. **Create OneOnOne model**: Add `id` (uuid), `organizerId` (String FK), `attendeeId` (String FK), `scheduledAt` (DateTime), `duration` (Int), `status` (OneOnOneStatus enum), optional `location` (String); create relations to User (organizer, attendee); add User relation fields `oneOnOnesOrganized` and `oneOnOnesAttended`; create OneOnOneStatus enum (`SCHEDULED`, `COMPLETED`, `CANCELED`); add indexes on `organizerId`, `attendeeId`, `scheduledAt`.
   - **Note on `recurrence`**: `recurrence` (NONE, WEEKLY, BI_WEEKLY, MONTHLY, BI_ANNUAL) would track repeating 1-on-1s but adds complexity to OneOnOne scheduling logic and app code (generating future instances, managing overrides). **Decision: REMOVE**. If recurring 1-on-1s are needed later, create a separate `OneOnOneTemplate` model to manage recurring patterns, keeping individual OneOnOne records simple and historical.

3. **Modify PerformanceReview model**: Remove `reviewCycle` (enum), `overallRating`, `strengths`, `achievements`, `notes`, `scheduledAt`, `duration`, `location`, `recurrence` fields; add `reviewCycleId` (String FK) relation to ReviewCycle with cascading delete; remove old indexes referencing deleted fields (`scheduledAt`); add index on `reviewCycleId`.

4. **Clean up enums**: Delete `ReviewCycle` enum (now a model); DELETE `MeetingRecurrence` enum (no longer used after OneOnOne refactor—recurrence removed); keep `ReviewStatus` (unchanged); keep `ReviewType` (unchanged—includes ONE_ON_ONE but PerformanceReview.reviewType will no longer use it; can be removed in future if data cleanup permits).

5. **Update User model**: Add two new relation fields: `oneOnOnesOrganized: OneOnOne[]` and `oneOnOnesAttended: OneOnOne[]` (both one-to-many self-relations via organizerId and attendeeId).

6. **Add Organization relation**: Add `reviewCycles: ReviewCycle[]` one-to-many relation field to Organization.

7. **Create and verify migration**: Run `npx prisma migrate dev --name refactor_review_cycles_and_one_on_ones` to generate migration; verify `npx prisma validate` passes; review generated SQL migration for correctness.

## Schema Changes Summary

### REMOVED from Current Schema

**PerformanceReview model (8 fields):**
- `reviewCycle: ReviewCycle?` (enum) – replaced by `reviewCycleId` (FK relation)
- `overallRating: SmallInt?` – not needed; review quality tracked in new system only
- `strengths: Text?` – not needed; review content simplified
- `achievements: Text?` – not needed; review content simplified
- `notes: Text?` – not needed; review content simplified
- `scheduledAt: DateTime?` – moved to OneOnOne model
- `duration: Int?` – moved to OneOnOne model
- `location: String?` – moved to OneOnOne model
- `recurrence: MeetingRecurrence` (enum) – removed from OneOnOne; if recurring 1-on-1s needed, use OneOnOneTemplate in future

**Indexes (2):**
- `@@index([scheduledAt])` from PerformanceReview

**Enums (2):**
- `enum ReviewCycle` (WEEKLY, BI_WEEKLY, MONTHLY, SEMI_ANNUAL, BI_ANNUAL) – now a model
- `enum MeetingRecurrence` (NONE, WEEKLY, BI_WEEKLY, MONTHLY, BI_ANNUAL) – no longer used

---

### ADDED to Current Schema

**Models (2):**
- `model ReviewCycle`: id, name, startDate, endDate, organizationId, createdAt, updatedAt + relations to Organization and PerformanceReview
- `model OneOnOne`: id, organizerId, attendeeId, scheduledAt, duration, status, location (optional) + relations to User (2x)

**Indexes (4):**
- `@@index([organizationId])` on ReviewCycle
- `@@index([startDate])` on ReviewCycle
- `@@index([endDate])` on ReviewCycle
- `@@index([organizerId])` on OneOnOne
- `@@index([attendeeId])` on OneOnOne
- `@@index([scheduledAt])` on OneOnOne

**Enums (1):**
- `enum OneOnOneStatus` (SCHEDULED, COMPLETED, CANCELED)

**User model (2 relation fields):**
- `oneOnOnesOrganized: OneOnOne[]` (via organizerId)
- `oneOnOnesAttended: OneOnOne[]` (via attendeeId)

**Organization model (1 relation field):**
- `reviewCycles: ReviewCycle[]` (one-to-many)

**PerformanceReview model (1 field, 1 index):**
- `reviewCycleId: String` (FK, non-nullable, onDelete: Cascade)
- `@@index([reviewCycleId])`

---

### MODIFIED from Current Schema

**PerformanceReview model:**
- New: `reviewCycleId` (required relation to ReviewCycle)
- Removed: 8 fields listed above
- Indexes: Remove `@@index([scheduledAt])`; add `@@index([reviewCycleId])`
- Simplified focus: Now holds only performance review data (reviewType, revieweeId, reviewerId, status, areasForImprovement, organizationId, createdAt, updatedAt)

**User model:**
- Added: 2 relation fields (oneOnOnesOrganized, oneOnOnesAttended)

**Organization model:**
- Added: 1 relation field (reviewCycles)

---

## Further Considerations

1. **Data Migration**: Existing PerformanceReview rows with `reviewType = ONE_ON_ONE` should be migrated to OneOnOne model. Rows with other reviewTypes will have reviewCycleId assigned based on their createdAt date matching ReviewCycle periods.

2. **PerformanceReview reviewCycleId**: Set as non-nullable (required) for referential integrity. If legacy reviews exist without cycles, create a "Legacy" ReviewCycle or assign them to the most recent active cycle.

3. **Cascading Delete**: ReviewCycle deletion will cascade-delete all associated PerformanceReviews and OneOnOne instances. Consider if `onDelete: Restrict` is safer to prevent accidental data loss; recommend `Cascade` to keep schema clean.

4. **ReviewType enum**: Retains `ONE_ON_ONE` value for backward compatibility and potential historical queries, though new code will use OneOnOne model exclusively.
