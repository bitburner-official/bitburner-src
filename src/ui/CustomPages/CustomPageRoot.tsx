import React, { useState, useEffect } from "react";
import { CustomPageManager, type CustomPage } from "../CustomPageManager";
import { Settings } from "../../Settings/Settings";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

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

  // String content: render in a Typography pre so the player's configured
  // monospace font/size is applied and column-padded text aligns correctly.
  // ReactNode content: render directly inside a plain container so the
  // caller's JSX controls its own layout and styling.
  if (typeof page.content === "string") {
    return (
      <Typography
        component="pre"
        sx={{
          fontFamily: Settings.styles.fontFamily,
          fontSize: `${Settings.styles.fontSize}px`,
          lineHeight: Settings.styles.lineHeight,
          whiteSpace: "pre",
          m: 0,
          p: 1,
        }}
      >
        {page.content}
      </Typography>
    );
  }

  return <Box sx={{ p: 1 }}>{page.content}</Box>;
}
