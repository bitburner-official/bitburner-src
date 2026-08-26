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
import { SpecialServers } from "../../Server/data/SpecialServers";
import { AutoExpandAccordion } from "../../ui/AutoExpand/AutoExpandAccordion";
import { DarknetServer } from "../../Server/DarknetServer";

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
    for (const s of GetAllServers(true)) {
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
    for (const s of GetAllServers(true)) {
      if (!(s instanceof Server || s instanceof DarknetServer) || s.hostname === SpecialServers.WorldDaemon) continue;
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
        <Typography>服务器</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <table>
          <tbody>
            <tr>
              <td>
                <Typography>服务器：</Typography>
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
                <Typography>提权：</Typography>
              </td>
              <td>
                <Button onClick={rootServer}>单个提权</Button>
              </td>
              <td>
                <Button onClick={rootAllServers}>全部提权</Button>
              </td>
            </tr>
            <tr>
              <td>
                <Typography>后门：</Typography>
              </td>
              <td>
                <Button onClick={backdoorServer}>单个留后门</Button>
              </td>
              <td>
                <Button onClick={backdoorAllServers}>全部留后门</Button>
              </td>
            </tr>
            <tr>
              <td>
                <Typography>安全等级：</Typography>
              </td>
              <td>
                <Button onClick={minSecurity}>单个降至最低</Button>
              </td>
              <td>
                <Button onClick={minAllSecurity}>全部降至最低</Button>
              </td>
            </tr>
            <tr>
              <td>
                <Typography>资金：</Typography>
              </td>
              <td>
                <Button onClick={minMoney}>单个设为 0</Button>
              </td>
              <td>
                <Button onClick={minAllMoney}>全部设为 0</Button>
              </td>
              <td>
                <Button onClick={maxMoney}>单个设为最高</Button>
              </td>
              <td>
                <Button onClick={maxAllMoney}>全部设为最高</Button>
              </td>
            </tr>
          </tbody>
        </table>
      </AccordionDetails>
    </AutoExpandAccordion>
  );
}
