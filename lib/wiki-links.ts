import { getAllNotes, type Note } from "./notes";

const WIKI_LINK_RE = /\[\[([^\]]+)\]\]/g;

export type WikiLinkIndex = {
  outgoing: Map<string, Set<string>>;
  incoming: Map<string, Set<string>>;
  titleToSlug: Map<string, string>;
  existingSlugs: Set<string>;
};

function normalizeTitle(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, " ");
}

function extractWikiTokens(body: string): string[] {
  const tokens: string[] = [];
  for (const m of body.matchAll(WIKI_LINK_RE)) tokens.push(m[1].trim());
  return tokens;
}

function resolveToken(
  token: string,
  titleToSlug: Map<string, string>,
  existingSlugs: Set<string>
): string {
  if (existingSlugs.has(token)) return token;
  const byTitle = titleToSlug.get(normalizeTitle(token));
  if (byTitle) return byTitle;
  return token;
}

let cached: WikiLinkIndex | null = null;

export async function buildIndex(force = false): Promise<WikiLinkIndex> {
  if (cached && !force) return cached;

  const notes = await getAllNotes(true);
  const titleToSlug = new Map<string, string>();
  const existingSlugs = new Set<string>();

  for (const note of notes) {
    existingSlugs.add(note.slug);
    titleToSlug.set(normalizeTitle(note.frontmatter.title), note.slug);
  }

  const outgoing = new Map<string, Set<string>>();
  const incoming = new Map<string, Set<string>>();

  for (const note of notes) {
    const tokens = extractWikiTokens(note.body);
    const out = new Set<string>();
    for (const tok of tokens) {
      const target = resolveToken(tok, titleToSlug, existingSlugs);
      out.add(target);
      if (existingSlugs.has(target)) {
        if (!incoming.has(target)) incoming.set(target, new Set());
        incoming.get(target)!.add(note.slug);
      }
    }
    outgoing.set(note.slug, out);
  }

  cached = { outgoing, incoming, titleToSlug, existingSlugs };
  return cached;
}

export async function getBacklinks(slug: string): Promise<Note[]> {
  const idx = await buildIndex();
  const sourceSlugs = idx.incoming.get(slug);
  if (!sourceSlugs || sourceSlugs.size === 0) return [];
  const all = await getAllNotes();
  return all.filter((n) => sourceSlugs.has(n.slug));
}

export async function resolveWikiTarget(
  token: string
): Promise<{ slug: string; exists: boolean; label: string }> {
  const idx = await buildIndex();
  const slug = resolveToken(token, idx.titleToSlug, idx.existingSlugs);
  return {
    slug,
    exists: idx.existingSlugs.has(slug),
    label: token,
  };
}
