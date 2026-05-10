/**
 * 사용자가 입력한 slug 또는 제목 기반으로 안전한 슬러그를 생성한다.
 * 허용: 영숫자, 한국어 음절, 하이픈, 언더스코어, 슬래시(폴더 구분)
 * 금지: 경로 traversal(`..`), 백슬래시, 선/후행 슬래시, 빈 세그먼트
 */
export function sanitizeSlug(input: string): { ok: true; slug: string } | { ok: false; reason: string } {
  const trimmed = input.trim().normalize("NFC");
  if (trimmed.length === 0) return { ok: false, reason: "빈 슬러그" };
  if (trimmed.includes("\\")) return { ok: false, reason: "백슬래시 금지" };
  if (trimmed.includes("..")) return { ok: false, reason: "'..' 금지 (경로 traversal)" };
  if (trimmed.startsWith("/") || trimmed.endsWith("/"))
    return { ok: false, reason: "선/후행 슬래시 금지" };

  const segments = trimmed.split("/");
  for (const seg of segments) {
    if (seg.length === 0) return { ok: false, reason: "빈 세그먼트 (`//`)" };
    if (!/^[\p{L}\p{N}_\-]+$/u.test(seg))
      return { ok: false, reason: `세그먼트 '${seg}': 영숫자/한글/하이픈/언더스코어만 허용` };
  }
  return { ok: true, slug: segments.join("/") };
}

/**
 * 제목에서 슬러그를 자동 추론한다 (사용자가 폼에서 수정 가능).
 * 공백 → 하이픈, 특수문자 제거, 소문자화(라틴만), 한글은 그대로.
 */
export function suggestSlug(title: string): string {
  return title
    .normalize("NFC")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s\-_]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}
