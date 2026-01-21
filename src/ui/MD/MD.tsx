import React from "react";
import ReactMarkdown from "react-markdown";
import { TableHead } from "@mui/material";
import remarkGfm from "remark-gfm";
import { h1, h2, h3, h4, h5, h6, li, Td, Th, table, tr, Blockquote, p } from "./components";
import { code, Pre } from "./code";
import { A } from "./a";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import { FilePath } from "../../Paths/FilePath";
import { convertMathNotation, getPage } from "../../Documentation/root";
import { DocImages } from "../../Documentation/pages";
import { createPlugin } from "../../ThirdParty/RehypePlugin.mjs";
import { Settings } from "../../Settings/Settings";
import { fromDom } from "hast-util-from-dom";

const rehypePlugin = createPlugin(function () {
  return {
    render(value: string, { display }: { display: boolean }) {
      const mml = convertMathNotation(value);
      const element = document.createElement(display ? "div" : "span");
      if (display) {
        element.style.textAlign = "center";
      }
      element.style.fontFamily = Settings.styles.fontFamily;
      // Check the comment in src/Themes/ui/StyleEditorModal.tsx to see why we need to convert the font size.
      element.style.fontSize = `${Settings.styles.fontSize * (16 / 14)}px`;
      element.style.color = Settings.theme.primary;
      element.innerHTML = mml;
      return [fromDom(element)];
    },
  };
});

export function MD({ pageFilePath }: { pageFilePath: FilePath }): React.ReactElement {
  const pageContent = getPage(pageFilePath);

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
      }}
      remarkPlugins={[remarkGfm, remarkMath]}
      // Use a custom rehype plugin to render LaTeX notation in md files. Use rehypeRaw to support HTML content in NS
      // API docs.
      rehypePlugins={[rehypePlugin, rehypeRaw]}
      transformImageUri={(__src, alt) => {
        return DocImages[alt];
      }}
    >
      {pageContent}
    </ReactMarkdown>
  );
}
