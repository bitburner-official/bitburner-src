import React, { useState, useMemo } from "react";
import { Box, Button, Typography, Paper, Container, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

import { Augmentations } from "../../Augmentation/Augmentations";
import { getAugCost, getGenericAugmentationPriceMultiplier } from "../../Augmentation/AugmentationHelpers";
import { AugmentationName, FactionName } from "@enums";
import { PurchasableAugmentations } from "../../Augmentation/ui/PurchasableAugmentations";
import { PurchaseAugmentationsOrderSetting } from "../../Settings/SettingEnums";
import { Settings } from "../../Settings/Settings";
import { Player } from "@player";
import { formatBigNumber } from "../../ui/formatNumber";
import { Router } from "../../ui/GameRoot";
import { Faction } from "../Faction";
import { getFactionAugmentationsFiltered, hasAugmentationPrereqs, purchaseAugmentation } from "../FactionHelpers";
import { CONSTANTS } from "../../Constants";
import { useRerender } from "../../ui/React/hooks";
import { ReputationInfo } from "../../ui/React/ReputationInfo";
import { FavorInfo } from "../../ui/React/FavorInfo";

/** Root React Component for displaying a faction's "Purchase Augmentations" page */
export function AugmentationsPage({ faction }: { faction: Faction }): React.ReactElement {
  const rerender = useRerender(400);
  const [filterText, setFilterText] = useState("");

  const matches = (s1: string, s2: string) => s1.toLowerCase().includes(s2.toLowerCase());
  const factionAugs = useMemo(() => getFactionAugmentationsFiltered(faction), [faction]);
  const filteredFactionAugs = useMemo(
    () =>
      factionAugs.filter(
        (aug: AugmentationName) =>
          !filterText ||
          matches(Augmentations[aug].name, filterText) ||
          matches(Augmentations[aug].info, filterText) ||
          matches(Augmentations[aug].stats, filterText),
      ),
    [filterText, factionAugs],
  );

  function getAugs(): AugmentationName[] {
    // filteredFactionAugs contains augs in the default order. We need to return a copy here so callers cannot
    // accidentally mutate it.
    // Using slice is enough because the array contains only strings.
    return filteredFactionAugs.slice();
  }

  function getAugsSorted(): AugmentationName[] {
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

  function getAugsSortedByCost(): AugmentationName[] {
    const augs = getAugs();
    augs.sort((augName1, augName2) => {
      const aug1 = Augmentations[augName1],
        aug2 = Augmentations[augName2];
      if (aug1 == null || aug2 == null) {
        throw new Error("Invalid Augmentation Names");
      }

      return getAugCost(aug1).moneyCost - getAugCost(aug2).moneyCost;
    });

    return augs;
  }

  function getAugsSortedByPurchasable(): AugmentationName[] {
    const augs = getAugs();
    function canBuy(augName: AugmentationName): boolean {
      const aug = Augmentations[augName];
      const augCosts = getAugCost(aug);
      const repCost = augCosts.repCost;
      const hasReq = faction.playerReputation >= repCost;
      const hasRep = hasAugmentationPrereqs(aug);
      const hasCost = augCosts.moneyCost !== 0 && Player.money >= augCosts.moneyCost;
      return hasCost && hasReq && hasRep;
    }
    const buy = augs.filter(canBuy).sort((augName1, augName2) => {
      const aug1 = Augmentations[augName1],
        aug2 = Augmentations[augName2];
      if (aug1 == null || aug2 == null) {
        throw new Error("Invalid Augmentation Names");
      }

      return getAugCost(aug1).moneyCost - getAugCost(aug2).moneyCost;
    });
    const cantBuy = augs
      .filter((aug) => !canBuy(aug))
      .sort((augName1, augName2) => {
        const aug1 = Augmentations[augName1],
          aug2 = Augmentations[augName2];
        if (aug1 == null || aug2 == null) {
          throw new Error("Invalid Augmentation Names");
        }
        return getAugCost(aug1).repCost - getAugCost(aug2).repCost;
      });

    return buy.concat(cantBuy);
  }

  function getAugsSortedByReputation(): AugmentationName[] {
    const augs = getAugs();
    augs.sort((augName1, augName2) => {
      const aug1 = Augmentations[augName1],
        aug2 = Augmentations[augName2];
      if (aug1 == null || aug2 == null) {
        throw new Error("Invalid Augmentation Names");
      }
      return getAugCost(aug1).repCost - getAugCost(aug2).repCost;
    });

    return augs;
  }

  function getAugsSortedByDefault(): AugmentationName[] {
    return getAugs();
  }

  function switchSortOrder(newOrder: PurchaseAugmentationsOrderSetting): void {
    Settings.PurchaseAugmentationsOrder = newOrder;
    rerender();
  }

  function handleFilterChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setFilterText(event.target.value);
  }

  const augs = getAugsSorted();
  const purchasable = augs.filter(
    (aug: string) =>
      aug === AugmentationName.NeuroFluxGovernor ||
      (!Player.augmentations.some((a) => a.name === aug) && !Player.queuedAugmentations.some((a) => a.name === aug)),
  );
  const owned = augs.filter((aug) => !purchasable.includes(aug));

  let multiplierDescription;
  let multiplierComponent;
  if (faction.name !== FactionName.ShadowsOfAnarchy) {
    multiplierDescription = <Typography>每排队一个强化，所有强化的价格都会上涨；安装它们时价格会重置。</Typography>;
    multiplierComponent = (
      <Typography>
        <b>价格倍率：</b>x {formatBigNumber(getGenericAugmentationPriceMultiplier())}
      </Typography>
    );
  } else {
    multiplierDescription = (
      <Typography>
        每已购买一个 {FactionName.ShadowsOfAnarchy} 强化，该价格倍率就会提高。安装强化时该倍率不会重置。
      </Typography>
    );
    multiplierComponent = (
      <Typography>
        <b>价格倍率：</b>x{" "}
        {formatBigNumber(
          Math.pow(
            CONSTANTS.SoACostMult,
            augs.filter((augmentationName) => Player.hasAugmentation(augmentationName)).length,
          ),
        )}
        <br />
        <b>声望倍率：</b>x{" "}
        {formatBigNumber(
          Math.pow(
            CONSTANTS.SoARepMult,
            augs.filter((augmentationName) => Player.hasAugmentation(augmentationName)).length,
          ),
        )}
      </Typography>
    );
  }

  return (
    <>
      <Container disableGutters maxWidth="lg" sx={{ mx: 0 }}>
        <Button onClick={() => Router.back()}>返回</Button>
        <Typography variant="h4">派系强化 - {faction.name}</Typography>
        <Paper sx={{ p: 1, mb: 1 }}>
          <Typography>
            以下是可从 <b>{faction.name}</b> 购买的所有强化。强化是能够增强你能力的强力升级。
          </Typography>
          <br />
          {multiplierDescription}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: `repeat(${faction.name === FactionName.ShadowsOfAnarchy ? "2" : "3"}, 1fr)`,
              justifyItems: "center",
              my: 1,
            }}
          >
            {multiplierComponent}
            <Box>
              <ReputationInfo favor={faction.favor} playerReputation={faction.playerReputation} boldLabel={true} />
              <FavorInfo favor={faction.favor} boldLabel={true} />
            </Box>
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
            <Button onClick={() => switchSortOrder(PurchaseAugmentationsOrderSetting.Cost)}>按费用排序</Button>
            <Button onClick={() => switchSortOrder(PurchaseAugmentationsOrderSetting.Reputation)}>按声望排序</Button>
            <Button onClick={() => switchSortOrder(PurchaseAugmentationsOrderSetting.Default)}>按默认顺序排序</Button>
            <Button onClick={() => switchSortOrder(PurchaseAugmentationsOrderSetting.Purchasable)}>按可购买排序</Button>
          </Box>
          <TextField
            value={filterText}
            onChange={handleFilterChange}
            autoFocus
            placeholder="筛选强化"
            InputProps={{
              startAdornment: <SearchIcon />,
              spellCheck: false,
            }}
            sx={{ pt: 1 }}
          />
        </Paper>
      </Container>

      <PurchasableAugmentations
        augNames={purchasable}
        ownedAugNames={owned}
        canPurchase={(aug) => {
          const costs = getAugCost(aug);
          return (
            hasAugmentationPrereqs(aug) &&
            faction.playerReputation >= costs.repCost &&
            (costs.moneyCost === 0 || Player.money >= costs.moneyCost)
          );
        }}
        purchaseAugmentation={(aug, showModal) => {
          if (!Settings.SuppressBuyAugmentationConfirmation) {
            showModal(true);
          } else {
            purchaseAugmentation(faction, aug);
            rerender();
          }
        }}
        rerender={rerender}
        rep={faction.playerReputation}
        faction={faction}
      />
    </>
  );
}
