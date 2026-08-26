/**
 * Root React Component for displaying a Faction's UI.
 * This is the component for displaying a single faction's UI, not the list of all
 * accessible factions
 */
import React from "react";

import { DonateOption } from "./DonateOption";
import { Info } from "./Info";
import { Option } from "./Option";

import { Faction } from "../Faction";

import { Router } from "../../ui/GameRoot";
import { Page } from "../../ui/Router";
import { Player } from "@player";
import { Typography, Button } from "@mui/material";

import { FactionWorkType } from "@enums";
import { FactionWork } from "../../Work/FactionWork";
import { useCycleRerender } from "../../ui/React/hooks";
import { favorNeededToDonate } from "../formulas/donation";
import { knowAboutBitverse } from "../../BitNode/BitNodeUtils";

type FactionRootProps = {
  faction: Faction;
};

// Info text for all options on the UI
const hackingContractsInfo =
  "为你的派系完成黑客合约。" +
  "你的效率决定了你能为该派系获得多少声望，" +
  "它完全取决于你的黑客技能。" +
  "你将获得黑客经验。";
const fieldWorkInfo =
  "为你的派系执行外勤任务。" +
  "你的效率决定了你能为该派系获得多少声望，" +
  "它均衡地取决于你的所有属性。" +
  "你将获得所有属性的经验。";
const securityWorkInfo =
  "为你的派系担任安保工作。" +
  "你的效率决定了你能为该派系获得多少声望，" +
  "它取决于你的战斗属性和黑客技能。" +
  "你将获得所有战斗属性和黑客的经验。";
const augmentationsInfo = "随着你在该派系的声望提升，你将" + "解锁强化项目，购买它们可以增强" + "你的能力。";

interface IMainProps {
  faction: Faction;
  rerender: () => void;
  onAugmentations: () => void;
}

function MainPage({ faction, rerender, onAugmentations }: IMainProps): React.ReactElement {
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

  // We have a special flag for whether this faction is the player's
  // gang faction because if the player has a gang, they cannot do any other action
  const isPlayersGang = Player.gang && Player.getGangName() === faction.name;

  // Flags for whether special options (gang, sleeve purchases, donate, etc.)
  // should be shown
  const favorToDonate = favorNeededToDonate();
  const canDonate = faction.favor >= favorToDonate;

  return (
    <>
      <Button onClick={() => Router.toPage(Page.Factions)}>返回</Button>
      <Typography variant="h4" color="primary">
        {faction.name}
      </Typography>
      <Info faction={faction} factionInfo={factionInfo} />
      {!isPlayersGang && (
        <>
          {factionInfo.offersWork() && (
            <Typography>
              为你的派系工作/执行任务，助力其事业发展！这样做可以为派系赢得声望。你也会随时间被动地获得声望，不过速度非常缓慢。&nbsp;
              {knowAboutBitverse() && <>注意在某些 BitNode 中被动声望获取是禁用的。 </>}
              积累声望后，你就能通过该派系购买强化——它们是能够增强你能力的强力升级。
            </Typography>
          )}
          {factionInfo.offerHackingWork && (
            <Option
              buttonText={"黑客合约"}
              infoText={hackingContractsInfo}
              onClick={() => startHackingContracts(faction)}
            />
          )}
          {factionInfo.offerFieldWork && (
            <Option buttonText={"外勤工作"} infoText={fieldWorkInfo} onClick={() => startFieldWork(faction)} />
          )}
          {factionInfo.offerSecurityWork && (
            <Option buttonText={"安保工作"} infoText={securityWorkInfo} onClick={() => startSecurityWork(faction)} />
          )}
          {factionInfo.offersWork() && (
            <DonateOption faction={faction} rerender={rerender} favorToDonate={favorToDonate} disabled={!canDonate} />
          )}
        </>
      )}
      <Option buttonText={"购买强化"} infoText={augmentationsInfo} onClick={onAugmentations} />
    </>
  );
}

export function FactionRoot({ faction }: FactionRootProps): React.ReactElement {
  const rerender = useCycleRerender();

  if (!Player.factions.includes(faction.name)) {
    return (
      <>
        <Typography variant="h4" color="primary">
          你尚未加入 {faction.name}！
        </Typography>
        <Button onClick={() => Router.toPage(Page.Factions)}>返回派系列表</Button>
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
