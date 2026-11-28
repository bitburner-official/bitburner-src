import React, { useState } from "react";

import { Container, Button, Paper, Box, Tooltip, Switch, FormControlLabel, Typography } from "@mui/material";
import { Help } from "@mui/icons-material";

import { formatNumberNoSuffix, formatPercent } from "../../ui/formatNumber";

import { AllGangs, getClashWinChance } from "../AllGangs";

import { useGang } from "./Context";
import { TerritoryInfoModal } from "./TerritoryInfoModal";
import { PromptEvent } from "../../ui/React/PromptManager";

/** React Component for the territory subpage. */
export function TerritorySubpage(): React.ReactElement {
  const gang = useGang();
  const gangNames = Object.keys(AllGangs).filter((g) => g != gang.facName);
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <Container disableGutters maxWidth="md" sx={{ mx: 0 }}>
      <Typography>
        This page shows how much territory your Gang controls. This statistic is listed as a percentage, which
        represents how much of the total territory you control.
      </Typography>

      <Button onClick={() => setInfoOpen(true)} sx={{ my: 1 }}>
        <Help sx={{ mr: 1 }} />
        About Gang Territory
      </Button>

      <Box component={Paper} sx={{ p: 1, mb: 1 }}>
        <Typography variant="h6" sx={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
          {gang.facName} (Your gang)
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={gang.territoryWarfareEngaged}
              onChange={(event) => {
                let canWinAtLeastOneGang = false;
                for (const gangName of Object.keys(AllGangs)) {
                  if (gang.facName === gangName) {
                    continue;
                  }
                  if (getClashWinChance(gang.facName, gangName) >= 0.5) {
                    canWinAtLeastOneGang = true;
                    break;
                  }
                }
                /**
                 * tooLowGangPower is a special check. Before the first tick of territory clash, the power of all gangs
                 * is 1, so the win chance of the player's gang against all gangs is 50%. If the player tries to enable
                 * the clash in this short time frame, canWinAtLeastOneGang is true, but their gang will still be
                 * crushed after the first clash tick.
                 */
                const tooLowGangPower = gang.getPower() < 2;
                const needToBeWarned = !canWinAtLeastOneGang || tooLowGangPower;
                /**
                 * Show a confirmation popup if the player tries to enable the territory clash when their gang is too
                 * weak and cannot win any other gangs.
                 */
                if (event.target.checked && needToBeWarned) {
                  let message = "Your gang is too weak.";
                  if (!canWinAtLeastOneGang) {
                    message += " Its win chances against all other gangs are below 50%.";
                  }
                  PromptEvent.emit({
                    txt:
                      message +
                      "\nOn average, you will always lose territory when being engaged in clashes.\n\nDo you really want to engage in territory clashes?",
                    resolve: (value: string | boolean) => {
                      if (value === true) {
                        gang.territoryWarfareEngaged = true;
                      }
                    },
                  });
                } else {
                  gang.territoryWarfareEngaged = event.target.checked;
                }
              }}
            />
          }
          label={
            <Tooltip
              title={
                <Typography>
                  Engaging in Territory Clashes sets your clash chance to 100%. Disengaging will cause your clash chance
                  to gradually decrease until it reaches 0%.
                </Typography>
              }
            >
              <Typography>Engage in Territory Clashes</Typography>
            </Tooltip>
          }
        />
        <br />
        <FormControlLabel
          control={
            <Switch
              checked={gang.notifyMemberDeath}
              onChange={(event) => (gang.notifyMemberDeath = event.target.checked)}
            />
          }
          label={
            <Tooltip
              title={
                <Typography>
                  If this is enabled, you will receive a pop-up notifying you whenever one of your Gang Members dies in
                  a territory clash.
                </Typography>
              }
            >
              <Typography>Notify about Gang Member Deaths</Typography>
            </Tooltip>
          }
        />

        <Typography>
          <b>Territory Clash Chance:</b> {formatPercent(gang.territoryClashChance, 3)} <br />
          <b>Power:</b> {formatNumberNoSuffix(AllGangs[gang.facName].power, 3)} <br />
          <b>Territory:</b> {formatTerritory(AllGangs[gang.facName].territory)}% <br />
        </Typography>
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
        {gangNames
          .sort((a, b) => {
            if (AllGangs[a].territory <= 0 && AllGangs[b].territory > 0) return 1;
            if (AllGangs[a].territory > 0 && AllGangs[b].territory <= 0) return -1;
            return 0;
          })
          .map((name) => (
            <OtherGangTerritory key={name} name={name} />
          ))}
      </Box>
      <TerritoryInfoModal open={infoOpen} onClose={() => setInfoOpen(false)} />
    </Container>
  );
}
function formatTerritory(n: number): string {
  const v = n * 100;
  const precision = 3;
  if (v <= 0) {
    return formatNumberNoSuffix(0, precision);
  } else if (v >= 100) {
    return formatNumberNoSuffix(100, precision);
  } else {
    return formatNumberNoSuffix(v, precision);
  }
}

interface ITerritoryProps {
  name: string;
}

function OtherGangTerritory(props: ITerritoryProps): React.ReactElement {
  const gang = useGang();
  const territory = AllGangs[props.name].territory;
  const opacity = territory > 0 ? 1 : 0.75;
  return (
    <Box component={Paper} sx={{ p: 1, opacity }}>
      <Typography variant="h6" sx={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
        {props.name}
      </Typography>
      <Typography>
        <b>Power:</b> {formatNumberNoSuffix(AllGangs[props.name].power, 3)} <br />
        <b>Territory:</b> {formatTerritory(territory)}% <br />
        <b>Clash Win Chance:</b> {formatPercent(getClashWinChance(gang.facName, props.name), 3)}
      </Typography>
    </Box>
  );
}
