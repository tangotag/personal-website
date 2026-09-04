import "server-only";
import { compile, run } from "@mdx-js/mdx";
import type { MDXComponents } from "mdx/types";
import { createElement } from "react";
import * as runtime from "react/jsx-runtime";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { mdxComponents } from "@/components/case-study/mdx-components";

export { extractHeadings, type Heading } from "@/lib/headings";

/**
 * Compiles an MDX body to a React element with the case-study component vocabulary.
 * Uses @mdx-js/mdx directly (compile → run against react/jsx-runtime); next-mdx-remote's
 * dev-runtime shim dropped JSX attribute props under React 19.2.
 */
export async function renderMdx(body: string, components: MDXComponents = mdxComponents) {
  const compiled = await compile(body, {
    outputFormat: "function-body",
    development: false,
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: "wrap", properties: { className: "heading-link" } }],
    ],
  });
  const { default: MDXContent } = await run(String(compiled), {
    ...runtime,
    baseUrl: import.meta.url,
  });
  return createElement(MDXContent, { components });
}
