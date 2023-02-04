import { Box, Button, Tooltip, Typography, Paper, Container } from "@mui/material";
import React, { useState } from "react";

import { StaticAugmentations } from "../../Augmentation/StaticAugmentations";
import { getGenericAugmentationPriceMultiplier } from "../../Augmentation/AugmentationHelpers";
import { AugmentationNames } from "../../Augmentation/data/AugmentationNames";
import { PurchasableAugmentations } from "../../Augmentation/ui/PurchasableAugmentations";
import { PurchaseAugmentationsOrderSetting } from "../../Settings/SettingEnums";
import { Settings } from "../../Settings/Settings";
import { Player } from "@player";
import { formatBigNumber } from "../../ui/nFormat";
import { Favor } from "../../ui/React/Favor";
import { Reputation } from "../../ui/React/Reputation";
import { FactionNames } from "../data/FactionNames";
import { Faction } from "../Faction";
import { getFactionAugmentationsFiltered, hasAugmentationPrereqs, purchaseAugmentation } from "../FactionHelpers";
import { CONSTANTS } from "../../Constants";

type IProps = {
  faction: Faction;
  routeToMainPage: () => void;
};

/** Root React Component for displaying a faction's "Purchase Augmentations" page */
export function AugmentationsPage(props: IProps): React.ReactElement {
  const setRerender = useState(false)[1];

  function rerender(): void {
    setRerender((old) => !old);
  }

  function getAugs(): string[] {
    return getFactionAugmentationsFiltered(props.faction);
  }

  function getAugsSorted(): string[] {
    switch (Settings.PurchaseAugmentationsOrder) {
      case PurchaseAugmentationsOrderSetting.Cost: {
        return getAugsSortedByCost();
      }
      case PurchaseAugmentationsOrderSetting.Reputation: {
        return getAugsSortedByReputation();
      }
      case PurchaseAugmentationsOrderSetting.Purchasable: {
        return getAugsSortedByPurchasable();
      }
      default:
        return getAugsSortedByDefault();
    }
  }

  function getAugsSortedByCost(): string[] {
    const augs = getAugs();
    augs.sort((augName1, augName2) => {
      const aug1 = StaticAugmentations[augName1],
        aug2 = StaticAugmentations[augName2];
      if (aug1 == null || aug2 == null) {
        throw new Error("Invalid Augmentation Names");
      }

      return aug1.getCost().moneyCost - aug2.getCost().moneyCost;
    });

    return augs;
  }

  function getAugsSortedByPurchasable(): string[] {
    const augs = getAugs();
    function canBuy(augName: string): boolean {
      const aug = StaticAugmentations[augName];
      const augCosts = aug.getCost();
      const repCost = augCosts.repCost;
      const hasReq = props.faction.playerReputation >= repCost;
      const hasRep = hasAugmentationPrereqs(aug);
      const hasCost = augCosts.moneyCost !== 0 && Player.money > augCosts.moneyCost;
      return hasCost && hasReq && hasRep;
    }
    const buy = augs.filter(canBuy).sort((augName1, augName2) => {
      const aug1 = StaticAugmentations[augName1],
        aug2 = StaticAugmentations[augName2];
      if (aug1 == null || aug2 == null) {
        throw new Error("Invalid Augmentation Names");
      }

      return aug1.getCost().moneyCost - aug2.getCost().moneyCost;
    });
    const cantBuy = augs
      .filter((aug) => !canBuy(aug))
      .sort((augName1, augName2) => {
        const aug1 = StaticAugmentations[augName1],
          aug2 = StaticAugmentations[augName2];
        if (aug1 == null || aug2 == null) {
          throw new Error("Invalid Augmentation Names");
        }
        return aug1.getCost().repCost - aug2.getCost().repCost;
      });

    return buy.concat(cantBuy);
  }

  function getAugsSortedByReputation(): string[] {
    const augs = getAugs();
    augs.sort((augName1, augName2) => {
      const aug1 = StaticAugmentations[augName1],
        aug2 = StaticAugmentations[augName2];
      if (aug1 == null || aug2 == null) {
        throw new Error("Invalid Augmentation Names");
      }
      return aug1.getCost().repCost - aug2.getCost().repCost;
    });

    return augs;
  }

  function getAugsSortedByDefault(): string[] {
    return getAugs();
  }

  function switchSortOrder(newOrder: PurchaseAugmentationsOrderSetting): void {
    Settings.PurchaseAugmentationsOrder = newOrder;
    rerender();
  }

  const augs = getAugsSorted();
  const purchasable = augs.filter(
    (aug: string) =>
      aug === AugmentationNames.NeuroFluxGovernor ||
      (!Player.augmentations.some((a) => a.name === aug) && !Player.queuedAugmentations.some((a) => a.name === aug)),
  );
  const owned = augs.filter((aug: string) => !purchasable.includes(aug));

  const multiplierComponent =
    props.faction.name !== FactionNames.ShadowsOfAnarchy ? (
      <Tooltip
        title={
          <Typography>
            The price of every Augmentation increases for every queued Augmentation and it is reset when you install
            them.
          </Typography>
        }
      >
        <Typography>
          <b>Price multiplier:</b> x {formatBigNumber(getGenericAugmentationPriceMultiplier())}
        </Typography>
      </Tooltip>
    ) : (
      <Tooltip
        title={
          <Typography>
            This price multiplier increases for each {FactionNames.ShadowsOfAnarchy} augmentation already purchased. The
            multiplier is NOT reset when installing augmentations.
          </Typography>
        }
      >
        <Typography>
          <b>Price multiplier:</b> x{" "}
          {formatBigNumber(
            Math.pow(
              CONSTANTS.SoACostMult,
              augs.filter((augmentationName) => Player.hasAugmentation(augmentationName)).length,
            ),
          )}
          <br />
          <b>Reputation multiplier:</b> x{" "}
          {formatBigNumber(
            Math.pow(
              CONSTANTS.SoARepMult,
              augs.filter((augmentationName) => Player.hasAugmentation(augmentationName)).length,
            ),
          )}
        </Typography>
      </Tooltip>
    );

  return (
    <>
      <Container disableGutters maxWidth="lg" sx={{ mx: 0 }}>
        <Button onClick={props.routeToMainPage}>Back</Button>
        <Typography variant="h4">Faction Augmentations - {props.faction.name}</Typography>
        <Paper sx={{ p: 1, mb: 1 }}>
          <Typography>
            These are all of the Augmentations that are available to purchase from <b>{props.faction.name}</b>.
            Augmentations are powerful upgrades that will enhance your abilities.
            <br />
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: `repeat(${props.faction.name === FactionNames.ShadowsOfAnarchy ? "2" : "3"}, 1fr)`,
              justifyItems: "center",
              my: 1,
            }}
          >
            <>{multiplierComponent}</>
            <Typography>
              <b>Reputation:</b> <Reputation reputation={props.faction.playerReputation} />
              <br />
              <b>Favor:</b> <Favor favor={Math.floor(props.faction.favor)} />
            </Typography>
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
            <Button onClick={() => switchSortOrder(PurchaseAugmentationsOrderSetting.Cost)}>Sort by Cost</Button>
            <Button onClick={() => switchSortOrder(PurchaseAugmentationsOrderSetting.Reputation)}>
              Sort by Reputation
            </Button>
            <Button onClick={() => switchSortOrder(PurchaseAugmentationsOrderSetting.Default)}>
              Sort by Default Order
            </Button>
            <Button onClick={() => switchSortOrder(PurchaseAugmentationsOrderSetting.Purchasable)}>
              Sort by Purchasable
            </Button>
          </Box>
        </Paper>
      </Container>

      <PurchasableAugmentations
        augNames={purchasable}
        ownedAugNames={owned}
        canPurchase={(aug) => {
          const costs = aug.getCost();
          return (
            hasAugmentationPrereqs(aug) &&
            props.faction.playerReputation >= costs.repCost &&
            (costs.moneyCost === 0 || Player.money > costs.moneyCost)
          );
        }}
        purchaseAugmentation={(aug, showModal) => {
          if (!Settings.SuppressBuyAugmentationConfirmation) {
            showModal(true);
          } else {
            purchaseAugmentation(aug, props.faction);
            rerender();
          }
        }}
        rep={props.faction.playerReputation}
        faction={props.faction}
      />
    </>
  );
}
