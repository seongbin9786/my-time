# My Commit

시간 관리 및 기록 애플리케이션입니다.

## 구조

```text
my-commit/
├── apps/
│   ├── web/          # React + Vite frontend
│   └── api/          # NestJS API
├── packages/
│   └── eslint-config/
├── Dockerfile.api
├── Dockerfile.web
├── Caddyfile
└── docker-compose.yml
```

## Runtime Policy

- AWS infrastructure dependency 없음.
- API/Web은 Docker 기반으로 실행.
- DB는 Docker Compose에 포함하지 않고 host local MySQL을 사용.
- API는 NestJS + MySQL.
- 로그는 append-only revision + current pointer 모델로 저장.
- stale 저장은 서버에 revision으로 보존하되 current를 덮어쓰지 않음.

관련 문서:

- [동기화 정책 비교](./docs/SYNC_POLICY_COMPARISON.md)
- [ADR 004](./docs/adr/004-self-hosted-nestjs-mysql-revision-sync/004-self-hosted-nestjs-mysql-revision-sync.md)

## 사전 준비

- Node.js 22 권장
- pnpm 9
- Docker / Docker Compose
- Host local MySQL

MySQL 예시:

```sql
CREATE DATABASE my_commit CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'my_commit'@'%' IDENTIFIED BY 'my_commit';
CREATE USER 'my_commit'@'localhost' IDENTIFIED BY 'my_commit';
GRANT ALL PRIVILEGES ON my_commit.* TO 'my_commit'@'%';
GRANT ALL PRIVILEGES ON my_commit.* TO 'my_commit'@'localhost';
FLUSH PRIVILEGES;
```

## 환경 변수

```bash
cp .env.example .env.local
```

주요 값:

```bash
JWT_SECRET=your-fixed-secret
VITE_API_URL=http://localhost:3000

DATABASE_URL=mysql://my_commit:my_commit@127.0.0.1:3306/my_commit
DOCKER_DATABASE_URL=mysql://my_commit:my_commit@host.docker.internal:3306/my_commit

WEB_PORT=8080
ALLOWED_ORIGINS=http://localhost,http://localhost:8080,http://localhost:4000
```

Prisma CLI와 로컬 API는 `DATABASE_URL`을 사용합니다. Docker API는
`DOCKER_DATABASE_URL`로 host MySQL에 접속합니다.

## 로컬 개발

```bash
pnpm install
pnpm db:migrate
```

터미널 1:

```bash
pnpm dev:api
```

터미널 2:

```bash
pnpm dev:web
```

접속:

- Web dev: http://localhost:4000
- API: http://localhost:3000

## Docker 실행

Host MySQL이 먼저 실행 중이어야 합니다. `selfhost:up`은 먼저 Prisma
migration을 적용한 뒤 Docker Compose를 시작합니다.

```bash
pnpm selfhost:up
```

접속:

- Web: http://localhost:8080
- API proxy: http://localhost:8080/api

종료:

```bash
pnpm selfhost:down
```

로그:

```bash
pnpm selfhost:logs
```

## 명령어

```bash
# 개발
pnpm dev
pnpm dev:web
pnpm dev:api

# DB
pnpm db:migrate

# 빌드
pnpm build
pnpm build:web
pnpm build:api

# 테스트
pnpm test
pnpm test:web
pnpm --filter my-commit-api test

# 린트
pnpm lint
pnpm lint:fix

# self-host
pnpm selfhost:up
pnpm selfhost:down
pnpm selfhost:logs
```

## API

인증:

```text
POST /auth/signup
POST /auth/login
```

설정:

```text
GET /user-settings
PUT /user-settings
```

로그:

```text
GET  /raw-logs
POST /raw-logs
POST /raw-logs/bulk
GET  /raw-logs/:date
GET  /raw-logs/:date/backups
```

## 백업

운영 백업은 host MySQL 기준으로 수행합니다.

```bash
mysqldump -u my_commit -p my_commit > my_commit_backup.sql
```

앱의 JSON export는 사용자 단위 current data 이동용으로 유지합니다. 전체 버전 보존의 source of truth는 MySQL `log_revisions`입니다.
