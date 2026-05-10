# MyBlog TODO

> MVP(Phase A) 완료 시점(2026-05-10) 기준의 남은 일 목록.
> Source of truth: `.omc/specs/deep-interview-myblog.md` + `docs/PLAN.md`

---

## 🟢 진행 중 — Phase B (사용자 라이브 검증)

> 인수 기준: 사용자 본인이 **7일 연속** 글쓰기에 실제 사용. 워크플로우 마찰로 손이 멈추는 일이 없으면 MVP 통과.

- [ ] Day 1 — 첫 글 작성, 위키링크 1회 이상 사용
- [ ] Day 2~3 — 마크다운 복사 → Velog 또는 Tistory에 붙여넣기 실험
- [ ] Day 4~5 — 외부 이미지 첨부 워크플로우 사용 (Imgur/GitHub 업로드 → URL 붙여넣기)
- [ ] Day 6~7 — 7일 사용 후 회고 작성. 마찰 지점은 `docs/PHASE-B-LOG.md` (신규)에 누적
- [ ] 마찰 지점이 1개 이상이면 **즉시 처리할 것 / v0.2 이월할 것**으로 분류

> Day 1 글쓰기 시 발견되는 사소한 이슈(폰트 사이즈, 본문 폭, prose 색상 등)는 v0.2 대기 없이 그날 바로 고치는 게 자연스러움.

---

## 🛠️ Tech Debt (Phase B 도중 또는 직후 처리)

- [ ] **테스트 도입** — `lib/wiki-links.ts`(역인덱스), `lib/notes.ts`(frontmatter 파싱) 단위 테스트. vitest 권장
- [ ] **잘못된 frontmatter 처리** — 현재 `getAllNotes`는 title/date 없는 파일을 조용히 제외. dev에서는 console.warn으로 알려주는 게 안전
- [ ] **위키링크 매칭의 Korean 정규화** — `buildIndex`의 `titleToSlug` 키도 NFC 정규화 일관성 확인 (이슈 #1 일반 원칙)
- [ ] **slug 정책 정리** — 한국어 파일명도 동작하지만, frontmatter `slug` 필드를 도입해 영문 슬러그 + 한국어 제목 분리 권장 (URL 안전성)
- [ ] **빌드 시 깨진 위키링크 리포트** — 미존재 링크 개수를 `next build` 로그에 한 줄로 출력
- [ ] **ESLint 규칙 강화** — `eslint-plugin-import` 등 점진 도입
- [ ] **`README.md` 작성** — 현재 scaffold 기본 README. 프로젝트 정체성에 맞게 교체

---

## 🌱 v0.2 — UX 다듬기

> Phase B에서 우선순위가 결정되면 그에 맞춰 재배열. 아래는 디폴트 후보.

- [ ] **다크 모드 토글** — `next-themes`. 현재는 OS 설정에 의존
- [ ] **미존재 링크 UX** — 호버 시 "이 노트를 만들기" 안내 (아직 자동 생성은 X, 단순 hint)
- [ ] **노트 헤더 개선** — 마지막 수정일, 본문 단어 수, 추정 읽기 시간
- [ ] **타이포그래피 정밀 조정** — Phase B 후기 회고에 따라 조정
- [ ] **모바일 가독성** — viewport별 본문 폭 점검

---

## 🌳 v0.3 — 분류 & 탐색

- [ ] **태그 페이지** — `/tags/[tag]`로 태그별 노트 목록
- [ ] **계층적 폴더/중첩 태그** — `tags: [dev/react/hooks]` 같은 슬래시 표기 지원, 트리 뷰
- [ ] **검색** — 단순 클라이언트 인덱스(`fuse.js`) 또는 SSG 시 정적 인덱스

---

## 🌲 v0.4 — 시각화 / 시간축

- [ ] **그래프 뷰** — 노트 노드, 위키링크 엣지. `react-force-graph` 또는 `d3-force` 검토
- [ ] **데일리 노트** — 날짜 기반 노트 자동 생성 + 시간축 대시보드
- [ ] **메타 페이지 / Recent** — 최근 N일 변경된 노트

---

## 🔗 v0.5 — 외부 플랫폼 호환

- [ ] **마크다운 복사 시 변환** — `[[link]]` → `[label](https://blog.example.com/notes/slug)`로 치환
- [ ] **이미지 fence 변환** — 외부 호스팅 URL은 그대로, 혹시라도 들어간 로컬 경로는 절대 URL로
- [ ] **frontmatter 제거 옵션** — 이미 구현됨. 변환 옵션을 버튼 옆 토글로 노출 검토
- [ ] **다크 모드, RSS, OG 메타** — 외부 검색 노출에 필요한 것들

---

## 🚀 v0.6 — 배포

- [ ] **Vercel 배포** — `npx vercel`
- [ ] **커스텀 도메인 결정 후 연결**
- [ ] **사이트맵, robots.txt, OG 이미지** — 검색 노출용
- [ ] **404 페이지 디자인** — 현재는 Next 기본

> PLAN.md 권장: Phase B (7일 테스트)가 끝난 뒤 배포. localhost로 7일 검증이 우선.

---

## 🤖 v0.7+ — 외부 플랫폼 자동/반자동 발행

- [ ] **Tistory OpenAPI 자동 발행** — frontmatter `crossPost.tistory: true` 시 빌드 후 발행 hook
- [ ] **Velog 반자동 발행** — GraphQL API가 비공식이므로 변환된 마크다운을 `pbcopy`로 복사하는 CLI 스크립트가 더 안전
- [ ] **canonical URL** — 외부 발행 시 `<link rel="canonical">`을 내 도메인으로

---

## 📚 v1.0 — 운영 단계

- [ ] **댓글** — Giscus(GitHub Discussions 기반)
- [ ] **분석** — Vercel Analytics 또는 Plausible
- [ ] **백업** — git push + 외부 저장소 정기 점검
- [ ] **이미지 깨짐 모니터링** — 외부 호스팅 의존이라 주기적 link check 필요

---

## 의도적으로 하지 않을 것 (Non-goals 재확인)

명세에서 명시적으로 제외된 항목들. 유혹이 와도 우선순위 재검토 없이 만들지 않는다.

- 카테고리 전용 페이지(`/tech`, `/essay`) — 디지털 가든에 카테고리는 불필요. 분류는 태그 + 위키링크
- 풍부한 MDX 커스텀 컴포넌트 — 외부 플랫폼 마크다운 복사 호환성을 깨뜨림
- 자체 이미지 호스팅 — 명세에서 외부 호스팅으로 결정

---

## 갱신 규칙

- 새 작업이 떠오르면 적절한 섹션에 체크박스로 추가
- 완료한 항목은 체크하고 한 사이클(v0.X 출시) 후 일괄 정리
- 우선순위가 바뀌면 섹션 순서를 재배열하지 말고 항목을 옮긴다 (이력 보존)
