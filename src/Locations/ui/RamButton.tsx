import React from "react";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import { Player } from "@player";
import { purchaseRamForHomeComputer } from "../../Server/ServerPurchases";

import { Money } from "../../ui/React/Money";
import { formatRam } from "../../ui/formatNumber";

import { currentNodeMults } from "../../BitNode/BitNodeMultipliers";
import { ServerConstants } from "../../Server/data/Constants";
import MathNotation from "../../Documentation/data/MathNotation.json";
import { MathNotationOutput } from "../../Documentation/ui/MathNotationOutput";

interface IProps {
  rerender: () => void;
}

export function RamButton(props: IProps): React.ReactElement {
  const homeComputer = Player.getHomeComputer();
  const reachMaxRam =
    (Player.bitNodeOptions.restrictHomePCUpgrade && homeComputer.maxRam >= 128) ||
    homeComputer.maxRam >= ServerConstants.HomeComputerMaxRam;

  const cost = Player.getUpgradeHomeRamCost();

  function buy(): void {
    purchaseRamForHomeComputer();
    props.rerender();
  }

  return (
    <Tooltip
      title={
        <>
          <Typography>HomeRamCostMult = {currentNodeMults.HomeComputerRamCost}</Typography>
          <MathNotationOutput notation={MathNotation.HomeRAMCost} />
        </>
      }
    >
      <span>
        <br />
        <Typography>
          <i>"More RAM means more scripts on 'home'"</i>
        </Typography>
        <br />
        <Button disabled={!Player.canAfford(cost) || reachMaxRam} onClick={buy}>
          Upgrade 'home' RAM&nbsp;
          {reachMaxRam ? (
            "- Max"
          ) : (
            <>
              ({formatRam(homeComputer.maxRam)} -&gt; {formatRam(homeComputer.maxRam * 2)}) -&nbsp;
              <Money money={cost} forPurchase={true} />
            </>
          )}
        </Button>
      </span>
    </Tooltip>
  );
}
