import type { Bladeburner } from "../Bladeburner";

import React, { useMemo } from "react";
import { CopyableText } from "../../ui/React/CopyableText";
import { formatBigNumber } from "../../ui/formatNumber";
import { Box, IconButton, Paper, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { Skill } from "../Skill";

interface SkillElemProps {
  skill: Skill;
  bladeburner: Bladeburner;
  onUpgrade: () => void;
}

export function SkillElem({ skill, bladeburner, onUpgrade }: SkillElemProps): React.ReactElement {
  const skillName = skill.name;
  const skillLevel = bladeburner.getSkillLevel(skillName);
  const pointCost = useMemo(() => skill.calculateCost(skillLevel), [skill, skillLevel]);
  // No need to support "+1" button when the skill level reaches Number.MAX_SAFE_INTEGER.
  const isSupported = skillLevel < Number.MAX_SAFE_INTEGER;
  // Use skill.canUpgrade() instead of reimplementing all conditional checks.
  const canLevel = isSupported && skill.canUpgrade(bladeburner, 1).available;
  /**
   * maxLvl is only useful when we check if we should show "MAX LEVEL". For the check of the icon button, we don't need
   * it. This condition is checked in skill.canUpgrade().
   */
  const maxLvl = skill.maxLvl ? skillLevel >= skill.maxLvl : false;

  function onClick(): void {
    bladeburner.upgradeSkill(skillName);
    onUpgrade();
  }

  return (
    <Paper sx={{ my: 1, p: 1 }}>
      <Box display="flex" flexDirection="row" alignItems="center">
        <CopyableText variant="h6" color="primary" value={skillName} />
        {!canLevel ? (
          <IconButton disabled>
            <CloseIcon />
          </IconButton>
        ) : (
          <IconButton onClick={onClick}>
            <AddIcon />
          </IconButton>
        )}
      </Box>
      <Typography>Level: {formatBigNumber(skillLevel)}</Typography>
      {maxLvl ? (
        <Typography>MAX LEVEL</Typography>
      ) : (
        <Typography>Skill Points required: {isSupported ? formatBigNumber(pointCost) : "N/A"}</Typography>
      )}
      <Typography>{skill.desc}</Typography>
    </Paper>
  );
}
