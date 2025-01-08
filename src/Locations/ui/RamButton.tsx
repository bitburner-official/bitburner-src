import React from "react";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import { Player } from "@player";
import { purchaseRamForHomeComputer } from "../../Server/ServerPurchases";

import { Money } from "../../ui/React/Money";
import { formatRam } from "../../ui/formatNumber";

import { MathJax } from "better-react-mathjax";
import { currentNodeMults } from "../../BitNode/BitNodeMultipliers";
import { ServerConstants } from "../../Server/data/Constants";

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

  const bnMult = currentNodeMults.HomeComputerRamCost === 1 ? "" : `\\cdot ${currentNodeMults.HomeComputerRamCost}`;

  return (
    <Tooltip
      title={
        <MathJax>{`\\(\\large{cost = ram \\cdot 3.2 \\cdot 10^4 \\cdot 1.58^{log_2{(ram)}}} ${bnMult}\\)`}</MathJax>
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
