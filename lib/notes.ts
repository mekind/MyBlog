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
  slug: string;
  frontmatter: NoteFrontmatter;
  body: string;
  raw: string;
  private: boolean;
};

type NoteEntry = {
  filename: string;
  root: string;
  isPrivate: boolean;
};

const PUBLIC_ROOT = path.join(process.cwd(), "content", "notes");
const PRIVATE_ROOT = path.join(process.cwd(), "content", "notes", "private");

async function readDirSafe(dir: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(dir);
    return entries.filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));
  } catch {
    return [];
  }
}

async function readAllEntries(): Promise<NoteEntry[]> {
  const [publicFiles, privateFiles] = await Promise.all([
    readDirSafe(PUBLIC_ROOT),
    readDirSafe(PRIVATE_ROOT),
  ]);

  const entries: NoteEntry[] = [
    ...publicFiles.map((f) => ({
      filename: f,
      root: PUBLIC_ROOT,
      isPrivate: false,
    })),
    ...privateFiles.map((f) => ({
      filename: f,
      root: PRIVATE_ROOT,
      isPrivate: true,
    })),
  ];

  // 슬러그 충돌 시 public 우선, private은 경고 후 무시
  const seen = new Map<string, NoteEntry>();
  for (const e of entries) {
    const slug = fileToSlug(e.filename);
    const prior = seen.get(slug);
    if (!prior) {
      seen.set(slug, e);
      continue;
    }
    const winner = prior.isPrivate ? e : prior;
    const loser = prior.isPrivate ? prior : e;
    console.warn(
      `[notes] slug 충돌: '${slug}' — ${winner.isPrivate ? "private" : "public"} 채택, ${loser.isPrivate ? "private" : "public"} 무시`
    );
    seen.set(slug, winner);
  }
  return Array.from(seen.values());
}

function fileToSlug(filename: string): string {
  return filename.replace(/\.(mdx|md)$/, "");
}

async function readNote(entry: NoteEntry): Promise<Note | null> {
  const filepath = path.join(entry.root, entry.filename);
  const raw = await fs.readFile(filepath, "utf8");
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
    slug: fileToSlug(entry.filename),
    frontmatter: fm,
    body: content,
    raw,
    private: entry.isPrivate,
  };
}

export async function getAllNotes(includeDrafts = false): Promise<Note[]> {
  const entries = await readAllEntries();
  const notes = await Promise.all(entries.map(readNote));
  return notes
    .filter((n): n is Note => n !== null)
    .filter((n) => includeDrafts || !n.frontmatter.draft)
    .sort((a, b) => (a.frontmatter.date < b.frontmatter.date ? 1 : -1));
}

function decodeAndNormalize(slug: string): string {
  let decoded = slug;
  try {
    decoded = decodeURIComponent(slug);
  } catch {
    // already decoded or malformed — fall through
  }
  return decoded.normalize("NFC");
}

export async function getNoteBySlug(slug: string): Promise<Note | null> {
  const entries = await readAllEntries();
  const target = decodeAndNormalize(slug);
  const match = entries.find(
    (e) => fileToSlug(e.filename).normalize("NFC") === target
  );
  if (!match) return null;
  return readNote(match);
}

export async function getAllSlugs(): Promise<string[]> {
  const notes = await getAllNotes(true);
  return notes.map((n) => n.slug);
}
