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
              Purchase an additional Sleeve. These Duplicate Sleeves are permanent (they persist through BitNodes). You
              can purchase a total of {MaxSleevesFromCovenant} from {FactionName.TheCovenant}.
            </Typography>
            <Button disabled={!canPurchaseSleeve().success} onClick={purchaseOnClick}>
              Purchase -&nbsp;
              <Money money={getSleeveCost(Player.sleevesFromCovenant)} forPurchase={true} />
            </Button>
            <br />
            <br />
          </>
        )}
        <Typography>You can also purchase upgrades for your Sleeves. These upgrades are also permanent.</Typography>
        {upgradePanels}
      </>
    </Modal>
  );
}
