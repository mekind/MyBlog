# Deep Interview Spec: MyBlog — Personal Digital Garden

## Metadata
- Interview ID: myblog-2026-05-10
- Rounds: 5
- Final Ambiguity Score: 16.5%
- Type: greenfield
- Generated: 2026-05-10
- Threshold: 20%
- Status: **PASSED**

## Clarity Breakdown
| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Goal Clarity | 0.85 | 0.40 | 0.340 |
| Constraint Clarity | 0.85 | 0.30 | 0.255 |
| Success Criteria | 0.80 | 0.30 | 0.240 |
| **Total Clarity** | | | **0.835** |
| **Ambiguity** | | | **0.165 (16.5%)** |

---

## Goal

> **개인 디지털 가든 — 글을 쓰고 [[다른 글]]로 연결하면, 백링크가 자동으로 양방향 그물망을 형성하는 퍼스널 지식 베이스. 외부 플랫폼 발행은 마크다운 복사 버튼으로 처리.**

처음 PLAN.md의 "블로그 + 카테고리(tech/essay) + 마크다운 복사" 프레임은 인터뷰 도중 폐기됐다. 사용자의 진짜 의도는:
- "글을 정리"하는 도구
- 옵시디언 같은 지식 관리 경험
- "쓰는 도구로 쓸만한가"가 인수 기준 (디자인 만족도가 아니라)

따라서 이 프로젝트의 정체성은 **공개 출판이 가능한 디지털 가든**이며, 카테고리 분리(tech/essay)나 시간순 블로그 인덱스는 부수적이다.

## Constraints

- **MVP 핵심 기능은 단 하나: `[[wiki-link]]` 문법 + 자동 백링크 생성**
- **이미지는 외부 호스팅(Imgur, GitHub 등) URL만 사용** — `/public/images/` 같은 로컬 자산 디렉토리는 사용하지 않음. Velog/Tistory 복사 시 이미지가 자동으로 동작하기 위함.
- **언어: 한국어 본문이 주** — 타이포그래피·줄간격·폰트는 한국어 가독성 기준으로 결정 (Pretendard + 시스템 폰트 폴백)
- **MVP 빌드 단계의 인수: localhost에서 작동** — 배포(Vercel)는 7일 테스트 후 결정
- **외부 플랫폼 자동 발행 금지** — 마크다운 복사 버튼만. Velog/Tistory API는 추후 단계
- **MDX 커스텀 컴포넌트는 MVP에서 사용하지 않음** — 순수 마크다운만 사용해서 복사 호환성 보장

## Non-Goals (MVP에서 명시적으로 제외)

- 그래프 뷰 (시각화)
- 데일리 노트 / 시간축 대시보드
- 계층적 폴더 / 중첩 태그
- 댓글, RSS, sitemap, OG 메타
- 검색
- 카테고리 전용 페이지(`/tech`, `/essay`) — PLAN.md에 있었으나 디지털 가든 프레임과 맞지 않으므로 제외. 글 분류는 태그/링크가 담당.
- Vercel 자동 배포, 커스텀 도메인
- Velog/Tistory 자동 발행
- 다크/라이트 토글 (있으면 좋지만 MVP 인수 기준이 아님)

## Acceptance Criteria

### Phase A — 빌드 완료 게이트 (개발자 완료 시점)

- [ ] `content/notes/*.mdx` 디렉토리에 글을 추가하면 자동으로 노출된다
- [ ] 본문에 `[[다른 글 제목]]` 또는 `[[slug]]` 문법을 쓰면 해당 노트로 가는 링크로 렌더링된다
- [ ] 미존재 링크(아직 쓰지 않은 글)는 시각적으로 구분되어 표시된다 (예: 회색 / 점선)
- [ ] 각 노트 하단에 **백링크 섹션**이 자동으로 표시된다 — "이 노트를 언급한 다른 노트" 목록
- [ ] 한국어 본문이 깔끔하게 렌더링된다 (Pretendard 또는 동급 한글 폰트 적용, 최대 폭 제한, 줄간격)
- [ ] 마크다운 복사 버튼이 노트 상세 페이지에 있고, 클릭 시 frontmatter 제외한 본문 마크다운을 클립보드로 복사한다
- [ ] 외부 이미지 URL(`![](https://...)`)이 본문에서 정상 렌더링된다
- [ ] localhost에서 모든 위 항목이 동작한다

### Phase B — 사용자 검증 게이트 (MVP 진정한 종료)

- [ ] **사용자가 7일 연속으로 글을 쓰는 데 사용한다.** 도중 워크플로우 마찰로 손이 멈추는 일이 없으면 MVP 통과.

Phase A는 코드 작성으로 달성, Phase B는 사용자 본인의 7일 라이브 테스트로 검증.

## Assumptions Exposed & Resolved

| 가정 | 어떻게 도전했는가 | 해결 |
|------|------------------|------|
| "이건 블로그다" | "옵시디언 기능이 있으면 좋겠다"는 발언으로 재프레이밍 → 디지털 가든 | 정체성을 디지털 가든으로 변경 |
| "tech/essay 카테고리가 필요하다" | 백링크가 핵심이라면 카테고리는 부수적 — 태그/링크가 분류 담당 | MVP에서 카테고리 페이지 제거 |
| "MVP에 4개 기능 다 있어야 한다" | "하나만 빠지면 의미 없는 건 무엇?"으로 우선순위 강제 | 백링크 = 핵심, 나머지 3개 = 후순위 |
| "디자인이 인수 기준이다" | "일주일 쓰고 싶다 = 7일 연속 사용 가능"으로 구체화 | 디자인보다 워크플로우 마찰 없음이 인수 기준 |
| "이미지를 어떻게 처리할지 미정" | 워크플로우 마찰 1순위 위협 요인으로 명시적 결정 강제 | 외부 호스팅으로 단순화 |

## Technical Context

### 스택
- Next.js 15 (App Router) + TypeScript
- Tailwind CSS + Pretendard (한국어 폰트)
- MDX 처리: `@next/mdx` + `gray-matter` + `remark-gfm` + `rehype-slug` + `rehype-pretty-code`
- **`[[wiki-link]]` 처리: `remark-wiki-link` 또는 자체 remark 플러그인** ← 핵심 의존성

### 디렉토리 구조 (수정판)

```
myblog/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # 홈 (전체 노트 목록 또는 최근 노트)
│   └── notes/
│       └── [slug]/page.tsx         # 노트 상세 + 백링크 섹션
├── content/
│   └── notes/
│       └── *.mdx
├── components/
│   ├── Backlinks.tsx               # 백링크 자동 표시
│   ├── WikiLink.tsx                # [[link]] 커스텀 렌더링 (존재/미존재 구분)
│   ├── CopyMarkdownButton.tsx
│   └── NoteCard.tsx
├── lib/
│   ├── notes.ts                    # 노트 목록/상세
│   ├── wiki-links.ts               # [[link]] 파싱 + 역인덱스 빌드
│   └── mdx.ts
└── docs/
    └── PLAN.md                     # ← 이 명세에 따라 갱신 필요
```

### Frontmatter 스키마 (단순화)

```yaml
---
title: "노트 제목"
date: 2026-05-10
tags: [react, nextjs]
draft: false
---
```

(PLAN.md의 `category` 필드는 제거 — 디지털 가든에 카테고리는 불필요)

### 백링크 빌드 알고리즘

1. 빌드 시 `content/notes/*.mdx`를 모두 스캔
2. 각 노트에서 `[[link]]` 토큰을 추출 → `outgoing[noteSlug] = [linkedSlug, ...]`
3. 역인덱스 생성 → `incoming[linkedSlug] = [referringSlug, ...]`
4. 노트 상세 렌더링 시 `incoming[currentSlug]`을 백링크 섹션에 표시

## Ontology (Key Entities)

| Entity | Type | Fields | Relationships |
|--------|------|--------|---------------|
| Note | core domain | slug, title, date, tags, body, draft | has many WikiLink (outgoing), has many Backlink (incoming) |
| WikiLink | core domain | sourceSlug, targetSlug, exists | refers to Note |
| Backlink | derived | targetSlug, sourceSlugs[] | inverse of WikiLink |
| Tag | supporting | name | many-to-many with Note |
| MarkdownCopyAction | UI | rawBody | operates on Note |

## Ontology Convergence

| Round | Entities | New | Changed | Stable | Stability |
|-------|----------|-----|---------|--------|-----------|
| 1 | Post, Category, Tag, MarkdownCopy | 4 | - | - | N/A |
| 2 | Note, Link, Backlink, Tag, Folder, DailyNote, Graph, CrossPostTarget | 6 (대규모 재정의) | 2 (Post→Note, MarkdownCopy→CrossPostTarget) | 0 | 33% |
| 3 | (동일, 우선순위만) | 0 | 0 | 8 | 100% |
| 4 | (동일) | 0 | 0 | 8 | 100% |
| 5 | (동일, MVP만 핵심으로 좁힘) | 0 | 0 | 8 | 100% |

3라운드부터 도메인 모델이 완전 수렴. 비-MVP 엔티티(Folder, DailyNote, Graph)는 향후 로드맵으로 분류.

## 향후 로드맵 (MVP 이후)

| 단계 | 추가 기능 |
|------|----------|
| v0.2 | 그래프 뷰 (react-force-graph 등) |
| v0.3 | 계층적 폴더 / 중첩 태그 |
| v0.4 | 데일리 노트 / 시간축 대시보드 |
| v0.5 | 다크 모드, RSS, OG 메타 |
| v0.6 | Vercel 배포 + 커스텀 도메인 |
| v0.7 | Tistory OpenAPI 자동 발행 |
| v0.8 | Velog 반자동 발행 |

## Interview Transcript

<details>
<summary>Full Q&A (5 rounds)</summary>

### Round 1 — Targeting Success Criteria
**Q:** MyBlog MVP가 "완성되었다"고 말할 수 있는 순간은?
**A:** 실제로 일주일 쓰고 싶은 상태
**Ambiguity:** 38.5%

### Round 2 — Targeting Goal Clarity
**Q:** 가장 갖고 오고 싶은 옵시디언 기능은?
**A:** 4개 모두 (백링크, 그래프, 폴더/태그, 데일리 노트)
**Ambiguity:** 53% (스코프 폭발로 일시 상승)

### Round 3 — Targeting Constraints
**Q:** 4개 중 빠지면 의미 없는 핵심 1개는?
**A:** 상호 링크 + 백링크
**Ambiguity:** 30%

### Round 4 — Targeting Success Criteria
**Q:** 어떤 시나리오가 완성되면 MVP 끝인가?
**A:** 7일 연속 글을 쓴 다 — 쓰는 도구로 쓸만했는가
**Ambiguity:** 21%

### Round 5 — Targeting Constraints
**Q:** 글에 이미지 넣는 습관은?
**A:** 외부 이미지 호스팅 (Imgur, GitHub 등)
**Ambiguity:** 16.5% (PASSED)

</details>
