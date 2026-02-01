# Add Background Job

Create a new BullMQ background job for: {{job_name}}

## Requirements

### 1. Define Job Type

Add to `apps/api/src/mail/mail.constants.ts` (or create new processor):

```typescript
export const JOB_TYPES = {
  // existing jobs...
  {{JOB_NAME}}: '{{job_name}}',
} as const;
```

### 2. Create Job Payload Type

```typescript
export interface {{JobName}}Payload {
  // job-specific data
}
```

### 3. Add Processor Handler

In the appropriate processor file:

```typescript
@Processor('queue-name')
export class {{JobName}}Processor extends WorkerHost {
  async process(job: Job<{{JobName}}Payload>) {
    const { data } = job;

    try {
      // Job logic here
      return { success: true };
    } catch (error) {
      // Log error
      throw error; // BullMQ will retry
    }
  }
}
```

### 4. Queue the Job

In the service that triggers the job:

```typescript
await this.queue.add(JOB_TYPES.{{JOB_NAME}}, payload, {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 1000,
  },
  removeOnComplete: true,
  removeOnFail: false,
});
```

## Job Configuration Options

- `attempts` - Number of retry attempts
- `backoff` - Retry delay strategy
- `delay` - Initial delay before processing
- `priority` - Job priority (lower = higher priority)
- `removeOnComplete` - Clean up successful jobs
- `removeOnFail` - Keep failed jobs for debugging

## Error Handling

- Log errors with context
- Use appropriate retry strategies
- Consider dead letter queue for persistent failures
- Send alerts for critical job failures
