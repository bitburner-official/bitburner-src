import React from "react";
import { defaultNsApiPage } from "./Documentation";
import { DocumentationLink } from "./DocumentationLink";

export function NsApiDocumentationLink(): React.ReactElement {
  return (
    <DocumentationLink
      page={defaultNsApiPage}
      fontSize="1.2rem"
      sx={{
        textDecorationThickness: "3px",
        textUnderlineOffset: "5px",
      }}
    >
      NS API documentation
    </DocumentationLink>
  );
}
