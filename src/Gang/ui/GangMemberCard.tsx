import React from "react";
import { Settings } from "../../Settings/Settings";
import { GangMember } from "../GangMember";
import { GangMemberCardContent } from "./GangMemberCardContent";

import Box from "@mui/material/Box";

import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";

interface IProps {
  member: GangMember;
}

/** React Component for a gang member on the management subpage. */
export function GangMemberCard(props: IProps): React.ReactElement {
  return (
    <Box component={Paper} sx={{ width: "auto" }}>
      <Box sx={{ m: 1 }}>
        <ListItemText primary={<span style={{fontWeight: "bold", color: props.member.isEnforcer ? Settings.theme.combat : Settings.theme.hack}}>{props.member.name + " (" + (props.member.isEnforcer ? "enforcer" : "hacker") + ")"}</span>} />
        <GangMemberCardContent member={props.member} />
      </Box>
    </Box>
  );
}
