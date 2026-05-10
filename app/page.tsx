import Link from "next/link";
import { getAllNotes } from "@/lib/notes";

export default async function Home() {
  const notes = await getAllNotes();

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <header className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          MyBlog
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          개인 디지털 가든 — [[링크]]로 글이 연결됩니다
        </p>
      </header>

      {notes.length === 0 ? (
        <p className="text-zinc-500">
          아직 노트가 없습니다. <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">content/notes/</code> 에 .mdx 파일을 추가하세요.
        </p>
      ) : (
        <ul className="space-y-6">
          {notes.map((n) => (
            <li key={n.slug}>
              <Link href={`/notes/${n.slug}`} className="group block">
                <h2 className="text-lg font-medium text-zinc-900 group-hover:text-sky-700 dark:text-zinc-100 dark:group-hover:text-sky-300">
                  {n.frontmatter.title}
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
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
