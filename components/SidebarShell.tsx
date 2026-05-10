"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

type SidebarCtx = {
  open: boolean;
  toggle: () => void;
  close: () => void;
};

const Ctx = createContext<SidebarCtx | null>(null);

export function useSidebar(): SidebarCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSidebar outside SidebarShell");
  return v;
}

export default function SidebarShell({
  sidebar,
  header,
  children,
}: {
  sidebar: ReactNode;
  header: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((v) => !v), []);
  const close = useCallback(() => setOpen(false), []);

  return (
    <Ctx.Provider value={{ open, toggle, close }}>
      {header}
      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden h-[calc(100vh-3rem)] w-64 shrink-0 overflow-y-auto border-r border-zinc-200 lg:block dark:border-zinc-800">
          {sidebar}
        </aside>

        {/* Mobile drawer */}
        {open && (
          <>
            <div
              onClick={close}
              className="fixed inset-0 top-12 z-30 bg-black/30 lg:hidden"
              aria-hidden
            />
            <aside className="fixed left-0 top-12 z-40 h-[calc(100vh-3rem)] w-64 overflow-y-auto border-r border-zinc-200 bg-white lg:hidden dark:border-zinc-800 dark:bg-zinc-950">
              {sidebar}
            </aside>
          </>
        )}

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </Ctx.Provider>
  );
}
