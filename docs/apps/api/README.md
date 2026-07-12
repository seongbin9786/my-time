# My Commit API

NestJS + host MySQL 기반 API입니다.

## Architecture

```text
Browser
  │
  ▼
Caddy web container
  ├─ static web assets
  └─ /api/* -> NestJS api container
                  │
                  ▼
             host local MySQL
```

MySQL은 Docker Compose 서비스가 아닙니다. API 컨테이너는 `host.docker.internal`을 통해 host MySQL에 접속합니다.

## Data Model

로그 저장은 append-only revision + current pointer 모델입니다.

- `log_revisions`: 모든 저장 버전의 완전한 원문 snapshot
- `current_logs`: 날짜별 현재 revision pointer

정상 base로 저장하면 새 revision을 만들고 current pointer를 갱신합니다. stale base로 저장하면 새 revision은 남기지만 current pointer는 바꾸지 않습니다.

## Scripts

`apps/api` 기준:

```bash
pnpm dev
pnpm build
pnpm start
pnpm test
pnpm lint
pnpm db:migrate
```

저장소 루트 기준:

```bash
pnpm dev:api
pnpm build:api
pnpm --filter my-commit-api test
pnpm db:migrate
```

## Environment

루트 `.env.local`을 사용합니다.

```bash
JWT_SECRET=your-fixed-secret
DATABASE_URL=mysql://my_commit:my_commit@127.0.0.1:3306/my_commit
DOCKER_DATABASE_URL=mysql://my_commit:my_commit@host.docker.internal:3306/my_commit
```

Prisma CLI와 로컬 API는 `DATABASE_URL`을 사용합니다. Docker API는
`DOCKER_DATABASE_URL`을 사용합니다.

## Endpoints

```text
POST /auth/signup
POST /auth/login

GET /user-settings
PUT /user-settings

GET  /raw-logs
POST /raw-logs
POST /raw-logs/bulk
GET  /raw-logs/:date
GET  /raw-logs/:date/backups
```

## Migration

```bash
pnpm --filter my-commit-api db:migrate
```

Prisma가 `apps/api/prisma/migrations`의 적용 이력을 관리하며 다음 테이블을 생성합니다.

- `users`
- `user_settings`
- `log_revisions`
- `current_logs`

기존 수동 schema script로 이미 테이블을 만든 DB를 그대로 사용할 때는 최초 한 번
초기 migration을 baseline 처리한 뒤 deploy합니다.

```bash
pnpm --filter my-commit-api exec prisma migrate resolve --applied 20260712000000_init
pnpm db:migrate
```

## Troubleshooting

### `ECONNREFUSED 127.0.0.1:3306`

Host MySQL is not running or `DATABASE_URL` is wrong.

### Docker container cannot connect to MySQL

Check that MySQL listens on an address reachable from Docker and that the
`DOCKER_DATABASE_URL` user can connect from the Docker host gateway. On macOS,
`host.docker.internal` is supported by Docker Desktop. On Linux,
`docker-compose.yml` adds `host.docker.internal:host-gateway`.
