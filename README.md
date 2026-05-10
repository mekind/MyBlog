# MyBlog

> ⚠️ **개인 사용 전용 레포 (Not for deployment)**
>
> 이 프로젝트는 외부 배포를 목적으로 하지 않습니다. 작성자 본인이 로컬에서
> 개인 디지털 가든 / 노트 시스템으로 사용하기 위해 개발하고 있습니다.
> 공개 호스팅, 멀티 유저, 인증 같은 운영용 기능은 의도적으로 다루지 않습니다.

## 목적

궁극적으로는 **로컬에서 동작하는 AI를 활용하기 위한 개인 지식 베이스**로
쓰는 것을 목표로 합니다. 노트, TODO, 링크 그래프 등을 파일시스템에 평문
마크다운으로 쌓아두면 추후 로컬 LLM이 직접 읽고 쓰는 컨텍스트로 활용할 수
있습니다.

현재 단계:

- 마크다운(`content/notes/`) 기반 노트 작성·열람·편집
- `[[wiki link]]` 로 노트 간 연결
- 폴더 트리 사이드바, 백링크
- `content/todos.md` 체크박스를 메인 카드 + `/todos` 페이지로 노출
- 비공개 노트는 `content/notes/private/` 하위에 분리

이후 방향:

- 로컬 LLM(예: Ollama/llama.cpp)으로 노트 검색·요약·자동 링크
- 그래프 뷰, 임베딩 기반 관련 노트 추천
- AI가 직접 노트를 작성/갱신하는 워크플로우

## 실행

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인합니다.

## 디렉터리 구조

```
content/
  notes/          # 공개 노트 (.mdx)
  notes/private/  # 비공개 노트
  todos.md        # 체크박스 기반 TODO
app/              # Next.js App Router
components/
lib/              # 노트·TODO 파서, wiki link 처리 등
```

## 작업 워크플로우

`CLAUDE.md` 참조 — 모든 변경은 worktree + 브랜치 + PR 흐름으로 진행합니다.
