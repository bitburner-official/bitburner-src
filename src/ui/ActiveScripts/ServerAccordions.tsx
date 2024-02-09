import type { WorkerScript } from "../../Netscript/WorkerScript";

import React, { useState } from "react";

import { ServerAccordion } from "./ServerAccordion";

import { IconButton, List, Typography } from "@mui/material/";
import { FirstPage, KeyboardArrowLeft, KeyboardArrowRight, LastPage } from "@mui/icons-material";
import { Settings } from "../../Settings/Settings";
import { workerScripts } from "../../Netscript/WorkerScripts";
import { getRecordEntries } from "../../Types/Record";

export function ServerAccordions({ filter }: { filter: string }): React.ReactElement {
  const [page, setPage] = useState(0);

  const serversPerPage = Settings.ActiveScriptsServerPageSize;

  const serverData: [string, WorkerScript[]][] = (() => {
    const tempData: Record<string, WorkerScript[]> = {};
    for (const ws of workerScripts.values()) {
      if (!ws.hostname.includes(filter) && !ws.scriptRef.filename.includes(filter)) continue;
      const hostname = ws.hostname;
      if (tempData[hostname]) tempData[hostname].push(ws);
      else tempData[hostname] = [ws];
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
  const lastServerNumber = (serverData.length === 0 ? 0 : adjustedIndex + dataToShow.length).toString();
  const firstServerNumber = (serverData.length === 0 ? 0 : adjustedIndex + 1)
    .toString()
    .padStart(lastServerNumber.length, "\xa0");

  return (
    <>
      <IconButton onClick={() => changePage(0)} disabled={page === 0}>
        <FirstPage />
      </IconButton>
      <IconButton onClick={() => changePage(page - 1)} disabled={page === 0}>
        <KeyboardArrowLeft />
      </IconButton>
      <Typography component="span">
        {`servers ${firstServerNumber}-${lastServerNumber} of ${serverData.length}`}
      </Typography>
      <IconButton onClick={() => changePage(page + 1)} disabled={page === lastPage}>
        <KeyboardArrowRight />
      </IconButton>
      <IconButton onClick={() => changePage(lastPage)} disabled={page === lastPage}>
        <LastPage />
      </IconButton>
      <List dense={true}>
        {serverData.slice(page * serversPerPage, page * serversPerPage + serversPerPage).map(([hostname, scripts]) => {
          return <ServerAccordion key={hostname} hostname={hostname} scripts={scripts} />;
        })}
      </List>
    </>
  );
}
