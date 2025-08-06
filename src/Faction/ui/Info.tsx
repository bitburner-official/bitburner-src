/**
 * React component for general information about the faction. This includes the
 * factions "motto", reputation, favor, and gameplay instructions
 */
import React from "react";

import { Faction } from "../Faction";
import { FactionInfo } from "../FactionInfo";

import Typography from "@mui/material/Typography";
import { useCycleRerender } from "../../ui/React/hooks";
import { knowAboutBitverse } from "../../BitNode/BitNodeUtils";
import { ReputationInfo } from "../../ui/React/ReputationInfo";
import { FavorInfo } from "../../ui/React/FavorInfo";

interface IProps {
  faction: Faction;
  factionInfo: FactionInfo;
}

function DefaultAssignment(): React.ReactElement {
  return (
    <Typography>
      Perform work/carry out assignments for your faction to help further its cause! By doing so, you will earn
      reputation for your faction. You will also gain reputation passively over time, although at a very slow
      rate.&nbsp;
      {knowAboutBitverse() && <>Note that the passive reputation gain is disabled in some BitNodes. </>}
      Earning reputation will allow you to purchase augmentations through this faction, which are powerful upgrades that
      enhance your abilities.
    </Typography>
  );
}

export function Info(props: IProps): React.ReactElement {
  useCycleRerender();

  const Assignment = props.factionInfo.assignment ?? DefaultAssignment;

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
      <Assignment />
    </>
  );
}
