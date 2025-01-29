/**
 * React Subcomponent for displaying a location's UI, when that location is a tech vendor
 *
 * This subcomponent renders all of the buttons for purchasing things from tech vendors
 */
import React, { useState } from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

import { Location } from "../Location";
import { RamButton } from "./RamButton";
import { TorButton } from "./TorButton";
import { CoresButton } from "./CoresButton";

import { getPurchaseServerCost, getPurchaseServerLimit, getPurchaseServerMaxRam } from "../../Server/ServerPurchases";

import { Money } from "../../ui/React/Money";
import { Player } from "@player";
import { PurchaseServerModal } from "./PurchaseServerModal";
import { formatRam } from "../../ui/formatNumber";
import { Box } from "@mui/material";
import { useCycleRerender } from "../../ui/React/hooks";

function ServerButton(props: { ram: number }): React.ReactElement {
  const [open, setOpen] = useState(false);
  const cost = getPurchaseServerCost(props.ram);
  const reachLimitOfPrivateServer = Player.purchasedServers.length >= getPurchaseServerLimit();
  return (
    <>
      <Button onClick={() => setOpen(true)} disabled={!Player.canAfford(cost) || reachLimitOfPrivateServer}>
        Purchase {formatRam(props.ram)} Server -&nbsp;
        {reachLimitOfPrivateServer ? "Max" : <Money money={cost} forPurchase={true} />}
      </Button>
      <PurchaseServerModal open={open} onClose={() => setOpen(false)} ram={props.ram} cost={cost} />
    </>
  );
}

export function TechVendorLocation(props: { loc: Location }): React.ReactElement {
  const rerender = useCycleRerender();

  const purchaseServerButtons: React.ReactNode[] = [];
  for (let ram = props.loc.techVendorMinRam; ram <= props.loc.techVendorMaxRam; ram *= 2) {
    if (ram > getPurchaseServerMaxRam()) {
      break;
    }
    purchaseServerButtons.push(<ServerButton key={ram} ram={ram} />);
  }

  return (
    <>
      <br />
      <Box sx={{ display: "grid", width: "fit-content" }}>{purchaseServerButtons}</Box>
      <br />
      <Typography>
        <i>"You can order bigger servers via scripts. We don't take custom orders in person."</i>
      </Typography>
      <br />
      <TorButton rerender={rerender} />
      <br />
      <RamButton rerender={rerender} />
      <br />
      <CoresButton rerender={rerender} />
    </>
  );
}
