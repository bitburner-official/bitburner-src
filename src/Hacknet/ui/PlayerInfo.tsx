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
import { Reputation } from "../../ui/React/Reputation";
import { ReputationRate } from "../../ui/React/ReputationRate";
import Tooltip from "@mui/material/Tooltip";

interface IProps {
  totalProduction: number;
}

export function PlayerInfo(props: IProps): React.ReactElement {
  const hasServers = hasHacknetServers();
  const faction = Factions[FactionName.Netburners];

  const rows: React.ReactNode[][] = [];
  rows.push(["Money Spent:", <Money key="money" money={-Player.moneySourceA.hacknet_expenses} />, null]);
  rows.push([
    "Money Produced:",
    <Money key="money" money={Player.moneySourceA.hacknet} />,
    <span key="moneyRate">
      (<MoneyRate money={props.totalProduction} />)
    </span>,
  ]);
  if (hasServers) {
    rows[1][2] = (
      <Tooltip key="moneyRate" title="Value of hashes if sold for money">
        <>
          (<MoneyRate money={(props.totalProduction * 1e6) / 4} />)
        </>
      </Tooltip>
    );
    rows.push([
      "Hashes:",
      <span key={"hashes"}>
        <Hashes hashes={Player.hashManager.hashes} /> / <Hashes hashes={Player.hashManager.capacity} />
      </span>,
      <span key="hashRate">
        (<HashRate key="hashRate" hashes={props.totalProduction} />)
      </span>,
    ]);
  }
  if (faction.isMember) {
    const repRate = (hasServers ? (props.totalProduction * 1e6) / 4 : props.totalProduction) * 1e-2;
    rows.push([
      `${faction.name} reputation:`,
      <Reputation key="rep" reputation={faction.playerReputation} />,
      <span key="repRate">
        (<ReputationRate key="repRate" reputation={repRate} />)
      </span>,
    ]);
  }

  return (
    <Paper sx={{ display: "inline-block", padding: "0.5em 1em", margin: "0.5em 0" }}>
      <Typography variant="h6">Hacknet Summary</Typography>
      <StatsTable rows={rows} />
    </Paper>
  );
}
