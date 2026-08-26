import * as React from "react";
import { Gang } from "../Gang";
import { CONSTANTS } from "../../Constants";
import { convertTimeMsToTimeElapsedString } from "../../utils/StringHelperFunctions";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";

interface IProps {
  gang: Gang;
}

/** React Component for displaying the bonus time remaining. */
export function BonusTime(props: IProps): React.ReactElement {
  const CyclerPerSecond = 1000 / CONSTANTS.MilliPerCycle;
  if ((props.gang.storedCycles / CyclerPerSecond) * 1000 <= 5000) return <></>;
  const bonusMillis = (props.gang.storedCycles / CyclerPerSecond) * 1000;
  return (
    <Box display="flex">
      <Tooltip
        title={
          <Typography>
            当你离线或游戏处于非活动状态时（例如标签页被浏览器节流），你会获得奖励时间。奖励时间会让帮派机制的进程加快，最高可达正常速度的 25 倍。
          </Typography>
        }
      >
        <Typography>奖励时间： {convertTimeMsToTimeElapsedString(bonusMillis)}</Typography>
      </Tooltip>
    </Box>
  );
}
