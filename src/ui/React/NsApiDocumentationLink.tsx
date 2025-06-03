import React from "react";
import { Link } from "@mui/material";
import { Settings } from "../../Settings/Settings";
import { Router } from "../GameRoot";
import { Page } from "../Router";
import { defaultNsApiPage, openDocExternally } from "./Documentation";

export function NsApiDocumentationLink(): React.ReactElement {
  return (
    <Link
      target="_blank"
      onClick={(event) => {
        if (event.ctrlKey) {
          openDocExternally(defaultNsApiPage);
          return;
        }
        Router.toPage(Page.Documentation, { docPage: defaultNsApiPage });
      }}
      fontSize="1.2rem"
      color={Settings.theme.info}
      sx={{
        textDecorationThickness: "3px",
        textUnderlineOffset: "5px",
      }}
    >
      NS API documentation
    </Link>
  );
}
