import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import { remarkWikiLink } from "./remark-wiki-link";
import WikiLink from "@/components/WikiLink";
import type { ComponentType } from "react";

const components = {
  WikiLink: WikiLink as ComponentType<{ token: string }>,
};

export async function compileNoteBody(body: string) {
  const { content } = await compileMDX({
    source: body,
    components,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm, remarkWikiLink],
        rehypePlugins: [
          rehypeSlug,
          [
            rehypePrettyCode,
            {
              theme: { dark: "github-dark", light: "github-light" },
              keepBackground: false,
            },
          ],
        ],
      },
      parseFrontmatter: false,
    },
  });
  return content;
}
