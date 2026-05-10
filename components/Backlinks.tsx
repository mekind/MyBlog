import Link from "next/link";
import { getBacklinks } from "@/lib/wiki-links";

export default async function Backlinks({ slug }: { slug: string }) {
  const notes = await getBacklinks(slug);

  return (
    <section className="mt-16 border-t border-zinc-200 pt-8 dark:border-zinc-800">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
        Backlinks ({notes.length})
      </h2>
      {notes.length === 0 ? (
        <p className="text-sm text-zinc-500">
          아직 이 노트를 언급한 다른 노트가 없습니다.
        </p>
      ) : (
        <ul className="space-y-2">
          {notes.map((n) => (
            <li key={n.slug}>
              <Link
                href={`/notes/${n.slug}`}
                className="text-sky-700 hover:text-sky-900 dark:text-sky-300 dark:hover:text-sky-100"
              >
                {n.frontmatter.title}
              </Link>
              <span className="ml-2 text-xs text-zinc-500">
                {n.frontmatter.date}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
