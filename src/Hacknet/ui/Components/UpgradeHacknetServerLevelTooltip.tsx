import { Typography } from "@mui/material";
import React, { useCallback } from "react";
import { calculateHashGainRate } from "../../formulas/HacknetServers";
import { PlayerObject } from "../../../PersonObjects/Player/PlayerObject";
import { HashRate } from "../../../ui/React/HashRate";
import { arrayShallowEquals, usePlayerSelector } from "../../../utils/PlayerExternalStore";
import { getMaxNumberLevelUpgrades } from "../../HacknetHelpers";
import { HacknetServerConstants } from "../../data/Constants";
import { HacknetServer } from "../../HacknetServer";

interface IProps {
  node: HacknetServer;
  purchaseMult: number | string;
}

const selectHacknetNodeMoney = (p: PlayerObject) => p.mults.hacknet_node_money;

export function UpgradeHacknetServerLevelTooltip({ purchaseMult, node }: IProps): React.ReactElement {
  const [level, ramUsed, maxRam, cores] = usePlayerSelector(
    useCallback((): [number, number, number, number] => [node.level, node.ramUsed, node.maxRam, node.cores], [node]),
    arrayShallowEquals,
  );

  const hacknetNodeMoney = usePlayerSelector(selectHacknetNodeMoney);

  let multiplier = 0;
  if (purchaseMult === "MAX") {
    multiplier = getMaxNumberLevelUpgrades(node, HacknetServerConstants.MaxLevel);
  } else {
    const levelsToMax = HacknetServerConstants.MaxLevel - level;
    multiplier = Math.min(levelsToMax, purchaseMult as number);
  }

  const base_increase =
    calculateHashGainRate(level + multiplier, 0, maxRam, cores, hacknetNodeMoney) -
    calculateHashGainRate(level, 0, maxRam, cores, hacknetNodeMoney);
  const modded_increase = (base_increase * (maxRam - ramUsed)) / maxRam;
  return (
    <Typography>
      +<HashRate hashes={modded_increase} /> (effective increase, taking current RAM usage into account)
      <br />
      <span style={{ opacity: 0.5 }}>
        +<HashRate hashes={base_increase} />
      </span>{" "}
      (base increase, attained when no script is running)
    </Typography>
  );
}
