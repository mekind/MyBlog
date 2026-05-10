import { getAllNotes, type Note } from "./notes";

const WIKI_LINK_RE = /\[\[([^\]]+)\]\]/g;

export type WikiLinkIndex = {
  outgoing: Map<string, Set<string>>;
  incoming: Map<string, Set<string>>;
  /** lowercased basename → list of slugs that have that basename */
  basenameToSlugs: Map<string, string[]>;
  /** normalized title → slug */
  titleToSlug: Map<string, string>;
  /** all existing slugs */
  existingSlugs: Set<string>;
};

function normalize(s: string): string {
  return s.trim().normalize("NFC").toLowerCase().replace(/\s+/g, " ");
}

function basenameOfSlug(slug: string): string {
  const idx = slug.lastIndexOf("/");
  return idx === -1 ? slug : slug.slice(idx + 1);
}

function extractWikiTokens(body: string): string[] {
  const tokens: string[] = [];
  for (const m of body.matchAll(WIKI_LINK_RE)) tokens.push(m[1].trim());
  return tokens;
}

function resolveToken(
  token: string,
  idx: WikiLinkIndex
): { slug: string; exists: boolean; ambiguous: boolean } {
  // 1) full slug exact (already normalized as path-with-slashes)
  if (idx.existingSlugs.has(token)) {
    return { slug: token, exists: true, ambiguous: false };
  }
  // 2) title exact (normalized)
  const byTitle = idx.titleToSlug.get(normalize(token));
  if (byTitle) {
    return { slug: byTitle, exists: true, ambiguous: false };
  }
  // 3) basename — only if unambiguous (single match)
  const byBasename = idx.basenameToSlugs.get(normalize(token));
  if (byBasename && byBasename.length === 1) {
    return { slug: byBasename[0], exists: true, ambiguous: false };
  }
  if (byBasename && byBasename.length > 1) {
    return { slug: token, exists: false, ambiguous: true };
  }
  return { slug: token, exists: false, ambiguous: false };
}

export async function buildIndex(): Promise<WikiLinkIndex> {
  const notes = await getAllNotes(true);
  const titleToSlug = new Map<string, string>();
  const existingSlugs = new Set<string>();
  const basenameToSlugs = new Map<string, string[]>();

  for (const note of notes) {
    existingSlugs.add(note.slug);
    titleToSlug.set(normalize(note.frontmatter.title), note.slug);
    const bn = normalize(basenameOfSlug(note.slug));
    if (!basenameToSlugs.has(bn)) basenameToSlugs.set(bn, []);
    basenameToSlugs.get(bn)!.push(note.slug);
  }

  const outgoing = new Map<string, Set<string>>();
  const incoming = new Map<string, Set<string>>();
  let ambiguousCount = 0;
  let missingCount = 0;

  const idx: WikiLinkIndex = {
    outgoing,
    incoming,
    basenameToSlugs,
    titleToSlug,
    existingSlugs,
  };

  for (const note of notes) {
    const tokens = extractWikiTokens(note.body);
    const out = new Set<string>();
    for (const tok of tokens) {
      const r = resolveToken(tok, idx);
      out.add(r.slug);
      if (r.exists) {
        if (!incoming.has(r.slug)) incoming.set(r.slug, new Set());
        incoming.get(r.slug)!.add(note.slug);
      } else if (r.ambiguous) {
        ambiguousCount++;
        console.warn(
          `[wiki-link] '${tok}' (${note.slug}) — 모호: ${(basenameToSlugs.get(normalize(tok)) || []).join(", ")}. 풀 경로로 작성하세요.`
        );
      } else {
        missingCount++;
      }
    }
    outgoing.set(note.slug, out);
  }

  if (missingCount > 0) {
    console.log(`[wiki-link] 미존재 링크 ${missingCount}개`);
  }
  if (ambiguousCount > 0) {
    console.log(`[wiki-link] 모호한 basename 참조 ${ambiguousCount}개`);
  }

  return idx;
}

export async function getBacklinks(slug: string): Promise<Note[]> {
  const idx = await buildIndex();
  const sources = idx.incoming.get(slug);
  if (!sources || sources.size === 0) return [];
  const all = await getAllNotes();
  return all.filter((n) => sources.has(n.slug));
}

export async function resolveWikiTarget(token: string): Promise<{
  slug: string;
  exists: boolean;
  ambiguous: boolean;
  label: string;
}> {
  const idx = await buildIndex();
  const r = resolveToken(token, idx);
  return { ...r, label: token };
}
