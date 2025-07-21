import React, { useState } from "react";

import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { GetServer, GetAllServers } from "../../Server/AllServers";
import { Server } from "../../Server/Server";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { AutoExpandAccordion } from "../../ui/AutoExpand/AutoExpandAccordion";

export function ServersDev(): React.ReactElement {
  const [server, setServer] = useState<string>("home");
  const servers = GetAllServers().map((server) => server.hostname);

  function rootServer(): void {
    const s = GetServer(server);
    if (s === null) return;
    if (!(s instanceof Server)) return;
    s.hasAdminRights = true;
    s.sshPortOpen = true;
    s.ftpPortOpen = true;
    s.smtpPortOpen = true;
    s.httpPortOpen = true;
    s.sqlPortOpen = true;
    s.openPortCount = 5;
  }

  function rootAllServers(): void {
    for (const s of GetAllServers()) {
      if (!(s instanceof Server)) return;
      s.hasAdminRights = true;
      s.sshPortOpen = true;
      s.ftpPortOpen = true;
      s.smtpPortOpen = true;
      s.httpPortOpen = true;
      s.sqlPortOpen = true;
      s.openPortCount = 5;
    }
  }

  function backdoorServer(): void {
    const s = GetServer(server);
    if (s === null) return;
    if (!(s instanceof Server)) return;
    s.backdoorInstalled = true;
  }

  function backdoorAllServers(): void {
    for (const s of GetAllServers()) {
      if (!(s instanceof Server)) return;
      s.backdoorInstalled = true;
    }
  }

  function minSecurity(): void {
    const s = GetServer(server);
    if (s === null) return;
    if (!(s instanceof Server)) return;
    s.hackDifficulty = s.minDifficulty;
  }

  function minAllSecurity(): void {
    for (const s of GetAllServers()) {
      if (!(s instanceof Server)) return;
      s.hackDifficulty = s.minDifficulty;
    }
  }

  function maxMoney(): void {
    const s = GetServer(server);
    if (s === null) return;
    if (!(s instanceof Server)) return;
    s.moneyAvailable = s.moneyMax;
  }

  function maxAllMoney(): void {
    for (const s of GetAllServers()) {
      if (!(s instanceof Server)) return;
      s.moneyAvailable = s.moneyMax;
    }
  }

  function minMoney(): void {
    const s = GetServer(server);
    if (s === null) return;
    if (!(s instanceof Server)) return;
    s.moneyAvailable = 0;
  }

  function minAllMoney(): void {
    for (const s of GetAllServers()) {
      if (!(s instanceof Server)) return;
      s.moneyAvailable = 0;
    }
  }

  return (
    <AutoExpandAccordion cacheKey="DEVMENU_ServersDev" unmountOnExit={true}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>Servers</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <table>
          <tbody>
            <tr>
              <td>
                <Typography>Server:</Typography>
              </td>
              <td colSpan={2}>
                <Autocomplete
                  style={{ width: "250px" }}
                  options={servers}
                  value={server}
                  renderInput={(params) => <TextField {...params} />}
                  onChange={(_, server) => {
                    if (!server || GetServer(server) === null) {
                      return;
                    }
                    setServer(server);
                  }}
                ></Autocomplete>
              </td>
            </tr>
            <tr>
              <td>
                <Typography>Root:</Typography>
              </td>
              <td>
                <Button onClick={rootServer}>Root one</Button>
              </td>
              <td>
                <Button onClick={rootAllServers}>Root all</Button>
              </td>
            </tr>
            <tr>
              <td>
                <Typography>Backdoor:</Typography>
              </td>
              <td>
                <Button onClick={backdoorServer}>Backdoor one</Button>
              </td>
              <td>
                <Button onClick={backdoorAllServers}>Backdoor all</Button>
              </td>
            </tr>
            <tr>
              <td>
                <Typography>Security:</Typography>
              </td>
              <td>
                <Button onClick={minSecurity}>Min one</Button>
              </td>
              <td>
                <Button onClick={minAllSecurity}>Min all</Button>
              </td>
            </tr>
            <tr>
              <td>
                <Typography>Money:</Typography>
              </td>
              <td>
                <Button onClick={minMoney}>Min one</Button>
              </td>
              <td>
                <Button onClick={minAllMoney}>Min all</Button>
              </td>
              <td>
                <Button onClick={maxMoney}>Max one</Button>
              </td>
              <td>
                <Button onClick={maxAllMoney}>Max all</Button>
              </td>
            </tr>
          </tbody>
        </table>
      </AccordionDetails>
    </AutoExpandAccordion>
  );
}
