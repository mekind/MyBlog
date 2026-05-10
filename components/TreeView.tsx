"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { TreeNode, TreeFolder } from "@/lib/tree";

const STORAGE_KEY = "myblog:sidebar:closed";

function loadClosed(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function saveClosed(set: Set<string>): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
}

export default function TreeView({ nodes }: { nodes: TreeNode[] }) {
  const [closed, setClosed] = useState<Set<string>>(new Set());
  useEffect(() => setClosed(loadClosed()), []);

  function toggle(path: string) {
    const next = new Set(closed);
    if (next.has(path)) next.delete(path);
    else next.add(path);
    setClosed(next);
    saveClosed(next);
  }

  return (
    <ul className="space-y-0.5">
      {nodes.map((node, i) => (
        <TreeItem
          key={renderKey(node, i)}
          node={node}
          depth={0}
          closed={closed}
          onToggle={toggle}
        />
      ))}
    </ul>
  );
}

function renderKey(node: TreeNode, i: number): string {
  if (node.kind === "folder") return `f:${node.path.join("/")}:${i}`;
  return `n:${node.slug}:${i}`;
}

function TreeItem({
  node,
  depth,
  closed,
  onToggle,
}: {
  node: TreeNode;
  depth: number;
  closed: Set<string>;
  onToggle: (path: string) => void;
}) {
  const indent = { paddingLeft: `${depth * 12 + 8}px` };
  if (node.kind === "folder") {
    const folder = node as TreeFolder;
    const pathKey = folder.path.join("/");
    const isClosed = closed.has(pathKey);
    return (
      <li>
        <button
          type="button"
          onClick={() => onToggle(pathKey)}
          style={indent}
          className={`flex w-full items-center gap-1 rounded px-1 py-0.5 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
            folder.private
              ? "text-amber-700 dark:text-amber-300"
              : "text-zinc-700 dark:text-zinc-300"
          }`}
        >
          <span className="inline-block w-3 text-zinc-400">
            {isClosed ? "▸" : "▾"}
          </span>
          <span className="truncate font-medium">
            {folder.private ? "🔒 " : "📁 "}
            {folder.name}
          </span>
        </button>
        {!isClosed && (
          <ul className="space-y-0.5">
            {folder.children.map((c, i) => (
              <TreeItem
                key={renderKey(c, i)}
                node={c}
                depth={depth + 1}
                closed={closed}
                onToggle={onToggle}
              />
            ))}
          </ul>
        )}
      </li>
    );
  }
  return (
    <li>
      <Link
        href={`/notes/${node.slug}`}
        style={indent}
        className={`flex items-center gap-1 truncate rounded px-1 py-0.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
          node.private
            ? "text-amber-700 dark:text-amber-300"
            : "text-zinc-700 dark:text-zinc-300"
        }`}
        title={node.title}
      >
        <span className="inline-block w-3 text-zinc-400">·</span>
        <span className="truncate">{node.title}</span>
      </Link>
    </li>
  );
}
