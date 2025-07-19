import { Box, Button, Container, Paper, Typography } from "@mui/material";
import React from "react";
import type { Location } from "../../Locations/Location";
import { Settings } from "../../Settings/Settings";
import { formatHp, formatMoney, formatNumberNoSuffix, formatPercent, formatReputation } from "../../ui/formatNumber";
import { Player } from "@player";
import { calculateDamageAfterFailingInfiltration } from "../utils";
import {
  calculateInfiltratorsRepReward,
  calculateSellInformationCashReward,
  calculateTradeInformationRepReward,
} from "../formulas/victory";
import { Factions } from "../../Faction/Factions";
import { FactionName } from "../../Faction/Enums";
import { calculateMarketDemandMultiplier, calculateReward, MaxDifficultyForInfiltration } from "../formulas/game";
import { useRerender } from "../../ui/React/hooks";

interface IProps {
  location: Location;
  startingSecurityLevel: number;
  difficulty: number;
  maxLevel: number;
  start: () => void;
  cancel: () => void;
}

function arrowPart(color: string, length: number): JSX.Element {
  let arrow = "";
  if (length <= 0) length = 0;
  else if (length > 13) length = 13;
  else {
    length--;
    arrow = ">";
  }
  return (
    <span style={{ color: color }}>
      {"=".repeat(length)}
      {arrow}
      {" ".repeat(13 - arrow.length - length)}
    </span>
  );
}

function coloredArrow(difficulty: number): JSX.Element {
  const cappedDifficulty = Math.min(difficulty, MaxDifficultyForInfiltration);
  if (cappedDifficulty === 0) {
    return (
      <span style={{ color: "white" }}>
        {">"}
        {" ".repeat(51)}
      </span>
    );
  } else {
    return (
      <>
        {arrowPart(Settings.theme.primary, cappedDifficulty * 13)}
        {arrowPart(Settings.theme.warning, (cappedDifficulty - 1) * 13)}
        {arrowPart(Settings.theme.warning, (cappedDifficulty - 2) * 13)}
        {arrowPart(Settings.theme.error, (cappedDifficulty - 3) * 26)}
      </>
    );
  }
}

export function Intro({
  location,
  startingSecurityLevel,
  difficulty,
  maxLevel,
  start,
  cancel,
}: IProps): React.ReactElement {
  useRerender(1000);

  const timestampNow = Date.now();

  const reward = calculateReward(startingSecurityLevel);
  const repGain = calculateTradeInformationRepReward(reward, maxLevel, startingSecurityLevel, timestampNow);
  const moneyGain = calculateSellInformationCashReward(reward, maxLevel, startingSecurityLevel, timestampNow);
  const soaRepGain = calculateInfiltratorsRepReward(
    Factions[FactionName.ShadowsOfAnarchy],
    maxLevel,
    startingSecurityLevel,
    timestampNow,
  );
  const marketRateMultiplier = calculateMarketDemandMultiplier(timestampNow, false);

  let warningMessage;
  if (difficulty >= MaxDifficultyForInfiltration) {
    warningMessage = (
      <Typography color={Settings.theme.error} textAlign="center">
        This location is too secure for your current abilities. You cannot infiltrate it.
      </Typography>
    );
  } else if (difficulty >= 1.5) {
    warningMessage = (
      <Typography color={difficulty > 2 ? Settings.theme.error : Settings.theme.warning} textAlign="center">
        This location is too heavily guarded for your current stats. You should train more or find an easier location.
      </Typography>
    );
  }

  return (
    <Container sx={{ alignItems: "center" }}>
      <Paper sx={{ p: 1, mb: 1, display: "grid", justifyItems: "center" }}>
        <Typography variant="h4">
          Infiltrating <b>{location.name}</b>
        </Typography>

        <Typography variant="h6">
          <b>HP: {`${formatHp(Player.hp.current)} / ${formatHp(Player.hp.max)}`}</b>
        </Typography>
        <Typography variant="h6">
          <b>Lose {formatHp(calculateDamageAfterFailingInfiltration(startingSecurityLevel))} HP for each failure</b>
        </Typography>

        <Typography variant="h6">
          <b>Maximum clearance level: </b>
          {maxLevel}
        </Typography>

        <br />
        <Typography variant="h6">
          <b>Reward: </b>
        </Typography>
        <Typography component="div">
          <ul style={{ marginTop: 0 }}>
            <li>Reputation: {formatReputation(repGain)}</li>
            <li>Money: {formatMoney(moneyGain)}</li>
            {Player.factions.includes(FactionName.ShadowsOfAnarchy) && (
              <li>SoA reputation: {formatReputation(soaRepGain)}</li>
            )}
            <li>
              Market demand:{" "}
              {marketRateMultiplier >= 0
                ? formatPercent(marketRateMultiplier, marketRateMultiplier !== 100 ? 3 : 0)
                : `0% (${formatPercent(marketRateMultiplier)})`}
            </li>
          </ul>
        </Typography>

        <Typography
          variant="h6"
          sx={{
            color:
              difficulty > 2 ? Settings.theme.error : difficulty > 1 ? Settings.theme.warning : Settings.theme.primary,
            display: "flex",
            alignItems: "center",
          }}
        >
          <b>Difficulty:&nbsp;</b>
          {formatNumberNoSuffix(difficulty * (100 / MaxDifficultyForInfiltration))} / 100
        </Typography>
        <Typography sx={{ lineHeight: "1em", whiteSpace: "pre" }}>[{coloredArrow(difficulty)}]</Typography>
        <Typography
          sx={{ lineHeight: "1em", whiteSpace: "pre" }}
        >{`▲            ▲            ▲            ▲           ▲`}</Typography>
        <Typography
          sx={{ lineHeight: "1em", whiteSpace: "pre" }}
        >{`  Trivial       Normal        Hard        Brutal    Impossible`}</Typography>

        {warningMessage && (
          <>
            <br />
            {warningMessage}
          </>
        )}
      </Paper>

      <Paper sx={{ p: 1, display: "grid", justifyItems: "center" }}>
        <Typography sx={{ width: "75%", textAlign: "center" }}>
          <b>Infiltration</b> is a series of short minigames that get progressively harder. You take damage for failing
          them. Reaching the maximum level rewards you with intel that you can trade for money or reputation.
          <br />
          <br />
          <b>Gameplay:</b>
        </Typography>
        <ul>
          <Typography>
            <li>
              The minigames you play are randomly selected.
              <br />
              It might take you a few tries to get used to them.
            </li>
            <li>No game requires use of the mouse.</li>
            <li>
              <b>Spacebar</b> is the default action/confirm button.
            </li>
            <li>
              The <b>arrow keys</b> and <b>WASD</b> can be used interchangeably.
            </li>
            <li>Sometimes the rest of the keyboard is used.</li>
          </Typography>
        </ul>

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", width: "100%" }}>
          <Button onClick={start} disabled={difficulty >= MaxDifficultyForInfiltration}>
            Start
          </Button>
          <Button onClick={cancel}>Cancel</Button>
        </Box>
      </Paper>
    </Container>
  );
}
