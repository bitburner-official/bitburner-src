/**
 * Root React component for the popup that lets player purchase Duplicate
 * Sleeves and Sleeve-related upgrades from The Covenant
 */
import React from "react";

import { CovenantSleeveMemoryUpgrade } from "./CovenantSleeveMemoryUpgrade";

import { MaxSleevesFromCovenant, canPurchaseSleeve, getSleeveCost, purchaseSleeve } from "../SleeveCovenantPurchases";

import { Money } from "../../../ui/React/Money";
import { Modal } from "../../../ui/React/Modal";
import { Player } from "@player";

import { dialogBoxCreate } from "../../../ui/React/DialogBox";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { FactionName } from "@enums";
import { useRerender } from "../../../ui/React/hooks";

interface IProps {
  open: boolean;
  onClose: () => void;
}

export function CovenantPurchasesRoot(props: IProps): React.ReactElement {
  const rerender = useRerender();

  function purchaseOnClick(): void {
    const result = purchaseSleeve();
    if (!result.success) {
      dialogBoxCreate(result.message);
      return;
    }
    rerender();
  }

  // Purchasing Upgrades for Sleeves
  const upgradePanels = [];
  for (let i = 0; i < Player.sleeves.length; ++i) {
    const sleeve = Player.sleeves[i];
    upgradePanels.push(<CovenantSleeveMemoryUpgrade key={i} index={i} rerender={rerender} sleeve={sleeve} />);
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <>
        {Player.sleevesFromCovenant < MaxSleevesFromCovenant && (
          <>
            <Typography>
              购买一个额外的分身。这些分身是永久的（它们会在 BitNode 之间保留）。你总共最多可以从
              {FactionName.TheCovenant} 处购买 {MaxSleevesFromCovenant} 个。
            </Typography>
            <Button disabled={!canPurchaseSleeve().success} onClick={purchaseOnClick}>
              购买 -&nbsp;
              <Money money={getSleeveCost(Player.sleevesFromCovenant)} forPurchase={true} />
            </Button>
            <br />
            <br />
          </>
        )}
        <Typography>你还可以为你的分身购买升级。这些升级同样是永久的。</Typography>
        {upgradePanels}
      </>
    </Modal>
  );
}
