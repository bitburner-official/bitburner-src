/**
 * React component for general information about the faction. This includes the
 * factions "motto", reputation, favor, and gameplay instructions
 */
import React from "react";

import { Faction } from "../Faction";
import { FactionInfo } from "../FactionInfo";

import Typography from "@mui/material/Typography";
import { useCycleRerender } from "../../ui/React/hooks";
import { ReputationInfo } from "../../ui/React/ReputationInfo";
import { FavorInfo } from "../../ui/React/FavorInfo";
import Tooltip from "@mui/material/Tooltip";
import InfoIcon from "@mui/icons-material/Info";
import Grade from "@mui/icons-material/Grade";

interface IProps {
  faction: Faction;
  factionInfo: FactionInfo;
}

export function Info(props: IProps): React.ReactElement {
  useCycleRerender();

  return (
    <>
      <Typography sx={{ whiteSpace: "pre-wrap" }}>{props.factionInfo.infoText}</Typography>
      {props.factionInfo.enemies.length > 0 && (
        <Typography component="div">
          <br />
          该派系的敌对派系：{props.factionInfo.enemies.join(", ")}。
        </Typography>
      )}
      <Typography>-------------------------</Typography>
      <ReputationInfo favor={props.faction.favor} playerReputation={props.faction.playerReputation} />
      <Typography>-------------------------</Typography>
      <FavorInfo favor={props.faction.favor} />
      <Typography>-------------------------</Typography>
      <Typography variant="h5" style={{ display: "flex", alignItems: "center" }}>
        <Grade style={{ fontSize: "1.1em", marginRight: "10px" }} />
        特殊战役
        <Tooltip
          title={
            <>
              一些派系正在开发特殊战役，用于研究突破性技术或执行特别计划。有些战役可能已经完成，而另一些则尚未完成。现在就去探索吧；如果某场战役尚未完成，稍后再来看看会有什么进展。
            </>
          }
        >
          <InfoIcon sx={{ fontSize: "0.8em", marginLeft: "10px" }} />
        </Tooltip>
      </Typography>
      {props.factionInfo.campaign ? props.factionInfo.campaign() : <Typography>无</Typography>}
      <Typography>-------------------------</Typography>
    </>
  );
}
