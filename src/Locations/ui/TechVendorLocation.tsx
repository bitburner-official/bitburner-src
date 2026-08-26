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

import { getCloudServerCost, getCloudServerLimit, getCloudServerMaxRam } from "../../Server/ServerPurchases";

import { Money } from "../../ui/React/Money";
import { Player } from "@player";
import { PurchaseServerModal } from "./PurchaseServerModal";
import { formatRam } from "../../ui/formatNumber";
import { Box } from "@mui/material";
import { useCycleRerender } from "../../ui/React/hooks";

function ServerButton(props: { ram: number }): React.ReactElement {
  const [open, setOpen] = useState(false);
  const cost = getCloudServerCost(props.ram);
  const reachLimitOfPrivateServer = Player.purchasedServers.length >= getCloudServerLimit();
  return (
    <>
      <Button onClick={() => setOpen(true)} disabled={!Player.canAfford(cost) || reachLimitOfPrivateServer}>
        购买 {formatRam(props.ram)} 云服务器 -&nbsp;
        {reachLimitOfPrivateServer ? "已达上限" : <Money money={cost} forPurchase={true} />}
      </Button>
      <PurchaseServerModal open={open} onClose={() => setOpen(false)} ram={props.ram} cost={cost} />
    </>
  );
}

export function TechVendorLocation(props: { loc: Location }): React.ReactElement {
  const rerender = useCycleRerender();

  const purchaseServerButtons: React.ReactNode[] = [];
  for (let ram = props.loc.techVendorMinRam; ram <= props.loc.techVendorMaxRam; ram *= 2) {
    if (ram > getCloudServerMaxRam()) {
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
        <i>“你可以通过脚本订购更大的云服务器。我们不接待现场定制。”</i>
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
