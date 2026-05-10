import type { Plugin } from "unified";
import type { Root, Text, PhrasingContent } from "mdast";
import { visit } from "unist-util-visit";

const WIKI_LINK_RE = /\[\[([^\]]+)\]\]/g;

type MdxJsxElement = {
  type: "mdxJsxTextElement";
  name: string;
  attributes: Array<{
    type: "mdxJsxAttribute";
    name: string;
    value: string;
  }>;
  children: PhrasingContent[];
};

export const remarkWikiLink: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, "text", (node: Text, index, parent) => {
      if (!parent || index === undefined) return;
      const value = node.value;
      if (!WIKI_LINK_RE.test(value)) return;
      WIKI_LINK_RE.lastIndex = 0;

      const replacement: PhrasingContent[] = [];
      let lastIndex = 0;
      for (const m of value.matchAll(WIKI_LINK_RE)) {
        const matchStart = m.index ?? 0;
        if (matchStart > lastIndex) {
          replacement.push({
            type: "text",
            value: value.slice(lastIndex, matchStart),
          });
        }
        const token = m[1].trim();
        const jsxNode = {
          type: "mdxJsxTextElement",
          name: "WikiLink",
          attributes: [
            { type: "mdxJsxAttribute", name: "token", value: token },
          ],
          children: [],
        } as unknown as PhrasingContent;
        replacement.push(jsxNode);
        lastIndex = matchStart + m[0].length;
      }
      if (lastIndex < value.length) {
        replacement.push({ type: "text", value: value.slice(lastIndex) });
      }

      (parent as { children: PhrasingContent[] }).children.splice(
        index,
        1,
        ...replacement
      );
      return index + replacement.length;
    });
  };
};
