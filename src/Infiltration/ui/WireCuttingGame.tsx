import React from "react";
import type { Infiltration } from "../Infiltration";
import type { WireCuttingModel } from "../model/WireCuttingModel";
import { Box, Paper, Typography } from "@mui/material";
import { AugmentationName } from "@enums";
import { Player } from "@player";

interface IProps {
  state: Infiltration;
  stage: WireCuttingModel;
}

export function WireCuttingGame({ stage }: IProps): React.ReactElement {
  const hasAugment = Player.hasAugmentation(AugmentationName.KnowledgeOfApollo, true);
  const wrongWireColor = "#CC79A7";
  return (
    <>
      <Paper sx={{ display: "grid", justifyItems: "center", pb: 1 }}>
        <Typography variant="h4" sx={{ width: "75%", textAlign: "center" }}>
          Cut the wires with the following properties! (keyboard 1 to 9)
        </Typography>
        {stage.questions.map((question, i) => (
          <Typography key={i}>{question.toString()}</Typography>
        ))}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: `repeat(${stage.wires.length}, 1fr)`,
            columnGap: 3,
            justifyItems: "center",
            background: "black",
            padding: "10px 20px",
          }}
        >
          {Array.from({ length: stage.wires.length }, (_, i) => {
            const isCorrectWire = stage.cutWires[i] || stage.wiresToCut.has(i);
            const color = hasAugment && !isCorrectWire ? wrongWireColor : "#009E73";
            return (
              <Typography key={i} style={{ color: color }}>
                {i + 1}
              </Typography>
            );
          })}
          {Array.from({ length: 11 }, (_, i) => (
            <React.Fragment key={i}>
              {stage.wires.map((wire, j) => {
                if ((i === 3 || i === 4) && stage.cutWires[j]) {
                  return <Typography key={j}></Typography>;
                }
                const isCorrectWire = stage.cutWires[j] || stage.wiresToCut.has(j);
                const wireColor = hasAugment && !isCorrectWire ? wrongWireColor : wire.colors[i % wire.colors.length];
                return (
                  <Typography key={j} style={{ color: wireColor }}>
                    |{wire.wireType[i % wire.wireType.length]}|
                  </Typography>
                );
              })}
            </React.Fragment>
          ))}
        </Box>
      </Paper>
    </>
  );
}
