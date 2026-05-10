"use server";

import fs from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { NOTES_ROOT, PRIVATE_SEGMENT, getAllNotes } from "./notes";
import { sanitizeSlug } from "./slug";

export type NoteFormInput = {
  title: string;
  slug: string;
  isPrivate: boolean;
  tags: string;
  body: string;
};

export type ActionResult =
  | { ok: true; redirectTo: string }
  | { ok: false; error: string };

function buildFilepath(slug: string, isPrivate: boolean): string {
  const segments = slug.split("/");
  if (isPrivate) {
    return path.join(NOTES_ROOT, PRIVATE_SEGMENT, ...segments) + ".mdx";
  }
  return path.join(NOTES_ROOT, ...segments) + ".mdx";
}

function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

function buildMdxFile(
  fm: { title: string; date: string; tags: string[] },
  body: string
): string {
  const tagsLine =
    fm.tags.length > 0 ? `tags: [${fm.tags.map((t) => JSON.stringify(t)).join(", ")}]\n` : "";
  return `---\ntitle: ${JSON.stringify(fm.title)}\ndate: ${fm.date}\n${tagsLine}---\n\n${body.trimStart()}`;
}

async function ensureDir(filepath: string): Promise<void> {
  await fs.mkdir(path.dirname(filepath), { recursive: true });
}

export async function createNote(input: NoteFormInput): Promise<ActionResult> {
  const title = input.title.trim();
  if (title.length === 0) return { ok: false, error: "제목을 입력하세요" };

  const slugCheck = sanitizeSlug(input.slug);
  if (!slugCheck.ok) return { ok: false, error: slugCheck.reason };

  const all = await getAllNotes(true);
  if (all.some((n) => n.slug === slugCheck.slug)) {
    return { ok: false, error: `슬러그 '${slugCheck.slug}' 이미 존재` };
  }

  const filepath = buildFilepath(slugCheck.slug, input.isPrivate);
  try {
    await fs.access(filepath);
    return { ok: false, error: "동일 경로의 파일이 이미 존재합니다" };
  } catch {
    /* OK — 없는 게 정상 */
  }

  const date = new Date().toISOString().slice(0, 10);
  const content = buildMdxFile(
    { title, date, tags: parseTags(input.tags) },
    input.body
  );

  await ensureDir(filepath);
  await fs.writeFile(filepath, content, "utf8");

  revalidatePath("/", "layout");
  return { ok: true, redirectTo: `/notes/${slugCheck.slug}` };
}

export async function updateNote(
  originalSlug: string,
  input: NoteFormInput
): Promise<ActionResult> {
  const title = input.title.trim();
  if (title.length === 0) return { ok: false, error: "제목을 입력하세요" };

  const slugCheck = sanitizeSlug(input.slug);
  if (!slugCheck.ok) return { ok: false, error: slugCheck.reason };

  const all = await getAllNotes(true);
  const original = all.find((n) => n.slug === originalSlug);
  if (!original) return { ok: false, error: "원본 노트를 찾을 수 없음" };

  // slug 변경 시 충돌 검사
  if (slugCheck.slug !== originalSlug) {
    if (all.some((n) => n.slug === slugCheck.slug)) {
      return { ok: false, error: `슬러그 '${slugCheck.slug}' 이미 존재` };
    }
  }

  const newFilepath = buildFilepath(slugCheck.slug, input.isPrivate);

  // 기존 frontmatter date 보존
  const date = original.frontmatter.date;
  const content = buildMdxFile(
    { title, date, tags: parseTags(input.tags) },
    input.body
  );

  await ensureDir(newFilepath);
  await fs.writeFile(newFilepath, content, "utf8");

  // 경로가 바뀌었으면 기존 파일 제거
  if (path.resolve(newFilepath) !== path.resolve(original.filepath)) {
    try {
      await fs.unlink(original.filepath);
    } catch {
      /* 이미 제거됨 */
    }
  }

  revalidatePath("/", "layout");
  return { ok: true, redirectTo: `/notes/${slugCheck.slug}` };
}

export async function createNoteFromForm(formData: FormData): Promise<void> {
  const result = await createNote({
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    isPrivate: formData.get("isPrivate") === "true",
    tags: String(formData.get("tags") ?? ""),
    body: String(formData.get("body") ?? ""),
  });
  if (result.ok) redirect(result.redirectTo);
  throw new Error(result.error);
}

export async function updateNoteFromForm(
  originalSlug: string,
  formData: FormData
): Promise<void> {
  const result = await updateNote(originalSlug, {
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    isPrivate: formData.get("isPrivate") === "true",
    tags: String(formData.get("tags") ?? ""),
    body: String(formData.get("body") ?? ""),
  });
  if (result.ok) redirect(result.redirectTo);
  throw new Error(result.error);
}
