"use client";

import Link from "next/link";
import { useState } from "react";
import { useSidebar } from "./SidebarShell";

export default function Header() {
  const sidebar = useSidebar();
  return (
    <header className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-zinc-200 bg-white/80 px-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="사이드바 토글"
          onClick={() => sidebar.toggle()}
          className="rounded p-1 text-zinc-600 hover:bg-zinc-100 lg:hidden dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <span className="block h-0.5 w-5 bg-current"></span>
          <span className="mt-1 block h-0.5 w-5 bg-current"></span>
          <span className="mt-1 block h-0.5 w-5 bg-current"></span>
        </button>
        <Link href="/" className="text-sm font-semibold tracking-tight">
          MyBlog
        </Link>
      </div>
      <Link
        href="/write"
        className="rounded bg-zinc-900 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        새 글
      </Link>
    </header>
  );
}
