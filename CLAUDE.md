@AGENTS.md

## 작업 워크플로우 (필수)

새로운 작업은 **항상 git worktree + 브랜치 + Pull Request** 흐름을 따른다. main에 직접 커밋·푸시 금지.

### 절차

1. **워크트리 생성** — 새 작업 시작 시 isolated worktree 사용
   - 사용 가능하면 `superpowers:using-git-worktrees` 스킬 호출
   - 또는 직접: `git worktree add ../<repo>-<feature> -b feature/<short-name>`
2. **브랜치 명명**
   - `feature/<설명>` — 새 기능
   - `fix/<설명>` — 버그 수정
   - `docs/<설명>` — 문서만 변경
   - `chore/<설명>` — 의존성·설정·잡일
3. **개발 + 커밋**
   - 커밋 작성자: `mekind <mekind98@gmail.com>` (per-command flag 사용, git config 변경 금지)
   - 커밋 메시지 스타일: 기존 히스토리 참고 (`feat:`, `fix:`, `docs:` 접두 + 한국어 본문)
4. **검증** — 머지 가능 상태 확인
   - `npx tsc --noEmit`
   - `npm run build`
   - 영향받는 라우트 dev 서버 curl 체크
5. **푸시 + PR**
   - `git push -u origin <branch>`
   - `gh pr create --title "..." --body "..."` (HEREDOC 사용해서 요약·테스트 계획 포함)
6. **사용자 검토 대기**
   - PR URL을 사용자에게 보고
   - 머지는 사용자가 직접 (또는 명시적 요청 시 `gh pr merge`)

### 예외 (worktree·PR 생략 가능)

다음의 경우만 main 직접 커밋 허용:

- 사용자가 "직접 커밋해", "PR 만들지 마"처럼 명시적으로 요청한 경우
- 본 워크플로우 자체를 수정하는 메타 변경
- 급한 핫픽스로 사용자가 명시적으로 우회를 요청

위 외 모든 경우는 워크트리 + PR 필수. 의심스러우면 사용자에게 물어본다.

### 진행 중 worktree 정리

- PR이 머지되면 사용자가 worktree를 정리하거나 `git worktree remove` 요청
- 작업 도중 변경 없이 끝났으면 isolation 모드의 자동 cleanup에 맡긴다

### 메모리

- 사용자 git 신원: `mekind <mekind98@gmail.com>` (시스템 로그인 이메일 사용 금지)
- 원격: `origin = https://github.com/mekind/MyBlog.git`
