import React from "react";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import { Player } from "@player";

import { Money } from "../../ui/React/Money";
import { MathJax } from "better-react-mathjax";

interface IProps {
  rerender: () => void;
}

export function CoresButton(props: IProps): React.ReactElement {
  const homeComputer = Player.getHomeComputer();
  const reachMaxCore = Player.bitNodeOptions.restrictHomePCUpgrade || homeComputer.cpuCores >= 8;

  const cost = Player.getUpgradeHomeCoresCost();

  function buy(): void {
    // Do NOT reuse reachMaxCore - it is cached (and possibly stale) at button creation time
    if (Player.bitNodeOptions.restrictHomePCUpgrade || homeComputer.cpuCores >= 8) {
      return;
    }
    if (!Player.canAfford(cost)) {
      return;
    }
    Player.loseMoney(cost, "servers");
    homeComputer.cpuCores++;
    props.rerender();
  }

  return (
    <Tooltip title={<MathJax>{`\\(\\large{cost = 10^9 \\cdot 7.5 ^{\\text{cores}}}\\)`}</MathJax>}>
      <span>
        <br />
        <Typography>
          <i>"Cores increase the effectiveness of grow() and weaken() on 'home'"</i>
        </Typography>
        <br />
        <Button disabled={!Player.canAfford(cost) || reachMaxCore} onClick={buy}>
          Upgrade 'home' cores&nbsp;
          {reachMaxCore ? (
            "- Max"
          ) : (
            <>
              ({homeComputer.cpuCores} -&gt; {homeComputer.cpuCores + 1}) -&nbsp;
              <Money money={cost} forPurchase={true} />
            </>
          )}
        </Button>
      </span>
    </Tooltip>
  );
}
