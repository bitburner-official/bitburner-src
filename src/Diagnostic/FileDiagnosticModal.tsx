import React from "react";
import { GetServer, GetAllServers } from "../Server/AllServers";
import { Modal } from "../ui/React/Modal";
import { formatBigNumber } from "../ui/formatNumber";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ServerName } from "../Types/strings";
import { allContentFiles } from "../Files/ContentFile";

interface File {
  name: string;
  size: number;
}

function ServerAccordion(props: { hostname: ServerName }): React.ReactElement {
  const server = GetServer(props.hostname);
  if (server === null) throw new Error(`server '${props.hostname}' should not be null`);
  let totalSize = 0;
  const files: File[] = [];
  for (const [path, file] of allContentFiles(server)) {
    totalSize += file.content.length;
    files.push({ name: path, size: file.content.length });
  }

  if (totalSize === 0) return <></>;

  files.sort((a: File, b: File): number => b.size - a.size);

  return (
    <Accordion TransitionProps={{ unmountOnExit: true }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>
          {server.hostname} ({formatBigNumber(totalSize)}b)
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography>Filename</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography>Size</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {files.map((file: File) => (
                <TableRow key={file.name}>
                  <TableCell component="th" scope="row">
                    <Typography>{file.name}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography>{formatBigNumber(file.size)}b</Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <ul></ul>
      </AccordionDetails>
    </Accordion>
  );
}

interface IProps {
  open: boolean;
  onClose: () => void;
}

export function FileDiagnosticModal(props: IProps): React.ReactElement {
  const keys: string[] = [];
  for (const key of GetAllServers()) {
    keys.push(key.hostname);
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <>
        <Typography>
          Welcome to the file diagnostic! If your save file is really big it's likely because you have too many
          text/scripts. This tool can help you narrow down where they are.
        </Typography>
        {keys.map((hostname: string) => (
          <ServerAccordion key={hostname} hostname={hostname} />
        ))}
      </>
    </Modal>
  );
}
