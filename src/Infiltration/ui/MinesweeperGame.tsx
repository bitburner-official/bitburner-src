import { Close, Flag, Report } from "@mui/icons-material";
import { Box, Paper, Typography } from "@mui/material";
import React from "react";
import type { Infiltration } from "../Infiltration";
import type { MinesweeperModel } from "../model/MinesweeperModel";
import { AugmentationName } from "@enums";
import { Player } from "@player";
import { Settings } from "../../Settings/Settings";

interface IProps {
  state: Infiltration;
  stage: MinesweeperModel;
}

export function MinesweeperGame({ stage }: IProps): React.ReactElement {
  const hasAugment = Player.hasAugmentation(AugmentationName.HuntOfArtemis, true);

  const flatGrid: { flagged?: boolean; current?: boolean; marked?: boolean }[] = [];

  stage.minefield.map((line, y) =>
    line.map((_cell, x) => {
      if (stage.memoryPhase) {
        flatGrid.push({ flagged: Boolean(stage.minefield[y][x]) });
        return;
      } else if (x === stage.x && y === stage.y) {
        flatGrid.push({ current: true });
      } else if (stage.answer[y][x]) {
        flatGrid.push({ marked: true });
      } else if (hasAugment && stage.minefield[y][x]) {
        flatGrid.push({ flagged: true });
      } else {
        flatGrid.push({});
      }
    }),
  );

  return (
    <>
      <Paper sx={{ display: "grid", justifyItems: "center", pb: 1 }}>
        <Typography variant="h4">{stage.memoryPhase ? "记住所有的地雷！" : "标记所有的地雷！"}</Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: `repeat(${stage.settings.width}, 1fr)`,
            gridTemplateRows: `repeat(${stage.settings.height}, 1fr)`,
            gap: 1,
          }}
        >
          {flatGrid.map((item, i) => {
            let color: string;
            let icon: React.ReactElement;

            if (item.marked) {
              color = Settings.theme.warning;
              icon = <Flag />;
            } else if (item.current) {
              color = Settings.theme.infolight;
              icon = <Close />;
            } else if (item.flagged) {
              color = Settings.theme.error;
              icon = <Report />;
            } else {
              color = Settings.theme.primary;
              icon = <></>;
            }

            return (
              <Typography
                key={i}
                sx={{
                  color: color,
                  border: `2px solid ${item.current ? Settings.theme.infolight : Settings.theme.primary}`,
                  height: "32px",
                  width: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {icon}
              </Typography>
            );
          })}
        </Box>
      </Paper>
    </>
  );
}
