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
import { Tooltip } from "@mui/material";

interface IProps {
  totalProduction: number;
}

export function PlayerInfo(props: IProps): React.ReactElement {
  const hasServers = hasHacknetServers();

  const rows: React.ReactNode[][] = [];
  rows.push(["已花费资金：", <Money key="money" money={-Player.moneySourceA.hacknet_expenses || 0} />]);
  rows.push(["已产出资金：", <Money key="money" money={Player.moneySourceA.hacknet} />]);
  if (hasServers) {
    rows.push([
      "哈希：",
      <span key={"hashes"}>
        <Hashes hashes={Player.hashManager.hashes} /> / <Hashes hashes={Player.hashManager.capacity} />
      </span>,
    ]);
    rows.push([
      "哈希速率：",
      <Tooltip
        key="moneyRate"
        title={
          <Typography>
            <MoneyRate money={(props.totalProduction * 1e6) / 4} /> 若出售换取资金
          </Typography>
        }
      >
        <span>
          <HashRate key="hashRate" hashes={props.totalProduction} />
        </span>
      </Tooltip>,
    ]);
  } else {
    rows.push(["生产速率：", <MoneyRate key="moneyRate" money={props.totalProduction} />]);
  }

  return (
    <Paper sx={{ display: "inline-block", padding: "0.5em 1em", margin: "0.5em 0" }}>
      <Typography variant="h6">Hacknet 概览</Typography>
      <StatsTable rows={rows} textAlign="left" />
    </Paper>
  );
}
