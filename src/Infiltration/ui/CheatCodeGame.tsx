import { Paper, Typography } from "@mui/material";
import React from "react";
import type { Infiltration } from "../Infiltration";
import type { CheatCodeModel } from "../model/CheatCodeModel";
import { AugmentationName } from "@enums";
import { Player } from "@player";

interface IProps {
  state: Infiltration;
  stage: CheatCodeModel;
}

export function CheatCodeGame({ stage }: IProps): React.ReactElement {
  const hasAugment = Player.hasAugmentation(AugmentationName.TrickeryOfHermes, true);

  return (
    <>
      <Paper sx={{ display: "grid", justifyItems: "center" }}>
        <Typography variant="h4">输入代码！</Typography>
        <Typography variant="h4">
          <div
            style={{
              display: "grid",
              gap: "2rem",
              gridTemplateColumns: `repeat(${stage.code.length}, 1fr)`,
              textAlign: "center",
            }}
          >
            {stage.code.map((arrow, i) => {
              return (
                <span key={i} style={i !== stage.index ? { opacity: 0.4 } : {}}>
                  {i > stage.index && !hasAugment ? "?" : arrow}
                </span>
              );
            })}
          </div>
        </Typography>
      </Paper>
    </>
  );
}
