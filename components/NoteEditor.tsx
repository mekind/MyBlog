"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { suggestSlug } from "@/lib/slug";
import { createNote, updateNote } from "@/lib/note-actions";

export type NoteEditorInitial = {
  title: string;
  slug: string;
  isPrivate: boolean;
  tags: string;
  body: string;
};

export default function NoteEditor({
  mode,
  initial,
  originalSlug,
}: {
  mode: "create" | "edit";
  initial: NoteEditorInitial;
  originalSlug?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initial.title);
  const [slug, setSlug] = useState(initial.slug);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [isPrivate, setIsPrivate] = useState(initial.isPrivate);
  const [tags, setTags] = useState(initial.tags);
  const [body, setBody] = useState(initial.body);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(suggestSlug(value));
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const input = { title, slug, isPrivate, tags, body };
      const result =
        mode === "create"
          ? await createNote(input)
          : await updateNote(originalSlug!, input);
      if (result.ok) {
        router.push(result.redirectTo);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-bold">
        {mode === "create" ? "새 글 작성" : "편집"}
      </h1>

      {error && (
        <p className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="space-y-4">
        <Field label="제목">
          <input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            placeholder="제목"
          />
        </Field>

        <Field label="슬러그 (URL)">
          <input
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
            className="w-full rounded border border-zinc-300 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-900"
            placeholder="dev/react/hooks"
          />
          <p className="mt-1 text-xs text-zinc-500">
            슬래시(/)로 폴더 구분. 영숫자/한글/하이픈/언더스코어만.
          </p>
        </Field>

        <Field label="공개 범위">
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={!isPrivate}
                onChange={() => setIsPrivate(false)}
              />
              public
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={isPrivate}
                onChange={() => setIsPrivate(true)}
              />
              private (git 제외)
            </label>
          </div>
        </Field>

        <Field label="태그 (쉼표 구분)">
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            placeholder="react, nextjs"
          />
        </Field>

        <Field label="본문 (마크다운 / MDX)">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={20}
            className="w-full rounded border border-zinc-300 bg-white px-3 py-2 font-mono text-sm leading-relaxed dark:border-zinc-700 dark:bg-zinc-900"
            placeholder={`# 제목\n\n본문...\n\n[[다른 글]] 로 위키링크`}
          />
        </Field>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            disabled={pending}
          >
            취소
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={pending}
            className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {pending ? "저장 중..." : mode === "create" ? "저장" : "업데이트"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
        {label}
      </span>
      {children}
    </label>
  );
}
