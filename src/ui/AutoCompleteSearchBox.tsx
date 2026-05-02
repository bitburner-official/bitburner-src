import { Autocomplete, SxProps, TextField } from "@mui/material";
import React, { useState, SyntheticEvent } from "react";
import dice from "fast-dice-coefficient";

type AutoCompleteSearchBoxProps = {
  sx?: SxProps;
  placeholder: string;
  maxSuggestions: number;
  suggestionList: () => string[];
  ignoredTextRegex: RegExp;
  onSelection: (
    event: SyntheticEvent<Element, Event>,
    selection: string,
    options: string[],
    searchValue: string,
  ) => void;
  width?: number;
};

type ScoredItem = {
  item: string;
  score: number;
};

export function AutoCompleteSearchBox({
  sx,
  placeholder,
  maxSuggestions,
  suggestionList,
  ignoredTextRegex,
  onSelection,
  width = 500,
}: AutoCompleteSearchBoxProps) {
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
          sx={{ minWidth: `${width}px` }}
          placeholder={placeholder}
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
            const scoredSuggestions: ScoredItem[] = suggestionList().map((item) => ({
              item,
              score: dice(value, item.replace(ignoredTextRegex, "")),
            }));
            const sortByScore = (a: ScoredItem, b: ScoredItem) => b.score - a.score;
            const matchedSuggestions = scoredSuggestions.filter((v) => v.item.includes(value)).sort(sortByScore);
            const unmatchedSuggestions = scoredSuggestions.filter((v) => !v.item.includes(value)).sort(sortByScore);
            const results = [...matchedSuggestions, ...unmatchedSuggestions].map((v) => v.item);
            setOptions(results.slice(0, maxSuggestions));
          }}
        />
      )}
      filterOptions={(options) => options}
      onChange={(event, selection) => onSelection(event, selection, options, searchValue)}
    />
  );
}
