import React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import type { Faction } from "../../Faction/Faction";
import { Factions } from "../../Faction/Factions";
import { getRecordValues } from "../../Types/Record";
import { getEnumHelper } from "../../utils/EnumHelper";

export function FactionChooser({
  faction,
  onChange,
  style,
}: {
  faction: Faction;
  onChange: (f: Faction) => void;
  style?: React.CSSProperties;
}): React.ReactElement {
  const factions = React.useMemo(() => {
    return getRecordValues(Factions).map((faction) => faction.name);
  }, []);
  return (
    <Autocomplete
      style={{ width: "350px", ...style }}
      options={factions}
      value={faction.name}
      renderInput={(params) => <TextField {...params} style={{ height: "100%" }} />}
      onChange={(_, factionName) => {
        if (!factionName || !getEnumHelper("FactionName").isMember(factionName)) {
          return;
        }
        onChange(Factions[factionName]);
      }}
    ></Autocomplete>
  );
}
