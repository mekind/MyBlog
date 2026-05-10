import { notFound } from "next/navigation";
import { getNoteBySlug } from "@/lib/notes";
import NoteEditor from "@/components/NoteEditor";

export default async function EditNotePage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const note = await getNoteBySlug(slug);
  if (!note) notFound();

  return (
    <NoteEditor
      mode="edit"
      originalSlug={note.slug}
      initial={{
        title: note.frontmatter.title,
        slug: note.slug,
        isPrivate: note.private,
        tags: (note.frontmatter.tags ?? []).join(", "),
        body: note.body,
      }}
    />
  );
}
