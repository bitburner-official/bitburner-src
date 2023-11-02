/**
 * React component for displaying a single augmentation for purchase through
 * the faction UI
 */
import { CheckCircle, NewReleases, Report } from "@mui/icons-material";
import { Box, Button, Container, Paper, Tooltip, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Faction } from "../../Faction/Faction";
import { Player } from "@player";
import { Settings } from "../../Settings/Settings";
import { formatMoney, formatReputation } from "../../ui/formatNumber";
import { Augmentation } from "../Augmentation";
import { AugmentationName, FactionName } from "@enums";
import { Augmentations } from "../Augmentations";
import { PurchaseAugmentationModal } from "./PurchaseAugmentationModal";
import { getAugCost } from "../AugmentationHelpers";
import { useRerender } from "../../ui/React/hooks";
import { Requirement } from "../../ui/Components/Requirement";

interface IPreReqsProps {
  aug: Augmentation;
}

const PreReqs = (props: IPreReqsProps): React.ReactElement => {
  const ownedPreReqs = props.aug.prereqs.filter((aug) => Player.hasAugmentation(aug));
  const hasPreReqs = props.aug.prereqs.length > 0 && ownedPreReqs.length === props.aug.prereqs.length;

  return (
    <Tooltip
      title={
        <>
          <Typography sx={{ color: Settings.theme.money }}>
            This Augmentation has the following pre-requisite(s):
          </Typography>
          {props.aug.prereqs.map((preAug) => (
            <Requirement
              fulfilled={Player.hasAugmentation(preAug)}
              value={preAug}
              color={Settings.theme.money}
              incompleteColor={Settings.theme.error}
              key={preAug}
            />
          ))}
        </>
      }
    >
      <Typography
        sx={{
          ml: 1,
          fontSize: "0.9rem",
          display: "flex",
          alignItems: "center",
          color: hasPreReqs ? Settings.theme.successlight : Settings.theme.error,
          gridArea: "prereqs",
        }}
      >
        {hasPreReqs ? (
          <>
            <CheckCircle fontSize="small" sx={{ mr: 1 }} />
            Pre-requisites Owned
          </>
        ) : (
          <>
            <Report fontSize="small" sx={{ mr: 1 }} />
            Missing {props.aug.prereqs.length - ownedPreReqs.length} pre-requisite(s)
          </>
        )}
      </Typography>
    </Tooltip>
  );
};

interface IExclusiveProps {
  aug: Augmentation;
}

const Exclusive = (props: IExclusiveProps): React.ReactElement => {
  return (
    <Tooltip
      title={
        <>
          <Typography sx={{ color: Settings.theme.money }}>
            This Augmentation can only be acquired from the following source(s):
          </Typography>
          <ul>
            <Typography sx={{ color: Settings.theme.money }}>
              <li>
                <b>{props.aug.factions[0]}</b> faction
              </li>
              {Player.isAwareOfGang() && !props.aug.isSpecial && (
                <li>
                  Certain <b>gangs</b>
                </li>
              )}
              {Player.canAccessGrafting() &&
                (!props.aug.isSpecial || props.aug.factions.includes(FactionName.Bladeburners)) &&
                props.aug.name !== AugmentationName.TheRedPill && (
                  <li>
                    <b>Grafting</b>
                  </li>
                )}
            </Typography>
          </ul>
        </>
      }
    >
      <NewReleases
        fontSize="small"
        sx={{ ml: 1, color: Settings.theme.money, transform: "rotate(180deg)", gridArea: "exclusive" }}
      />
    </Tooltip>
  );
};

interface IPurchasableAugsProps {
  augNames: AugmentationName[];
  ownedAugNames: AugmentationName[];

  canPurchase: (aug: Augmentation) => boolean;
  purchaseAugmentation: (aug: Augmentation, showModal: (open: boolean) => void) => void;
  rerender: () => void;

  rep?: number;
  sleeveAugs?: boolean;
  faction?: Faction;
}

export const PurchasableAugmentations = (props: IPurchasableAugsProps): React.ReactElement => {
  return (
    <Container
      maxWidth="lg"
      disableGutters
      sx={{ mx: 0, display: "grid", gridTemplateColumns: "repeat(1, 1fr)", gap: 0.75 }}
    >
      {props.augNames.map((augName) => (
        <PurchasableAugmentation key={augName} parent={props} augName={augName} owned={false} />
      ))}
      {props.ownedAugNames.map((augName) => (
        <PurchasableAugmentation key={augName} parent={props} augName={augName} owned={true} />
      ))}
    </Container>
  );
};

interface IPurchasableAugProps {
  parent: IPurchasableAugsProps;
  augName: AugmentationName;
  owned: boolean;
}

export function PurchasableAugmentation(props: IPurchasableAugProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const rerender = useRerender();
  useEffect(() => {
    // No need to rerender augs that are owned
    if (props.owned) return;
    const interval = setInterval(rerender, 600);
    return () => clearInterval(interval);
  }, [props.owned, rerender]);

  const aug = Augmentations[props.augName];
  if (!aug) return <></>;
  const augLevel = aug.getLevel();
  const augCosts = getAugCost(aug);
  const cost = props.parent.sleeveAugs ? aug.baseCost : augCosts.moneyCost;
  const repCost = augCosts.repCost;
  const info = typeof aug.info === "string" ? <span>{aug.info}</span> : aug.info;
  const description = (
    <>
      {info}
      <br />
      <br />
      {aug.stats}
    </>
  );

  return (
    <Paper
      sx={{
        p: 0.5,
        display: "grid",
        gridTemplateColumns: "minmax(0, 4fr) 1.4fr",
        gap: 1,
        opacity: props.owned ? 0.75 : 1,
        minWidth: "1100px",
      }}
    >
      <>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Button
            onClick={() =>
              props.parent.purchaseAugmentation(aug, (open): void => {
                setOpen(open);
              })
            }
            disabled={!props.parent.canPurchase(aug) || props.owned}
            sx={{ width: "48px", height: "36px", float: "left", clear: "none", mr: 1 }}
          >
            {props.owned ? "Owned" : "Buy"}
          </Button>

          <Box sx={{ maxWidth: props.owned ? "100%" : "85%" }}>
            <Box sx={{ display: "grid", alignItems: "center", gridTemplateAreas: `"title exclusive prereqs"` }}>
              <Tooltip
                title={
                  <>
                    <Typography variant="h5">
                      {aug.name}
                      {aug.name === AugmentationName.NeuroFluxGovernor && ` - Level ${augLevel + 1}`}
                    </Typography>
                    <Typography whiteSpace={"pre-wrap"}>{description}</Typography>
                  </>
                }
              >
                <Typography
                  sx={{
                    gridArea: "title",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    color:
                      props.owned || !props.parent.canPurchase(aug) ? Settings.theme.disabled : Settings.theme.primary,
                  }}
                >
                  {aug.name}
                  {aug.name === AugmentationName.NeuroFluxGovernor && ` - Level ${augLevel + 1}`}
                </Typography>
              </Tooltip>

              {aug.factions.length === 1 && !props.parent.sleeveAugs && <Exclusive aug={aug} />}
              {aug.prereqs.length > 0 && !props.parent.sleeveAugs && <PreReqs aug={aug} />}
            </Box>
          </Box>
        </Box>

        {props.owned || (
          <Box sx={{ display: "grid", alignItems: "center", gridTemplateColumns: "1fr 1fr" }}>
            <Requirement
              fulfilled={cost === 0 || Player.money > cost}
              value={formatMoney(cost)}
              color={Settings.theme.money}
              incompleteColor={Settings.theme.error}
            />
            {props.parent.rep !== undefined && (
              <Requirement
                fulfilled={props.parent.rep >= repCost}
                value={`${formatReputation(repCost)} rep`}
                color={Settings.theme.rep}
                incompleteColor={Settings.theme.error}
              />
            )}
          </Box>
        )}

        {Settings.SuppressBuyAugmentationConfirmation || (
          <PurchaseAugmentationModal
            open={open}
            onClose={() => {
              setOpen(false);
              props.parent.rerender();
            }}
            faction={props.parent.faction}
            aug={aug}
          />
        )}
      </>
    </Paper>
  );
}
