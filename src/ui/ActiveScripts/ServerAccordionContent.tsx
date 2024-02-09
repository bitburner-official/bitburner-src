// TODO: Probably roll this into the ServerAccordion component, no real need for a separate component

import React, { useState } from "react";
import { WorkerScript } from "../../Netscript/WorkerScript";
import { WorkerScriptAccordion } from "./WorkerScriptAccordion";
import { IconButton, List, Typography } from "@mui/material";
import { Settings } from "../../Settings/Settings";
import { FirstPage, KeyboardArrowLeft, KeyboardArrowRight, LastPage } from "@mui/icons-material";

interface ServerActiveScriptsProps {
  scripts: WorkerScript[];
}

export function ServerAccordionContent({ scripts }: ServerActiveScriptsProps): React.ReactElement {
  const [page, setPage] = useState(0);
  if (scripts.length === 0) {
    console.error(`Attempted to display a server in active scripts when there were no matching scripts to show`);
    return <></>;
  }
  const scriptsPerPage = Settings.ActiveScriptsScriptPageSize;
  const lastPage = Math.ceil(scripts.length / scriptsPerPage) - 1;
  function changePage(n: number) {
    if (!Number.isInteger(n) || n > lastPage || n < 0) return;
    setPage(n);
  }
  if (page > lastPage) changePage(lastPage);

  const lastScriptNumber = Math.min((page + 1) * scriptsPerPage, scripts.length).toString();
  const firstScriptNumber = (page * scriptsPerPage + 1).toString().padStart(lastScriptNumber.length, "\xa0");

  return (
    <>
      <IconButton onClick={() => changePage(0)} disabled={page === 0}>
        <FirstPage />
      </IconButton>
      <IconButton onClick={() => changePage(page - 1)} disabled={page === 0}>
        <KeyboardArrowLeft />
      </IconButton>
      <Typography component="span">
        {`scripts ${firstScriptNumber}-${lastScriptNumber} of ${scripts.length}`}
      </Typography>
      <IconButton onClick={() => changePage(page + 1)} disabled={page === lastPage}>
        <KeyboardArrowRight />
      </IconButton>
      <IconButton onClick={() => changePage(lastPage)} disabled={page === lastPage}>
        <LastPage />
      </IconButton>
      <List dense disablePadding>
        {scripts.slice(page * scriptsPerPage, page * scriptsPerPage + scriptsPerPage).map((ws) => (
          <WorkerScriptAccordion key={ws.pid} workerScript={ws} />
        ))}
      </List>
    </>
  );
}
