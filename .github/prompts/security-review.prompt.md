# Security Review

Review the code for security vulnerabilities.

## Checklist

### Authentication & Authorization

- [ ] All endpoints require authentication (or explicitly marked `@Public()`)
- [ ] Role-based guards are properly applied
- [ ] Session validation is performed
- [ ] JWT/token handling is secure

### Multi-Tenant Data Isolation

- [ ] All queries are scoped by `organizationId`
- [ ] SUPER_ADMIN bypass is intentional and correct
- [ ] No data leakage between organizations
- [ ] Proper ownership validation before updates/deletes

### Input Validation

- [ ] All inputs validated with Zod schemas
- [ ] No raw user input in database queries
- [ ] File uploads are validated and sanitized
- [ ] URL parameters are validated

### SQL Injection Prevention

- [ ] Using Prisma parameterized queries (not raw SQL)
- [ ] No string concatenation in queries
- [ ] Dynamic filters are properly escaped

### Sensitive Data Handling

- [ ] Passwords stored in `private` schema
- [ ] Tokens/secrets not logged
- [ ] Sensitive fields excluded from API responses
- [ ] PII properly protected

### API Security

- [ ] Rate limiting on sensitive endpoints
- [ ] CORS properly configured
- [ ] No sensitive data in error messages
- [ ] Proper HTTP status codes

## Report Format

For each issue found:

1. **Severity**: Critical/High/Medium/Low
2. **Location**: File and line number
3. **Issue**: Description of the vulnerability
4. **Recommendation**: How to fix it
