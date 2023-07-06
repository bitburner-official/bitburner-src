import React from "react";
import { h1, h2, h3, h4, h5, h6, li, td, th, table, tr, blockquote } from "./components";
import ReactMarkdown from "react-markdown";
import { TableHead, Typography } from "@mui/material";
import remarkGfm from "remark-gfm";
import { code, pre } from "./code";

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
        pre: pre,
        p: Typography,
        code: code,
        li: li,

        th: th,
        td: td,
        table: table,
        thead: TableHead,
        tr: tr,
        blockquote: blockquote,
      }}
      remarkPlugins={[remarkGfm]}
    >
      {props.md}
    </ReactMarkdown>
  );
}
