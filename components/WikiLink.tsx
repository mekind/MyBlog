import Link from "next/link";
import { resolveWikiTarget } from "@/lib/wiki-links";

export default async function WikiLink({ token }: { token: string }) {
  const { slug, exists, ambiguous, label } = await resolveWikiTarget(token);
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
      title={
        ambiguous
          ? "모호한 basename — 풀 경로(folder/name)로 작성하세요"
          : "아직 쓰지 않은 노트"
      }
      className={
        ambiguous
          ? "text-amber-700 underline decoration-dotted decoration-amber-400 underline-offset-2 dark:text-amber-300"
          : "text-zinc-500 underline decoration-dotted decoration-zinc-400 underline-offset-2"
      }
    >
      {label}
    </span>
  );
}
