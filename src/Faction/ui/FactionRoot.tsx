/**
 * Root React Component for displaying a Faction's UI.
 * This is the component for displaying a single faction's UI, not the list of all
 * accessible factions
 */
import React, { useState } from "react";

import { DonateOption } from "./DonateOption";
import { Info } from "./Info";
import { Option } from "./Option";

import { Faction } from "../Faction";

import { Router } from "../../ui/GameRoot";
import { Page } from "../../ui/Router";
import { Player } from "@player";
import { Typography, Button } from "@mui/material";

import { CovenantPurchasesRoot } from "../../PersonObjects/Sleeve/ui/CovenantPurchasesRoot";
import { FactionName, FactionWorkType } from "@enums";
import { GangButton } from "./GangButton";
import { FactionWork } from "../../Work/FactionWork";
import { useRerender } from "../../ui/React/hooks";
import { repNeededToDonate } from "../formulas/donation";

type FactionRootProps = {
  faction: Faction;
};

// Info text for all options on the UI
const hackingContractsInfo =
  "Complete hacking contracts for your faction. " +
  "Your effectiveness, which determines how much " +
  "reputation you gain for this faction, is based completely on your hacking skill. " +
  "You will gain hacking exp.";
const fieldWorkInfo =
  "Carry out field missions for your faction. " +
  "Your effectiveness, which determines how much " +
  "reputation you gain for this faction, is based on all of your stats equally . " +
  "You will gain exp for all stats.";
const securityWorkInfo =
  "Serve in a security detail for your faction. " +
  "Your effectiveness, which determines how much " +
  "reputation you gain for this faction, is based on your combat stats and your hacking skill. " +
  "You will gain exp for all combat stats and hacking.";
const augmentationsInfo =
  "As your reputation with this faction rises, you will " +
  "unlock Augmentations, which you can purchase to enhance " +
  "your abilities.";
const sleevePurchasesInfo = "Purchase Duplicate Sleeves and upgrades. These are permanent!";

interface IMainProps {
  faction: Faction;
  rerender: () => void;
  onAugmentations: () => void;
}

function MainPage({ faction, rerender, onAugmentations }: IMainProps): React.ReactElement {
  const [sleevesOpen, setSleevesOpen] = useState(false);
  const factionInfo = faction.getInfo();

  function startWork(): void {
    Player.startFocusing();
    Router.toPage(Page.Work);
  }

  function startFieldWork(faction: Faction): void {
    Player.startWork(
      new FactionWork({
        singularity: false,
        faction: faction.name,
        factionWorkType: FactionWorkType.field,
      }),
    );
    startWork();
  }

  function startHackingContracts(faction: Faction): void {
    Player.startWork(
      new FactionWork({
        singularity: false,
        faction: faction.name,
        factionWorkType: FactionWorkType.hacking,
      }),
    );
    startWork();
  }

  function startSecurityWork(faction: Faction): void {
    Player.startWork(
      new FactionWork({
        singularity: false,
        faction: faction.name,
        factionWorkType: FactionWorkType.security,
      }),
    );
    startWork();
  }

  // We have a special flag for whether the player this faction is the player's
  // gang faction because if the player has a gang, they cannot do any other action
  const isPlayersGang = Player.gang && Player.getGangName() === faction.name;

  // Flags for whether special options (gang, sleeve purchases, donate, etc.)
  // should be shown
  const favorToDonate = repNeededToDonate();
  const canDonate = faction.favor >= favorToDonate;
  const canPurchaseSleeves = faction.name === FactionName.TheCovenant && Player.bitNodeN === 10;

  return (
    <>
      <Button onClick={() => Router.toPage(Page.Factions)}>Back</Button>
      <Typography variant="h4" color="primary">
        {faction.name}
      </Typography>
      <Info faction={faction} factionInfo={factionInfo} />
      <GangButton faction={faction} />
      {!isPlayersGang && factionInfo.offerHackingWork && (
        <Option
          buttonText={"Hacking Contracts"}
          infoText={hackingContractsInfo}
          onClick={() => startHackingContracts(faction)}
        />
      )}
      {!isPlayersGang && factionInfo.offerFieldWork && (
        <Option buttonText={"Field Work"} infoText={fieldWorkInfo} onClick={() => startFieldWork(faction)} />
      )}
      {!isPlayersGang && factionInfo.offerSecurityWork && (
        <Option buttonText={"Security Work"} infoText={securityWorkInfo} onClick={() => startSecurityWork(faction)} />
      )}
      {!isPlayersGang && factionInfo.offersWork() && (
        <DonateOption faction={faction} rerender={rerender} favorToDonate={favorToDonate} disabled={!canDonate} />
      )}
      <Option buttonText={"Purchase Augmentations"} infoText={augmentationsInfo} onClick={onAugmentations} />
      {canPurchaseSleeves && (
        <>
          <Option
            buttonText={"Purchase & Upgrade Duplicate Sleeves"}
            infoText={sleevePurchasesInfo}
            onClick={() => setSleevesOpen(true)}
          />
          <CovenantPurchasesRoot open={sleevesOpen} onClose={() => setSleevesOpen(false)} />
        </>
      )}
    </>
  );
}

export function FactionRoot({ faction }: FactionRootProps): React.ReactElement {
  const rerender = useRerender(200);

  if (!Player.factions.includes(faction.name)) {
    return (
      <>
        <Typography variant="h4" color="primary">
          You have not joined {faction.name} yet!
        </Typography>
        <Button onClick={() => Router.toPage(Page.Factions)}>Back to Factions</Button>
      </>
    );
  }

  return (
    <MainPage
      rerender={rerender}
      faction={faction}
      onAugmentations={() => Router.toPage(Page.FactionAugmentations, { faction })}
    />
  );
}
