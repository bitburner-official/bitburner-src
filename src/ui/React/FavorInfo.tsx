import React from "react";
import InfoIcon from "@mui/icons-material/Info";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import { Favor } from "../../ui/React/Favor";
import MathNotation from "../../Documentation/data/MathNotation.json";
import { MathNotationOutput } from "../../Documentation/ui/MathNotationOutput";

export function FavorInfo({ favor, boldLabel }: { favor: number; boldLabel?: boolean }): React.ReactElement {
  return (
    <Tooltip
      title={
        <>
          <Typography>
            好感每提高 1 点，你在该派系获得的声望速度就提升 1%。每当你安装一个强化时都会获得好感。获得的好感数量取决于你在所有转生中为该派系赚取的声望总量。
          </Typography>
          <Typography style={{ fontSize: "2rem" }}>r = 声望收益</Typography>
          <MathNotationOutput notation={MathNotation.FavorBonus} />
        </>
      }
    >
      <Typography component="div" sx={{ display: "flex", alignItems: "center", whiteSpace: "pre-wrap" }}>
        <Typography sx={{ fontWeight: `${boldLabel ? "bold" : "normal"}` }}>好感： </Typography>
        <Favor favor={favor} />
        <InfoIcon sx={{ fontSize: "1.1em", marginLeft: "10px" }} />
      </Typography>
    </Tooltip>
  );
}
