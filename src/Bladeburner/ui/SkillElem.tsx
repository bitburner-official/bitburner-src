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

  const canLevel = bladeburner.skillPoints >= pointCost;
  const maxLvl = skill.maxLvl ? skillLevel >= skill.maxLvl : false;

  function onClick(): void {
    bladeburner.upgradeSkill(skillName);
    onUpgrade();
  }

  return (
    <Paper sx={{ my: 1, p: 1 }}>
      <Box display="flex" flexDirection="row" alignItems="center">
        <CopyableText variant="h6" color="primary" value={skillName} />
        {!canLevel || maxLvl ? (
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
        <Typography>Skill Points required: {formatBigNumber(pointCost)}</Typography>
      )}
      <Typography>{skill.desc}</Typography>
    </Paper>
  );
}
