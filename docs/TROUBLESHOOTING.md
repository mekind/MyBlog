# MyBlog Troubleshooting

이 문서는 MyBlog 초기 구축 중 마주친 이슈와 해결 방법을 기록한다. 같은 함정을 반복하지 않기 위한 참고 자료.

---

## 이슈 #1 — 한국어 슬러그 노트가 404

### 증상
- 영문 슬러그 노트 (`/notes/welcome`) → HTTP 200 정상
- 한국어 슬러그 노트 (`/notes/wiki-link-사용법`, 브라우저는 `/notes/wiki-link-%EC%82%AC%EC%9A%A9%EB%B2%95`로 요청) → HTTP 404
- 핫리로드 직후 한 번 200으로 응답한 뒤 다시 404로 돌아오는 등 **간헐적 200/404 플리커** 관찰됨 → 캐시 문제로 오인하기 쉬움

### 진단 절차
1. **파일명 인코딩 확인** — `ls content/notes | xxd`
   - `사용법` 부분이 NFC(`ec 82 ac ec 9a a9 eb b2 95`)로 저장되어 있음을 확인
2. **URL 인코딩 확인** — `%EC%82%AC%EC%9A%A9%EB%B2%95`도 같은 NFC 바이트
   - → 유니코드 정규화(NFC vs NFD) 문제는 아님
3. **`getNoteBySlug`에 디버그 로그 추가**
   ```ts
   console.log("[getNoteBySlug] miss", { slug, files, slugs });
   ```
4. **로그에서 발견한 진짜 원인:**
   ```
   slug: 'wiki-link-%EC%82%AC%EC%9A%A9%EB%B2%95',
   slugs: [ 'welcome', 'wiki-link-사용법' ]
   ```
   `params.slug`가 **percent-encode 된 채로** 전달되어 디코딩된 파일 슬러그와 매칭 실패.

### 근본 원인
**Next 16 / Turbopack 환경에서 동적 라우트의 `params.slug`가 자동으로 `decodeURIComponent` 되지 않는다.** 이전 버전이나 Webpack 빌드와 다른 동작.

> 학습된 지식과 다른 부분 → `myblog/AGENTS.md`가 경고한 대로 "This is NOT the Next.js you know"가 실제로 발생한 사례.

### 해결
`lib/notes.ts`에 디코드 + NFC 정규화 헬퍼를 추가하고 슬러그 비교 시 항상 통과시킨다.

```ts
function decodeAndNormalize(slug: string): string {
  let decoded = slug;
  try {
    decoded = decodeURIComponent(slug);
  } catch {
    // 이미 디코드되어 있거나 malformed — 그대로 사용
  }
  return decoded.normalize("NFC");
}

export async function getNoteBySlug(slug: string): Promise<Note | null> {
  const files = await readNotesDir();
  const target = decodeAndNormalize(slug);
  const match = files.find((f) => fileToSlug(f).normalize("NFC") === target);
  if (!match) return null;
  return readNote(match);
}
```

### 비ASCII 슬러그를 다룰 때 일반 원칙
- **항상 양쪽을 정규화한 뒤 비교**: 받은 슬러그와 디스크/인덱스의 슬러그 모두 `decodeURIComponent` 후 `.normalize("NFC")`
- **`try/catch`로 감싼다**: 이미 디코드된 문자열을 다시 디코드하면 일부 시퀀스에서 `URIError`가 발생할 수 있음
- **위키링크 인덱스(`buildIndex`)도 동일 정책**: `titleToSlug`/`existingSlugs`에 들어가는 슬러그 키가 일관되게 NFC여야 비교 일치
- **가능하면 영문 슬러그 권장**: 파일명은 영문 슬러그로 두고 `frontmatter.title`만 한국어로. 운영상 안전.

### 관련된 함정
- "200/404가 번갈아 나오면 캐시 문제"라고 단정하지 말 것 — 핫리로드 시점에 따라 응답이 달라 보일 뿐, 실제로는 일관된 매칭 실패였음
- `dynamicParams = false`를 의심해서 제거했지만 무관 — 진짜 원인은 슬러그 디코딩

---

## 이슈 #2 — 날짜가 `Sun May 10 2026 09:00:00 GMT+0900` 처럼 표시됨

### 증상
- 노트 카드와 헤더에 정상적인 `2026-05-10` 대신 풀 자바스크립트 Date toString 결과가 노출됨

### 원인
`gray-matter`가 YAML frontmatter의 `date: 2026-05-10`을 자동으로 **JavaScript `Date` 객체**로 파싱한다. 그 결과를 `String(value)`로 캐스팅하면 `Date.prototype.toString()`이 호출되어 풀 표현이 나온다.

### 해결
`lib/notes.ts`에서 `Date` 인스턴스 여부를 분기.

```ts
const dateStr =
  data.date instanceof Date
    ? data.date.toISOString().slice(0, 10)
    : String(data.date);
```

### 일반 원칙
- frontmatter에서 외부로 노출되는 값은 **항상 명시적 타입 변환**을 거친다.
- 시각/timezone에 의존하는 표시가 필요하면 `toISOString()` (UTC) 후 슬라이스가 가장 안전.

---

## 이슈 #3 — Turbopack에서 remark/rehype 플러그인 제약

### 사실
- Next 16 dev/build 기본은 Turbopack
- Turbopack은 `next.config`의 `withMDX(...)`로 전달되는 플러그인을 **문자열 패키지명**으로 받아야 하고, **옵션은 직렬화 가능**해야 한다 (JS 함수 옵션 불가).
- 우리에게 필요한 위키링크 플러그인은 `existingSlugs: Set<string>` 같은 **런타임 상태**가 옵션으로 필요 → `@next/mdx` 번들러 통합 경로로는 못 넘긴다.

### 결정
**번들러 통합 대신 `next-mdx-remote/rsc`로 런타임 컴파일**.
- `lib/mdx.ts`에서 노트 본문을 받아 `compileMDX`로 React 노드 생성
- remark/rehype 플러그인을 함수 인스턴스 그대로 전달 (Turbopack 제약 우회)
- 자체 작성한 `remarkWikiLink`도 자유롭게 import 가능

### 트레이드오프
- 빌드 타임 정적 최적화 일부 손실 (각 페이지가 RSC로 동적 컴파일)
- MVP 규모(글 수십~수백 개)에서는 체감 차이 미미
- 글 수가 수천 개로 늘어나면 별도 빌드 스크립트로 미리 컴파일하는 방식으로 전환 검토

---

## 검증 워크플로우 (참고)

빌드/런타임 이슈를 빠르게 좁히는 데 사용한 명령들.

| 목적 | 명령 |
|------|------|
| 타입 검증 | `npx tsc --noEmit` |
| dev 서버 기동 | `npm run dev` (백그라운드) |
| 응답 코드 확인 | `curl -s -o /dev/null -w "HTTP %{http_code}\n" URL` |
| HTML 내 핵심 텍스트 grep | `curl -s URL \| grep -oE '<h1[^>]*>[^<]+'` |
| 같은 URL 5번 반복 | `for i in 1..5; do curl ... done` (간헐적 이슈 탐지) |
| 파일명 바이트 검사 | `ls dir \| xxd \| head` |
| dev 서버 로그 | `tail -40 <output-file>` (Next 요청 로그 + console.log) |

---

## 새 이슈가 발생하면

1. 이 문서에 **증상 → 진단 절차 → 근본 원인 → 해결 → 일반 원칙** 형식으로 추가
2. 같은 함정에 두 번 빠지지 않도록 *일반 원칙*을 반드시 1줄 이상 적는다
3. Next 버전이 올라가면 본문에 명시한 버전 의존 동작(예: 이슈 #1)을 재검증
