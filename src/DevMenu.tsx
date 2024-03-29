import React, { useEffect } from "react";

import Typography from "@mui/material/Typography";

import { Player } from "@player";
import { AugmentationName } from "@enums";

import { General } from "./DevMenu/ui/General";
import { TimeSkip } from "./DevMenu/ui/TimeSkip";

import { StatsDev } from "./DevMenu/ui/StatsDev";
import { FactionsDev } from "./DevMenu/ui/FactionsDev";
import { AugmentationsDev } from "./DevMenu/ui/AugmentationsDev";
import { SourceFilesDev } from "./DevMenu/ui/SourceFilesDev";
import { ProgramsDev } from "./DevMenu/ui/ProgramsDev";
import { ServersDev } from "./DevMenu/ui/ServersDev";
import { CompaniesDev } from "./DevMenu/ui/CompaniesDev";
import { BladeburnerDev } from "./DevMenu/ui/BladeburnerDev";
import { GangDev } from "./DevMenu/ui/GangDev";
import { CorporationDev } from "./DevMenu/ui/CorporationDev";
import { CodingContractsDev } from "./DevMenu/ui/CodingContractsDev";
import { StockMarketDev } from "./DevMenu/ui/StockMarketDev";
import { SleevesDev } from "./DevMenu/ui/SleevesDev";
import { StanekDev } from "./DevMenu/ui/StanekDev";
import { AchievementsDev } from "./DevMenu/ui/AchievementsDev";
import { EntropyDev } from "./DevMenu/ui/EntropyDev";

import { Exploit } from "./Exploits/Exploit";
import { useRerender } from "./ui/React/hooks";

export function DevMenuRoot(): React.ReactElement {
  useEffect(() => {
    Player.giveExploit(Exploit.YoureNotMeantToAccessThis);
  }, []);
  // Pass rerender to certain subpages in case certain tabs are now valid/invalid due to changes made on those pages
  // Rerender periodically in case game state changes (e.g. player starts gang or buys wse account through a script)
  const rerender = useRerender(400);
  return (
    <>
      <Typography>Development Menu - Only meant to be used for testing/debugging</Typography>
      <General parentRerender={rerender} />
      <StatsDev />
      <FactionsDev />
      <AugmentationsDev />
      <SourceFilesDev parentRerender={rerender} />
      <ProgramsDev />
      <ServersDev />
      <CompaniesDev />

      {Player.bladeburner && <BladeburnerDev bladeburner={Player.bladeburner} />}

      {Player.gang && <GangDev />}

      {Player.corporation && <CorporationDev />}

      <CodingContractsDev />

      {Player.hasWseAccount && <StockMarketDev />}

      {Player.sleeves.length > 0 && <SleevesDev />}
      {Player.augmentations.some((aug) => aug.name === AugmentationName.StaneksGift1) && <StanekDev />}

      <TimeSkip />
      <AchievementsDev />
      <EntropyDev />
    </>
  );
}
