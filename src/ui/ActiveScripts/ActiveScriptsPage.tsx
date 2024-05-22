import type { WorkerScript } from "../../Netscript/WorkerScript";
import type { BaseServer } from "../../Server/BaseServer";

import React, { useState } from "react";

import { MenuItem, Typography, Select, SelectChangeEvent, TextField, IconButton, List } from "@mui/material";
import { FirstPage, KeyboardArrowLeft, KeyboardArrowRight, LastPage, Search } from "@mui/icons-material";

import { ScriptProduction } from "./ScriptProduction";
import { ServerAccordion } from "./ServerAccordion";

import { workerScripts } from "../../Netscript/WorkerScripts";
import { Settings } from "../../Settings/Settings";
import { isPositiveInteger } from "../../types";
import { SpecialServers } from "../../Server/data/SpecialServers";

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

  // Creating and sorting the server data array is done here
  const serverData: [BaseServer, WorkerScript[]][] = (() => {
    const tempData: Map<BaseServer, WorkerScript[]> = new Map();
    if (filter) {
      // Only check filtering if a filter exists (performance)
      for (const ws of workerScripts.values()) {
        if (!ws.hostname.includes(filter) && !ws.scriptRef.filename.includes(filter)) continue;
        const server = ws.getServer();
        const serverScripts = tempData.get(server);
        if (serverScripts) serverScripts.push(ws);
        else tempData.set(server, [ws]);
      }
    } else {
      for (const ws of workerScripts.values()) {
        const server = ws.getServer();
        const serverScripts = tempData.get(server);
        if (serverScripts) serverScripts.push(ws);
        else tempData.set(server, [ws]);
      }
    }
    // serverData will be based on a sorted array from the temporary Map
    return [...tempData].sort(([serverA], [serverB]) => {
      // Servers not owned by the player are equal for sorting. Earliest return because it is the most common comparison.
      if (!serverA.purchasedByPlayer && !serverB.purchasedByPlayer) return 0;
      // Servers owned by the player come earlier in the sorting
      if (serverA.purchasedByPlayer && !serverB.purchasedByPlayer) return -1;
      if (!serverA.purchasedByPlayer && serverB.purchasedByPlayer) return 1;
      // If we have reached this point, then both servers are player owned
      // Home is at the top
      if (serverA.hostname === SpecialServers.Home) return -1;
      if (serverB.hostname === SpecialServers.Home) return 1;
      // Hacknet servers shown after home
      if (serverA.isHacknetServer && !serverB.isHacknetServer) return -1;
      if (!serverA.isHacknetServer && serverB.isHacknetServer) return 1;
      // Sorting for hacknet servers is based on the numbered suffix
      if (serverA.isHacknetServer) {
        if (serverA.hostname.length < serverB.hostname.length) return -1;
        if (serverA.hostname.length > serverB.hostname.length) return 1;
        // Get the numbered suffix from the end of the server names
        const numA = Math.abs(parseInt(serverA.hostname.slice(-2)));
        const numB = Math.abs(parseInt(serverB.hostname.slice(-2)));
        if (numA < numB) return -1;
        return 1;
      }
      // Sorting for other purchased servers is alphabetical. There's probably a better way to do this.
      const fakeArray = [serverA.hostname, serverB.hostname].sort();
      if (serverA.hostname === fakeArray[0]) return -1;
      return 1;
    });
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
        {dataToShow.map(([server, scripts]) => (
          <ServerAccordion key={server.hostname} server={server} scripts={scripts} />
        ))}
      </List>
    </>
  );
}
