import React from "react";
import ReactMarkdown from "react-markdown";
import { TableHead, Typography } from "@mui/material";
import remarkGfm from "remark-gfm";
import { h1, h2, h3, h4, h5, h6, li, Td, Th, table, tr, Blockquote } from "./components";
import { code, Pre } from "./code";
import { A } from "./a";

export function MD(props: { md: string }): React.ReactElement {
  return (
    <ReactMarkdown
      components={{
        h1: h1,
        h2: h2,
        h3: h3,
        h4: h4,
        h5: h5,
        h6: h6,
        pre: Pre,
        p: Typography,
        code: code,
        li: li,

        th: Th,
        td: Td,
        table: table,
        thead: TableHead,
        tr: tr,
        blockquote: Blockquote,
        a: A,
      }}
      remarkPlugins={[remarkGfm]}
    >
      {props.md}
    </ReactMarkdown>
  );
}
