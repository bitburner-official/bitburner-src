/**
 * React Component for the Hacknet Node UI.
 * This Component displays the panel for a single Hacknet Node
 */
import React from "react";

import { HacknetServerConstants } from "../data/Constants";
import {
  getMaxNumberLevelUpgrades,
  getMaxNumberRamUpgrades,
  getMaxNumberCoreUpgrades,
  getMaxNumberCacheUpgrades,
  purchaseLevelUpgrade,
  purchaseRamUpgrade,
  purchaseCoreUpgrade,
  purchaseCacheUpgrade,
  updateHashManagerCapacity,
} from "../HacknetHelpers";

import { Player } from "@player";
import { HacknetServer } from "../HacknetServer";

import { Money } from "../../ui/React/Money";
import { Hashes } from "../../ui/React/Hashes";
import { HashRate } from "../../ui/React/HashRate";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import { TableCell } from "../../ui/React/Table";
import TableBody from "@mui/material/TableBody";
import Table from "@mui/material/Table";
import TableRow from "@mui/material/TableRow";
import { formatRam } from "../../ui/formatNumber";
import { calculateHashGainRate } from "../formulas/HacknetServers";
import Tooltip from "@mui/material/Tooltip";

interface IProps {
  node: HacknetServer;
  purchaseMultiplier: number | string;
  rerender: () => void;
}

export function HacknetServerElem(props: IProps): React.ReactElement {
  const node = props.node;
  const purchaseMult = props.purchaseMultiplier;
  const rerender = props.rerender;

  // Upgrade Level Button
  let upgradeLevelButton;
  if (node.level >= HacknetServerConstants.MaxLevel) {
    upgradeLevelButton = <Button disabled>MAX LEVEL</Button>;
  } else {
    let multiplier = 0;
    if (purchaseMult === "MAX") {
      multiplier = getMaxNumberLevelUpgrades(node, HacknetServerConstants.MaxLevel);
    } else {
      const levelsToMax = HacknetServerConstants.MaxLevel - node.level;
      multiplier = Math.min(levelsToMax, purchaseMult as number);
    }

    const base_increase =
      calculateHashGainRate(node.level + multiplier, 0, node.maxRam, node.cores, Player.mults.hacknet_node_money) -
      calculateHashGainRate(node.level, 0, node.maxRam, node.cores, Player.mults.hacknet_node_money);
    const modded_increase = (base_increase * (node.maxRam - node.ramUsed)) / node.maxRam;

    const upgradeLevelCost = node.calculateLevelUpgradeCost(multiplier, Player.mults.hacknet_node_level_cost);
    upgradeLevelButton = (
      <Tooltip
        title={
          <Typography>
            +<HashRate hashes={modded_increase} /> (effective increase, taking current RAM usage into account)
            <br />
            <span style={{ opacity: 0.5 }}>
              +<HashRate hashes={base_increase} />
            </span>{" "}
            (base increase, attained when no script is running)
          </Typography>
        }
      >
        <Button onClick={upgradeLevelOnClick}>
          +{multiplier}&nbsp;-&nbsp;
          <Money money={upgradeLevelCost} forPurchase={true} />
        </Button>
      </Tooltip>
    );
  }
  function upgradeLevelOnClick(): void {
    let numUpgrades = purchaseMult;
    if (purchaseMult === "MAX") {
      numUpgrades = getMaxNumberLevelUpgrades(node, HacknetServerConstants.MaxLevel);
    }
    purchaseLevelUpgrade(node, numUpgrades as number);
    rerender();
  }

  function upgradeRamOnClick(): void {
    let numUpgrades = purchaseMult;
    if (purchaseMult === "MAX") {
      numUpgrades = getMaxNumberRamUpgrades(node, HacknetServerConstants.MaxRam);
    }
    purchaseRamUpgrade(node, numUpgrades as number);
    rerender();
  }
  // Upgrade RAM Button
  let upgradeRamButton;
  if (node.maxRam >= HacknetServerConstants.MaxRam) {
    upgradeRamButton = <Button disabled>MAX RAM</Button>;
  } else {
    let multiplier = 0;
    if (purchaseMult === "MAX") {
      multiplier = getMaxNumberRamUpgrades(node, HacknetServerConstants.MaxRam);
    } else {
      const levelsToMax = Math.round(Math.log2(HacknetServerConstants.MaxRam / node.maxRam));
      multiplier = Math.min(levelsToMax, purchaseMult as number);
    }

    const base_increase =
      calculateHashGainRate(
        node.level,
        0,
        node.maxRam * Math.pow(2, multiplier),
        node.cores,
        Player.mults.hacknet_node_money,
      ) - calculateHashGainRate(node.level, 0, node.maxRam, node.cores, Player.mults.hacknet_node_money);

    const modded_increase =
      calculateHashGainRate(
        node.level,
        node.ramUsed,
        node.maxRam * Math.pow(2, multiplier),
        node.cores,
        Player.mults.hacknet_node_money,
      ) - calculateHashGainRate(node.level, node.ramUsed, node.maxRam, node.cores, Player.mults.hacknet_node_money);

    const upgradeRamCost = node.calculateRamUpgradeCost(multiplier, Player.mults.hacknet_node_ram_cost);
    upgradeRamButton = (
      <Tooltip
        title={
          <Typography>
            +<HashRate hashes={modded_increase} /> (effective increase, taking current RAM usage into account)
            <br />
            <span style={{ opacity: 0.5 }}>
              +<HashRate hashes={base_increase} />
            </span>{" "}
            (base increase, attained when no script is running)
          </Typography>
        }
      >
        <Button onClick={upgradeRamOnClick}>
          +{multiplier}&nbsp;-&nbsp;
          <Money money={upgradeRamCost} forPurchase={true} />
        </Button>
      </Tooltip>
    );
  }

  function upgradeCoresOnClick(): void {
    let numUpgrades = purchaseMult;
    if (purchaseMult === "MAX") {
      numUpgrades = getMaxNumberCoreUpgrades(node, HacknetServerConstants.MaxCores);
    }
    purchaseCoreUpgrade(node, numUpgrades as number);
    rerender();
  }
  // Upgrade Cores Button
  let upgradeCoresButton;
  if (node.cores >= HacknetServerConstants.MaxCores) {
    upgradeCoresButton = <Button disabled>MAX CORES</Button>;
  } else {
    let multiplier = 0;
    if (purchaseMult === "MAX") {
      multiplier = getMaxNumberCoreUpgrades(node, HacknetServerConstants.MaxCores);
    } else {
      const levelsToMax = HacknetServerConstants.MaxCores - node.cores;
      multiplier = Math.min(levelsToMax, purchaseMult as number);
    }

    const base_increase =
      calculateHashGainRate(node.level, 0, node.maxRam, node.cores + multiplier, Player.mults.hacknet_node_money) -
      calculateHashGainRate(node.level, 0, node.maxRam, node.cores, Player.mults.hacknet_node_money);
    const modded_increase = (base_increase * (node.maxRam - node.ramUsed)) / node.maxRam;

    const upgradeCoreCost = node.calculateCoreUpgradeCost(multiplier, Player.mults.hacknet_node_core_cost);
    upgradeCoresButton = (
      <Tooltip
        title={
          <Typography>
            +<HashRate hashes={modded_increase} /> (effective increase, taking current RAM usage into account)
            <br />
            <span style={{ opacity: 0.5 }}>
              +<HashRate hashes={base_increase} />
            </span>{" "}
            (base increase, attained when no script is running)
          </Typography>
        }
      >
        <Button onClick={upgradeCoresOnClick}>
          +{multiplier}&nbsp;-&nbsp;
          <Money money={upgradeCoreCost} forPurchase={true} />
        </Button>
      </Tooltip>
    );
  }

  // Upgrade Cache button
  let upgradeCacheButton;
  if (node.cache >= HacknetServerConstants.MaxCache) {
    upgradeCacheButton = <Button disabled>MAX CACHE</Button>;
  } else {
    let multiplier = 0;
    if (purchaseMult === "MAX") {
      multiplier = getMaxNumberCacheUpgrades(node, HacknetServerConstants.MaxCache);
    } else {
      const levelsToMax = HacknetServerConstants.MaxCache - node.cache;
      multiplier = Math.min(levelsToMax, purchaseMult as number);
    }

    const increase = 32 * Math.pow(2, node.cache + multiplier) - node.hashCapacity;
    const upgradeCacheCost = node.calculateCacheUpgradeCost(multiplier);
    upgradeCacheButton = (
      <Tooltip
        title={
          <Typography>
            +<Hashes hashes={increase} /> hashes
          </Typography>
        }
      >
        <Button onClick={upgradeCacheOnClick}>
          +{multiplier}&nbsp;-&nbsp;
          <Money money={upgradeCacheCost} forPurchase={true} />
        </Button>
      </Tooltip>
    );
  }
  function upgradeCacheOnClick(): void {
    let numUpgrades = purchaseMult;
    if (purchaseMult === "MAX") {
      numUpgrades = getMaxNumberCacheUpgrades(node, HacknetServerConstants.MaxCache);
    }
    purchaseCacheUpgrade(node, numUpgrades as number);
    rerender();
    updateHashManagerCapacity();
  }

  return (
    <Grid item component={Paper} p={1}>
      <Table size="small">
        <TableBody>
          <TableRow>
            <TableCell>
              <Typography>{node.hostname}</Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Typography>Production:</Typography>
            </TableCell>
            <TableCell colSpan={2}>
              <Tooltip
                title={
                  <Typography>
                    <Hashes hashes={node.totalHashesGenerated} /> hashes produced by this server since last augment
                    installation.
                    <br />
                    <HashRate hashes={node.hashRate} /> current production rate.
                    <br />
                    <span style={{ opacity: 0.5 }}>
                      <HashRate hashes={(node.hashRate * node.maxRam) / (node.maxRam - node.ramUsed)} />
                    </span>{" "}
                    max production rate. (achieved when 100% RAM is allocated to it)
                    <br />
                    {formatRam(node.ramUsed)} / {formatRam(node.maxRam)} (
                    {Math.round((100 * node.ramUsed) / node.maxRam)}%) RAM allocated to script.
                    <br />
                    {formatRam(node.maxRam - node.ramUsed)} / {formatRam(node.maxRam)} (
                    {Math.round((100 * (node.maxRam - node.ramUsed)) / node.maxRam)}%) RAM allocated to hash production.
                  </Typography>
                }
              >
                <Typography>
                  <Hashes hashes={node.totalHashesGenerated} /> (<HashRate hashes={node.hashRate} />)
                </Typography>
              </Tooltip>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Typography>Hash Capacity:</Typography>
            </TableCell>
            <TableCell colSpan={2}>
              <Typography>
                <Hashes hashes={node.hashCapacity} />
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
              <Typography>{formatRam(node.maxRam)}</Typography>
            </TableCell>
            <TableCell>{upgradeRamButton}</TableCell>
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
          <TableRow>
            <TableCell>
              <Typography>Cache Level:</Typography>
            </TableCell>
            <TableCell>
              <Typography>{node.cache}</Typography>
            </TableCell>
            <TableCell>{upgradeCacheButton}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Grid>
  );
}
