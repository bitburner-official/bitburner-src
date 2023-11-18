/**
 * React Component for the stats related to the gang, like total respect and
 * money per second.
 */
import React from "react";
import { formatNumber, formatMoney } from "../../ui/formatNumber";
import { BonusTime } from "./BonusTime";
import { BonusVisibility } from "./BonusVisibility";
import { BonusTerror } from "./BonusTerror";
import { BonusCompletion } from "./BonusCompletion";
import { useCharityORG } from "./Context";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import { Player } from "@player";

export function CharityORGStats(): React.ReactElement {
  const charityORG = useCharityORG();

  return (
    <>
      <Box display="flex">
        <Tooltip title={<Typography>The money in your Charities bank account.</Typography>}>
          <Typography>
            Bank : {formatMoney(charityORG.bank)},&nbsp;Spent: {formatMoney(charityORG.spent)}
            <br />
            Gain : {formatMoney(charityORG.moneyGainRate * 5)} / sec
            <br />
            Spend: {formatMoney(charityORG.moneySpendRate * 5)} / sec
            <br />
            Karma: {formatNumber(Player.karma)} ({formatNumber(charityORG.karmaGainRate * 5)}) / sec
            <br />
          </Typography>
        </Tooltip>
      </Box>

      <Box display="flex" whiteSpace="pre">
        <Tooltip
          title={
            <Typography>
              Your Prestige. More prestige allows you to recruite more members and affects your reputation gain.
            </Typography>
          }
        >
          <Typography>
            Prestige : {formatNumber(charityORG.prestige)} ({formatNumber(charityORG.prestigeGainRate * 5)} / sec)
          </Typography>
        </Tooltip>
      </Box>

      <Box display="flex" whiteSpace="pre">
        <Tooltip
          title={
            <Typography>
              Shows your Visibility. A low visibility will mean your effors have little effect, while a high one ensures
              the most impact.
            </Typography>
          }
        >
          <Typography>
            Visibility: {formatNumber(charityORG.visibility)} ({formatNumber(charityORG.visibilityGainRate * 5)} / sec)
          </Typography>
        </Tooltip>
      </Box>

      <Box display="flex" whiteSpace="pre">
        <Tooltip
          title={
            <Typography>
              Represents how scared the polulation is. A high terror ensures your actions will have little impact, while
              a low one ensures the best results.
            </Typography>
          }
        >
          <Typography>
            Terror : {formatNumber(charityORG.terror)} ({formatNumber(charityORG.terrorGainRate * 5)} / sec)
          </Typography>
        </Tooltip>
      </Box>

      <BonusTime charityORG={charityORG} />
      <BonusVisibility charityORG={charityORG} />
      <BonusTerror charityORG={charityORG} />
      <BonusCompletion charityORG={charityORG} />
    </>
  );
}
