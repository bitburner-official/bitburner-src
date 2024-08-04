import type { Bladeburner } from "../Bladeburner";

import React, { useState } from "react";
import { Box, Button, Paper, Tooltip, Typography } from "@mui/material";
import { Player } from "@player";
import { FactionName } from "@enums";
import { convertTimeMsToTimeElapsedString } from "../../utils/StringHelperFunctions";
import { BladeburnerConstants } from "../data/Constants";
import { Money } from "../../ui/React/Money";
import { useRerender } from "../../ui/React/hooks";
import { formatNumberNoSuffix, formatPopulation, formatBigNumber } from "../../ui/formatNumber";
import { Factions } from "../../Faction/Factions";
import { Router } from "../../ui/GameRoot";
import { Page } from "../../ui/Router";
import { TravelModal } from "./TravelModal";

interface StatsProps {
  bladeburner: Bladeburner;
}

export function Stats({ bladeburner }: StatsProps): React.ReactElement {
  const [travelOpen, setTravelOpen] = useState(false);
  useRerender(1000);

  const inFaction = bladeburner.rank >= BladeburnerConstants.RankNeededForFaction;

  function openFaction(): void {
    const success = bladeburner.joinFaction();
    if (success) Router.toPage(Page.Faction, { faction: Factions[FactionName.Bladeburners] });
  }

  return (
    <Paper sx={{ p: 1, overflowY: "auto", overflowX: "hidden", wordBreak: "break-all" }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, maxHeight: "60vh" }}>
        <Box sx={{ alignSelf: "flex-start", width: "100%" }}>
          <Button onClick={() => setTravelOpen(true)} sx={{ width: "50%" }}>
            Travel
          </Button>
          <Tooltip title={!inFaction ? <Typography>Rank 25 required.</Typography> : ""}>
            <span>
              <Button disabled={!inFaction} onClick={openFaction} sx={{ width: "50%" }}>
                Faction
              </Button>
            </span>
          </Tooltip>
          <TravelModal open={travelOpen} onClose={() => setTravelOpen(false)} bladeburner={bladeburner} />
        </Box>
        <Box display="flex">
          <Tooltip title={<Typography>Your rank within the Bladeburner division.</Typography>}>
            <Typography>Rank: {formatBigNumber(bladeburner.rank)}</Typography>
          </Tooltip>
        </Box>
        <br />
        <Box display="flex">
          <Tooltip
            title={
              <Typography>
                Performing actions will use up your stamina.
                <br />
                <br />
                Your max stamina is determined primarily by your agility stat.
                <br />
                <br />
                Your stamina gain rate is determined by both your agility and your max stamina. Higher max stamina leads
                to a higher gain rate.
                <br />
                <br />
                Once your stamina falls below 50% of its max value, it begins to negatively affect the success rate of
                your contracts/operations. This penalty is shown in the overview panel. If the penalty is 15%, then this
                means your success rate would be multiplied by 85% (100 - 15).
                <br />
                <br />
                Your max stamina and stamina gain rate can also be increased by training, or through skills and
                Augmentation upgrades.
              </Typography>
            }
          >
            <Typography>
              Stamina: {formatBigNumber(bladeburner.stamina)} / {formatBigNumber(bladeburner.maxStamina)}
            </Typography>
          </Tooltip>
        </Box>
        <Typography>
          Stamina Penalty: {formatNumberNoSuffix((1 - bladeburner.calculateStaminaPenalty()) * 100, 1)}%
        </Typography>
        <br />
        <Typography>Team Size: {formatNumberNoSuffix(bladeburner.teamSize, 0)}</Typography>
        <Typography>Team Members Lost: {formatNumberNoSuffix(bladeburner.teamLost, 0)}</Typography>
        <br />
        <Typography>Num Times Hospitalized: {bladeburner.numHosp}</Typography>
        <Typography>
          Money Lost From Hospitalizations: <Money money={bladeburner.moneyLost} />
        </Typography>
        <br />
        <Typography>Current City: {bladeburner.city}</Typography>
        <Box display="flex">
          <Tooltip
            title={
              <Typography>
                This is your Bladeburner division's estimate of how many Synthoids exist in your current city. An
                accurate population count increases success rate estimates.
              </Typography>
            }
          >
            <Typography>Est. Synthoid Population: {formatPopulation(bladeburner.getCurrentCity().popEst)}</Typography>
          </Tooltip>
        </Box>
        <Box display="flex">
          <Tooltip
            title={
              <Typography>
                This is your Bladeburner division's estimate of how many Synthoid communities exist in your current
                city.
              </Typography>
            }
          >
            <Typography>Synthoid Communities: {formatNumberNoSuffix(bladeburner.getCurrentCity().comms, 0)}</Typography>
          </Tooltip>
        </Box>
        <Box display="flex">
          <Tooltip
            title={
              <Typography>
                The city's chaos level due to tensions and conflicts between humans and Synthoids. Having too high of a
                chaos level can make contracts and operations harder.
              </Typography>
            }
          >
            <Typography>City Chaos: {formatBigNumber(bladeburner.getCurrentCity().chaos)}</Typography>
          </Tooltip>
        </Box>
        <br />
        {bladeburner.storedCycles / BladeburnerConstants.CyclesPerSecond > 3 && (
          <>
            <Box display="flex">
              <Tooltip
                title={
                  <Typography>
                    You gain bonus time while offline or when the game is inactive (e.g. when the tab is throttled by
                    browser). Bonus time makes the Bladeburner mechanic progress faster, up to 5x the normal speed.
                  </Typography>
                }
              >
                <Typography>
                  Bonus time:{" "}
                  {convertTimeMsToTimeElapsedString(
                    (bladeburner.storedCycles / BladeburnerConstants.CyclesPerSecond) * 1000,
                  )}
                </Typography>
              </Tooltip>
            </Box>
            <br />
          </>
        )}
        <Typography>Skill Points: {formatBigNumber(bladeburner.skillPoints)}</Typography>
        <br />
        <Typography>
          Aug. Success Chance mult: {formatNumberNoSuffix(Player.mults.bladeburner_success_chance * 100, 1)}%
          <br />
          Aug. Max Stamina mult: {formatNumberNoSuffix(Player.mults.bladeburner_max_stamina * 100, 1)}%
          <br />
          Aug. Stamina Gain mult: {formatNumberNoSuffix(Player.mults.bladeburner_stamina_gain * 100, 1)}%
          <br />
          Aug. Field Analysis mult: {formatNumberNoSuffix(Player.mults.bladeburner_analysis * 100, 1)}%
        </Typography>
      </Box>
    </Paper>
  );
}
