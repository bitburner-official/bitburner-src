import { Paper, Typography, Box } from "@mui/material";
import React from "react";
import type { Infiltration } from "../Infiltration";
import type { Cyberpunk2077Model } from "../model/Cyberpunk2077Model";
import { AugmentationName } from "@enums";
import { Player } from "@player";
import { Settings } from "../../Settings/Settings";

interface IProps {
  state: Infiltration;
  stage: Cyberpunk2077Model;
}

interface GridItem {
  content: string;
  color: string;
  selected?: boolean;
}

export function Cyberpunk2077Game({ stage }: IProps): React.ReactElement {
  const hasAugment = Player.hasAugmentation(AugmentationName.FloodOfPoseidon, true);

  const flatGrid: GridItem[] = [];
  stage.grid.map((line, y) =>
    line.map((cell, x) => {
      const isCorrectAnswer = cell === stage.answers[stage.currentAnswerIndex];
      const optionColor = hasAugment && !isCorrectAnswer ? Settings.theme.disabled : Settings.theme.primary;

      if (x === stage.x && y === stage.y) {
        flatGrid.push({ color: optionColor, content: cell, selected: true });
        return;
      }

      flatGrid.push({ color: optionColor, content: cell });
    }),
  );

  const fontSize = "2em";
  return (
    <>
      <Paper sx={{ display: "grid", justifyItems: "center", pb: 1 }}>
        <Typography variant="h4">Match the symbols!</Typography>
        <Typography variant="h5" color={Settings.theme.primary}>
          Targets:{" "}
          {stage.answers.map((a, i) => {
            if (i === stage.currentAnswerIndex)
              return (
                <span key={`${i}`} style={{ fontSize: "1em", color: Settings.theme.infolight }}>
                  {a}&nbsp;
                </span>
              );
            return (
              <span key={`${i}`} style={{ fontSize: "1em", color: Settings.theme.primary }}>
                {a}&nbsp;
              </span>
            );
          })}
        </Typography>
        <br />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: `repeat(${stage.settings.width}, 1fr)`,
            gap: 1,
          }}
        >
          {flatGrid.map((item, idx) => {
            let borderStyle = "solid";
            let borderColor = "transparent";
            if (item.selected) {
              borderColor = Settings.theme.infolight;
            } else if (hasAugment && item.content === stage.answers[stage.currentAnswerIndex]) {
              borderStyle = "dashed";
              borderColor = Settings.theme.warning;
            }
            return (
              <Typography
                key={idx}
                sx={{
                  fontSize: fontSize,
                  color: item.color,
                  // Always use a 2px border to avoid small symbol position shifts caused by size changes (element vs
                  // element + 2px border).
                  border: `2px ${borderStyle} ${borderColor}`,
                  lineHeight: "unset",
                  p: item.selected ? "2px" : "4px",
                }}
              >
                {item.content}
              </Typography>
            );
          })}
        </Box>
      </Paper>
    </>
  );
}
