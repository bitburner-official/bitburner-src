import React, { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { TableHead } from "@mui/material";
import remarkGfm from "remark-gfm";
import { h1, h2, h3, h4, h5, h6, li, Td, Th, table, tr, Blockquote, p } from "./components";
import { code, Pre } from "./code";
import { A } from "./a";
import remarkMath from "remark-math";
import rehypeMathjax from "rehype-mathjax/svg";
import { FilePath } from "../../Paths/FilePath";
import { getPage } from "../../Documentation/root";
import { toJsxRuntime, type Components } from "hast-util-to-jsx-runtime";

import { Fragment, jsx, jsxs } from "react/jsx-runtime";

const COMPONENTS: Components = {
  h1: h1,
  h2: h2,
  h3: h3,
  h4: h4,
  h5: h5,
  h6: h6,
  pre: Pre,
  p: p,
  code: code,
  li: li,

  th: Th,
  td: Td,
  table: table,
  thead: TableHead,
  tr: tr,
  blockquote: Blockquote,
  a: A,
};

export function MD(props: { pageFilePath: FilePath; top: number }): React.ReactElement {
  const pageContent = getPage(props.pageFilePath);

  useEffect(() => {
    // This is a workaround. window.scrollTo does not work when we switch from Documentation tab to another tab, then
    // switch back.
    setTimeout(() => {
      window.scrollTo({ top: props.top, behavior: "instant" });
    }, 0);
  });

  return toJsxRuntime(pageContent as any, {
    Fragment,
    components: COMPONENTS,

    ignoreInvalidStyle: true,
    jsx,
    jsxs,
    passKeys: true,
    passNode: true,
  });
}
