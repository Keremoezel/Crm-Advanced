## Summary

<!-- Brief description of changes -->

## Related Issue

<!-- closes #<issue_number> -->

## Type of Change

- [ ] `feat` — New feature
- [ ] `fix` — Bug fix
- [ ] `schema` — Database schema change
- [ ] `refactor` — Code restructure
- [ ] `docs` — Documentation
- [ ] `test` — Tests
- [ ] `chore` — Maintenance

## Checklist

- [ ] Code follows project conventions (no duplication, no raw SQL, tenant-scoped)
- [ ] All queries filter by `tenantId`
- [ ] Input validated with Zod schema
- [ ] API endpoints require authentication
- [ ] No `SELECT *` — specific columns selected
- [ ] Pagination used for list endpoints
- [ ] No N+1 queries
- [ ] TypeScript strict — no `any` types
- [ ] German UI text (de-DE) used where applicable
- [ ] Tests added/updated
- [ ] Self-reviewed for security issues (SQL injection, XSS, CSRF)

## Screenshots (if UI change)

<!-- Add screenshots here -->
