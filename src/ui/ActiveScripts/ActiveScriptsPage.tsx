/**
 * Root React Component for the "Active Scripts" UI page. This page displays
 * and provides information about all of the player's scripts that are currently running
 */
import React, { useState } from "react";

import { MenuItem, Typography, Select, SelectChangeEvent, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

import { ScriptProduction } from "./ScriptProduction";
import { ServerAccordions } from "./ServerAccordions";

import { Settings } from "../../Settings/Settings";
import { isPositiveInteger } from "../../types";

export function ActiveScriptsPage(): React.ReactElement {
  // Don't fail if the player has somehow loaded invalid script page sizes
  const [scriptsPerPage, setScriptsPerPage] = useState(
    isPositiveInteger(Settings.ActiveScriptsScriptPageSize) ? Settings.ActiveScriptsScriptPageSize : 10,
  );
  const [serversPerPage, setServersPerPage] = useState(
    isPositiveInteger(Settings.ActiveScriptsServerPageSize) ? Settings.ActiveScriptsServerPageSize : 10,
  );
  const [filter, setFilter] = useState("");

  function changeScriptsPerPage(e: SelectChangeEvent<number>) {
    const n = parseInt(e.target.value as string);
    if (!isPositiveInteger(n)) return;
    Settings.ActiveScriptsScriptPageSize = n;
    setScriptsPerPage(n);
  }
  function changeServersPerPage(e: SelectChangeEvent<number>) {
    const n = parseInt(e.target.value as string);
    if (!isPositiveInteger(n)) return;
    Settings.ActiveScriptsServerPageSize = n;
    setServersPerPage(n);
  }

  return (
    <>
      <Typography>
        This page displays a list of all of your scripts that are currently running across every machine. It also
        provides information about each script's production. The scripts are categorized by the hostname of the servers
        on which they are running.
      </Typography>

      <ScriptProduction />
      <div>
        <Typography component="span">Servers per page: </Typography>
        <Select value={serversPerPage} onChange={changeServersPerPage}>
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={15}>15</MenuItem>
          <MenuItem value={20}>20</MenuItem>
          <MenuItem value={100}>100</MenuItem>
        </Select>
        <Typography component="span"> Scripts per page: </Typography>
        <Select value={scriptsPerPage} onChange={changeScriptsPerPage}>
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={15}>15</MenuItem>
          <MenuItem value={20}>20</MenuItem>
          <MenuItem value={100}>100</MenuItem>
        </Select>
        <Typography component="span"> Search filter: </Typography>
        <TextField
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          autoFocus
          InputProps={{ startAdornment: <SearchIcon />, spellCheck: false }}
        />
      </div>
      <ServerAccordions filter={filter} />
    </>
  );
}
