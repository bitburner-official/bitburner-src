import React, { useEffect } from "react";

import Typography from "@mui/material/Typography";
import { Player } from "@player";

import { AugmentationNames } from "./Augmentation/data/AugmentationNames";
import { Achievements } from "./DevMenu/ui/Achievements";
import { Augmentations } from "./DevMenu/ui/Augmentations";
import { Bladeburner as BladeburnerElem } from "./DevMenu/ui/Bladeburner";
import { CodingContracts } from "./DevMenu/ui/CodingContracts";
import { Companies } from "./DevMenu/ui/Companies";
import { Corporation } from "./DevMenu/ui/Corporation";
import { Entropy } from "./DevMenu/ui/Entropy";
import { Factions } from "./DevMenu/ui/Factions";
import { Gang } from "./DevMenu/ui/Gang";
import { General } from "./DevMenu/ui/General";
import { Programs } from "./DevMenu/ui/Programs";
import { SaveFile } from "./DevMenu/ui/SaveFile";
import { Servers } from "./DevMenu/ui/Servers";
import { Sleeves } from "./DevMenu/ui/Sleeves";
import { SourceFiles } from "./DevMenu/ui/SourceFiles";
import { Stanek } from "./DevMenu/ui/Stanek";
import { Stats } from "./DevMenu/ui/Stats";
import { StockMarket } from "./DevMenu/ui/StockMarket";
import { TimeSkip } from "./DevMenu/ui/TimeSkip";
import { Exploit } from "./Exploits/Exploit";

export function DevMenuRoot(): React.ReactElement {
  useEffect(() => {
    Player.giveExploit(Exploit.YoureNotMeantToAccessThis);
  }, []);
  return (
    <>
      <Typography>Development Menu - Only meant to be used for testing/debugging</Typography>
      <General />
      <Stats />
      <Factions />
      <Augmentations />
      <SourceFiles />
      <Programs />
      <Servers />
      <Companies />

      {Player.bladeburner && <BladeburnerElem />}

      {Player.gang && <Gang />}

      {Player.corporation && <Corporation />}

      <CodingContracts />

      {Player.hasWseAccount && <StockMarket />}

      {Player.sleeves.length > 0 && <Sleeves />}
      {Player.augmentations.some((aug) => aug.name === AugmentationNames.StaneksGift1) && <Stanek />}

      <TimeSkip />
      <Achievements />
      <Entropy />
      <SaveFile />
    </>
  );
}
