import fs from "node:fs/promises";
import path from "node:path";

export type Todo = {
  section: string | null;
  text: string;
  done: boolean;
};

export const TODOS_PATH = path.join(process.cwd(), "content", "todos.md");

const SECTION_RE = /^##\s+(.+?)\s*$/;
const ITEM_RE = /^-\s+\[([ xX])\]\s+(.+?)\s*$/;

export function parseTodos(source: string): Todo[] {
  const todos: Todo[] = [];
  let section: string | null = null;
  for (const line of source.split(/\r?\n/)) {
    const sec = line.match(SECTION_RE);
    if (sec) {
      section = sec[1];
      continue;
    }
    const item = line.match(ITEM_RE);
    if (item) {
      todos.push({
        section,
        text: item[2],
        done: item[1] !== " ",
      });
    }
  }
  return todos;
}

export async function getTodos(): Promise<Todo[]> {
  let source: string;
  try {
    source = await fs.readFile(TODOS_PATH, "utf8");
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
  return parseTodos(source);
}
