import React, { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { TableHead } from "@mui/material";
import remarkGfm from "remark-gfm";
import { h1, h2, h3, h4, h5, h6, li, Td, Th, table, tr, Blockquote, p } from "./components";
import { code, Pre } from "./code";
import { A } from "./a";
import remarkMath from "remark-math";
import rehypeMathjax from "rehype-mathjax/svg";
import rehypeRaw from "rehype-raw";
import { FilePath } from "../../Paths/FilePath";
import { getPage } from "../../Documentation/root";

export function MD({
  pageFilePath,
  top,
  modalWrapperRef,
}: {
  pageFilePath: FilePath;
  top: number;
  /**
   * If this component is used for rendering the documentation popup, this parameter is the ref of the wrapper div in
   * the modal.
   */
  modalWrapperRef?: React.RefObject<HTMLDivElement>;
}): React.ReactElement {
  const pageContent = getPage(pageFilePath);

  /**
   * After rendering the doc page, we need to scroll it. This component is used in 2 places:
   * - src\Documentation\ui\DocumentationRoot.tsx: The documentation tab.
   * - src\Documentation\ui\DocumentationPopUp.tsx: The documentation popup opened by using the
   * DocumentationAutocomplete component.
   */
  useEffect(() => {
    // With the documentation popup: Scroll by using the wrapper div in the modal.
    if (modalWrapperRef && modalWrapperRef.current) {
      modalWrapperRef.current.scrollTo({ top, behavior: "instant" });
      return;
    }
    /**
     * With the documentation tab: Scroll by using the window object.
     * Using setTimeout is a workaround. window.scrollTo does not work when we switch from Documentation tab to another
     * tab, then switch back.
     */
    setTimeout(() => {
      window.scrollTo({ top, behavior: "instant" });
    }, 0);
  });

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
      // Use rehypeRaw to support HTML content in NS API docs.
      rehypePlugins={[rehypeMathjax, rehypeRaw]}
    >
      {pageContent}
    </ReactMarkdown>
  );
}
