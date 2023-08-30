import React, { useState } from "react";
import { WorkerScript } from "../../Netscript/WorkerScript";
import { WorkerScriptAccordion } from "./WorkerScriptAccordion";
import List from "@mui/material/List";
import TablePagination from "@mui/material/TablePagination";
import { TablePaginationActionsAll } from "../React/TablePaginationActionsAll";
import { Settings } from "../../Settings/Settings";

interface IProps {
  workerScripts: WorkerScript[];
}

export function ServerAccordionContent(props: IProps): React.ReactElement {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(Settings.ActiveScriptsScriptPageSize);
  const handleChangePage = (event: unknown, newPage: number): void => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>): void => {
    Settings.ActiveScriptsScriptPageSize = parseInt(event.target.value, 10);
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <>
      {props.workerScripts.length > 10 ? (
        <TablePagination
          rowsPerPageOptions={[10, 15, 20, 100]}
          component="div"
          count={props.workerScripts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          ActionsComponent={TablePaginationActionsAll}
        />
      ) : (
        ""
      )}
      <List dense disablePadding>
        {props.workerScripts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((ws) => (
          <WorkerScriptAccordion key={`${ws.pid}`} workerScript={ws} />
        ))}
      </List>
    </>
  );
}
