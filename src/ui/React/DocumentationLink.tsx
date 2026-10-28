import React from "react";
import { Link, type LinkProps } from "@mui/material";
import { Settings } from "../../Settings/Settings";
import { Page, Router } from "../Router";
import { openDocExternally } from "./Documentation";
import { openDocumentationPopUp } from "../../Documentation/root";

export function DocumentationLink(
  props: React.PropsWithChildren<
    {
      page: string;
    } & LinkProps
  >,
): React.ReactElement {
  return (
    <Link
      target="_blank"
      color={Settings.theme.info}
      onClick={(event) => {
        if (event.ctrlKey) {
          openDocExternally(props.page);
          return;
        }
        if (Router.page() === Page.BitVerse) {
          openDocumentationPopUp(props.page);
          return;
        }
        Router.toPage(Page.Documentation, { docPage: props.page });
      }}
      {...props}
      sx={{ cursor: "pointer", ...props.sx }}
    >
      {props.children}
    </Link>
  );
}
