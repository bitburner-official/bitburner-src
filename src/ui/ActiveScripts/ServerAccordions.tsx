/**
 * React Component for rendering the Accordion elements for all servers
 * on which scripts are running
 */
import React, { useState } from "react";

import { ServerAccordion } from "./ServerAccordion";

import TextField from "@mui/material/TextField";
import List from "@mui/material/List";
import TablePagination from "@mui/material/TablePagination";
import Grid from "@mui/material/Grid";
import { WorkerScript } from "../../Netscript/WorkerScript";
import { GetServer } from "../../Server/AllServers";
import { BaseServer } from "../../Server/BaseServer";
import { Settings } from "../../Settings/Settings";
import { TablePaginationActionsAll } from "../React/TablePaginationActionsAll";
import SearchIcon from "@mui/icons-material/Search";
import { matchScriptPathUnanchored } from "../../utils/helpers/scriptKey";
import lodash from "lodash";

// Map of server hostname -> all workerscripts on that server for all active scripts
interface IServerData {
  server: BaseServer;
  workerScripts: WorkerScript[];
}

type IServerToScriptsMap = Record<string, IServerData | undefined>;

interface IProps {
  workerScripts: Map<number, WorkerScript>;
}

export function ServerAccordions(props: IProps): React.ReactElement {
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(Settings.ActiveScriptsServerPageSize);

  const handleChangePage = (event: unknown, newPage: number): void => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>): void => {
    Settings.ActiveScriptsServerPageSize = parseInt(event.target.value, 10);
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  function handleFilterChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setFilter(event.target.value);
    setPage(0);
  }

  const serverToScriptMap: IServerToScriptsMap = {};
  for (const ws of props.workerScripts.values()) {
    const server = GetServer(ws.hostname);
    if (server == null) {
      console.warn(`WorkerScript has invalid hostname: ${ws.hostname}`);
      continue;
    }

    let data = serverToScriptMap[server.hostname];

    if (data === undefined) {
      serverToScriptMap[server.hostname] = {
        server: server,
        workerScripts: [],
      };
      data = serverToScriptMap[server.hostname];
    }
    if (data !== undefined) {
      // Add only scripts that correspond to the filter
      if (ws.hostname.includes(filter) || ws.name.includes(filter)) {
        data.workerScripts.push(ws);
      }
    }
  }

  // Match filter in the scriptname part of the key
  const pattern = matchScriptPathUnanchored(lodash.escapeRegExp(filter));
  const filtered = Object.values(serverToScriptMap).filter((data) => {
    if (!data) return false;
    if (data.server.hostname.includes(filter)) return true;
    for (const k of data.server.runningScriptMap.keys()) {
      if (pattern.test(k)) return true;
    }
    return false;
  });
  // Pushing a script from home to the start of the array to always display on top
  if (filtered.find((x) => x?.server?.hostname === "home")) {
    const index = filtered.findIndex((x) => x?.server?.hostname === "home");
    if (index != 0) {
      filtered.unshift(filtered[index]);
      filtered.splice(index + 1);
    }
  }

  return (
    <>
      <Grid container>
        <Grid item xs={4}>
          <TextField
            value={filter}
            onChange={handleFilterChange}
            autoFocus
            InputProps={{
              startAdornment: <SearchIcon />,
              spellCheck: false,
            }}
            style={{
              paddingTop: "8px",
            }}
          />
        </Grid>
        <Grid item xs={8}>
          {filtered.length > 10 ? (
            <TablePagination
              rowsPerPageOptions={[10, 15, 20, 100]}
              component="div"
              count={filtered.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              ActionsComponent={TablePaginationActionsAll}
            />
          ) : (
            ""
          )}
        </Grid>
      </Grid>
      <List dense={true}>
        {filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((data) => {
          return (
            data && (
              <ServerAccordion key={data.server.hostname} server={data.server} workerScripts={data.workerScripts} />
            )
          );
        })}
      </List>
    </>
  );
}
