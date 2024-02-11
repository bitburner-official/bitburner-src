import type { WorkerScript } from "../../Netscript/WorkerScript";
import React, { useState } from "react";

import { MenuItem, Typography, Select, SelectChangeEvent, TextField, IconButton, List } from "@mui/material";
import { FirstPage, KeyboardArrowLeft, KeyboardArrowRight, LastPage, Search } from "@mui/icons-material";

import { ScriptProduction } from "./ScriptProduction";
import { ServerAccordion } from "./ServerAccordion";

import { workerScripts } from "../../Netscript/WorkerScripts";
import { getRecordEntries } from "../../Types/Record";
import { Settings } from "../../Settings/Settings";
import { isPositiveInteger } from "../../types";

export function ActiveScriptsPage(): React.ReactElement {
  const [scriptsPerPage, setScriptsPerPage] = useState(Settings.ActiveScriptsScriptPageSize);
  const [serversPerPage, setServersPerPage] = useState(Settings.ActiveScriptsServerPageSize);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(0);

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

  const serverData: [string, WorkerScript[]][] = (() => {
    const tempData: Record<string, WorkerScript[]> = {};
    if (filter) {
      // Only check filtering if a filter exists (performance)
      for (const ws of workerScripts.values()) {
        if (!ws.hostname.includes(filter) && !ws.scriptRef.filename.includes(filter)) continue;
        const hostname = ws.hostname;
        if (tempData[hostname]) tempData[hostname].push(ws);
        else tempData[hostname] = [ws];
      }
    } else {
      for (const ws of workerScripts.values()) {
        const hostname = ws.hostname;
        if (tempData[hostname]) tempData[hostname].push(ws);
        else tempData[hostname] = [ws];
      }
    }
    return getRecordEntries(tempData);
  })();

  const lastPage = Math.max(Math.ceil(serverData.length / serversPerPage) - 1, 0);
  function changePage(n: number) {
    if (!Number.isInteger(n) || n > lastPage || n < 0) return;
    setPage(n);
  }
  if (page > lastPage) changePage(lastPage);

  const adjustedIndex = page * serversPerPage;
  const dataToShow = serverData.slice(adjustedIndex, adjustedIndex + serversPerPage);
  const firstServerNumber = serverData.length === 0 ? 0 : adjustedIndex + 1;
  const lastServerNumber = serverData.length === 0 ? 0 : adjustedIndex + dataToShow.length;

  return (
    <>
      <Typography>
        This page displays a list of all of your scripts that are currently running across every machine. It also
        provides information about each script's production. The scripts are categorized by the hostname of the servers
        on which they are running.
      </Typography>

      <ScriptProduction />
      <div style={{ width: "100%", display: "flex", alignItems: "center" }}>
        <TextField
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          autoFocus
          InputProps={{ startAdornment: <Search />, spellCheck: false }}
          size="small"
        />
        <Typography marginLeft="1em">Servers/page:</Typography>
        <Select value={serversPerPage} onChange={changeServersPerPage}>
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={15}>15</MenuItem>
          <MenuItem value={20}>20</MenuItem>
          <MenuItem value={100}>100</MenuItem>
        </Select>
        <Typography marginLeft="1em">Scripts/page:</Typography>
        <Select value={scriptsPerPage} onChange={changeScriptsPerPage}>
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={15}>15</MenuItem>
          <MenuItem value={20}>20</MenuItem>
          <MenuItem value={100}>100</MenuItem>
        </Select>
        <Typography
          marginLeft="auto"
          marginRight="1em"
        >{`${firstServerNumber}-${lastServerNumber} of ${serverData.length}`}</Typography>
        <IconButton onClick={() => changePage(0)} disabled={page === 0}>
          <FirstPage />
        </IconButton>
        <IconButton onClick={() => changePage(page - 1)} disabled={page === 0}>
          <KeyboardArrowLeft />
        </IconButton>
        <IconButton onClick={() => changePage(page + 1)} disabled={page === lastPage}>
          <KeyboardArrowRight />
        </IconButton>
        <IconButton onClick={() => changePage(lastPage)} disabled={page === lastPage}>
          <LastPage />
        </IconButton>
      </div>
      <List dense={true}>
        {dataToShow.map(([hostname, scripts]) => (
          <ServerAccordion key={hostname} hostname={hostname} scripts={scripts} />
        ))}
      </List>
    </>
  );
}
