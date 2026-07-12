# Self-hosted MySQL Revision Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove AWS infrastructure dependency and replace the API/data layer with a NestJS + host MySQL implementation that stores every log version as a complete revision and only promotes safe revisions to current.

**Architecture:** The API runs as a NestJS HTTP server in Docker. MySQL runs on the host, not in Docker, and the API connects through `host.docker.internal` when containerized. Logs use append-only `log_revisions` plus `current_logs` pointer; stale writes are preserved as revisions but do not overwrite current.

**Tech Stack:** NestJS, mysql2, Node crypto, Vite web, Docker Compose, Caddy, host MySQL.

---

### Task 1: Documentation Source of Truth

**Files:**
- Modify: `docs/SYNC_POLICY_COMPARISON.md`
- Create: `docs/adr/004-self-hosted-nestjs-mysql-revision-sync/004-self-hosted-nestjs-mysql-revision-sync.md`
- Create: `docs/superpowers/plans/2026-06-21-self-hosted-mysql-revision-sync.md`

- [x] **Step 1: Record requirements**

Capture these decisions:

- AWS infrastructure dependency must be removed.
- Runtime is local Docker based.
- Required external services must be open-source and self-hostable.
- DB is host local MySQL, not Docker MySQL.
- API moves to NestJS.
- Log sync uses option 3: append-only revisions plus current pointer.
- Technical decisions discovered during implementation must be written to MD/ADR.

### Task 2: API Package Conversion

**Files:**
- Modify: `apps/api/package.json`
- Modify: `apps/api/tsconfig.json`
- Delete/ignore: `apps/api/serverless.yml`
- Delete/ignore: `apps/api/docker-compose.yml`

- [x] **Step 1: Replace Hono/Serverless/DynamoDB dependencies**

Remove AWS, Hono, Serverless, DynamoDB Local dependencies. Add NestJS, mysql2, reflect-metadata, rxjs.

- [x] **Step 2: Replace scripts**

Use:

- `dev`: `tsx watch src/main.ts`
- `build`: `tsc -p tsconfig.json`
- `start`: `node dist/main.js`
- `test`: `vitest run`
- `db:migrate`: `tsx scripts/migrate.ts`

### Task 3: MySQL Schema

**Files:**
- Create: `apps/api/src/db/schema.ts`
- Create: `apps/api/scripts/migrate.ts`

- [x] **Step 1: Define schema**

Create tables:

- `users`
- `user_settings`
- `current_logs`
- `log_revisions`

The critical invariant is that `log_revisions.content` stores the full content snapshot for every saved version.

- [x] **Step 2: Implement migration script**

The script connects to host MySQL using env vars and executes idempotent `CREATE TABLE IF NOT EXISTS` statements.

### Task 4: MySQL Connection Layer

**Files:**
- Create: `apps/api/src/db/mysql.ts`

- [x] **Step 1: Implement mysql2 pool**

Use env vars:

- `MYSQL_HOST`
- `MYSQL_PORT`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_DATABASE`

Default host is `127.0.0.1` for local dev. Docker compose uses `host.docker.internal`.

### Task 5: NestJS API Structure

**Files:**
- Create: `apps/api/src/main.ts`
- Create: `apps/api/src/app.module.ts`
- Create: `apps/api/src/auth/*`
- Create: `apps/api/src/settings/*`
- Create: `apps/api/src/logs/*`

- [x] **Step 1: Bootstrap Nest**

Enable CORS using `ALLOWED_ORIGINS`.

- [x] **Step 2: Implement JWT auth**

Use Node crypto HS256 with the existing `JWT_SECRET` env var. Keep response shape `{ access_token }`.

### Task 6: Users and Settings

**Files:**
- Create: `apps/api/src/users/users.repository.ts`
- Create: `apps/api/src/settings/settings.controller.ts`
- Create: `apps/api/src/settings/settings.service.ts`

- [x] **Step 1: Preserve API compatibility**

Keep:

- `POST /auth/signup`
- `POST /auth/login`
- `GET /user-settings`
- `PUT /user-settings`

### Task 7: Revision Log Sync

**Files:**
- Create: `apps/api/src/logs/logs.repository.ts`
- Create: `apps/api/src/logs/logs.service.ts`
- Create: `apps/api/src/logs/logs.controller.ts`

- [x] **Step 1: Implement append plus guarded promotion**

For `POST /raw-logs`:

1. Start transaction.
2. Lock current row for user/date.
3. Insert full-content revision.
4. Promote only when request `baseRevisionId` matches current revision, or existing-client `parentHash` matches current content hash. If no current revision exists, the first saved revision becomes current.
5. Commit.

- [x] **Step 2: Preserve legacy client compatibility**

Existing web sends `contentHash` and `parentHash`. Until the web is migrated, map `parentHash` to `baseContentHash` and still append every save as a revision. A stale save is preserved with `promoted=false` and does not overwrite current.

### Task 8: Self-host Docker

**Files:**
- Create: `Dockerfile.api`
- Create: `Dockerfile.web`
- Create: `docker-compose.yml`
- Create: `Caddyfile`
- Modify: `.env.example`

- [x] **Step 1: Compose api/web/caddy**

Do not include MySQL as a service. API connects to host MySQL.

### Task 9: AWS Removal

**Files:**
- Modify: `package.json`
- Modify: `apps/web/package.json`
- Delete: `apps/api/serverless.yml`
- Delete: `apps/web/serverless.yml`
- Delete or deprecate AWS deployment scripts/docs.

- [x] **Step 1: Remove AWS deploy scripts**

Root scripts should not expose AWS deploy/undeploy commands.

### Task 10: Verification

**Files:**
- Existing test/build configs.

- [x] **Step 1: Run API build**

Run: `pnpm --filter my-commit-api build`

- [x] **Step 2: Run web tests**

Run: `pnpm --filter my-commit-client test`

- [x] **Step 3: Run web build**

Run: `pnpm --filter my-commit-client build`

- [x] **Step 4: Run lint if dependency install succeeds**

Run: `pnpm --filter my-commit-api lint`
Run: `pnpm --filter my-commit-client lint`
