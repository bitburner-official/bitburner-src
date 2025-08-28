/**
 * React Component for displaying Player info and stats on the Hacknet Node UI.
 * This includes:
 * - Player's money
 * - Player's production from Hacknet Nodes
 */
import React from "react";

import { hasHacknetServers } from "../HacknetHelpers";
import { MoneyRate } from "../../ui/React/MoneyRate";
import { Paper, Typography } from "@mui/material";
import { StatsTable } from "../../ui/React/StatsTable";
import { Tooltip } from "@mui/material";
import { HashTotalProduction } from "./Components/HashTotalProduction";
import { HacknetExpenses } from "./Components/HacknetExpenses";
import { HacknetProduced } from "./Components/HacknetProduced";
import { PlayerHashes } from "./Components/PlayerHashes";
import { PlayerHashCapacity } from "./Components/PlayerHashCapacity";

interface IProps {
  totalProduction: number;
}

export function PlayerInfo(props: IProps): React.ReactElement {
  const hasServers = hasHacknetServers();

  const rows: React.ReactNode[][] = [];
  rows.push(["Money Spent:", <HacknetExpenses key="expenses" />]);
  rows.push(["Money Produced:", <HacknetProduced key="money" />]);
  if (hasServers) {
    rows.push([
      "Hashes:",
      <span key={"hashes"}>
        <PlayerHashes /> / <PlayerHashCapacity />
      </span>,
    ]);
    rows.push([
      "Hash Rate:",
      <Tooltip
        key="moneyRate"
        title={
          <Typography>
            <MoneyRate money={(props.totalProduction * 1e6) / 4} /> if sold for money
          </Typography>
        }
      >
        <span>
          <HashTotalProduction />
        </span>
      </Tooltip>,
    ]);
  } else {
    rows.push(["Production Rate:", <MoneyRate key="moneyRate" money={props.totalProduction} />]);
  }

  return (
    <Paper sx={{ display: "inline-block", padding: "0.5em 1em", margin: "0.5em 0" }}>
      <Typography variant="h6">Hacknet Summary</Typography>
      <StatsTable rows={rows} textAlign="left" />
    </Paper>
  );
}
