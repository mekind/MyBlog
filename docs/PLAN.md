# MyBlog 구축 계획 (v2 — Digital Garden)

> **Source of truth: `.omc/specs/deep-interview-myblog.md`** (2026-05-10 deep-interview, ambiguity 16.5% PASS)
> 본 문서는 명세를 구현 관점에서 재구성한 작업 계획서다.

---

## 1. 정체성

**MyBlog는 블로그가 아니라 퍼스널 디지털 가든이다.**

- 글을 쓰고 `[[다른 글]]`로 연결한다
- 백링크가 자동으로 양방향 그물망을 형성한다
- 외부 플랫폼(Velog, Tistory) 발행은 **마크다운 복사 버튼**으로 수동 처리

> 기존(v1) 계획서의 "tech/essay 카테고리 분리 + 시간순 블로그 인덱스" 프레임은 **폐기**. 분류는 태그와 위키링크가 담당한다.

---

## 2. MVP 범위 (단 하나의 핵심)

### IN
- `[[wiki-link]]` 문법 → 다른 노트로 가는 링크 렌더링
- 미존재 링크 시각적 구분 (회색/점선)
- 노트 하단 **백링크 섹션** 자동 표시
- 마크다운 복사 버튼 (frontmatter 제외 본문)
- 한국어 본문 가독성 확보 (Pretendard + 적정 줄간격/측정)
- 외부 이미지 URL 렌더링

### OUT (명시적 비목표 — MVP에서 제외)
- 그래프 뷰
- 데일리 노트 / 시간축 대시보드
- 계층적 폴더 / 중첩 태그
- 카테고리 전용 페이지(`/tech`, `/essay`) ← v1에 있었으나 제거
- 댓글, RSS, sitemap, OG 메타
- 검색
- 다크 모드 (있어도 좋지만 인수 기준 아님)
- Vercel 배포, 커스텀 도메인
- Velog/Tistory **자동 발행** (마크다운 복사로 충분)

---

## 3. 인수 기준

### Phase A — 빌드 완료 (개발자가 도달해야 할 지점)
- [ ] `content/notes/*.mdx` 추가 시 자동 노출
- [ ] `[[제목]]` 또는 `[[slug]]`이 노트 링크로 렌더링
- [ ] 미존재 링크가 시각적으로 구분
- [ ] 각 노트 하단에 "이 노트를 언급한 다른 노트" 백링크 섹션
- [ ] 한국어 본문 가독성 (Pretendard 적용, 본문 폭 제한, 줄간격)
- [ ] 마크다운 복사 버튼 동작 (frontmatter 제외)
- [ ] 외부 이미지 URL(`![](https://...)`) 정상 렌더링
- [ ] localhost에서 위 항목 모두 동작

### Phase B — 사용자 검증 (진정한 MVP 종료)
- [ ] **사용자가 7일 연속 글쓰기에 실제 사용한다.** 워크플로우 마찰로 손이 멈추지 않으면 통과.

빌드 단계는 Phase A. 그 후 사용자 본인의 라이브 테스트로 Phase B 검증.

---

## 4. 기술 스택

- **프레임워크**: Next.js 15 (App Router) + TypeScript
- **스타일**: Tailwind CSS
- **한국어 폰트**: Pretendard (system fallback 포함)
- **MDX 처리**:
  - `@next/mdx`
  - `gray-matter` — frontmatter 파싱
  - `remark-gfm` — GFM
  - `rehype-slug` — 헤딩 id
  - `rehype-pretty-code` — 코드 하이라이트 (Shiki)
  - **`remark-wiki-link`** — `[[link]]` 문법 처리 (또는 자체 remark 플러그인)

---

## 5. 디렉토리 구조

```
myblog/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # 홈 (전체/최근 노트 목록)
│   └── notes/
│       └── [slug]/page.tsx         # 노트 상세 + 백링크
├── content/
│   └── notes/
│       └── *.mdx
├── components/
│   ├── WikiLink.tsx                # [[link]] 커스텀 렌더 (존재/미존재 구분)
│   ├── Backlinks.tsx               # 백링크 섹션
│   ├── CopyMarkdownButton.tsx
│   └── NoteCard.tsx
├── lib/
│   ├── notes.ts                    # 노트 목록/상세
│   ├── wiki-links.ts               # [[link]] 파싱 + 역인덱스
│   └── mdx.ts
├── public/
├── docs/
│   └── PLAN.md                     # (이 문서)
├── .omc/
│   └── specs/
│       └── deep-interview-myblog.md # 원천 명세
├── next.config.mjs
├── tailwind.config.ts
└── package.json
```

### 5.1 공개 / 비공개 노트 분리

- `content/notes/*.mdx` — **공개 노트**. git에 커밋되어 GitHub에 올라감.
- `content/notes/private/*.mdx` — **비공개 노트**. `.gitignore`로 제외되어 로컬에만 존재.
- 두 디렉토리는 **같은 슬러그 네임스페이스**를 공유하며, URL 경로에 `private/`이 드러나지 않는다 (예: `content/notes/private/foo.mdx` → `/notes/foo`).
- 슬러그 충돌 시 **public이 우선**이고 private은 경고 후 무시된다 (`lib/notes.ts`의 `readAllEntries`).
- 위키링크와 백링크는 두 디렉토리를 모두 인덱싱한다. 즉, 공개 노트가 비공개 노트로 위키링크하면 로컬에서는 동작하지만, GitHub에 올라간 빌드에는 미존재 링크로 보인다 — 의도적 동작.

---

## 6. Frontmatter 스키마

```yaml
---
title: "노트 제목"
date: 2026-05-10
tags: [react, nextjs]
draft: false
---
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `title` | string | ✅ | 노트 제목 — 위키링크 매칭 키 |
| `date` | YYYY-MM-DD | ✅ | 작성일 |
| `tags` | string[] | ❌ | 태그 (분류용) |
| `draft` | boolean | ❌ | 비공개 (기본 false) |

> v1의 `category` 필드는 제거. 분류는 태그와 위키링크가 담당.

---

## 7. 위키링크 + 백링크 알고리즘

### 7.1 파싱
- `[[제목]]` 또는 `[[slug]]` 토큰을 `remark-wiki-link`로 추출
- 매칭 우선순위: slug 정확 일치 → title 정확 일치 → title 정규화(공백/소문자) 일치
- 매칭 실패 시: 미존재 링크로 표시 (회색/점선)

### 7.2 역인덱스 빌드
빌드 시 모든 노트를 스캔하여:

```ts
// outgoing[noteSlug] = [linkedSlug, ...]
// incoming[linkedSlug] = [referringSlug, ...]
```

`incoming`이 백링크의 원천 데이터.

### 7.3 백링크 렌더링
- 노트 상세 페이지 하단에 `incoming[currentSlug]`을 표시
- 빈 배열이면 섹션 자체를 숨기지 않고 "아직 이 노트를 언급한 글이 없습니다" 정도의 hint

---

## 8. 마크다운 복사 동작

1. 서버에서 노트의 **원문 .mdx 파일**을 읽고 frontmatter를 제거
2. 본문 문자열을 client component(`CopyMarkdownButton`)로 prop 전달
3. 클릭 시 `navigator.clipboard.writeText`로 복사
4. 복사 완료 토스트/상태 표시

> MVP에서는 `[[link]]`을 그대로 복사한다. Velog/Tistory에 붙여넣을 때 위키링크는 일반 텍스트로 보이지만, MVP 인수 기준에 포함되지 않으므로 허용. v0.5+에서 변환 처리.

---

## 9. 데이터 흐름

```
content/notes/*.mdx
   │
   ▼
lib/wiki-links.ts (build-time)
   │  ├─ outgoing 인덱스
   │  └─ incoming 인덱스 (= 백링크)
   ▼
lib/notes.ts
   │  ├─ getAllNotes()
   │  └─ getNoteBySlug(slug) → { meta, raw, compiled, backlinks }
   ▼
app/page.tsx                    (전체 노트 목록)
app/notes/[slug]/page.tsx       (상세 + WikiLink 렌더 + Backlinks + CopyButton)
```

---

## 10. 작업 순서

1. **프로젝트 초기화**
   - `npx create-next-app@latest myblog --typescript --tailwind --app`
   - 기본 디렉토리 정리
2. **MDX 파이프라인 구축**
   - 의존성 설치: `@next/mdx gray-matter remark-gfm rehype-slug rehype-pretty-code shiki remark-wiki-link`
   - `next.config.mjs`에 MDX 설정
3. **노트 로딩 라이브러리 (`lib/notes.ts`)**
   - `content/notes` 스캔, frontmatter 파싱, draft 필터
4. **위키링크 인덱스 (`lib/wiki-links.ts`)**
   - 모든 노트의 `[[link]]` 추출
   - outgoing/incoming 역인덱스 생성
5. **`WikiLink` 컴포넌트**
   - 존재/미존재 시각적 구분
6. **노트 상세 페이지 + 백링크 섹션**
   - MDX 렌더링 + 코드 하이라이트
   - 하단에 `Backlinks` 컴포넌트
7. **마크다운 복사 버튼**
   - 서버에서 raw 본문(frontmatter 제거) 전달
   - 클립보드 복사 + 피드백 UI
8. **홈 페이지**
   - 최근/전체 노트 목록
9. **한국어 타이포그래피**
   - Pretendard 적용
   - 본문 폭/줄간격/letter-spacing 튜닝
10. **샘플 노트 3~5개 작성**
    - 서로 `[[link]]`로 연결해서 백링크 동작 확인
11. **Phase A 인수 체크리스트 검증**
12. **사용자에게 인계 → Phase B (7일 라이브 테스트)**

---

## 11. 향후 로드맵 (MVP 이후)

| 단계 | 추가 기능 |
|------|-----------|
| v0.2 | 그래프 뷰 (react-force-graph 등) |
| v0.3 | 계층적 폴더 / 중첩 태그 |
| v0.4 | 데일리 노트 / 시간축 대시보드 |
| v0.5 | 다크 모드, RSS, OG 메타, 위키링크 → 일반 링크 변환 (외부 플랫폼 복사용) |
| v0.6 | Vercel 배포 + 커스텀 도메인 |
| v0.7 | Tistory OpenAPI 자동 발행 |
| v0.8 | Velog 반자동 발행 |
