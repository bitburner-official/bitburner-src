/**
 * React Subcomponent for displaying a location's UI, when that location has special
 * actions/options/properties
 *
 * Examples:
 *      - Bladeburner @ NSA
 *      - Grafting @ VitaLife
 *      - Create Corporation @ City Hall
 *
 * This subcomponent creates all of the buttons for interacting with those special
 * properties
 */
import React, { useCallback, useState, useEffect } from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

import type { Location } from "../Location";
import { Locations } from "../Locations";
import { CreateCorporationModal } from "../../Corporation/ui/modals/CreateCorporationModal";
import { AugmentationName, CompletedProgramName, FactionName, LocationName, ToastVariant } from "@enums";
import { Factions } from "../../Faction/Factions";
import { joinFaction } from "../../Faction/FactionHelpers";

import { Router } from "../../ui/GameRoot";
import { Page } from "../../ui/Router";
import { Player } from "@player";

import { dialogBoxCreate } from "../../ui/React/DialogBox";
import { SnackbarEvents } from "../../ui/React/Snackbar";
import { N00dles } from "../../utils/helpers/N00dles";
import { Exploit } from "../../Exploits/Exploit";
import { applyAugmentation } from "../../Augmentation/AugmentationHelpers";
import { CorruptibleText } from "../../ui/React/CorruptibleText";
import { HacknetNode } from "../../Hacknet/HacknetNode";
import { HacknetServer } from "../../Hacknet/HacknetServer";
import { GetServer } from "../../Server/AllServers";
import { ArcadeRoot } from "../../Arcade/ui/ArcadeRoot";
import { currentNodeMults } from "../../BitNode/BitNodeMultipliers";
import { canAccessBitNodeFeature, knowAboutBitverse } from "../../BitNode/BitNodeUtils";
import { useRerender } from "../../ui/React/hooks";
import { PromptEvent } from "../../ui/React/PromptManager";
import { canAcceptStaneksGift } from "../../CotMG/Helper";
import { getDarkscapeNavigator } from "../../DarkNet/effects/effects";
import { hasDarknetAccess } from "../../DarkNet/utils/darknetAuthUtils";
import { DarknetConstants } from "../../DarkNet/Constants";
import { formatMoney } from "../../ui/formatNumber";

interface SpecialLocationProps {
  loc: Location;
}

function SpecialLocationHint(bitNode: number): React.ReactElement {
  let message;
  switch (bitNode) {
    case 3:
      if (Player.bitNodeOptions.disableCorporation) {
        message = "你已通过 BitNode 高级选项禁用了企业。";
      } else if (currentNodeMults.CorporationSoftcap < 0.15) {
        message = `企业已在 BN-${Player.bitNodeN} 中禁用。`;
      }
      break;
    case 6:
    case 7:
      if (Player.bitNodeOptions.disableBladeburner) {
        message = "你已通过 BitNode 高级选项禁用了 Bladeburner。";
      } else if (currentNodeMults.BladeburnerRank === 0) {
        message = `Bladeburner 已在 BN-${Player.bitNodeN} 中禁用。`;
      }
      break;
  }
  if (!message && knowAboutBitverse()) {
    message = `你应该去看看 ${
      bitNode !== 6 ? `BN-${bitNode}` : `BN-6 或 BN-7`
    }，以了解更多关于此地的详情。`;
  }
  if (!message) {
    return <></>;
  }
  return (
    <>
      <br />
      <br />
      <Typography>{message}</Typography>
    </>
  );
}

export function SpecialLocation(props: SpecialLocationProps): React.ReactElement {
  const rerender = useRerender();

  // Apply for Bladeburner division
  const joinBladeburnerDivision = useCallback(() => {
    Player.startBladeburner();
    dialogBoxCreate("你已被 Bladeburner 部门录取！");
    rerender();
  }, [rerender]);

  /** Click handler for Bladeburner button at Sector-12 NSA */
  function handleBladeburner(): void {
    if (Player.bladeburner) {
      // Enter Bladeburner division
      Router.toPage(Page.Bladeburner);
      return;
    }
    if (
      Player.skills.strength < 100 ||
      Player.skills.defense < 100 ||
      Player.skills.dexterity < 100 ||
      Player.skills.agility < 100
    ) {
      dialogBoxCreate("拒绝！请在你每项战斗属性都达到 100 后再来申请（力量、防御、灵巧、敏捷）");
      return;
    }
    if (
      Player.activeSourceFileLvl(7) >= 3 &&
      canAcceptStaneksGift().success &&
      !Player.hasAugmentation(AugmentationName.StaneksGift1)
    ) {
      PromptEvent.emit({
        txt:
          `加入 Bladeburner 部门后，你会立即获得 "${AugmentationName.BladesSimulacrum}"\n` +
          `强化，且将无法接受 Stanek 的礼物。如果你想接受 Stanek 的礼物，\n` +
          `必须在加入 Bladeburner 部门之前进行。\n\n` +
          "你现在真的想加入 Bladeburner 部门吗？",
        resolve: (value: string | boolean) => {
          if (value !== true) {
            return;
          }
          joinBladeburnerDivision();
        },
      });
      return;
    }
    joinBladeburnerDivision();
  }

  /** Click handler for Secret lab button at New Tokyo VitaLife */
  function handleGrafting(): void {
    Router.toPage(Page.Grafting);
  }

  function renderBladeburner(): React.ReactElement {
    if (!Player.canAccessBladeburner() || currentNodeMults.BladeburnerRank === 0) {
      return SpecialLocationHint(6);
    }
    const text = Player.bladeburner ? "进入 Bladeburner 总部" : "申请加入 Bladeburner 部门";
    return (
      <>
        <br />
        <Button onClick={handleBladeburner}>{text}</Button>
      </>
    );
  }

  function renderNoodleBar(): React.ReactElement {
    function EatNoodles(): void {
      SnackbarEvents.emit("你吃了一些美味的面条，感觉神清气爽", ToastVariant.SUCCESS, 2000);
      N00dles(); // This is the true power of the noodles.
      if (knowAboutBitverse()) {
        Player.giveExploit(Exploit.N00dles);
      }
      if (canAccessBitNodeFeature(5)) {
        Player.exp.intelligence *= 1.0000000000000002;
      }
      Player.exp.hacking *= 1.0000000000000002;
      Player.exp.strength *= 1.0000000000000002;
      Player.exp.defense *= 1.0000000000000002;
      Player.exp.agility *= 1.0000000000000002;
      Player.exp.dexterity *= 1.0000000000000002;
      Player.exp.charisma *= 1.0000000000000002;
      for (const node of Player.hacknetNodes) {
        if (node instanceof HacknetNode) {
          Player.gainMoney(node.moneyGainRatePerSecond * 0.001, "other");
        } else {
          const server = GetServer(node);
          if (!(server instanceof HacknetServer)) throw new Error(`Server ${node} is not a hacknet server.`);
          Player.hashManager.storeHashes(server.hashRate * 0.001);
        }
      }

      if (Player.bladeburner) {
        Player.bladeburner.rank += 0.00001;
      }

      if (Player.corporation) {
        Player.corporation.gainFunds(Player.corporation.revenue * 0.000001, "glitch in reality");
      }
    }

    return (
      <>
        <br />
        <Button onClick={EatNoodles}>吃面条</Button>
      </>
    );
  }

  function CreateCorporation(): React.ReactElement {
    const [open, setOpen] = useState(false);
    if (!Player.canAccessCorporation() || currentNodeMults.CorporationSoftcap < 0.15) {
      return (
        <>
          <Typography>
            <i>一名商人正在对职员大吼大叫。你应该稍后再来。</i>
          </Typography>
          {SpecialLocationHint(3)}
        </>
      );
    }
    return (
      <>
        <Button disabled={!Player.canAccessCorporation() || !!Player.corporation} onClick={() => setOpen(true)}>
          创建企业
        </Button>
        <CreateCorporationModal open={open} onClose={() => setOpen(false)} restart={false} />
      </>
    );
  }

  function renderGrafting(): React.ReactElement {
    if (!Player.canAccessGrafting()) {
      return SpecialLocationHint(10);
    }
    return (
      <Button onClick={handleGrafting} sx={{ my: 5 }}>
        进入秘密实验室
      </Button>
    );
  }

  function handleCotMG(): void {
    const faction = Factions[FactionName.ChurchOfTheMachineGod];
    if (!Player.factions.includes(FactionName.ChurchOfTheMachineGod)) {
      joinFaction(faction);
    }
    if (
      !Player.augmentations.some((a) => a.name === AugmentationName.StaneksGift1) &&
      !Player.queuedAugmentations.some((a) => a.name === AugmentationName.StaneksGift1)
    ) {
      applyAugmentation({ name: AugmentationName.StaneksGift1, level: 1 });
    }

    Router.toPage(Page.StaneksGift);
  }

  function renderCotMG(): React.ReactElement {
    const toStanek = <Button onClick={() => Router.toPage(Page.StaneksGift)}>打开 Stanek 的礼物</Button>;
    // prettier-ignore
    const symbol = <Typography sx={{ lineHeight: '1em', whiteSpace: 'pre' }}>
      {"                 ``          "}<br />
      {"             -odmmNmds:      "}<br />
      {"           `hNmo:..-omNh.    "}<br />
      {"           yMd`      `hNh    "}<br />
      {"           mMd        oNm    "}<br />
      {"           oMNo      .mM/    "}<br />
      {"           `dMN+    -mM+     "}<br />
      {"            -mMNo  -mN+      "}<br />
      {"  .+-        :mMNo/mN/       "}<br />
      {":yNMd.        :NMNNN/        "}<br />
      {"-mMMMh.        /NMMh`        "}<br />
      {" .dMMMd.       /NMMMy`       "}<br />
      {"  `yMMMd.     /NNyNMMh`      "}<br />
      {"   `sMMMd.   +Nm: +NMMh.     "}<br />
      {"     oMMMm- oNm:   /NMMd.    "}<br />
      {"      +NMMmsMm-     :mMMd.   "}<br />
      {"       /NMMMm-       -mMMd.  "}<br />
      {"        /MMMm-        -mMMd. "}<br />
      {"       `sMNMMm-        .mMmo "}<br />
      {"      `sMd:hMMm.        ./.  "}<br />
      {"     `yMy` `yNMd`            "}<br />
      {"    `hMs`    oMMy            "}<br />
      {"   `hMh       sMN-           "}<br />
      {"   /MM-       .NMo           "}<br />
      {"   +MM:       :MM+           "}<br />
      {"    sNNo-.`.-omNy`           "}<br />
      {"     -smNNNNmdo-             "}<br />
      {"        `..`                 "}</Typography>
    if (Player.hasAugmentation(AugmentationName.StaneksGift3, true)) {
      return (
        <>
          <Typography>
            <i>
              Allison "Mother" Stanek：……你……你也能听到它们吗……？来吧，别害羞，让我好好看看你。
              很好，太棒了，看来我的造物已经生根发芽，没有产生什么恶果。真好奇，你那具身体里到底容纳了多少机器的灵魂？
            </i>
          </Typography>
          <br />
          {toStanek}
          <br />
          {symbol}
        </>
      );
    }
    if (Player.hasAugmentation(AugmentationName.StaneksGift2, true)) {
      return (
        <>
          <Typography>
            <i>
              Allison "Mother" Stanek：看来你很中意我的造物。经过你的摆弄，它几乎让人认不出是我亲手之作。
              我看得出你和我一样遵循机械神的道路，你对这份礼物的精通清楚地证明了这一点。我对你的期望与日俱增。
            </i>
          </Typography>
          <br />
          {toStanek}
          <br />
          {symbol}
        </>
      );
    }
    if (Player.factions.includes(FactionName.ChurchOfTheMachineGod)) {
      return (
        <>
          <Typography>
            <i>Allison "Mother" Stanek：欢迎回来，我的孩子！</i>
          </Typography>
          <br />
          {toStanek}
          <br />
          {symbol}
        </>
      );
    }

    if (!Player.canAccessCotMG()) {
      return (
        <>
          <Typography>
            一座破败的祭坛矗立在残破的教堂中央。
            <br />
            <br />祭坛上刻着一个符号。
          </Typography>

          <br />
          {symbol}
          {SpecialLocationHint(13)}
        </>
      );
    }

    if (
      Player.augmentations.filter((a) => a.name !== AugmentationName.NeuroFluxGovernor).length > 0 ||
      Player.queuedAugmentations.filter((a) => a.name !== AugmentationName.NeuroFluxGovernor).length > 0
    ) {
      return (
        <>
          <Typography>
            <i>Allison "Mother" Stanek：滚开，你这污秽之物！我的礼物必须是你身体接受的第一处改造！</i>
          </Typography>
        </>
      );
    }

    return (
      <>
        <Typography>
          <i>
            Allison "Mother" Stanek：欢迎，孩子，我看到你的身体是纯洁的。准备好超越我们的人类形态了吗？
            如果准备好了，就接受我的礼物。
          </i>
        </Typography>
        <Button onClick={handleCotMG}>接受 Stanek 的礼物</Button>
        {symbol}
      </>
    );
  }

  function RenderGlitch(): React.ReactElement {
    // If the user stays here for ~25 seconds, silently warp them to The Void.
    useEffect(() => {
      let delay = 0;
      // This is a sum of 25 exponential random variables, which is equivalent
      // to one Erlang-distributed random variable with mean 25sec and stddev 5sec.
      for (let i = 0; i < 25; ++i) {
        delay += -1000 * Math.log(1 - Math.random());
      }
      const id = setTimeout(() => Router.toPage(Page.Location, { location: Locations[LocationName.Void] }), delay);
      return () => clearTimeout(id);
    });

    return (
      <>
        <Typography>
          <CorruptibleText content={"这片区域笼罩着诡异的气息。你觉得自己应该离开。"} spoiler={false} />
        </Typography>
      </>
    );
  }

  function renderShadowedWalkway(): React.ReactElement {
    function handleDarknetNavigator(): void {
      if (Player.money < DarknetConstants.DarkscapeNavigatorDiscountedPrice) {
        dialogBoxCreate(`你的资金不足以购买 ${CompletedProgramName.darkscape}`);
        return;
      }
      Player.loseMoney(DarknetConstants.DarkscapeNavigatorDiscountedPrice, "other");
      getDarkscapeNavigator();
      dialogBoxCreate(
        `你以 ${formatMoney(
          DarknetConstants.DarkscapeNavigatorDiscountedPrice,
        )} 的价格购买了 ${CompletedProgramName.darkscape}。`,
      );
      rerender();
    }
    const canBuyDarknetNavigator =
      Player.money >= DarknetConstants.DarkscapeNavigatorDiscountedPrice && !hasDarknetAccess();
    return (
      <>
        <Typography>
          <br />
          <br />
          城市黑暗而寂静。它在这条破败走道的下方延展，是一片看似无尽的腐朽混凝土与锈蚀金属。
          <br />
          <br />
          附近，一台古老的自动售货机歪斜地立着，屏幕闪烁着雪花，上面仍然贴满广告，宣传着它以信用点出售的激光唱片。
          <br />
          <br />
          机器上一块褪色的标牌写着：
          <br />
          <br />
          <i>
            反抗、变革与自由：由隐私驱动。Darkscape Navigator 是逃离防火墙压迫的唯一途径。
          </i>
          <br />
          <br />
          <br />
          <Button onClick={handleDarknetNavigator} disabled={!canBuyDarknetNavigator}>
            购买 {CompletedProgramName.darkscape}{" "}
            {hasDarknetAccess()
              ? " - 已购买"
              : `(${formatMoney(DarknetConstants.DarkscapeNavigatorDiscountedPrice)})`}
          </Button>
        </Typography>
      </>
    );
  }

  switch (props.loc.name) {
    case LocationName.NewTokyoVitaLife: {
      return renderGrafting();
    }
    case LocationName.Sector12CityHall: {
      return <CreateCorporation />;
    }
    case LocationName.Sector12NSA: {
      return renderBladeburner();
    }
    case LocationName.NewTokyoNoodleBar: {
      return renderNoodleBar();
    }
    case LocationName.ChongqingChurchOfTheMachineGod: {
      return renderCotMG();
    }
    case LocationName.IshimaGlitch: {
      return <RenderGlitch />;
    }
    case LocationName.NewTokyoArcade: {
      return <ArcadeRoot />;
    }
    case LocationName.Sector12CIA:
    case LocationName.NewTokyoDefComm: {
      return (
        <>
          <br />
          <br />
          <br />
          <Button onClick={() => Router.toPage(Page.Go)}>IPvGO 子网接管</Button>
        </>
      );
    }
    case LocationName.ChongqingShadowedWalkway: {
      return renderShadowedWalkway();
    }
    case LocationName.Void: {
      // Reserved for special content such as easter eggs.
      // Player.giveAchievement() may render a toast while React is rendering this component. This causes a state update
      // during rendering, which triggers the following React warning: "Cannot update during an existing state
      // transition (such as within `render`). Render methods should be a pure function of props and state."
      // Therefore, we defer the call until after the current render completes.
      setTimeout(() => {
        Player.giveAchievement("THE_VOID");
      }, 0);
      return <></>;
    }
    default:
      console.error(`Location ${props.loc.name} doesn't have any special properties`);
      return <></>;
  }
}
