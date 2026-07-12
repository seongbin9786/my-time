# 동기화 정책 비교: 현재 구현과 단순화된 To-be

## 전제

이 문서는 다음 전제를 기준으로 현재 동기화 정책과 To-be 정책을 비교한다.

1. 동시 수정 충돌 해결은 지금 필요 없다.
2. 정보 손실은 없어야 한다. 서버에 올라간 개별 버전은 완전한 원문으로 모두 보관되어야 한다.
3. 동시에 여러 곳에서 같은 날짜를 편집하는 일은 없다고 본다.
4. 핵심 위험은 로딩 실패, stale 로컬 캐시, 신규 디바이스 초기 fetch 실패 같은 상황에서 오래된 내용이 최신 서버 내용을 덮어쓰는 것이다.
5. 버그성 저장이 발생하더라도 기존 서버 데이터와 새로 작성된 데이터가 모두 남아야 한다.

## 현재 정책 요약

현재 프론트엔드는 날짜별 localStorage wrapper에 다음 메타데이터를 저장한다.

- `content`
- `contentHash`
- `parentHash`
- `localUpdatedAt`

사용자가 편집하면 `updateRawLog`가 발생하고, middleware가 즉시 localStorage에 저장한 뒤 300ms debounce 후 서버에 저장한다.

날짜 이동, 로그인, 현재 날짜 fetch 트리거가 발생하면 localStorage를 먼저 hydrate하고 서버 데이터를 fetch한다. 이후 `contentHash`/`parentHash`를 비교해 다음 네 가지 상태 중 하나로 판단한다.

- `NO_CONFLICT_SAME`
- `FAST_FORWARD`
- `LOCAL_AHEAD`
- `CONFLICT_DIVERGED`

백엔드는 `saveLog`에서 기존 current log가 있으면 `log-backups` 테이블에 기존 current 내용을 저장한 뒤 current row를 새 내용으로 덮어쓴다. 즉 서버는 overwrite 전에 직전 버전을 백업한다.

관련 구현:

- `apps/web/src/store/RawLogStorageSyncMiddleware.ts`
- `apps/web/src/utils/StorageUtil.ts`
- `apps/web/src/utils/ConflictDetector.ts`
- `apps/api/src/logs.ts`
- `apps/web/src/features/dataManagement/backupService.ts`

## 현재 정책의 장점

- 사용자 편집과 서버 저장 경로가 이미 존재한다.
- 서버 저장 전 기존 current를 백업하므로, 정상 저장 경로를 타면 직전 서버 버전은 남는다.
- localStorage wrapper가 있어 로컬 수정 chain을 어느 정도 추적할 수 있다.
- 최근 수정으로 hydrate/refresh/import에서 발생하던 일부 오염과 잘못된 parent metadata 문제는 완화되었다.

## 현재 정책의 문제

### 1. 문제 정의보다 정책이 복잡하다

현재 구조는 Git식 `parentHash`와 충돌 감지에 가깝다. 하지만 실제 요구는 동시 편집 병합이 아니라, stale 클라이언트가 최신 데이터를 잃게 만들지 않는 것이다.

동시 편집을 다루지 않는다면 `FAST_FORWARD`, `LOCAL_AHEAD`, `CONFLICT_DIVERGED` 같은 클라이언트 추론은 핵심 요구보다 복잡하다.

### 2. 서버가 최종 방어선이 아니다

프론트엔드는 `parentHash`를 보내지만, 백엔드는 이를 검증하지 않는다. 서버는 현재 row를 읽고 백업한 뒤 새 row로 덮어쓴다.

따라서 클라이언트가 stale content를 보내도 서버는 이를 current로 승격한다. 기존 current는 backup에 남으므로 완전 유실은 막을 수 있지만, 최신 current가 오래된 내용으로 바뀌는 것은 막지 못한다.

### 3. 버전 보관 모델이 current + backups로 나뉘어 있다

현재 최신본은 `logs` 테이블에 있고, 이전본은 `log-backups` 테이블에 있다. 이 모델도 운영 가능하지만, "모든 개별 버전은 완전한 원문으로 저장된다"는 정책을 코드에서 이해하기 어렵다.

더 명확한 모델은 "모든 저장은 revision을 append하고, current는 특정 revision을 가리키는 pointer"이다.

### 4. 로컬 캐시와 서버 캐시가 같은 저장소 키를 공유한다

localStorage의 날짜 키가 에디터 표시, 로컬 draft, 서버에서 받아온 snapshot 역할을 섞어 가진다. 이 때문에 로딩 실패와 사용자 편집 경계가 흐려진다.

To-be에서는 최소한 개념적으로 다음을 분리해야 한다.

- 서버에서 확인된 현재 revision cache
- 아직 서버에 안전하게 승격되지 않은 local draft

### 5. 백업 import가 destructive replace 성격을 가진다

현재 import는 적용 전 날짜 키를 모두 지우고 backup 내용을 다시 저장한다. 로컬에서는 이해 가능하지만, 서버 동기화와 결합되면 "복구"가 곧 "여러 날짜 current 교체"가 된다.

To-be에서는 import도 revision append로 취급해야 한다. 기존 서버 current를 지우지 않고, import된 각 날짜 content를 새 revision으로 남긴 뒤 명시적으로 current 승격 여부를 결정해야 한다.

## To-be 정책: Append-only Revision + Guarded Promotion

권장 To-be는 CAS 기반 충돌 해결 UI가 아니라, 더 단순한 **append-only revision + guarded promotion** 모델이다.

핵심은 두 가지다.

1. 저장 요청은 어떤 경우에도 완전한 원문 revision으로 서버에 남긴다.
2. 단, 그 revision을 current로 승격할지는 서버가 `baseRevisionId`로 판단한다.

## To-be 데이터 모델

### Current

날짜별 현재 상태를 가리키는 pointer.

```ts
type CurrentLog = {
  userId: string;
  date: string;
  currentRevisionId: string;
  updatedAt: string;
};
```

### Revision

모든 저장 시도는 완전한 원문 snapshot으로 append된다.

```ts
type LogRevision = {
  userId: string;
  date: string;
  revisionId: string;
  content: string;
  contentHash: string;
  baseRevisionId: string | null;
  createdAt: string;
  source: 'edit' | 'restore' | 'import' | 'draft-save';
  promoted: boolean;
};
```

`revisionId`는 ULID 또는 timestamp + random suffix처럼 정렬 가능하고 충돌 가능성이 낮은 ID를 쓴다.

## To-be 저장 규칙

### 정상 저장

클라이언트가 현재 서버 revision을 로드한 뒤 편집한다.

1. 클라이언트가 `content`, `baseRevisionId`, `clientMutationId`를 보낸다.
2. 서버는 현재 `currentRevisionId`와 `baseRevisionId`를 비교한다.
3. 같으면 새 revision을 append하고 current pointer를 새 revision으로 갱신한다.
4. 응답은 새 `revisionId`와 `promoted: true`를 반환한다.

### 로딩 실패 또는 stale 저장

신규 디바이스가 서버 current를 제대로 로드하지 못했거나, 오래된 base로 저장한다.

1. 클라이언트가 `baseRevisionId: null` 또는 오래된 revision id로 저장한다.
2. 서버는 새 revision을 append한다.
3. 서버는 current pointer를 바꾸지 않는다.
4. 응답은 `promoted: false`, `reason: 'STALE_BASE'`를 반환한다.
5. 클라이언트는 서버 current를 다시 fetch하고, 사용자가 작성한 내용은 "보존된 미승격 revision"으로 표시한다.

이 정책이면 오래된 내용이 최신 current를 덮지 않고, 사용자가 새로 쓴 내용도 서버에 남는다.

### 같은 내용 저장

현재 revision의 `contentHash`와 요청 `contentHash`가 같으면 새 revision을 만들지 않고 no-op으로 처리해도 된다.

다만 "모든 저장 시도"까지 감사 로그로 남기고 싶다면 별도 event log를 둔다. 지금 요구는 개별 내용 버전 보존이므로 동일 content 중복 revision은 만들지 않아도 된다.

## 현재 정책 vs To-be 비교

| 항목 | 현재 정책 | To-be 정책 |
| --- | --- | --- |
| 핵심 모델 | current row + backup row + 클라이언트 parentHash | append-only revision + current pointer |
| 주요 목적 | 충돌 감지/fast-forward/local-ahead 추론 | 로딩 실패와 stale 저장으로부터 current 보호 |
| 서버 저장 | 기존 current를 backup 후 current overwrite | 새 revision append 후 조건부 current promotion |
| stale 저장 | current로 승격될 수 있음 | revision은 보존하되 current 승격 차단 |
| 동시 편집 처리 | 클라이언트가 hash 관계로 추정 | 지금은 목표 밖. stale base는 단순히 미승격 처리 |
| 정보 보존 | 정상 저장 경로에서는 직전 current 보존 | 모든 저장 content를 revision으로 보존 |
| 로컬 상태 | 날짜 key 하나가 cache/draft 역할을 섞음 | server cache와 local draft 개념 분리 |
| 복원 | 과거 backup content를 `updateRawLog`로 재저장 | 과거 revision content로 새 revision append |
| import | 기존 로컬 로그 삭제 후 backup 적용, 로그인 시 bulk sync | import content를 revision append. current 승격은 명시 정책 적용 |
| 코드 복잡도 | `ConflictDetector`, parent chain, conflict dialog | revision id, loaded gate, promotion result |
| 사용자 경험 | 충돌 dialog가 중심 | 로딩 완료 전 편집 제한, stale 저장 시 보존 안내 |

## 구현 가능한 방안들

아래 방안들은 모두 구현 가능하다. 차이는 "얼마나 빨리 안정화할 것인가", "서버 모델을 얼마나 바꿀 것인가", "데이터 보존을 어디까지 명시적으로 보장할 것인가"이다.

### 방안 1. 기존 구현 유지 + 국소 안정화

현재 구조를 유지한다.

- 프론트엔드: `contentHash`/`parentHash`/`ConflictDetector` 유지
- 백엔드: `logs` current row + `log-backups` 유지
- 저장: 기존 current를 backup에 저장한 뒤 current overwrite
- import/restore: 현재 방식 유지하되, 빈 로그/metadata 오염만 계속 보정

필요한 구현:

- 지금 수정한 내용 유지
- hydrate, restore, import, storage event가 `updateRawLog` 경로를 잘못 타지 않도록 테스트 추가
- `log-backups` 조회/복원 UX 개선
- 서버 backup 생성 실패 시 current overwrite도 실패하도록 트랜잭션 또는 방어 로직 추가

장점:

- 가장 적은 변경으로 갈 수 있다.
- 현재 테스트/코드 대부분을 재사용한다.
- 단기간 안정화에는 좋다.

단점:

- stale 저장이 current로 승격되는 문제는 남는다.
- `parentHash`를 서버가 검증하지 않으므로 모델이 정직하지 않다.
- 클라이언트 충돌 추론 로직이 요구사항보다 복잡하다.

적합한 경우:

- 당장 배포 리스크를 최소화해야 할 때
- 데이터 유실 방지는 "직전 current backup" 정도로 충분하다고 판단할 때

### 방안 2. 기존 테이블 유지 + Guarded overwrite

현재 `logs`와 `log-backups` 구조는 유지하되, 저장 API에 `baseContentHash` 또는 `baseVersion`을 추가한다.

- 정상 base면 current overwrite
- stale base면 current overwrite 금지
- stale 저장 content는 backup 또는 별도 rejected table에 저장

필요한 구현:

```ts
type SaveLogRequest = {
  date: string;
  content: string;
  contentHash: string;
  baseContentHash: string | null;
};

type SaveLogResponse = {
  success: true;
  promoted: boolean;
  reason?: 'STALE_BASE';
  current?: LogItem;
};
```

백엔드 동작:

1. 현재 `logs` row 조회
2. 요청 content를 먼저 보존용 row로 저장
3. `baseContentHash === current.contentHash`일 때만 current overwrite
4. 다르면 current 유지 후 `promoted: false` 반환

장점:

- 기존 current table 중심 구조를 크게 유지한다.
- stale overwrite를 막을 수 있다.
- append-only revision 모델보다 migration 부담이 작다.

단점:

- "모든 버전"이 어디에 저장되는지 모델이 여전히 애매할 수 있다.
- backup/rejected/draft 성격의 저장소를 잘 설계하지 않으면 다시 복잡해진다.
- current row에 content가 남아 있어 revision pointer 모델보다 덜 명확하다.

적합한 경우:

- 구조 개편은 줄이고 stale overwrite만 확실히 막고 싶을 때
- 현재 API와 UI를 대부분 유지하고 싶을 때

### 방안 3. Append-only revision + current pointer

이 문서의 기본 To-be다.

- 모든 저장은 `log-revisions`에 완전한 content snapshot으로 append
- `current`는 `currentRevisionId`만 가리킴
- `baseRevisionId`가 current와 같을 때만 새 revision을 current로 승격
- stale 저장은 revision으로 남기되 current는 유지

필요한 구현:

```ts
type LogRevision = {
  userId: string;
  date: string;
  revisionId: string;
  content: string;
  contentHash: string;
  baseRevisionId: string | null;
  source: 'edit' | 'restore' | 'import';
  promoted: boolean;
  createdAt: string;
};

type CurrentLog = {
  userId: string;
  date: string;
  currentRevisionId: string;
  updatedAt: string;
};
```

장점:

- 정보 보존 정책이 가장 명확하다.
- stale 저장과 current 승격을 분리할 수 있다.
- 복원/import도 같은 append 모델로 설명된다.
- `parentHash`와 conflict detector를 제거할 근거가 생긴다.

단점:

- 서버 데이터 모델 변경이 필요하다.
- 기존 `logs`/`log-backups` 데이터 migration 계획이 필요하다.
- current 조회 시 revision join 또는 2회 조회가 필요할 수 있다.

적합한 경우:

- 정보 손실 방지를 최우선 정책으로 명확히 만들고 싶을 때
- 중장기적으로 가장 이해하기 쉬운 모델을 원할 때

### 방안 4. Append-only revision only, current는 최신 promoted revision으로 계산

방안 3에서 current pointer table을 제거한다. 날짜별 current는 revision 목록 중 `promoted=true`인 최신 revision으로 계산한다.

필요한 구현:

- `log-revisions`만 둔다.
- promoted revision에는 `promotedAt`을 둔다.
- current 조회는 `date`별 `promotedAt` 최신 항목을 query한다.
- stale 저장은 `promoted=false`로 append한다.

장점:

- 테이블 수가 줄어든다.
- "저장소는 오직 revision log"라는 모델이 단순하다.
- current pointer와 revision append 사이의 transaction 부담이 줄어든다.

단점:

- MySQL에서 "날짜별 최신 promoted revision" 조회 인덱스를 신중히 설계해야 한다.
- promoted revision이 많아질 때 current 조회 비용/복잡도가 늘 수 있다.
- current 변경을 원자적으로 보장하려면 결국 조건부 promoted 처리나 별도 pointer가 다시 필요할 수 있다.

적합한 경우:

- 데이터량이 작고, current 조회 최적화보다 저장 모델 단순성이 더 중요할 때
- 날짜별 revision 수가 많지 않을 것으로 볼 때

### 방안 5. Draft-first 모델

서버 current를 직접 바꾸는 자동 저장을 없애거나 크게 제한한다. 모든 자동 저장은 draft/revision으로만 저장하고, current 승격은 명시적 조건에서만 한다.

동작:

- 타이핑 자동 저장: `draft revision` append
- 서버 current 로딩 완료 전: draft만 저장
- current 승격: 사용자가 저장 완료 상태를 확인했거나, base가 검증된 경우에만 수행

필요한 구현:

```ts
type DraftRevision = {
  userId: string;
  date: string;
  draftId: string;
  content: string;
  baseRevisionId: string | null;
  createdAt: string;
  promotedRevisionId?: string;
};
```

장점:

- 로딩 이슈로 current가 덮이는 경로를 강하게 줄인다.
- 자동 저장이 항상 보존용이라는 점이 명확하다.
- 신규 디바이스/느린 네트워크에 강하다.

단점:

- UX가 바뀐다. "자동 저장됨"과 "현재 버전으로 반영됨"을 구분해야 한다.
- 사용자가 보기에 저장 상태가 복잡해질 수 있다.
- current 승격 타이밍 정책을 따로 정해야 한다.

적합한 경우:

- 데이터 보존이 current 최신성보다 더 중요할 때
- 자동 저장을 안전한 임시 저장소로 격하해도 괜찮을 때

### 방안 6. Immutable object snapshot + MySQL metadata

로그 content 원문은 MinIO 같은 self-host object storage에 immutable snapshot으로 저장하고, MySQL에는 metadata와 current pointer만 둔다.

동작:

- 저장 시 content를 object로 업로드
- MySQL revision metadata row에는 object key, hash, size, source 저장
- current pointer는 promoted revision id 또는 object key를 가리킴

필요한 구현:

```ts
type LogRevisionMetadata = {
  userId: string;
  date: string;
  revisionId: string;
  objectKey: string;
  contentHash: string;
  contentSize: number;
  baseRevisionId: string | null;
  promoted: boolean;
  createdAt: string;
};
```

장점:

- 원문 snapshot 보존이 매우 명확하다.
- 큰 로그나 full history export에 유리하다.
- DB row size 제한에서 자유롭다.

단점:

- 현재 로그 텍스트 크기에는 과할 가능성이 높다.
- object write와 metadata write의 정합성 처리가 필요하다.
- 운영 리소스가 늘어난다.

적합한 경우:

- 로그 원문이 커질 가능성이 크거나 첨부/미디어까지 고려할 때
- 감사/보존 요건이 강해서 immutable object archive가 필요할 때

### 방안 7. Local-first operation log + 서버 snapshot archive

원문 snapshot이 아니라 사용자 입력 operation을 local queue에 쌓고 서버에 전송한다. 서버는 operation을 받아 snapshot revision을 만든다.

동작:

- 클라이언트는 edit operation을 queue에 저장
- 서버는 operation batch를 받아 새 snapshot revision 생성
- current 승격은 baseRevisionId 검증 후 수행

필요한 구현:

```ts
type LogOperationBatch = {
  date: string;
  baseRevisionId: string | null;
  operations: Array<{
    operationId: string;
    kind: 'replace_all';
    content: string;
    createdAt: string;
  }>;
};
```

현재 에디터가 textarea 전체 문자열 기반이므로, 실제 operation은 우선 `replace_all` 하나로 시작할 수 있다.

장점:

- 오프라인/재시도/idempotency를 체계화하기 좋다.
- `clientMutationId` 기반 중복 요청 방지가 쉽다.
- 나중에 세밀한 edit operation으로 확장 가능하다.

단점:

- 지금 요구에는 과할 수 있다.
- queue, retry, idempotency, compaction 정책이 필요하다.
- textarea 전체 content 앱에서는 append-only revision보다 이점이 작다.

적합한 경우:

- 오프라인 편집과 재시도 안정성을 중요하게 볼 때
- 앞으로 여러 입력 source나 자동화된 수정 이벤트가 많아질 때

## 방안별 간단 평가

| 방안 | 변경량 | 정보 보존 명확성 | stale overwrite 방지 | 모델 단순성 | 현재 맥락 적합도 |
| --- | --- | --- | --- | --- | --- |
| 1. 기존 유지 + 국소 안정화 | 낮음 | 중간 | 낮음 | 중간 | 단기 응급용 |
| 2. 기존 테이블 + guarded overwrite | 중간 | 중간 | 높음 | 중간 | 점진 개선용 |
| 3. revision + current pointer | 중간-높음 | 높음 | 높음 | 높음 | 가장 균형적 |
| 4. revision only | 중간 | 높음 | 중간-높음 | 중간 | 데이터량 작을 때 |
| 5. draft-first | 중간-높음 | 높음 | 매우 높음 | 중간 | 보수적 UX 가능할 때 |
| 6. immutable object snapshot | 높음 | 매우 높음 | 높음 | 낮음 | 현재는 과할 수 있음 |
| 7. operation log + snapshot | 높음 | 높음 | 높음 | 낮음 | 오프라인 중심일 때 |

내 기준의 1차 판단은 다음과 같다.

- 가장 빨리 안정화하려면 방안 2.
- 장기적으로 가장 명확하게 만들려면 방안 3.
- 사용자 입력을 절대 current에 바로 반영하지 않는 보수 정책이 필요하면 방안 5.
- 방안 6과 7은 지금 요구에는 YAGNI일 가능성이 높지만, 보존/오프라인 요구가 커지면 선택지가 된다.

## To-be 클라이언트 정책

### 1. 로딩 완료 전 저장 금지

로그인 상태에서 날짜를 열면 서버 current fetch가 끝나기 전까지 해당 날짜의 서버 저장을 금지한다.

UI 선택지는 두 가지다.

- 더 안전한 방식: 에디터를 read-only/loading 상태로 둔다.
- 덜 답답한 방식: 편집은 허용하되 local draft로만 저장하고, 서버 current 로드 전에는 upload하지 않는다.

현재 요구 기준으로는 첫 번째가 더 명확하다.

### 2. localStorage key 역할 분리

권장 키:

- `server-log:${date}`: 마지막으로 서버에서 확인한 current revision snapshot
- `draft-log:${date}`: 아직 서버에 승격되지 않은 사용자 draft
- `my-commit:current-date`: 현재 날짜

에디터는 다음 우선순위로 표시한다.

1. 미전송 draft가 있으면 draft
2. 없으면 server cache
3. 둘 다 없으면 빈 문자열

### 3. 저장 요청은 revision 기준으로 보낸다

```ts
type SaveLogRequest = {
  date: string;
  content: string;
  baseRevisionId: string | null;
  clientMutationId: string;
  source: 'edit' | 'restore' | 'import';
};
```

`parentHash`는 제거한다. `contentHash`는 서버나 클라이언트가 계산해 중복 저장 방지에만 쓴다.

### 4. 저장 응답은 승격 여부를 명확히 반환한다

```ts
type SaveLogResponse = {
  revisionId: string;
  currentRevisionId: string;
  promoted: boolean;
  reason?: 'STALE_BASE' | 'DUPLICATE_CONTENT';
};
```

`promoted: true`면 draft를 지우고 server cache를 갱신한다.

`promoted: false`면 draft는 "서버에 보존됨" 상태로 남기고, current를 다시 fetch한다.

## To-be 서버 정책

### 1. 저장은 transaction으로 처리한다

서버 저장은 다음을 한 단위로 처리한다.

1. 현재 pointer 조회
2. 새 revision append
3. `baseRevisionId === currentRevisionId`일 때만 current pointer 갱신

MySQL에서는 transaction 안에서 현재 pointer row를 잠그고, 새 revision을 먼저 insert한 뒤, base가 current와 일치할 때만 current pointer를 갱신한다. 단, "stale 저장도 revision으로 남겨야 한다"는 요구 때문에 단순 CAS reject만으로 끝내면 안 된다.

### 2. current overwrite는 직접 하지 않는다

current row는 content를 직접 들고 있지 않고 current revision id만 가진다. content는 revision table에서 읽는다.

현재 구조를 크게 바꾸기 어렵다면 중간 단계로 `logs` row에 latest content를 유지하되, 저장 요청마다 먼저 `log-revisions`에 새 content를 append하고, 조건이 맞을 때만 `logs` row를 갱신한다.

### 3. 복원은 과거 revision을 current로 직접 되돌리지 않는다

복원은 새 revision을 만든다.

예:

- r10: 현재 내용
- r3: 과거 내용
- 사용자가 r3 복원 선택
- r11: r3의 content를 가진 새 revision, source=`restore`
- current pointer -> r11

이러면 복원 작업 자체도 되돌릴 수 있다.

## 백업/import To-be

### export

export는 두 종류로 나눈다.

- current export: 날짜별 현재 content만 내보냄
- full history export: 날짜별 모든 revision을 내보냄

현재 수동 백업 버튼은 current export로 유지해도 된다. "절대 정보 손실 없음" 보장은 서버 revision history가 담당한다.

### import

import는 기존 데이터를 지우지 않는다.

기본 정책:

1. import 파일의 각 날짜 content를 revision으로 append한다.
2. 서버 current를 이미 로드했고 사용자가 명시적으로 "현재값으로 복구"를 선택한 경우에만 promoted revision으로 만든다.
3. 그렇지 않으면 `source='import'`, `promoted=false`로 저장하고 사용자가 history에서 선택하게 한다.

이렇게 하면 잘못된 백업 파일을 import해도 기존 current는 보존된다.

## 기존 설계 문서와의 차이

`docs/EDITOR_SYNC_REDESIGN.md`는 서버 CAS와 409 conflict를 중심으로 한다. 그 설계는 다중 디바이스 동시 편집까지 고려하면 더 정석적이다.

하지만 현재 전제에서는 CAS reject보다 append-only guarded promotion이 더 맞다.

- CAS reject만 하면 클라이언트가 가진 새 content가 서버에 안 남을 수 있다.
- conflict dialog는 지금 요구에 비해 과하다.
- 필요한 것은 "같으면 승격, 다르면 보존만 하고 최신 current는 유지"이다.

즉 To-be는 CAS를 완전히 버리는 것이 아니라, CAS를 "저장 거부"가 아니라 "current 승격 조건"으로만 사용한다.

## 제거하거나 축소할 수 있는 것

To-be로 가면 다음은 제거 또는 축소 가능하다.

- `parentHash`
- `ConflictDetector`
- `FAST_FORWARD` / `LOCAL_AHEAD` / `CONFLICT_DIVERGED`
- 충돌 해결 모달 중심 UX
- 클라이언트의 Git식 parent chain 테스트

대신 다음이 필요하다.

- `revisionId`
- `baseRevisionId`
- `promoted` 상태
- 로딩 완료 전 edit/save gate
- revision history 조회/복원 UI

## 단계적 이전안

### Phase 1: 정책 경계 정리

- `parentHash` 용어를 신규 설계에서 사용하지 않는다.
- 클라이언트 상태를 `serverLoaded`, `serverRevisionId`, `draftContent` 중심으로 재정의한다.
- 로딩 완료 전 서버 upload를 금지한다.
- hydrate는 저장을 트리거하지 않는다는 규칙을 테스트로 고정한다.

### Phase 2: 서버 revision append 도입

- `log-revisions` 저장소를 추가한다.
- 기존 `saveLog`는 저장 요청마다 revision을 먼저 append한다.
- current 갱신은 `baseRevisionId`가 현재 revision과 같을 때만 수행한다.
- stale 저장은 `promoted=false` revision으로 남긴다.

### Phase 3: 클라이언트 단순화

- `ConflictDetector` 사용을 제거한다.
- `saveLogToServer` 요청/응답을 revision id 기반으로 바꾼다.
- 저장 응답의 `promoted` 값으로 draft 정리 여부를 결정한다.

### Phase 4: 백업/복원 UX 정리

- history는 revision 목록을 보여준다.
- 복원은 과거 content로 새 revision을 append한다.
- import는 기본적으로 destructive replace가 아니라 revision append다.

## 수용 기준

- 신규 디바이스에서 서버 current 로드 전에는 current overwrite 요청이 나가지 않는다.
- stale `baseRevisionId`로 저장해도 서버 current pointer는 바뀌지 않는다.
- stale 저장 content는 revision으로 서버에 남는다.
- 정상 저장은 새 revision을 만들고 current pointer를 갱신한다.
- 복원은 과거 revision을 수정하지 않고 새 revision을 만든다.
- import는 기존 current를 지우지 않는다.
- 날짜별 모든 서버 revision은 완전한 원문 content를 가진다.

## 결론

현재 정책은 "클라이언트가 충돌을 추론하고 서버는 overwrite 전에 백업한다"에 가깝다. 최근 수정으로 몇 가지 실제 버그는 막았지만, 요구 전제에 비해 여전히 복잡하고 서버 방어선이 약하다.

To-be는 "서버는 모든 저장을 revision으로 남기고, current 승격만 조건부로 한다"가 되어야 한다. 이 모델은 동시 편집 병합을 포기하는 대신, 로딩 실패와 stale 저장으로 인한 데이터 손실을 더 단순하고 명확하게 막는다.
