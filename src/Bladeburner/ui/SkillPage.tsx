import type { Bladeburner } from "../Bladeburner";

import React from "react";
import { BladeburnerConstants } from "../data/Constants";
import { formatBigNumber } from "../../ui/formatNumber";
import { Typography } from "@mui/material";
import { useRerender } from "../../ui/React/hooks";
import { SkillElem } from "./SkillElem";
import { Skills } from "../data/Skills";

interface SkillPageProps {
  bladeburner: Bladeburner;
}

export function SkillPage({ bladeburner }: SkillPageProps): React.ReactElement {
  const rerender = useRerender();
  const multDisplays = bladeburner.getSkillMultsDisplay();

  return (
    <>
      <Typography>
        <strong>技能点：{formatBigNumber(bladeburner.skillPoints)}</strong>
      </Typography>
      <Typography>
        每积累 {BladeburnerConstants.RanksPerSkillPoint} 点声望可获得 1 点技能点。
        <br />
        注意：升级同一技能时，其收益按加法叠加；而不同技能之间的效果则按乘法叠加。
      </Typography>
      {multDisplays.map((multDisplay, i) => (
        <Typography key={i}>{multDisplay}</Typography>
      ))}
      {Object.values(Skills).map((skill) => (
        <SkillElem key={skill.name} bladeburner={bladeburner} skill={skill} onUpgrade={rerender} />
      ))}
    </>
  );
}
