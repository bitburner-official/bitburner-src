import React from "react";
import type { SxProps } from "@mui/system";
import { nsApiPages } from "../pages";
import { AutoCompleteSearchBox } from "../../ui/AutoCompleteSearchBox";

/**
 * bitburner.ns.md -> ns
 */
const regex = /^bitburner\.|\.md$/g;

const suggestions = nsApiPages.filter((v) => {
  // index.md in the "markdown" folder is useless.
  return v !== "index.md";
});

type DocumentationAutocompleteProps = {
  sx?: SxProps;
  /**
   * "path" is always "nsDoc/filename.md"
   */
  onChange: (path: string, external: boolean) => void;
  width?: number;
};

export function DocumentationAutocomplete({ sx, onChange, width }: DocumentationAutocompleteProps) {
  return (
    <AutoCompleteSearchBox
      sx={sx}
      placeholder="搜索 NS API"
      maxSuggestions={10}
      suggestionList={() => suggestions}
      ignoredTextRegex={regex}
      onSelection={(event, path, options, searchValue) => {
        if (!path) {
          return;
        }
        const external = "ctrlKey" in event && event.ctrlKey === true;
        // Press Enter
        if (path === searchValue) {
          if (options.length === 0) {
            return;
          }
          onChange(`nsDoc/${options[0]}`, external);
        } else {
          // Choose an option.
          onChange(`nsDoc/${path}`, external);
        }
      }}
      width={width}
    />
  );
}
