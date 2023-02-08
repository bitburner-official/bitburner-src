/**
 * React Component for the Hacknet Node UI.
 * This Component displays the panel for a single Hacknet Node
 */
import React from "react";

import { HacknetNodeConstants } from "../data/Constants";
import {
  getMaxNumberLevelUpgrades,
  getMaxNumberRamUpgrades,
  getMaxNumberCoreUpgrades,
  purchaseLevelUpgrade,
  purchaseRamUpgrade,
  purchaseCoreUpgrade,
} from "../HacknetHelpers";

import { Player } from "@player";
import { HacknetNode } from "../HacknetNode";

import { Money } from "../../ui/React/Money";
import { MoneyRate } from "../../ui/React/MoneyRate";

import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import { TableCell } from "../../ui/React/Table";
import TableBody from "@mui/material/TableBody";
import Table from "@mui/material/Table";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import { formatRam } from "../../ui/formatNumber";
import { calculateMoneyGainRate } from "../formulas/HacknetNodes";

interface IProps {
  node: HacknetNode;
  purchaseMultiplier: number | "MAX";
  rerender: () => void;
}

export function HacknetNodeElem(props: IProps): React.ReactElement {
  const node = props.node;
  const purchaseMult = props.purchaseMultiplier;
  const rerender = props.rerender;

  // Upgrade Level Button
  let upgradeLevelButton;
  if (node.level >= HacknetNodeConstants.MaxLevel) {
    upgradeLevelButton = <Button disabled>MAX LEVEL</Button>;
  } else {
    let multiplier = 0;
    if (purchaseMult === "MAX") {
      multiplier = getMaxNumberLevelUpgrades(node, HacknetNodeConstants.MaxLevel);
    } else {
      const levelsToMax = HacknetNodeConstants.MaxLevel - node.level;
      multiplier = Math.min(levelsToMax, purchaseMult);
    }

    const increase =
      calculateMoneyGainRate(node.level + multiplier, node.ram, node.cores, Player.mults.hacknet_node_money) -
      node.moneyGainRatePerSecond;
    const upgradeLevelCost = node.calculateLevelUpgradeCost(multiplier, Player.mults.hacknet_node_level_cost);
    upgradeLevelButton = (
      <Tooltip
        title={
          <Typography>
            +<MoneyRate money={increase} />
          </Typography>
        }
      >
        <Button onClick={upgradeLevelOnClick}>
          +{multiplier} -&nbsp;
          <Money money={upgradeLevelCost} forPurchase={true} />
        </Button>
      </Tooltip>
    );
  }
  function upgradeLevelOnClick(): void {
    const numUpgrades =
      purchaseMult === "MAX" ? getMaxNumberLevelUpgrades(node, HacknetNodeConstants.MaxLevel) : purchaseMult;
    purchaseLevelUpgrade(node, numUpgrades);
    rerender();
  }

  let upgradeRAMButton;
  if (node.ram >= HacknetNodeConstants.MaxRam) {
    upgradeRAMButton = <Button disabled>MAX RAM</Button>;
  } else {
    let multiplier = 0;
    if (purchaseMult === "MAX") {
      multiplier = getMaxNumberRamUpgrades(node, HacknetNodeConstants.MaxRam);
    } else {
      const levelsToMax = Math.round(Math.log2(HacknetNodeConstants.MaxRam / node.ram));
      multiplier = Math.min(levelsToMax, purchaseMult);
    }

    const increase =
      calculateMoneyGainRate(
        node.level,
        node.ram * Math.pow(2, multiplier),
        node.cores,
        Player.mults.hacknet_node_money,
      ) - node.moneyGainRatePerSecond;
    const upgradeRamCost = node.calculateRamUpgradeCost(multiplier, Player.mults.hacknet_node_ram_cost);
    upgradeRAMButton = (
      <Tooltip
        title={
          <Typography>
            +<MoneyRate money={increase} />
          </Typography>
        }
      >
        <Button onClick={upgradeRamOnClick}>
          +{multiplier} -&nbsp;
          <Money money={upgradeRamCost} forPurchase={true} />
        </Button>
      </Tooltip>
    );
  }
  function upgradeRamOnClick(): void {
    const numUpgrades =
      purchaseMult === "MAX" ? getMaxNumberRamUpgrades(node, HacknetNodeConstants.MaxRam) : purchaseMult;
    purchaseRamUpgrade(node, numUpgrades);
    rerender();
  }

  function upgradeCoresOnClick(): void {
    const numUpgrades =
      purchaseMult === "MAX" ? getMaxNumberCoreUpgrades(node, HacknetNodeConstants.MaxCores) : purchaseMult;
    purchaseCoreUpgrade(node, numUpgrades);
    rerender();
  }
  let upgradeCoresButton;
  if (node.cores >= HacknetNodeConstants.MaxCores) {
    upgradeCoresButton = <Button disabled>MAX CORES</Button>;
  } else {
    let multiplier = 0;
    if (purchaseMult === "MAX") {
      multiplier = getMaxNumberCoreUpgrades(node, HacknetNodeConstants.MaxCores);
    } else {
      const levelsToMax = HacknetNodeConstants.MaxCores - node.cores;
      multiplier = Math.min(levelsToMax, purchaseMult);
    }

    const increase =
      calculateMoneyGainRate(node.level, node.ram, node.cores + multiplier, Player.mults.hacknet_node_money) -
      node.moneyGainRatePerSecond;
    const upgradeCoreCost = node.calculateCoreUpgradeCost(multiplier, Player.mults.hacknet_node_core_cost);
    upgradeCoresButton = (
      <Tooltip
        title={
          <Typography>
            +<MoneyRate money={increase} />
          </Typography>
        }
      >
        <Button onClick={upgradeCoresOnClick}>
          +{multiplier} -&nbsp;
          <Money money={upgradeCoreCost} forPurchase={true} />
        </Button>
      </Tooltip>
    );
  }

  return (
    <Grid item component={Paper} p={1}>
      <Table size="small">
        <TableBody>
          <TableRow>
            <TableCell colSpan={3}>
              <Typography>{node.name}</Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Typography>Production:</Typography>
            </TableCell>
            <TableCell colSpan={2}>
              <Typography>
                <Money money={node.totalMoneyGenerated} /> (
                <MoneyRate money={node.moneyGainRatePerSecond} />)
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Typography>Level:</Typography>
            </TableCell>
            <TableCell>
              <Typography>{node.level}</Typography>
            </TableCell>
            <TableCell>{upgradeLevelButton}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Typography>RAM:</Typography>
            </TableCell>
            <TableCell>
              <Typography>{formatRam(node.ram)}</Typography>
            </TableCell>
            <TableCell>{upgradeRAMButton}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Typography>Cores:</Typography>
            </TableCell>
            <TableCell>
              <Typography>{node.cores}</Typography>
            </TableCell>
            <TableCell>{upgradeCoresButton}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Grid>
  );
}
