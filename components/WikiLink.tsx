import Link from "next/link";
import { resolveWikiTarget } from "@/lib/wiki-links";

export default async function WikiLink({ token }: { token: string }) {
  const { slug, exists, label } = await resolveWikiTarget(token);
  if (exists) {
    return (
      <Link
        href={`/notes/${slug}`}
        className="text-sky-700 underline decoration-sky-300 underline-offset-2 hover:text-sky-900 dark:text-sky-300 dark:hover:text-sky-100"
      >
        {label}
      </Link>
    );
  }
  return (
    <span
      title="아직 쓰지 않은 노트"
      className="text-zinc-500 underline decoration-dotted decoration-zinc-400 underline-offset-2"
    >
      {label}
    </span>
  );
}
