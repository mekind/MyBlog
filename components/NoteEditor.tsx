"use client";

import {
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import { marked } from "marked";
import { suggestSlug } from "@/lib/slug";
import { createNote, updateNote } from "@/lib/note-actions";

export type NoteEditorInitial = {
  title: string;
  slug: string;
  isPrivate: boolean;
  tags: string;
  body: string;
};

const PREVIEW_STORAGE_KEY = "myblog:editor:preview";

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
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PREVIEW_STORAGE_KEY);
      if (raw === "1") setShowPreview(true);
    } catch {
      /* no-op */
    }
  }, []);

  function togglePreview() {
    setShowPreview((v) => {
      const next = !v;
      try {
        window.localStorage.setItem(PREVIEW_STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* no-op */
      }
      return next;
    });
  }

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

        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              본문 (마크다운 / MDX)
            </span>
            <button
              type="button"
              onClick={togglePreview}
              className="rounded border border-zinc-300 px-2 py-0.5 text-xs hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              {showPreview ? "프리뷰 숨기기" : "프리뷰 보기"}
            </button>
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={20}
            className="w-full rounded border border-zinc-300 bg-white px-3 py-2 font-mono text-sm leading-relaxed dark:border-zinc-700 dark:bg-zinc-900"
            placeholder={`# 제목\n\n본문...\n\n[[다른 글]] 로 위키링크`}
          />
          {showPreview && <PreviewPane body={body} />}
        </div>

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

function PreviewPane({ body }: { body: string }) {
  const deferred = useDeferredValue(body);
  const html = useMemo(() => renderMarkdown(deferred), [deferred]);
  return (
    <div className="mt-4 rounded border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/50">
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
        Preview
      </p>
      <div
        className="prose prose-zinc max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <p className="mt-3 text-xs text-zinc-500">
        ※ 경량 렌더입니다. 위키링크는 회색 배지로만 표시되며 실제 유효성·백링크는 저장 후 노트 페이지에서 확인하세요.
      </p>
    </div>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderMarkdown(body: string): string {
  const tokenized = body.replace(
    /\[\[([^\]]+)\]\]/g,
    (_, token: string) =>
      `<span class="rounded bg-amber-100 px-1 text-xs text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">${escapeHtml(token)}</span>`
  );
  const out = marked.parse(tokenized, { gfm: true, async: false }) as string;
  return out;
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
