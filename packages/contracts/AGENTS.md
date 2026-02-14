# Contracts (Zod Schemas)

Zod 4 schemas for API request/response validation.

## Specific Zod4 guidelines

- **Use the 'error' param instead of 'message'. The old message parameter is still supported but deprecated.**

```js
// DO
z.string().min(5, { error: 'Too short.' });

// DON'T
z.string().min(5, { message: 'Too short.' });
```

- **The 'invalid_type_error' / 'required_error' params have been dropped.**

```js
// DO
z.string({
  error: (issue) =>
    issue.input === undefined ? 'This field is required' : 'Not a string',
});

// DON'T
z.string({
  required_error: 'This field is required',
  invalid_type_error: 'Not a string',
});
```

- **'errorMap' has been dropped and renamed to 'error'**

Error maps can also now return a plain string (instead of {message: string}). They can also return undefined, which tells Zod to yield control to the next error map in the chain.

```js
// DO
z.string().min(5, {
  error: (issue) => {
    if (issue.code === 'too_small') {
      return `Value must be >${issue.minimum}`;
    }
  },
});

//DON'T
z.string({
  errorMap: (issue, ctx) => {
    if (issue.code === 'too_small') {
      return { message: `Value must be >${issue.minimum}` };
    }
    return { message: ctx.defaultError };
  },
});
```

-**ZodError issue formats have been updated.**

```js
// Use the updated issue formats
import * as z from "zod"; // v4

type IssueFormats =
  | z.core.$ZodIssueInvalidType
  | z.core.$ZodIssueTooBig
  | z.core.$ZodIssueTooSmall
  | z.core.$ZodIssueInvalidStringFormat
  | z.core.$ZodIssueNotMultipleOf
  | z.core.$ZodIssueUnrecognizedKeys
  | z.core.$ZodIssueInvalidValue
  | z.core.$ZodIssueInvalidUnion
  | z.core.$ZodIssueInvalidKey // new: used for z.record/z.map
  | z.core.$ZodIssueInvalidElement // new: used for z.map/z.set
  | z.core.$ZodIssueCustom;

// Below is the list of Zod 3 issues types and their Zod 4 equivalent

import * as z from "zod"; // v3

export type IssueFormats =
  | z.ZodInvalidTypeIssue // ♻️ renamed to z.core.$ZodIssueInvalidType
  | z.ZodTooBigIssue  // ♻️ renamed to z.core.$ZodIssueTooBig
  | z.ZodTooSmallIssue // ♻️ renamed to z.core.$ZodIssueTooSmall
  | z.ZodInvalidStringIssue // ♻️ z.core.$ZodIssueInvalidStringFormat
  | z.ZodNotMultipleOfIssue // ♻️ renamed to z.core.$ZodIssueNotMultipleOf
  | z.ZodUnrecognizedKeysIssue // ♻️ renamed to z.core.$ZodIssueUnrecognizedKeys
  | z.ZodInvalidUnionIssue // ♻️ renamed to z.core.$ZodIssueInvalidUnion
  | z.ZodCustomIssue // ♻️ renamed to z.core.$ZodIssueCustom
  | z.ZodInvalidEnumValueIssue // ❌ merged in z.core.$ZodIssueInvalidValue
  | z.ZodInvalidLiteralIssue // ❌ merged into z.core.$ZodIssueInvalidValue
  | z.ZodInvalidUnionDiscriminatorIssue // ❌ throws an Error at schema creation time
  | z.ZodInvalidArgumentsIssue // ❌ z.function throws ZodError directly
  | z.ZodInvalidReturnTypeIssue // ❌ z.function throws ZodError directly
  | z.ZodInvalidDateIssue // ❌ merged into invalid_type
  | z.ZodInvalidIntersectionTypesIssue // ❌ removed (throws regular Error)
  | z.ZodNotFiniteIssue // ❌ infinite values no longer accepted (invalid_type)
```

- **z.string() changes**

```js
// String formats are now represented as subclasses of ZodString, instead of simple internal refinements.
z.email();
z.uuid();
z.url();
z.emoji(); // validates a single emoji character
z.base64();
z.base64url();
z.nanoid();
z.cuid();
z.cuid2();
z.ulid();
z.ipv4();
z.ipv6();
z.cidrv4(); // ip range
z.cidrv6(); // ip range
z.iso.date();
z.iso.time();
z.iso.datetime();
z.iso.duration();

// The method forms (z.string().email()) still exist and work as before, but are now deprecated.

// DO
z.email(); // ✅

// DON'T
z.string().email(); // ❌ deprecated
```

- **And much, much, much more changes**

The Zod 4 changes also updates: error map precedence, deprecates .format(), deprecates .flatten(), drops .formErrors, deprecates .addIssue() and .addIssues(), changes to z.number(), changes to z.object(), etc.

Head to the [Zed 4 docs](https://zod.dev/v4/changelog) for the full changelog

## Dos and Don'ts

### Do

- Utilise the new syntax and features implemented in Zod 4
- Use Zod for request/response validation schemas
- Export types that are used by both API and web
- Keep validation schemas in sync with the Prisma schema

### Don't

- Don't utilise Zod 3 deprecated syntax
- Add types only used by one application
- Duplicate types that exist in other packages

## Key Schemas

- `src/auth/` - Magic link request/verify schemas
- `src/users/` - User role schemas
- `src/organizations/` - Organization schemas

## Commands

```bash
cd packages/contracts && npm run build
```

## See Also

- [Root AGENTS.md](../AGENTS.md)
- [API Package](../apps/api/AGENTS.md)
- [Database Package](../database/AGENTS.md)
- [Zed 4 docs](https://zod.dev/v4/changelog)
