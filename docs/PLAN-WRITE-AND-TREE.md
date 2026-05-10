# PLAN — 글쓰기 UI + 폴더 트리 사이드바 (v0.2 후보)

> 계획 단계 문서. 실제 구현 전에 사용자 결정 5개를 받아 확정.

---

## 1. 왜 이 두 기능을 함께 묶는가

- **글쓰기 UI**: Phase B(7일 라이브 검증)에서 "쓰는 도구로 쓸만한가"의 직접 변수. 매번 에디터로 .mdx 파일을 만들기보다 사이트에서 바로 새 글을 쓰면 마찰이 줄어든다.
- **폴더 트리 사이드바**: 글이 5~10개를 넘기면 시간순 목록만으로는 탐색이 어려워진다. 디지털 가든 정체성에도 맞다 (계층 분류는 PLAN.md v0.3에서 다루기로 한 항목과 일부 겹치므로 우선순위를 끌어올리는 결정).

두 기능 모두 **MVP 인수 기준 변경 없이** Phase B 사용 경험을 보강하는 성격.

---

## 2. 결정 사항 (확정 2026-05-10)

| # | 결정 | 확정 |
|---|------|------|
| D1 | 글쓰기 UI 노출 | **항상 노출** (개인 용도, dev/prod 가드 없음) |
| D2 | 새 글 저장 위치 기본값 | **public 디폴트, 폼 토글로 private 전환** |
| D3 | 폴더 트리 구조 | **임의 중첩** (옵션 B) — `content/notes/dev/react/foo.mdx` 자유 |
| D4 | 사이드바 레이아웃 | **데스크톱 고정 / 모바일 햄버거 토글** |
| D5 | 편집 기능 | **포함** — 새 글 + 기존 글 편집 모두 |

위키링크 정책 (D3 부속):
- `[[basename]]` → 1개일 때만 매칭, 여러 후보면 `[[fullpath]]` 요구 + 빌드 경고
- 폴더 이동 시 슬러그 변경 → 깨진 위키링크는 빌드 로그에 카운트 출력

---

## 3. 기능 1 — 글쓰기 UI

### 3.1 진입점
- 헤더(또는 사이드바 상단)에 **"새 글" 버튼**
- 라우트: `/write`
- 환경 가드: `process.env.NODE_ENV !== "development"` 면 404 노출 (D1=dev 전용 가정)

### 3.2 폼 필드
| 필드 | 타입 | 검증 | 비고 |
|------|------|------|------|
| 제목 | text | 필수, 1~100자 | 슬러그 자동 추론 |
| 슬러그 | text | 영숫자/하이픈, 자동 채워짐, 수동 수정 가능 | 충돌 시 빨간 메시지 |
| 카테고리 | radio: public / private | 필수 | D2 디폴트 적용 |
| 태그 | text (쉼표 구분) | 선택 | |
| 본문 | textarea (monospace) + 라이브 프리뷰 | 필수 | MDX 컴파일 결과 옆 패널 |

### 3.3 라이브 프리뷰
- 좌: 마크다운 textarea
- 우: 실시간 컴파일 결과 (`useDeferredValue`로 디바운스)
- 위키링크는 미존재 표시까지만, 실제 인덱스 빌드는 저장 후 다음 요청에 반영

### 3.4 저장 흐름 (Server Action)
```
사용자 → submit
  → "use server" action
  → slug 충돌 검사 (lib/notes.ts 활용)
  → frontmatter 생성 (title, date=오늘, tags, draft=false)
  → fs.writeFile(content/notes/(private/)?{slug}.mdx)
  → revalidatePath("/")
  → redirect(`/notes/{slug}`)
```

### 3.5 보안
- Server Action은 dev에서만 동작 (요청 진입 시 `NODE_ENV` 확인 + 404)
- 슬러그/제목 sanitize: 경로 traversal 차단(`..`, `/` 거부)
- 파일명: `slug + ".mdx"` 만 허용, 다른 확장자 금지

### 3.6 새로 만들 파일
```
app/write/page.tsx                # 폼 페이지 (Client Component)
app/actions/create-note.ts        # Server Action
components/MdxLivePreview.tsx     # textarea + 미리보기
lib/slug.ts                       # 슬러그 sanitize/slugify
```

### 3.7 변경되는 파일
```
components/Header.tsx (신규)            # "새 글" 버튼 노출
app/layout.tsx                          # Header 통합
```

---

## 4. 기능 2 — 폴더 트리 사이드바

### 4.1 데이터 구조
- `lib/notes.ts`를 **재귀 스캔**으로 확장 (D3 권장안)
- 각 Note 에 `relativePath: string[]` 추가
  - 예: `content/notes/dev/react/hooks.mdx` → `["dev", "react", "hooks"]` (확장자 제외)
- 슬러그 = `relativePath.join("/")`
- 라우트: `app/notes/[slug]/page.tsx` → `app/notes/[...slug]/page.tsx` (catch-all로 변경)

### 4.2 트리 빌드
```ts
type TreeNode =
  | { kind: "folder"; name: string; children: TreeNode[] }
  | { kind: "note"; name: string; slug: string; private: boolean };
```
- `lib/tree.ts` 에서 노트 목록 → 트리 변환
- 정렬 규칙: 폴더 먼저 (가나다순) → 파일(날짜 역순)

### 4.3 사이드바 컴포넌트
```
components/Sidebar.tsx          # 컨테이너 (모바일 토글 상태)
components/TreeView.tsx         # 재귀 렌더링
components/TreeItem.tsx         # 폴더 펼치기/접기 (localStorage 저장)
```

### 4.4 레이아웃 (D4 권장안)
- 데스크톱(`>=lg`): grid `200px 1fr` — 좌측 사이드바 고정, 우측 본문
- 모바일: 사이드바 숨김, 헤더에 햄버거 → drawer
- 사이드바 상단: 사이트 타이틀 + "새 글" 버튼
- 사이드바 본문: 트리 (public 섹션, private 섹션 분리)

### 4.5 슬러그 마이그레이션 영향
| 항목 | 영향 |
|------|------|
| 현재 노트 3개 | 영향 없음 (`content/notes/foo.mdx` → 슬러그 `foo` 그대로) |
| 위키링크 매칭 | `[[hooks]]` → `dev/react/hooks` 도 매칭되도록 short-name 매칭 추가. 단, 모호하면 미존재 처리 |
| `generateStaticParams` | catch-all 동적 세그먼트 반환 (`{ slug: ["dev","react","hooks"] }`) |
| URL | 한국어 폴더명도 percent-encode 처리 (이미 결정된 정책 적용) |

### 4.6 새로 만들 파일
```
lib/tree.ts                        # 트리 빌드
components/Sidebar.tsx
components/TreeView.tsx
components/TreeItem.tsx
components/SidebarToggle.tsx       # 모바일 햄버거 (Client)
```

### 4.7 변경되는 파일
```
lib/notes.ts                       # 재귀 스캔, relativePath
app/notes/[slug]/page.tsx          → app/notes/[...slug]/page.tsx
app/layout.tsx                     # 사이드바 그리드
lib/wiki-links.ts                  # short-name 매칭 추가
components/WikiLink.tsx            # 신규 슬러그 형식 처리
```

---

## 5. 작업 순서 (제안)

> 두 기능은 의존성이 있다(둘 다 `lib/notes.ts` 변경). 순차 진행이 안전.

1. **결정 D1~D5 확정** (사용자)
2. `lib/notes.ts` 재귀 스캔 + `relativePath` 도입 + 테스트(샘플 3개 동작 보존)
3. 라우트를 `[...slug]`로 마이그레이션, 위키링크 매칭 보강
4. **사이드바 트리 (기능 2)** 먼저 — UI만 추가, 글쓰기는 아직 없음
5. **글쓰기 UI (기능 1)** — Server Action, 폼, 라이브 프리뷰
6. 양쪽 통합 검증 (`tsc`, `next build`, dev에서 새 글 작성 → 사이드바에 즉시 등장)

> 글쓰기를 먼저 하고 트리는 나중에 하는 순서도 가능하지만, **트리가 없으면 새 글의 위치가 시각적으로 안 보여 UX가 빈약**하다. 트리 먼저가 자연스럽다.

---

## 6. 위험 / 열린 항목

- **catch-all 라우트와 percent-encoding**: 한국어 폴더명 `params.slug` 가 percent-encoded 문자열 배열로 들어올 가능성 → 각 세그먼트 디코딩 + NFC 정규화 일관 적용 필요 (이슈 #1 일반 원칙)
- **위키링크의 모호한 short-name**: `[[hooks]]` 가 `dev/react/hooks` 와 `mobile/hooks` 둘 다 매칭되면 어떻게? → MVP는 **첫 매치 우선 + 빌드 시 경고** 정도로 충분
- **실시간 프리뷰의 성능**: `next-mdx-remote/rsc` 는 서버 컴파일이라 Client에서 즉시 미리보기는 어려움 → MVP는 클라이언트용 경량 마크다운 렌더(예: `marked`+간이 렌더)로 미리보기, 실제 저장 후엔 정식 컴파일 사용
- **Server Action의 fs 쓰기 권한**: dev 서버 프로세스가 워크스페이스에 쓰기 권한이 있는지 (보통 OK). Vercel 등 서버리스에서는 동작 안 함 — 그래서 dev 전용
- **편집 미포함**: 오타 등은 에디터/IDE로 직접 수정 (Phase B 동안 충분). v0.2.1에서 편집 추가

---

## 7. 검증 기준 (이 v0.2 종료 조건)

- [ ] `npm run dev` 상태에서 `/write` 진입 가능, 프로덕션 빌드(`next build`)에서는 진입 시 404 또는 노출되지 않음
- [ ] 폼으로 새 글 작성 → 정상 저장 → 자동 리다이렉트 → 사이드바 트리에 등장
- [ ] private 토글로 작성한 글이 `content/notes/private/` 에 저장되고 `git status` 에 안 보임
- [ ] 슬러그 충돌 시 폼에서 즉시 에러 표시
- [ ] 사이드바 트리: 폴더는 펼침/접힘 동작, localStorage 저장
- [ ] 데스크톱·모바일 레이아웃 모두 동작
- [ ] 한국어 슬러그(percent-encoded) 라우트 200 유지
- [ ] 기존 노트 3개 모두 동작 (회귀 없음)

---

## 8. 결정 요청

위 D1~D5 에 대한 응답을 주시면 본 계획을 확정하고 작업 순서대로 구현 시작합니다.
