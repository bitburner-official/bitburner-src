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
          This faction is enemies with: {props.factionInfo.enemies.join(", ")}.
        </Typography>
      )}
      <Typography>-------------------------</Typography>
      <ReputationInfo favor={props.faction.favor} playerReputation={props.faction.playerReputation} />
      <Typography>-------------------------</Typography>
      <FavorInfo favor={props.faction.favor} />
      <Typography>-------------------------</Typography>
      <Typography variant="h5" style={{ display: "flex", alignItems: "center" }}>
        <Grade style={{ fontSize: "1.1em", marginRight: "10px" }} />
        Special Campaign
        <Tooltip
          title={
            <>
              Some factions are developing special campaigns for researching breakthrough technology or executing
              initiatives. Some campaigns may be complete, while others remain unfinished. Explore them now, and return
              later if a campaign is not yet complete to see what unfolds.
            </>
          }
        >
          <InfoIcon sx={{ fontSize: "0.8em", marginLeft: "10px" }} />
        </Tooltip>
      </Typography>
      {props.factionInfo.campaign ? props.factionInfo.campaign() : <Typography>None</Typography>}
      <Typography>-------------------------</Typography>
    </>
  );
}
