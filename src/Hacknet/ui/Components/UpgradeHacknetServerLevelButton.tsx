import React, { useCallback } from "react";
import { Button, Tooltip } from "@mui/material";
import { HacknetServerConstants } from "../../data/Constants";
import { PlayerObject } from "../../../PersonObjects/Player/PlayerObject";
import { usePlayerSelector } from "../../../utils/PlayerExternalStore";
import { getMaxNumberLevelUpgrades, purchaseLevelUpgrade } from "../../HacknetHelpers";
import { Money } from "../../../ui/React/Money";
import { UpgradeHacknetServerLevelTooltip } from "./UpgradeHacknetServerLevelTooltip";
import { HacknetServer } from "../../HacknetServer";

interface IProps {
  node: HacknetServer;
  purchaseMult: number | string;
}

const selectHacknetNodeLevelCost = (p: PlayerObject) => p.mults.hacknet_node_level_cost;
const selectMoney = (p: PlayerObject) => p.money;

export function UpgradeHacknetServerLevelButton({ purchaseMult, node }: IProps): React.ReactElement {
  const level = usePlayerSelector(useCallback((): number => node.level, [node]));
  const hacknet_node_level_cost = usePlayerSelector(selectHacknetNodeLevelCost);
  usePlayerSelector(selectMoney); // we have to hook on money change for the max level algorithm

  function upgradeLevelOnClick(): void {
    let numUpgrades = purchaseMult;
    if (purchaseMult === "MAX") {
      numUpgrades = getMaxNumberLevelUpgrades(node, HacknetServerConstants.MaxLevel);
    }
    purchaseLevelUpgrade(node, numUpgrades as number);
  }

  if (level >= HacknetServerConstants.MaxLevel) {
    return <Button disabled>MAX LEVEL</Button>;
  } else {
    let multiplier = 0;
    if (purchaseMult === "MAX") {
      multiplier = getMaxNumberLevelUpgrades(node, HacknetServerConstants.MaxLevel);
    } else {
      const levelsToMax = HacknetServerConstants.MaxLevel - level;
      multiplier = Math.min(levelsToMax, purchaseMult as number);
    }

    const upgradeLevelCost = node.calculateLevelUpgradeCost(multiplier, hacknet_node_level_cost) ?? 0;
    return (
      <Tooltip title={<UpgradeHacknetServerLevelTooltip purchaseMult={purchaseMult} node={node} />}>
        <Button onClick={upgradeLevelOnClick}>
          +{multiplier}&nbsp;-&nbsp;
          <Money money={upgradeLevelCost} forPurchase={true} />
        </Button>
      </Tooltip>
    );
  }
}
