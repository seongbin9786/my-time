# ADR 004: 자체 호스팅 NestJS + MySQL 리비전 동기화

## 상태

채택 및 구현 완료.

## 배경

기존 프로젝트는 AWS 중심 인프라를 사용하고 있었다.

- AWS Lambda용 Hono API.
- DynamoDB 및 DynamoDB Local.
- Serverless Framework 배포.
- S3/CloudFront 웹 배포.
- AWS ACM/DNS/deploy/reset 스크립트.

제품 요구사항이 다음과 같이 바뀌었다.

1. AWS 인프라 의존성을 제거해야 한다.
2. 런타임은 로컬 Docker 기반이어야 한다.
3. 필요한 인프라는 오픈소스이며 자체 호스팅 가능해야 한다.
4. 데이터베이스는 Docker MySQL이 아니라 호스트의 로컬 MySQL이어야 한다.
5. API는 NestJS로 직접 구현할 수 있다.
6. 로그 데이터는 유실되면 안 된다. 저장된 모든 버전은 원문 전체를 보관해야 한다.
7. 동시 편집은 목표 요구사항이 아니다. 핵심 위험은 로딩 실패나 오래된 로컬 상태로 인해 stale 데이터가 최신 데이터를 덮어쓰는 것이다.

## 결정

백엔드를 NestJS + MySQL로 옮기고, current pointer를 가진 append-only revision 저장 방식을 사용한다.

자체 호스팅 런타임은 다음으로 구성한다.

- `api`: NestJS Docker 컨테이너.
- `web`: Docker 컨테이너의 Caddy가 서빙하는 Vite 정적 빌드. `/api/*` 요청도 API 컨테이너로 프록시한다.
- `mysql`: Docker Compose가 관리하지 않는 호스트 로컬 MySQL.

로그 동기화는 다음을 사용한다.

- `log_revisions`: append-only 전체 원문 스냅샷.
- `current_logs`: 날짜별 현재 승격 revision을 가리키는 pointer.

모든 저장 요청은 전체 원문 revision을 insert한다. 서버는 해당 revision의 base revision이 현재 revision과 일치할 때만 current로 승격한다. base가 stale이거나 알 수 없는 경우, revision은 보존하지만 current를 대체하지 않는다.

## 결과

### 장점

- AWS 배포와 DynamoDB lock-in을 제거한다.
- MySQL transaction 덕분에 revision append와 guarded promotion을 이해하기 쉽다.
- stale 저장이 current를 조용히 덮어쓸 수 없다.
- 거절되거나 stale인 저장도 `log_revisions`에 전체 원문으로 보존된다.
- 복원과 import를 destructive replacement가 아니라 새 revision으로 모델링할 수 있다.

### 단점

- production 데이터가 있다면 기존 DynamoDB 데이터의 export/migration 경로가 필요하다.
- API 패키지 변경 폭이 크다.
- MySQL 호스트 lifecycle, backup, credential 관리는 이제 운영자의 책임이다.
- Docker 컨테이너가 호스트 MySQL에 연결하려면 플랫폼별 네트워킹 설정이 필요하다.

## 구현 메모

- macOS Docker에서는 API가 `MYSQL_HOST=host.docker.internal`을 사용해야 한다.
- Linux Docker에서는 Compose가 `extra_hosts: host.docker.internal:host-gateway`를 제공해야 한다.
- `JWT_SECRET`은 계속 필요하며 안정적으로 유지되어야 한다.
- 첫 migration 단계에서는 기존 웹 endpoint 호환성을 유지해야 한다.
- 새 revision 필드는 기존 클라이언트를 깨뜨리지 않는 방식으로 응답에 추가해야 한다.

## 기각한 대안

### AWS + DynamoDB 유지

AWS 인프라 의존성을 제거해야 한다는 요구사항이 명확하므로 기각한다.

### Docker 기반 MySQL

Docker 없는 로컬 MySQL을 원한다는 요구사항이 명확하므로 기각한다.

### CAS 거절만 수행

stale 클라이언트 content도 보존되어야 하므로 기각한다. 제출된 content를 버리는 CAS 실패는 데이터 무손실 요구사항을 만족하지 못한다.

### S3/오브젝트 스냅샷 저장소

현재는 YAGNI로 보고 기각한다. 현재 로그 content 크기에는 MySQL text snapshot으로 충분하며 로컬 운영도 더 단순하다.
