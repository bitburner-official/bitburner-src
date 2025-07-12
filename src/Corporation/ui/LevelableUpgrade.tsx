// React components for the levelable upgrade buttons on the overview panel
import React from "react";

import { dialogBoxCreate } from "../../ui/React/DialogBox";
import { CorpUpgrades } from "../data/CorporationUpgrades";
import { MoneyCost } from "./MoneyCost";
import { useCorporation } from "./Context";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import { ButtonWithTooltip } from "../../ui/Components/ButtonWithTooltip";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { calculateMaxAffordableUpgrade, calculateUpgradeCost } from "../helpers";
import { CorpUpgradeName } from "@enums";
import { PositiveInteger } from "../../types";

interface IProps {
  upgradeName: CorpUpgradeName;
  mult: PositiveInteger | "MAX";
  rerender: () => void;
}

export function LevelableUpgrade({ upgradeName, mult, rerender }: IProps): React.ReactElement {
  const corp = useCorporation();
  const data = CorpUpgrades[upgradeName];
  const level = corp.upgrades[upgradeName].level;

  const amount = mult === "MAX" ? calculateMaxAffordableUpgrade(corp, data) : mult;

  const cost = amount === 0 ? 0 : calculateUpgradeCost(data.basePrice, data.priceMult, level, amount);
  const tooltip = data.desc;
  function onClick(): void {
    if (corp.funds < cost) return;
    const result = corp.purchaseUpgrade(upgradeName, amount);
    if (!result.success) {
      dialogBoxCreate(`Could not upgrade ${upgradeName} ${amount} times:\n${result.message}`);
    }
    rerender();
  }

  return (
    <Grid item xs={4}>
      <Box display="flex" alignItems="center" flexDirection="row-reverse">
        <ButtonWithTooltip
          disabledTooltip={corp.funds < cost || amount === 0 ? "Insufficient corporation funds" : ""}
          onClick={onClick}
        >
          +{amount} -&nbsp; <MoneyCost money={cost} corp={corp} />
        </ButtonWithTooltip>
        <Tooltip title={tooltip}>
          <Typography>
            {data.name} - lvl {level}
          </Typography>
        </Tooltip>
      </Box>
    </Grid>
  );
}
