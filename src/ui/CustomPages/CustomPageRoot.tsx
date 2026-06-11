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

  // Typography as="pre" so MUI's theme text color is applied — bare <pre>
  // does not inherit the theme color and renders invisible on dark backgrounds.
  return (
    <Typography
      component="pre"
      sx={{
        fontFamily: "monospace",
        fontSize: "1rem",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        m: 0,
        p: 0,
        lineHeight: 1.4,
      }}
    >
      {page.content}
    </Typography>
  );
}
