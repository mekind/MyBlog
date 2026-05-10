import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllNotes, getNoteBySlug } from "@/lib/notes";
import { compileNoteBody } from "@/lib/mdx";
import Backlinks from "@/components/Backlinks";
import CopyMarkdownButton from "@/components/CopyMarkdownButton";

export async function generateStaticParams() {
  const notes = await getAllNotes(true);
  return notes.map((n) => ({ slug: n.slug }));
}

export default async function NotePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const note = await getNoteBySlug(slug);
  if (!note) notFound();

  const compiled = await compileNoteBody(note.body);

  return (
    <article className="mx-auto max-w-2xl px-6 py-16">
      <nav className="mb-8 text-sm">
        <Link href="/" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
          ← 모든 노트
        </Link>
      </nav>

      <header className="mb-10">
        <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          {note.frontmatter.title}
        </h1>
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-500">{note.frontmatter.date}</p>
          <CopyMarkdownButton markdown={note.body} />
        </div>
        {note.frontmatter.tags && note.frontmatter.tags.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {note.frontmatter.tags.map((t) => (
              <li
                key={t}
                className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
              >
                #{t}
              </li>
            ))}
          </ul>
        )}
      </header>

      <div className="prose prose-zinc dark:prose-invert max-w-none">
        {compiled}
      </div>

      <Backlinks slug={note.slug} />
    </article>
  );
}
