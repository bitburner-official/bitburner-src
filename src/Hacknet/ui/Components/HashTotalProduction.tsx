import React from "react";
import { hasHacknetServers } from "../../../Hacknet/HacknetHelpers";
import { HacknetNode } from "../../../Hacknet/HacknetNode";
import { HacknetServer } from "../../../Hacknet/HacknetServer";
import { PlayerObject } from "../../../PersonObjects/Player/PlayerObject";
import { GetServer } from "../../../Server/AllServers";
import { usePlayerSelector } from "../../../utils/PlayerExternalStore";
import { HashRate } from "../../../ui/React/HashRate";

const selectTotalProduction = (p: PlayerObject) => {
  let totalProduction = 0;
  for (let i = 0; i < p.hacknetNodes.length; ++i) {
    const node = p.hacknetNodes[i];
    if (hasHacknetServers()) {
      if (node instanceof HacknetNode) throw new Error("node was hacknet node"); // should never happen
      const hserver = GetServer(node);
      if (!(hserver instanceof HacknetServer)) throw new Error("node was not hacknet server"); // should never happen
      if (hserver) {
        totalProduction += hserver.hashRate;
      } else {
        console.warn(`Could not find Hacknet Server object in AllServers map (i=${i})`);
      }
    } else {
      if (typeof node === "string") throw new Error("node was ip string"); // should never happen
      totalProduction += node.moneyGainRatePerSecond;
    }
  }
  return totalProduction;
};

export function HashTotalProduction(): React.ReactElement {
  const prod = usePlayerSelector(selectTotalProduction);
  return <HashRate key="hashRate" hashes={prod} />;
}
