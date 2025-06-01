import React, { useState } from "react";
import dice from "fast-dice-coefficient";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import type { SxProps } from "@mui/system";
import { nsApiPages } from "../pages";

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
};

export function DocumentationAutocomplete({ sx, onChange }: DocumentationAutocompleteProps) {
  const [options, setOptions] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState("");
  return (
    <Autocomplete
      freeSolo
      disableClearable
      /**
       * onChange of Autocomplete (not this TextField) is only called when the current value has been changed. This
       * means that onChange will not be called if the player chooses an option again. For example:
       * - Type "ns" -> Choose "bitburner.ns.md": Triggered.
       * - Type "ns" -> Choose "bitburner.ns.md" -> Close popup -> Choose "bitburner.ns.md" again: Not triggered.
       *
       * If we set "value" to a static value here, onChange will always be called.
       */
      value=""
      sx={sx}
      options={options}
      inputValue={searchValue}
      renderInput={(params) => (
        <TextField
          {...params}
          sx={{ minWidth: "500px" }}
          placeholder="Search NS API"
          onChange={(event) => {
            const value = event.target.value;
            setSearchValue(event.target.value);
            /**
             * Only support strings having length in the range of [2, 100].
             * - With only 1 char, the score is always 0.
             * - There is no reason to support unreasonably long queries.
             */
            if (value.length <= 1 || value.length > 100) {
              setOptions([]);
              return;
            }
            const scoredSuggestions = suggestions.map((page) => {
              return {
                page,
                score: dice(value, page.replace(regex, "")),
              };
            });
            scoredSuggestions.sort((a, b) => b.score - a.score);
            setOptions([...scoredSuggestions.map((v) => v.page)].slice(0, 10));
          }}
        />
      )}
      filterOptions={(options) => options}
      onChange={(event, path) => {
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
    />
  );
}
