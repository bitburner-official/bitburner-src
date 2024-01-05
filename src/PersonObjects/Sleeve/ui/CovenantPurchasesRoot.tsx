/**
 * Root React component for the popup that lets player purchase Duplicate
 * Sleeves and Sleeve-related upgrades from The Covenant
 */
import React from "react";

import { CovenantSleeveMemoryUpgrade } from "./CovenantSleeveMemoryUpgrade";

import { Sleeve } from "../Sleeve";
import { BaseCostPerSleeve, MaxSleevesFromCovenant } from "../SleeveCovenantPurchases";

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

  /** Get the cost to purchase a new Duplicate Sleeve */
  function purchaseCost(): number {
    return Math.pow(10, Player.sleevesFromCovenant) * BaseCostPerSleeve;
  }

  // Purchasing a new Duplicate Sleeve
  let purchaseDisabled = false;
  if (!Player.canAfford(purchaseCost())) {
    purchaseDisabled = true;
  }
  if (Player.sleevesFromCovenant >= MaxSleevesFromCovenant) {
    purchaseDisabled = true;
  }

  function purchaseOnClick(): void {
    if (Player.sleevesFromCovenant >= MaxSleevesFromCovenant) return;

    if (Player.canAfford(purchaseCost())) {
      Player.loseMoney(purchaseCost(), "sleeves");
      Player.sleevesFromCovenant += 1;
      Sleeve.recalculateNumOwned();
      rerender();
    } else {
      dialogBoxCreate(`You cannot afford to purchase a Duplicate Sleeve`);
    }
  }

  // Purchasing Upgrades for Sleeves
  const upgradePanels = [];
  for (let i = 0; i < Player.sleeves.length; ++i) {
    const sleeve = Player.sleeves[i];
    upgradePanels.push(<CovenantSleeveMemoryUpgrade index={i} rerender={rerender} sleeve={sleeve} />);
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <>
        {Player.sleevesFromCovenant < MaxSleevesFromCovenant && (
          <>
            <Typography>
              Purchase an additional Sleeves. These Duplicate Sleeves are permanent (they persist through BitNodes). You
              can purchase a total of {MaxSleevesFromCovenant} from {FactionName.TheCovenant}.
            </Typography>
            <Button disabled={purchaseDisabled} onClick={purchaseOnClick}>
              Purchase -&nbsp;
              <Money money={purchaseCost()} forPurchase={true} />
            </Button>
          </>
        )}
        <br />
        <br />
        <Typography>You can also purchase upgrades for your Sleeves. These upgrades are also permanent.</Typography>
        {upgradePanels}
      </>
    </Modal>
  );
}
