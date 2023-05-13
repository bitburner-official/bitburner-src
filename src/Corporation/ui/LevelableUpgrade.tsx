// React components for the levelable upgrade buttons on the overview panel
import React from "react";

import { dialogBoxCreate } from "../../ui/React/DialogBox";
import { CorpUpgrades } from "../data/CorporationUpgrades";
import { MoneyCost } from "./MoneyCost";
import { useCorporation } from "./Context";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { calculateMaxAffordableUpgrade, calculateUpgradeCost } from "../helpers";
import { CorpUpgradeName } from "../data/Enums";
import { PositiveInteger } from "../../types";

interface IProps {
  upgradeName: CorpUpgradeName;
  amount: PositiveInteger | "MAX";
  rerender: () => void;
}

export function LevelableUpgrade({ upgradeName, amount, rerender }: IProps): React.ReactElement {
  const corp = useCorporation();
  const data = CorpUpgrades[upgradeName];
  const level = corp.upgrades[upgradeName].level;

  const maxUpgrades = amount === "MAX" ? calculateMaxAffordableUpgrade(corp, data, amount) : amount;
  const cost = maxUpgrades === 0 ? 0 : calculateUpgradeCost(corp, data, maxUpgrades);
  const tooltip = data.desc;
  function onClick(): void {
    if (corp.funds < cost) return;
    const message = corp.purchaseUpgrade(upgradeName, maxUpgrades);
    if (message) dialogBoxCreate(`Could not upgrade ${upgradeName} ${maxUpgrades} times:\n${message}`);
    rerender();
  }

  return (
    <Grid item xs={4}>
      <Box display="flex" alignItems="center" flexDirection="row-reverse">
        <Button disabled={corp.funds < cost} sx={{ mx: 1 }} onClick={onClick}>
          +{maxUpgrades} -&nbsp;
          <MoneyCost money={cost} corp={corp} />
        </Button>
        <Tooltip title={tooltip}>
          <Typography>
            {data.name} - lvl {level}
          </Typography>
        </Tooltip>
      </Box>
    </Grid>
  );
}
