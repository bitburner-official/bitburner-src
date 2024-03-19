import React from "react";
import { CopyableText } from "../../ui/React/CopyableText";
import { formatBigNumber } from "../../ui/formatNumber";
import { Bladeburner } from "../Bladeburner";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
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
  const pointCost = skill.calculateCost(skillLevel);

  const canLevel = bladeburner.skillPoints >= pointCost;
  const maxLvl = skill.maxLvl ? skillLevel >= skill.maxLvl : false;

  function onClick(): void {
    if (bladeburner.skillPoints < pointCost) return;
    bladeburner.skillPoints -= pointCost;
    bladeburner.increaseSkill(skillName);
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
