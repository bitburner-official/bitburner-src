import { Box, Button, Container, Paper, Typography } from "@mui/material";
import React, { useCallback } from "react";
import { Settings } from "../../Settings/Settings";
import { formatHp, formatMoney, formatNumberNoSuffix, formatPercent, formatReputation } from "../../ui/formatNumber";
import { Player } from "@player";
import type { Infiltration } from "../Infiltration";
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
  state: Infiltration;
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
      <span style={{ color: Settings.theme.success }}>
        {">"}
        {" ".repeat(51)}
      </span>
    );
  } else {
    return (
      <>
        {arrowPart(Settings.theme.success, cappedDifficulty * 13)}
        {arrowPart(Settings.theme.warning, (cappedDifficulty - 1) * 13)}
        {arrowPart(Settings.theme.warning, (cappedDifficulty - 2) * 13)}
        {arrowPart(Settings.theme.error, (cappedDifficulty - 3) * 26)}
      </>
    );
  }
}

export function Intro({ state }: IProps): React.ReactElement {
  // We need to rerender ourselves based on things that change that aren't
  // reflected in Infiltration itself.
  useRerender(1000);

  const timestampNow = Date.now();

  const reward = calculateReward(state.startingSecurityLevel);
  const repGain = calculateTradeInformationRepReward(reward, state.maxLevel, state.startingSecurityLevel, timestampNow);
  const moneyGain = calculateSellInformationCashReward(
    reward,
    state.maxLevel,
    state.startingSecurityLevel,
    timestampNow,
  );
  const soaRepGain = calculateInfiltratorsRepReward(
    Factions[FactionName.ShadowsOfAnarchy],
    state.maxLevel,
    state.startingSecurityLevel,
    timestampNow,
  );
  const marketRateMultiplier = calculateMarketDemandMultiplier(timestampNow, false);

  const start = useCallback(() => state.startInfiltration(), [state]);
  const cancel = useCallback(() => state.cancel(), [state]);

  let warningMessage;
  if (state.startingDifficulty >= MaxDifficultyForInfiltration) {
    warningMessage = (
      <Typography color={Settings.theme.error} textAlign="center">
        该地点对你的当前能力而言过于森严，你无法潜入。
      </Typography>
    );
  } else if (state.startingDifficulty >= 1.5) {
    warningMessage = (
      <Typography
        color={state.startingDifficulty > 2 ? Settings.theme.error : Settings.theme.warning}
        textAlign="center"
      >
        该地点的守卫对你的当前属性而言过于严密。你应该多加训练，或寻找一个更容易的目标。
      </Typography>
    );
  }

  return (
    <Container sx={{ alignItems: "center" }}>
      <Paper sx={{ p: 1, mb: 1, display: "grid", justifyItems: "center" }}>
        <Typography variant="h4">
          正在潜入 <b>{state.location.name}</b>
        </Typography>

        <Typography variant="h6">
          <b>HP：{`${formatHp(Player.hp.current)} / ${formatHp(Player.hp.max)}`}</b>
        </Typography>
        <Typography variant="h6">
          <b>
            每次失败将损失 {formatHp(calculateDamageAfterFailingInfiltration(state.startingSecurityLevel))} 点 HP
          </b>
        </Typography>

        <Typography variant="h6">
          <b>最大潜入层数：</b>
          {state.maxLevel}
        </Typography>

        <br />
        <Typography variant="h6">
          <b>奖励：</b>
        </Typography>
        <Typography component="div">
          <ul style={{ marginTop: 0 }}>
            <li>声望：{formatReputation(repGain)}</li>
            <li>资金：{formatMoney(moneyGain)}</li>
            {Player.factions.includes(FactionName.ShadowsOfAnarchy) && (
              <li>SoA 声望：{formatReputation(soaRepGain)}</li>
            )}
            <li>
              市场需求：{" "}
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
              state.startingDifficulty > 2
                ? Settings.theme.error
                : state.startingDifficulty > 1
                ? Settings.theme.warning
                : Settings.theme.primary,
            display: "flex",
            alignItems: "center",
          }}
        >
          <b>难度：&nbsp;</b>
          {formatNumberNoSuffix(state.startingDifficulty * (100 / MaxDifficultyForInfiltration))} / 100
        </Typography>
        <Typography sx={{ lineHeight: "1em", whiteSpace: "pre" }}>
          [{coloredArrow(state.startingDifficulty)}]
        </Typography>
        <Typography
          sx={{ lineHeight: "1em", whiteSpace: "pre" }}
        >{`▲            ▲            ▲            ▲           ▲`}</Typography>
        <Typography
          sx={{ lineHeight: "1em", whiteSpace: "pre" }}
        >{`  轻松          普通          困难          残酷       不可能`}</Typography>

        {warningMessage && (
          <>
            <br />
            {warningMessage}
          </>
        )}
      </Paper>

      <Paper sx={{ p: 1, display: "grid", justifyItems: "center" }}>
        <Typography sx={{ width: "75%", textAlign: "center" }}>
          <b>潜入</b>是由一系列越来越难的小游戏组成的。失败会让你受到伤害。到达最大层数后，你将获得情报奖励，可以用来换取资金或声望。
          <br />
          <br />
          <b>玩法：</b>
        </Typography>
        <ul>
          <Typography>
            <li>
              你玩到的小游戏是随机选择的。
              <br />
              可能需要尝试几次才能上手。
            </li>
            <li>所有游戏都无需使用鼠标。</li>
            <li>
              <b>空格键</b>是默认的行动/确认按键。
            </li>
            <li>
              <b>方向键</b>与 <b>WASD</b> 可以互换使用。
            </li>
            <li>有时也会用到键盘上的其他按键。</li>
          </Typography>
        </ul>

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", width: "100%" }}>
          <Button onClick={start} disabled={state.startingDifficulty >= MaxDifficultyForInfiltration}>
            开始
          </Button>
          <Button onClick={cancel}>取消</Button>
        </Box>
      </Paper>
    </Container>
  );
}
