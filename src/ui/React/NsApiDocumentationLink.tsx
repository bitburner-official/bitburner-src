import React from "react";
import { Link } from "@mui/material";
import { getNsApiDocumentationUrl } from "../../utils/StringHelperFunctions";
import { Settings } from "../../Settings/Settings";

export function NsApiDocumentationLink(): React.ReactElement {
  return (
    <Link
      target="_blank"
      href={getNsApiDocumentationUrl()}
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
