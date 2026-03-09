---
description:
alwaysApply: true
---

# CRM-Advanced — Project Instructions

## What Is This Project?

Multi-tenant SaaS CRM for Power4 company. Sales teams and outbound callers manage leads, contacts, deals, and calls via Microsoft Teams integration. German UI, English code.

## Sprint Workflow

When asked to work on an issue or sprint:

1. Read the issue from GitHub: `"C:\Program Files\GitHub CLI\gh.exe" issue view <number>`
2. Create a feature branch: `git checkout -b feature/<short-name>`
3. Implement the issue following all engineering rules below
4. After completion, commit and offer to create a PR that closes the issue

When asked "start sprint X" or "do issue #N":

- Fetch issue details from GitHub
- Follow the acceptance criteria in the issue body
- Mark progress and check off items as completed

## Current Sprint Status

- **Sprint Plan**: 14 sprints (S1-S14), 44 issues total
- **GitHub Project**: https://github.com/users/Keremoezel/projects/1
- **Milestones**: https://github.com/Keremoezel/Crm-Advanced/milestones
- **Issues**: https://github.com/Keremoezel/Crm-Advanced/issues

## Tech Stack

- **Nuxt 4** + **Nuxt UI v4** + **Tailwind CSS v4**
- **NuxtHub** (SQLite/libSQL, KV, Blob, Cache)
- **Drizzle ORM** v0.45 — the ONLY way to query the database
- **CASL.js** v6 — permission system
- **nuxt-auth** — email-based authentication
- **Microsoft Graph API** — Teams integration
- **UI Language**: German (de-DE)
- **Code Language**: English

## Engineering Rules (NON-NEGOTIABLE)

### Security

- NO raw SQL — Drizzle ORM only, always parameterized
- Every API route requires authentication (except /api/auth/login)
- Every query MUST filter by `tenantId` (multi-tenant isolation)
- Validate ALL input with Zod schemas — no exceptions
- No secrets in client-side code
- Use `createError()` for API errors with proper HTTP status codes

### Code Quality

- NO code duplication — extract into composables, utils, or shared components
- NO unnecessary code — every line serves a purpose
- After writing code, review for: duplication, dead code, security issues
- TypeScript strict — no `any` types
- Comments only where logic is non-obvious

### Performance (Design for 10M+ Records)

- Pagination on EVERY list endpoint — cursor-based, not offset
- Select specific columns — never `SELECT *`, use `.select({ col1, col2 })`
- Prevent N+1 — use Drizzle joins/relations, never loop queries
- Database indexes on all FKs and frequently queried columns
- Cache expensive reads in NuxtHub KV (roles, permissions, tenant config)
- Batch inserts limited to 50 rows (SQLite constraint)

### Nuxt Patterns

- NuxtHub auto-imports `db` and `schema` in server routes
- File-based routing in `pages/` directory
- Composables in `composables/` with `use` prefix
- Server utils in `server/utils/`
- API routes follow REST convention: `server/api/[resource]/index.get.ts`
- Layouts in `layouts/`, middleware in `middleware/`
- `<UApp>` wrapper required in app.vue

### Database

- Migration workflow: edit `server/db/schema.ts` → start dev → run `npx drizzle-kit generate --config .nuxt/hub/db/drizzle.config.ts`
- Every table has: `id` (UUID), `tenantId`, `createdAt`, `updatedAt`
- Foreign keys with proper ON DELETE behavior
- Composite indexes for multi-column query patterns (e.g., tenantId + status)

## Git Workflow & Branch Strategy

- **Main branch**: `main` — protected, requires PR with passing CI
- **Feature branches**: `feature/<short-name>` (e.g., `feature/tenant-schema`)
- **Fix branches**: `fix/<short-name>` (e.g., `fix/user-validation`)
- **Conventional commits**: `feat:`, `fix:`, `schema:`, `refactor:`, `test:`, `ci:`, `chore:`, `security:`
- **PR closes issue**: include `closes #N` in PR body

## CI/CD Pipeline

On every push/PR to `main`, GitHub Actions runs:

1. **Lint & Format** — ESLint + Prettier check
2. **Type Check** — `nuxt typecheck`
3. **Unit Tests** — `vitest run`
4. **Build** — `nuxt build`

All must pass before merge is allowed.

## Development Commands

```bash
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint issues
pnpm format           # Format with Prettier
pnpm format:check     # Check formatting
pnpm typecheck        # TypeScript type checking
pnpm test:unit        # Run unit tests
pnpm test:unit:watch  # Watch mode
pnpm test:e2e         # Run Playwright E2E tests
pnpm db:generate      # Generate Drizzle migration
```

## Pre-commit Hooks (Husky)

- **pre-commit**: `lint-staged` runs ESLint + Prettier on staged files
- **commit-msg**: `commitlint` enforces conventional commit format

## Testing

- **Unit tests**: `tests/unit/` — Vitest + @nuxt/test-utils + happy-dom
- **E2E tests**: `tests/e2e/` — Playwright (Chromium)
- Config: `vitest.config.ts`, `playwright.config.ts`

## GitHub CLI

Path: `"C:\Program Files\GitHub CLI\gh.exe"`

- View issue: `gh issue view <number>`
- List sprint issues: `gh issue list --milestone "S1: Multi-Tenant Schema & Authentication"`
- Close issue via PR: include `closes #N` in PR body
