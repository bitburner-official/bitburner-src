/**
 * React Component for the stats related to the gang, like total respect and
 * money per second.
 */
import React from "react";
import { Factions } from "../../Faction/Factions";

import { formatNumberNoSuffix, formatRespect, formatWanted } from "../../ui/formatNumber";
import { MoneyRate } from "../../ui/React/MoneyRate";
import { Reputation } from "../../ui/React/Reputation";
import { AllGangs } from "../AllGangs";
import { BonusTime } from "./BonusTime";
import { useGang } from "./Context";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import { GangConstants } from "../data/Constants";

export function GangStats(): React.ReactElement {
  const gang = useGang();
  const territoryMult = AllGangs[gang.facName].territory * 100;
  let territoryStr;
  if (territoryMult <= 0) {
    territoryStr = formatNumberNoSuffix(0, 2);
  } else if (territoryMult >= 100) {
    territoryStr = formatNumberNoSuffix(100, 2);
  } else {
    territoryStr = formatNumberNoSuffix(territoryMult, 2);
  }
  const hasEnoughBonusTime = gang.storedCycles > GangConstants.maxCyclesToProcess;
  const bonusCyclesInOneSecond = 5 * GangConstants.maxCyclesToProcess;
  const respectGainRateInBonusTime = hasEnoughBonusTime
    ? `[实际收益：${formatRespect(gang.respectGainRate * bonusCyclesInOneSecond)} / 秒]`
    : "";
  const wantedGainRateInBonusTime = hasEnoughBonusTime
    ? `[实际收益：${formatWanted(gang.wantedGainRate * bonusCyclesInOneSecond)} / 秒]`
    : "";
  const moneyGainRateInBonusTime = hasEnoughBonusTime ? (
    <>
      [实际收益：<MoneyRate money={gang.moneyGainRate * bonusCyclesInOneSecond} />]
    </>
  ) : (
    ""
  );

  return (
    <>
      <Box display="flex">
        <Tooltip
          title={
            <Typography>
              表示你的帮派从其他帮派和犯罪组织那里获得的尊重数量。你的尊重会影响帮派成员能赚取的资金数额，也决定了你在帮派对应派系中能获得多少声望。
            </Typography>
          }
        >
          <Typography>
            尊重： {formatRespect(gang.respect)} ({formatRespect(5 * gang.respectGainRate)} / 秒){" "}
            {respectGainRateInBonusTime}
          </Typography>
        </Tooltip>
      </Box>

      <Box display="flex">
        <Tooltip
          title={
            <Typography>
              表示执法部门对你的帮派的通缉程度。你的帮派通缉等级越高，帮派成员赚钱和赚取尊重就越困难。注意，最低通缉等级为 1。
            </Typography>
          }
        >
          <Typography>
            通缉等级： {formatWanted(gang.wanted)} ({formatWanted(5 * gang.wantedGainRate)} / 秒){" "}
            {wantedGainRateInBonusTime}
          </Typography>
        </Tooltip>
      </Box>

      <Box display="flex">
        <Tooltip title={<Typography>因通缉等级而对尊重与资金获取速率造成的惩罚</Typography>}>
          <Typography>
            通缉等级惩罚： -{formatNumberNoSuffix((1 - gang.getWantedPenalty()) * 100, 2)}%
          </Typography>
        </Tooltip>
      </Box>

      <Typography>
        资金获取速率： <MoneyRate money={5 * gang.moneyGainRate} /> {moneyGainRateInBonusTime}
      </Typography>

      <Box display="flex">
        <Tooltip title={<Typography>你的帮派所控制地盘占总地盘的百分比</Typography>}>
          <Typography>地盘： {territoryStr}%</Typography>
        </Tooltip>
      </Box>
      <Typography>
        派系声望： <Reputation reputation={Factions[gang.facName].playerReputation} />
      </Typography>

      <BonusTime gang={gang} />
    </>
  );
}
