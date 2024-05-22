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
        <strong>Skill Points: {formatBigNumber(bladeburner.skillPoints)}</strong>
      </Typography>
      <Typography>
        You will gain one skill point every {BladeburnerConstants.RanksPerSkillPoint} ranks.
        <br />
        Note that when upgrading a skill, the benefit for that skill is additive. However, the effects of different
        skills with each other is multiplicative.
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
