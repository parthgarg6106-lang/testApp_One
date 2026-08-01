import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Focus — A Simple Todo List" },
      {
        name: "description",
        content:
          "A calm, fast todo list that keeps your tasks in your browser. No accounts, no clutter — just write it down and get it done.",
      },
      { property: "og:title", content: "Focus — A Simple Todo List" },
      {
        property: "og:description",
        content:
          "A calm, fast todo list that keeps your tasks in your browser. No accounts, no clutter.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Todo = { id: string; text: string; done: boolean };

const STORAGE_KEY = "focus.todos.v1";

function Index() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [draft, setDraft] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setTodos(JSON.parse(raw) as Todo[]);
    } catch {
      /* ignore malformed storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos, hydrated]);

  const add = () => {
    const text = draft.trim();
    if (!text) return;
    setTodos((prev) => [
      { id: crypto.randomUUID(), text, done: false },
      ...prev,
    ]);
    setDraft("");
  };

  const toggle = (id: string) =>
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const remove = (id: string) => setTodos((prev) => prev.filter((t) => t.id !== id));

  const visible = todos.filter((t) =>
    filter === "all" ? true : filter === "active" ? !t.done : t.done,
  );
  const remaining = todos.filter((t) => !t.done).length;

  return (
    <main className="min-h-screen bg-background px-5 py-12 sm:py-20">
      <div className="mx-auto w-full max-w-xl">
        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Today
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Focus
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {remaining === 0
              ? "Nothing left on your plate."
              : `${remaining} task${remaining === 1 ? "" : "s"} to go.`}
          </p>
        </header>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            add();
          }}
          className="flex items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-soft"
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="What needs doing?"
            aria-label="New task"
            className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-base text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            aria-label="Add task"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
            disabled={!draft.trim()}
          >
            <Plus className="h-5 w-5" />
          </button>
        </form>

        <div className="mt-6 flex gap-1.5">
          {(["all", "active", "done"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium capitalize transition-colors ${
                filter === f
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <ul className="mt-4 space-y-2">
          {visible.map((todo) => (
            <li
              key={todo.id}
              className="group flex items-center gap-3 rounded-2xl border border-border bg-card px-3 py-3 shadow-soft"
            >
              <button
                onClick={() => toggle(todo.id)}
                aria-label={todo.done ? "Mark as not done" : "Mark as done"}
                className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  todo.done
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-transparent hover:border-primary"
                }`}
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <span
                className={`flex-1 break-words text-[15px] ${
                  todo.done ? "text-muted-foreground line-through" : "text-foreground"
                }`}
              >
                {todo.text}
              </span>
              <button
                onClick={() => remove(todo.id)}
                aria-label="Delete task"
                className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>

        {hydrated && visible.length === 0 && (
          <p className="mt-10 text-center text-sm text-muted-foreground">
            {todos.length === 0
              ? "Your list is empty. Add your first task above."
              : "Nothing here."}
          </p>
        )}
      </div>
    </main>
  );
}
