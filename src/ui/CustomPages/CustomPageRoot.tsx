import React, { useState, useEffect } from "react";
import { CustomPageManager, type CustomPage } from "../CustomPageManager";
import Typography from "@mui/material/Typography";

interface Props {
  id: string;
}

/**
 * Renders the content of a script-created custom page.
 * Re-renders automatically whenever the script calls ns.ui.openPage() with
 * updated content.
 */
export function CustomPageRoot({ id }: Props): React.ReactElement {
  const [pages, setPages] = useState<readonly CustomPage[]>(() => CustomPageManager.getSnapshot());

  useEffect(() => CustomPageManager.subscribe(() => setPages(CustomPageManager.getSnapshot())), []);

  const page = pages.find((p: CustomPage) => p.id === id);

  if (!page) {
    return <Typography>This page no longer exists.</Typography>;
  }

  return (
    <pre
      style={{
        fontFamily: "monospace",
        fontSize: "inherit",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        margin: 0,
        padding: 0,
        lineHeight: 1.4,
      }}
    >
      {page.content}
    </pre>
  );
}
