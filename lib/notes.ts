import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

export type NoteFrontmatter = {
  title: string;
  date: string;
  tags?: string[];
  draft?: boolean;
};

export type Note = {
  /** URL slug. private/ prefix is stripped (e.g. private/foo → "foo"). */
  slug: string;
  /** Filesystem segments under content/notes/ (excluding extension). */
  relativePath: string[];
  frontmatter: NoteFrontmatter;
  body: string;
  raw: string;
  private: boolean;
  /** Absolute path on disk. */
  filepath: string;
};

type RawEntry = { relativePath: string[]; absPath: string };

export const NOTES_ROOT = path.join(process.cwd(), "content", "notes");
export const PRIVATE_SEGMENT = "private";

async function walkNotes(
  dir: string,
  baseSegments: string[] = []
): Promise<RawEntry[]> {
  let entries: import("node:fs").Dirent[] = [];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const results: RawEntry[] = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await walkNotes(fullPath, [...baseSegments, entry.name])));
    } else if (
      entry.isFile() &&
      (entry.name.endsWith(".mdx") || entry.name.endsWith(".md"))
    ) {
      const baseName = entry.name.replace(/\.(mdx|md)$/, "");
      results.push({
        relativePath: [...baseSegments, baseName],
        absPath: fullPath,
      });
    }
  }
  return results;
}

export function isPrivatePath(relativePath: string[]): boolean {
  return relativePath[0] === PRIVATE_SEGMENT;
}

export function pathToSlug(relativePath: string[]): string {
  const segments = isPrivatePath(relativePath)
    ? relativePath.slice(1)
    : relativePath;
  return segments.join("/");
}

async function readNote(entry: RawEntry): Promise<Note | null> {
  const raw = await fs.readFile(entry.absPath, "utf8");
  const { data, content } = matter(raw);
  if (!data.title || !data.date) return null;

  const dateStr =
    data.date instanceof Date
      ? data.date.toISOString().slice(0, 10)
      : String(data.date);

  const fm: NoteFrontmatter = {
    title: String(data.title),
    date: dateStr,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : undefined,
    draft: Boolean(data.draft),
  };

  return {
    slug: pathToSlug(entry.relativePath),
    relativePath: entry.relativePath,
    frontmatter: fm,
    body: content,
    raw,
    private: isPrivatePath(entry.relativePath),
    filepath: entry.absPath,
  };
}

function resolveCollisions(entries: RawEntry[]): RawEntry[] {
  const seen = new Map<string, RawEntry>();
  for (const e of entries) {
    const slug = pathToSlug(e.relativePath);
    const prior = seen.get(slug);
    if (!prior) {
      seen.set(slug, e);
      continue;
    }
    const eIsPriv = isPrivatePath(e.relativePath);
    const pIsPriv = isPrivatePath(prior.relativePath);
    let winner = prior;
    if (!eIsPriv && pIsPriv) winner = e;
    console.warn(
      `[notes] slug 충돌: '${slug}' — ${winner === e ? e.absPath : prior.absPath} 채택, ${winner === e ? prior.absPath : e.absPath} 무시`
    );
    seen.set(slug, winner);
  }
  return Array.from(seen.values());
}

export async function getAllNotes(includeDrafts = false): Promise<Note[]> {
  const raw = await walkNotes(NOTES_ROOT);
  const deduped = resolveCollisions(raw);
  const notes = await Promise.all(deduped.map(readNote));
  return notes
    .filter((n): n is Note => n !== null)
    .filter((n) => includeDrafts || !n.frontmatter.draft)
    .sort((a, b) => (a.frontmatter.date < b.frontmatter.date ? 1 : -1));
}

function decodeAndNormalizeSegment(seg: string): string {
  let decoded = seg;
  try {
    decoded = decodeURIComponent(seg);
  } catch {
    /* already decoded or malformed */
  }
  return decoded.normalize("NFC");
}

export function decodeSlugParam(slugSegments: string[] | string): string {
  const segments = Array.isArray(slugSegments) ? slugSegments : [slugSegments];
  return segments.map(decodeAndNormalizeSegment).join("/");
}

export async function getNoteBySlug(
  slugSegments: string[]
): Promise<Note | null> {
  const target = decodeSlugParam(slugSegments);
  const all = await getAllNotes(true);
  return all.find((n) => n.slug === target) ?? null;
}

export async function getAllSlugSegments(): Promise<string[][]> {
  const notes = await getAllNotes(true);
  return notes.map((n) => n.slug.split("/"));
}
