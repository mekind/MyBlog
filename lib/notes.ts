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
};

const NOTES_DIR = path.join(process.cwd(), "content", "notes");

async function readNotesDir(): Promise<string[]> {
  try {
    const entries = await fs.readdir(NOTES_DIR);
    return entries.filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));
  } catch {
    return [];
  }
}

function fileToSlug(filename: string): string {
  return filename.replace(/\.(mdx|md)$/, "");
}

async function readNote(filename: string): Promise<Note | null> {
  const filepath = path.join(NOTES_DIR, filename);
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
    slug: fileToSlug(filename),
    frontmatter: fm,
    body: content,
    raw,
  };
}

export async function getAllNotes(includeDrafts = false): Promise<Note[]> {
  const files = await readNotesDir();
  const notes = await Promise.all(files.map(readNote));
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
  const files = await readNotesDir();
  const target = decodeAndNormalize(slug);
  const match = files.find((f) => fileToSlug(f).normalize("NFC") === target);
  if (!match) return null;
  return readNote(match);
}

export async function getAllSlugs(): Promise<string[]> {
  const notes = await getAllNotes(true);
  return notes.map((n) => n.slug);
}
