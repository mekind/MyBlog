# TODO List Feature — Design

Date: 2026-05-10
Status: Approved

## Goal

`content/todos.md` 파일의 체크박스 항목을 메인에 요약 표시하고, `/todos` 페이지에서 전체 목록을 보여준다. 편집은 파일을 IDE/에디터로 직접 수정.

## Storage

- Path: `content/todos.md`
- Format: Markdown checklist
  ```markdown
  ## 섹션 이름
  - [ ] 미완료 항목
  - [x] 완료 항목
  ```
- 섹션 헤더(`## ...`)는 선택. 헤더 없는 항목은 `section: null`.

## Module: `lib/todos.ts`

```ts
export type Todo = { section: string | null; text: string; done: boolean };
export async function getTodos(): Promise<Todo[]>;
```

- 파일이 없으면 `[]` 반환 (에러 throw 금지).
- 파싱 규칙:
  - `^##\s+(.+)$` → 현재 섹션 갱신
  - `^-\s+\[([ xX])\]\s+(.+)$` → Todo 생성 (`done = !== ' '`)
- 그 외 라인은 무시.

## Main Page (`app/page.tsx`)

헤더 바로 아래에 TODO 요약 카드 삽입:

```
┌────────────────────────────────────┐
│ TODO  · 미완료 3 / 전체 7   →      │
└────────────────────────────────────┘
```

- 카드 전체가 `/todos`로 가는 `<Link>`.
- todos 0개면 카드 미표시.

## `/todos` Page (`app/todos/page.tsx`)

- 섹션별 그룹 렌더 (섹션 없는 항목은 맨 위 "기타" 또는 헤더 없이).
- 항목 표시:
  - 미완료: 일반 텍스트, `☐` 또는 빈 체크박스 아이콘
  - 완료: `line-through text-zinc-400`, `☑`
- 페이지 하단 안내문: "편집은 `content/todos.md`를 직접 수정하세요."

## Out of Scope

- UI에서의 추가/체크/삭제
- 우선순위, 마감일, 태그
- 마크다운 본문 외 frontmatter

## Testing

- `lib/todos.ts` 단위 테스트 (파일 없음, 빈 파일, 섹션 유무, 잘못된 라인 무시).
- 메인/`/todos` 페이지 수동 확인.
