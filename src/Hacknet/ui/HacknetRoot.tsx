import React, { useState } from "react";

import { GeneralInfo } from "./GeneralInfo";
import { HacknetNodeElem } from "./HacknetNodeElem";
import { HacknetServerElem } from "./HacknetServerElem";
import { HacknetNode } from "../HacknetNode";
import { HacknetServer } from "../HacknetServer";
import { HashUpgradeModal } from "./HashUpgradeModal";
import { MultiplierButtons } from "./MultiplierButtons";
import { PlayerInfo } from "./PlayerInfo";
import { PurchaseButton } from "./PurchaseButton";
import { PurchaseMultipliers } from "../data/Constants";

import {
  getCostOfNextHacknetNode,
  getCostOfNextHacknetServer,
  hasHacknetServers,
  purchaseHacknet,
} from "../HacknetHelpers";

import { Player } from "@player";
import { GetServer } from "../../Server/AllServers";

import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import { Box } from "@mui/material";
import { usePlayerSelector } from "../../utils/PlayerExternalStore";
import { PlayerObject } from "src/PersonObjects/Player/PlayerObject";

const selectHacknetNodecount = (p: PlayerObject) => p.hacknetNodes.length;

/** Root React Component for the Hacknet Node UI */
export function HacknetRoot(): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [purchaseMultiplier, setPurchaseMultiplier] = useState<number | "MAX">(PurchaseMultipliers.x1);
  const hacknetNodeCount = usePlayerSelector(selectHacknetNodecount);

  let totalProduction = 0;
  for (let i = 0; i < hacknetNodeCount; ++i) {
    const node = Player.hacknetNodes[i];
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

  function handlePurchaseButtonClick(): void {
    purchaseHacknet();
  }

  // Cost to purchase a new Hacknet Node
  let purchaseCost;
  if (hasHacknetServers()) {
    purchaseCost = getCostOfNextHacknetServer();
  } else {
    purchaseCost = getCostOfNextHacknetNode();
  }

  // onClick event handlers for purchase multiplier buttons
  const purchaseMultiplierOnClicks = [
    () => setPurchaseMultiplier(PurchaseMultipliers.x1),
    () => setPurchaseMultiplier(PurchaseMultipliers.x5),
    () => setPurchaseMultiplier(PurchaseMultipliers.x10),
    () => setPurchaseMultiplier(PurchaseMultipliers.MAX),
  ];

  // HacknetNode components
  const nodes = Player.hacknetNodes.map((node: string | HacknetNode, index: number) => {
    if (hasHacknetServers()) {
      if (node instanceof HacknetNode) throw new Error("node was hacknet node"); // should never happen
      const hserver = GetServer(node);
      if (hserver == null) {
        throw new Error(`Could not find Hacknet Server object in AllServers map for IP: ${node}`);
      }
      if (!(hserver instanceof HacknetServer)) throw new Error("node was not hacknet server"); // should never happen
      return (
        <HacknetServerElem
          key={hserver.hostname}
          index={index}
          node={hserver}
          purchaseMultiplier={purchaseMultiplier}
        />
      );
    } else {
      if (typeof node === "string") throw new Error("node was ip string"); // should never happen
      return <HacknetNodeElem key={node.name} node={node} purchaseMultiplier={purchaseMultiplier} />;
    }
  });

  return (
    <>
      <Typography variant="h4">Hacknet {hasHacknetServers() ? "Servers" : "Nodes"}</Typography>
      <GeneralInfo hasHacknetServers={hasHacknetServers()} />

      <br />

      <PlayerInfo totalProduction={totalProduction} />

      <br />

      {hasHacknetServers() && (
        <>
          {/* 
          The usage of focusRipple in this button is intentional. Without it, after closing the modal by pressing the
          Esc button, this button has a weird ripple effect (only on Chrome).
          The documentation says that focusRipple is false by default, but I have to explicitly set it to false to fix
          this weird ripple effect.
          */}
          <Button focusRipple={false} onClick={() => setOpen(true)}>
            Spend Hashes on Upgrades
          </Button>
          <br />
        </>
      )}

      <Grid container spacing={2}>
        <Grid item xs={6}>
          <PurchaseButton cost={purchaseCost} multiplier={purchaseMultiplier} onClick={handlePurchaseButtonClick} />
        </Grid>
        <Grid item xs={6}>
          <MultiplierButtons onClicks={purchaseMultiplierOnClicks} purchaseMultiplier={purchaseMultiplier} />
        </Grid>
      </Grid>

      <Box sx={{ display: "grid", width: "100%", gridTemplateColumns: "repeat(auto-fit, 30em)" }}>{nodes}</Box>
      <HashUpgradeModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
