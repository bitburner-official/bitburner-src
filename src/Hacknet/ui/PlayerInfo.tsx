/**
 * React Component for displaying Player info and stats on the Hacknet Node UI.
 * This includes:
 * - Player's money
 * - Player's production from Hacknet Nodes
 */
import React from "react";

import { hasHacknetServers } from "../HacknetHelpers";
import { Player } from "@player";
import { Money } from "../../ui/React/Money";
import { MoneyRate } from "../../ui/React/MoneyRate";
import { HashRate } from "../../ui/React/HashRate";
import { Hashes } from "../../ui/React/Hashes";
import { Paper, Typography } from "@mui/material";
import { StatsTable } from "../../ui/React/StatsTable";
import { Factions } from "../../Faction/Factions";
import { FactionName } from "@enums";
import { ReputationRate } from "../../ui/React/ReputationRate";

interface IProps {
  totalProduction: number;
}

export function PlayerInfo(props: IProps): React.ReactElement {
  const hasServers = hasHacknetServers();
  const faction = Factions[FactionName.Netburners];

  const rows: React.ReactNode[][] = [["Money:", <Money key="money" money={Player.money} />]];
  if (hasServers) {
    rows.push([
      "Hashes:",
      <Typography key={"hashes"}>
        <Hashes hashes={Player.hashManager.hashes} /> / <Hashes hashes={Player.hashManager.capacity} />
      </Typography>,
    ]);
    rows.push(["Total Hacknet Production:", <HashRate key="prod" hashes={props.totalProduction} />]);
  } else {
    rows.push(["Total Hacknet Production:", <MoneyRate key="prod" money={props.totalProduction} />]);
  }
  if (faction.isMember) {
    const repRate = (hasServers ? (props.totalProduction * 1e6) / 4 : props.totalProduction) * 1e-2;
    rows.push([`${faction.name} reputation gain:`, <ReputationRate key="rep" reputation={repRate} />]);
  }

  return (
    <Paper sx={{ display: "inline-block", padding: 0.5, margin: "0.5em 0" }}>
      <StatsTable rows={rows} />
    </Paper>
  );
}
