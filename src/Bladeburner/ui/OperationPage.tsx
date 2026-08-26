import type { Bladeburner } from "../Bladeburner";

import React from "react";
import { OperationElem } from "./OperationElem";
import { Typography } from "@mui/material";

interface OperationPageProps {
  bladeburner: Bladeburner;
}

export function OperationPage({ bladeburner }: OperationPageProps): React.ReactElement {
  const operations = Object.values(bladeburner.operations);
  return (
    <>
      <Typography>
        为Bladeburner部门执行行动。行动失败会降低你的Bladeburner声望，还会让你损失生命值，甚至可能导致住院。总体而言，行动比合约更困难、惩罚更重，但回报也更丰厚。
        <br />
        <br />
        行动会影响当前城市的混乱度和合成人数量。具体效果因行动而异。
        <br />
        <br />
        执行行动时可以带上团队，但你必须先招募团队成员。团队规模越大，成功几率越高。
        <br />
        <br />
        成功完成行动可以解锁更高等级的行动。更高等级的行动难度更大，但给予更多声望和经验。
      </Typography>
      {operations.map((operation) => (
        <OperationElem key={operation.name} bladeburner={bladeburner} action={operation} />
      ))}
    </>
  );
}
