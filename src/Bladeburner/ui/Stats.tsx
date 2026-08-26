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
import WarningIcon from "@mui/icons-material/Warning";
import { Settings } from "../../Settings/Settings";

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

  let populationTextColor = Settings.theme.primary;
  let populationWarning: string | null = null;
  /**
   * The initial population is randomized between 1e9 and 1.5e9. If it drops below 1e9, the success chance is reduced.
   * We use 2 thresholds:
   * - 8e8: The success chance is reduced by ~15%. On average, random events usually do not reduce the population to
   * this low number.
   * - 1e8: The success chance is reduced by ~80%. If the population is reduced to this number, it's very likely that
   * the player is performing actions that decrease the population by percentage.
   */
  if (bladeburner.getCurrentCity().pop <= 1e8) {
    populationTextColor = Settings.theme.error;
    populationWarning = "极低";
  } else if (bladeburner.getCurrentCity().pop < 8e8) {
    populationTextColor = Settings.theme.warning;
    populationWarning = "偏低";
  }

  let chaosTextColor = Settings.theme.primary;
  let chaosWarning: string | null = null;
  // When chaos is 1e4, the success chance is reduced by ~99%.
  if (bladeburner.getCurrentCity().chaos >= 1e4) {
    chaosTextColor = Settings.theme.error;
    chaosWarning = "极高";
  } else if (bladeburner.getCurrentCity().chaos >= BladeburnerConstants.ChaosThreshold) {
    chaosTextColor = Settings.theme.warning;
    chaosWarning = "偏高";
  }

  return (
    <Paper sx={{ p: 1, overflowY: "auto", overflowX: "hidden", wordBreak: "break-all" }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, maxHeight: "60vh" }}>
        <Box sx={{ alignSelf: "flex-start", width: "100%" }}>
          <Button onClick={() => setTravelOpen(true)} sx={{ width: "50%" }}>
            旅行
          </Button>
          <Tooltip title={!inFaction ? <Typography>需要声望 25。</Typography> : ""}>
            <span>
              <Button disabled={!inFaction} onClick={openFaction} sx={{ width: "50%" }}>
                派系
              </Button>
            </span>
          </Tooltip>
          <TravelModal open={travelOpen} onClose={() => setTravelOpen(false)} bladeburner={bladeburner} />
        </Box>
        <Box display="flex">
          <Tooltip title={<Typography>你在Bladeburner部门中的声望。</Typography>}>
            <Typography>声望：{formatBigNumber(bladeburner.rank)}</Typography>
          </Tooltip>
        </Box>
        <br />
        <Box display="flex">
          <Tooltip
            title={
              <Typography>
                执行行动会消耗体力。
                <br />
                <br />
                你的最大体力主要由敏捷属性决定。
                <br />
                <br />
                体力恢复速率由敏捷和最大体力共同决定。最大体力越高，恢复速率越快。
                <br />
                <br />
                当体力低于最大值的50%时，就会开始对合约/行动的成功率产生负面影响。该惩罚显示在概览面板中。若惩罚为15%，则表示你的成功率将乘以85%（100
                - 15）。
                <br />
                <br />
                训练、技能和强化升级也能提高你的最大体力和体力恢复速率。
              </Typography>
            }
          >
            <Typography>
              体力：{formatBigNumber(bladeburner.stamina)} / {formatBigNumber(bladeburner.maxStamina)}
            </Typography>
          </Tooltip>
        </Box>
        <Typography>
          体力惩罚：{formatNumberNoSuffix((1 - bladeburner.calculateStaminaPenalty()) * 100, 1)}%
        </Typography>
        <br />
        <Typography>团队规模：{formatNumberNoSuffix(bladeburner.teamSize, 0)}</Typography>
        <Typography>损失的团队成员：{formatNumberNoSuffix(bladeburner.teamLost, 0)}</Typography>
        <br />
        <Typography>住院次数：{bladeburner.numHosp}</Typography>
        <Typography>
          住院花费：<Money money={bladeburner.moneyLost} />
        </Typography>
        <br />
        <Typography>当前城市：{bladeburner.city}</Typography>
        <Box display="flex">
          <Tooltip
            title={
              <Typography component="div">
                <Typography>
                  这是Bladeburner部门对当前城市中合成人数量的估计。准确的数量估计有助于提高成功率估计。
                </Typography>
                <br />
                <Typography>
                  请谨慎对待按百分比减少合成人数量的行动。这类行动会在短时间内杀死大量合成人。人口过低会降低大多数行动的成功率。若人口过少，你将需要迁往其他城市。
                </Typography>
                {populationWarning && (
                  <>
                    <br />
                    情报机构通知我们，合成人数量{populationWarning}。
                  </>
                )}
              </Typography>
            }
          >
            <Typography color={populationTextColor} display="flex">
              合成人数量估计：{formatPopulation(bladeburner.getCurrentCity().popEst)}
              {populationWarning && <WarningIcon sx={{ marginLeft: "10px" }} />}
            </Typography>
          </Tooltip>
        </Box>
        <Box display="flex">
          <Tooltip
            title={
              <Typography>
                这是Bladeburner部门对当前城市中合成人社区数量的估计。
              </Typography>
            }
          >
            <Typography>合成人社区：{formatNumberNoSuffix(bladeburner.getCurrentCity().comms, 0)}</Typography>
          </Tooltip>
        </Box>
        <Box display="flex">
          <Tooltip
            title={
              <Typography component="div">
                <Typography>
                  人类与合成人之间的紧张与冲突会推高城市的混乱度。混乱度过高会使合约和行动更加困难。
                </Typography>
                {chaosWarning && (
                  <>
                    <br />
                    当前混乱度{chaosWarning}。
                  </>
                )}
              </Typography>
            }
          >
            <Typography color={chaosTextColor} display="flex">
              城市混乱度：{formatBigNumber(bladeburner.getCurrentCity().chaos)}
              {chaosWarning && <WarningIcon sx={{ marginLeft: "10px" }} />}
            </Typography>
          </Tooltip>
        </Box>
        <br />
        {bladeburner.storedCycles / BladeburnerConstants.CyclesPerSecond > 3 && (
          <>
            <Box display="flex">
              <Tooltip
                title={
                  <Typography>
                    离线或游戏未激活时（例如标签页被浏览器限流），你可以获得奖励时间。奖励时间能让Bladeburner机制更快推进，最高可达正常速度的5倍。
                  </Typography>
                }
              >
                <Typography>
                  奖励时间：{" "}
                  {convertTimeMsToTimeElapsedString(
                    (bladeburner.storedCycles / BladeburnerConstants.CyclesPerSecond) * 1000,
                  )}
                </Typography>
              </Tooltip>
            </Box>
            <br />
          </>
        )}
        <Typography>技能点：{formatBigNumber(bladeburner.skillPoints)}</Typography>
        <br />
        <Typography>
          强化·成功率加成：{formatNumberNoSuffix(Player.mults.bladeburner_success_chance * 100, 1)}%
          <br />
          强化·最大体力加成：{formatNumberNoSuffix(Player.mults.bladeburner_max_stamina * 100, 1)}%
          <br />
          强化·体力恢复加成：{formatNumberNoSuffix(Player.mults.bladeburner_stamina_gain * 100, 1)}%
          <br />
          强化·现场分析效果加成：{formatNumberNoSuffix(Player.mults.bladeburner_analysis * 100, 1)}%
        </Typography>
      </Box>
    </Paper>
  );
}
