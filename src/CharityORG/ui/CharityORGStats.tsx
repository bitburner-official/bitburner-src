/**
 * React Component for the stats related to the gang, like total respect and
 * money per second.
 */
import React from "react";
import { formatNumber, formatMoney } from "../../ui/formatNumber";
import { BonusTime } from "./BonusTime";
import { EffectTerror } from "./EffectTerror";
import { EffectVisibility } from "./EffectVisibility";
import { EffectAttack } from "./EffectAttack";
import { EffectTask } from "./EffectTask";
import { EffectRandom } from "./EffectRandom";
import { BonusCompletion } from "./BonusCompletion";
import { ModifierList } from "./ModifierList";
import { useCharityORG } from "./Context";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import { Player } from "@player";
import { forEach } from "lodash";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { useRerender } from "../../ui/React/hooks";

export function CharityORGStats(): React.ReactElement {
  const charityORG = useCharityORG();
  const [value, setValue] = React.useState(0);
  function handleChange(event: React.SyntheticEvent, tab: number): void {
    setValue(tab);
  }

  useRerender(200);
  return (
    <>
      <Box display="grid" width="100%" sx={{ gridTemplateColumns: "1fr 2fr" }}>
        <span>
          <Box display="grid" whiteSpace="pre">
            <Tooltip
              title={<Typography>The money in your Charities bank account and the money you've spent.</Typography>}
            >
              <Typography>
                Bank : {formatMoney(charityORG.bank)},&nbsp;Spent: {formatMoney(charityORG.spent)}
              </Typography>
            </Tooltip>
            <Tooltip title={<Typography>The money you are gaining per second.</Typography>}>
              <Typography>Gain : {formatMoney(charityORG.moneyGainRate * 5)} / sec</Typography>
            </Tooltip>
            <Tooltip title={<Typography>The money you are spending per second.</Typography>}>
              <Typography>Spend: {formatMoney(charityORG.moneySpendRate * 5)} / sec</Typography>
            </Tooltip>
            <Tooltip title={<Typography>The money you are embezzling per second.</Typography>}>
              <Typography>Embez: {formatMoney(charityORG.embezzleGainRate * 5)} / sec</Typography>
            </Tooltip>
            <Tooltip title={<Typography>The karma you are gaining per second.</Typography>}>
              <Typography>
                Karma: {formatNumber(Player.karma)} ({formatNumber(charityORG.karmaGainRate * 5)} / sec)
              </Typography>
            </Tooltip>
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
            <Tooltip
              title={
                <Typography>
                  Shows your Visibility. A low visibility will mean your effors have little effect, while a high one
                  ensures the most impact.
                </Typography>
              }
            >
              <Typography>
                Visibility: {formatNumber(charityORG.visibility)} ({formatNumber(charityORG.visibilityGainRate * 5)} /
                sec)
              </Typography>
            </Tooltip>
            <Tooltip
              title={
                <Typography>
                  Represents how scared the polulation is. A high terror ensures your actions will have little impact,
                  while a low one ensures the best results.
                </Typography>
              }
            >
              <Typography>
                Terror : {formatNumber(charityORG.terror)} ({formatNumber(charityORG.terrorGainRate * 5)} / sec)
              </Typography>
            </Tooltip>
          </Box>

          <BonusTime charityORG={charityORG} />
          <EffectVisibility charityORG={charityORG} />
          <EffectTerror charityORG={charityORG} />
          <EffectAttack charityORG={charityORG} />
          <EffectTask charityORG={charityORG} />
          <EffectRandom charityORG={charityORG} />
          <BonusCompletion charityORG={charityORG} />
          <ModifierList charityORG={charityORG} />
        </span>
        <span>
          <Tabs
            variant="fullWidth"
            value={value}
            onChange={handleChange}
            sx={{ minWidth: "fit-content", maxWidth: "45%" }}
          >
            <Tab label="General Messages" />
            <Tab label="Found Items/Effects" />
            <Tab label="Karma Messages" />
            <Tab label="Item Use Messages" />
          </Tabs>
          {value === 0 && (
            <Box sx={{ height: 340, overflow: "scroll", border: "1px solid", borderBlockColor: "yellow" }}>
              {forEach(charityORG.messages).map((n, i) => (
                <Typography key={i}>{n.message}</Typography>
              ))}
            </Box>
          )}
          {value === 1 && (
            <Box sx={{ height: 340, overflow: "scroll", border: "1px solid", borderBlockColor: "yellow" }}>
              {forEach(charityORG.itemMessages).map((n, i) => (
                <Typography key={i}>{n.message}</Typography>
              ))}
            </Box>
          )}
          {value === 2 && (
            <Box sx={{ height: 340, overflow: "scroll", border: "1px solid", borderBlockColor: "yellow" }}>
              {forEach(charityORG.karmaMessages).map((n, i) => (
                <Typography key={i}>{n.message}</Typography>
              ))}
            </Box>
          )}
          {value === 3 && (
            <Box sx={{ height: 340, overflow: "scroll", border: "1px solid", borderBlockColor: "yellow" }}>
              {forEach(charityORG.itemUseMessages).map((n, i) => (
                <Typography key={i}>{n.message}</Typography>
              ))}
            </Box>
          )}
        </span>
      </Box>
    </>
  );
}
