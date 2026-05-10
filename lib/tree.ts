import type { Note } from "./notes";

export type TreeFolder = {
  kind: "folder";
  name: string;
  /** path relative to NOTES_ROOT, e.g. ["dev","react"] */
  path: string[];
  /** "private" folder gets visually distinguished */
  private: boolean;
  children: TreeNode[];
};

export type TreeNote = {
  kind: "note";
  name: string;
  slug: string;
  title: string;
  date: string;
  private: boolean;
};

export type TreeNode = TreeFolder | TreeNote;

export function buildTree(notes: Note[]): TreeNode[] {
  const root: TreeFolder = {
    kind: "folder",
    name: "",
    path: [],
    private: false,
    children: [],
  };

  for (const note of notes) {
    const segments = note.relativePath;
    let cursor = root;
    // Walk all segments except last (which is the file basename)
    for (let i = 0; i < segments.length - 1; i++) {
      const seg = segments[i];
      let folder = cursor.children.find(
        (c): c is TreeFolder => c.kind === "folder" && c.name === seg
      );
      if (!folder) {
        folder = {
          kind: "folder",
          name: seg,
          path: segments.slice(0, i + 1),
          private: i === 0 && seg === "private",
          children: [],
        };
        cursor.children.push(folder);
      }
      cursor = folder;
    }
    const fileName = segments[segments.length - 1];
    cursor.children.push({
      kind: "note",
      name: fileName,
      slug: note.slug,
      title: note.frontmatter.title,
      date: note.frontmatter.date,
      private: note.private,
    });
  }

  sortTree(root.children);
  return root.children;
}

function sortTree(nodes: TreeNode[]): void {
  nodes.sort((a, b) => {
    // folders before notes
    if (a.kind !== b.kind) return a.kind === "folder" ? -1 : 1;
    if (a.kind === "folder" && b.kind === "folder") {
      return a.name.localeCompare(b.name, "ko");
    }
    if (a.kind === "note" && b.kind === "note") {
      // newer first
      return a.date < b.date ? 1 : -1;
    }
    return 0;
  });
  for (const n of nodes) {
    if (n.kind === "folder") sortTree(n.children);
  }
}
