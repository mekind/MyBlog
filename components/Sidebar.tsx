import { getAllNotes } from "@/lib/notes";
import { buildTree } from "@/lib/tree";
import TreeView from "./TreeView";

export default async function Sidebar() {
  const notes = await getAllNotes(true);
  const tree = buildTree(notes);
  return (
    <nav className="px-3 py-4 text-sm">
      <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
        Notes ({notes.length})
      </p>
      <TreeView nodes={tree} />
    </nav>
  );
}
