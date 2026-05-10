import Link from "next/link";
import { getTodos, type Todo } from "@/lib/todos";

export const metadata = {
  title: "TODO",
};

function groupBySection(todos: Todo[]): Map<string | null, Todo[]> {
  const map = new Map<string | null, Todo[]>();
  for (const t of todos) {
    const list = map.get(t.section) ?? [];
    list.push(t);
    map.set(t.section, list);
  }
  return map;
}

export default async function TodosPage() {
  const todos = await getTodos();
  const total = todos.length;
  const remaining = todos.filter((t) => !t.done).length;
  const groups = groupBySection(todos);

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <header className="mb-8">
        <Link
          href="/"
          className="text-sm text-zinc-500 hover:text-sky-700 dark:hover:text-sky-300"
        >
          ← 메인
        </Link>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          TODO
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          미완료 {remaining} / 전체 {total}
        </p>
      </header>

      {total === 0 ? (
        <p className="text-zinc-500">
          아직 항목이 없습니다.{" "}
          <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-800">
            content/todos.md
          </code>{" "}
          파일을 만들어 보세요.
        </p>
      ) : (
        <div className="space-y-8">
          {Array.from(groups.entries()).map(([section, items]) => (
            <section key={section ?? "__none__"}>
              {section && (
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">
                  {section}
                </h2>
              )}
              <ul className="space-y-1">
                {items.map((t, i) => (
                  <li
                    key={`${section ?? ""}-${i}`}
                    className={
                      t.done
                        ? "text-zinc-400 line-through dark:text-zinc-600"
                        : "text-zinc-900 dark:text-zinc-100"
                    }
                  >
                    <span className="mr-2 select-none font-mono text-zinc-400">
                      {t.done ? "☑" : "☐"}
                    </span>
                    {t.text}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <p className="mt-10 text-xs text-zinc-500">
        편집은{" "}
        <code className="rounded bg-zinc-100 px-1 py-0.5 dark:bg-zinc-800">
          content/todos.md
        </code>
        를 직접 수정하세요.
      </p>
    </main>
  );
}
