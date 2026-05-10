import Link from "next/link";
import { getAllNotes } from "@/lib/notes";
import { getTodos } from "@/lib/todos";

export default async function Home() {
  const notes = await getAllNotes();
  const todos = await getTodos();
  const todoTotal = todos.length;
  const todoRemaining = todos.filter((t) => !t.done).length;

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          MyBlog
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          개인 디지털 가든 — [[링크]]로 글이 연결됩니다
        </p>
      </header>

      {todoTotal > 0 && (
        <Link
          href="/todos"
          className="mb-10 flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-3 text-sm transition hover:border-sky-400 hover:bg-sky-50 dark:border-zinc-800 dark:hover:border-sky-700 dark:hover:bg-sky-950/40"
        >
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            TODO
            <span className="ml-3 font-normal text-zinc-500">
              미완료 {todoRemaining} / 전체 {todoTotal}
            </span>
          </span>
          <span className="text-zinc-400">→</span>
        </Link>
      )}

      {notes.length === 0 ? (
        <div className="text-zinc-500">
          <p className="mb-2">아직 노트가 없습니다.</p>
          <Link
            href="/write"
            className="text-sky-700 hover:text-sky-900 dark:text-sky-300 dark:hover:text-sky-100"
          >
            새 글 쓰기 →
          </Link>
        </div>
      ) : (
        <ul className="space-y-6">
          {notes.map((n) => (
            <li key={n.slug}>
              <Link href={`/notes/${n.slug}`} className="group block">
                <h2 className="flex items-center gap-2 text-lg font-medium text-zinc-900 group-hover:text-sky-700 dark:text-zinc-100 dark:group-hover:text-sky-300">
                  {n.frontmatter.title}
                  {n.private && (
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                      private
                    </span>
                  )}
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  <span className="font-mono text-xs">{n.slug}</span>
                  <span className="mx-2">·</span>
                  {n.frontmatter.date}
                  {n.frontmatter.tags && n.frontmatter.tags.length > 0 && (
                    <span className="ml-3">
                      {n.frontmatter.tags.map((t) => `#${t}`).join(" ")}
                    </span>
                  )}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
