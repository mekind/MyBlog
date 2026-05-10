import type { MDXComponents } from "mdx/types";
import WikiLink from "@/components/WikiLink";

const components: MDXComponents = {
  WikiLink: WikiLink as unknown as MDXComponents["WikiLink"],
};

export function useMDXComponents(existing: MDXComponents = {}): MDXComponents {
  return { ...components, ...existing };
}
