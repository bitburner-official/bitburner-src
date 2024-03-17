import React from "react"
import { GangMember } from "../GangMember";
import { GangMemberCardContent } from "./GangMemberCardContent";

import Box from "@mui/material/Box";

import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import { gangMemberTypeColor } from "@enums";

interface IProps {
  member: GangMember;
}

/** React Component for a gang member on the management subpage. */
export function GangMemberCard(props: IProps): React.ReactElement {
  return (
    <Box component={Paper} sx={{ width: "auto" }}>
      <Box sx={{ m: 1 }}>
        <ListItemText primary={<span style={{fontWeight: "bold", color: gangMemberTypeColor[props.member.type]}}>{props.member.name} ({props.member.type})</span>} />
        <GangMemberCardContent member={props.member} />
      </Box>
    </Box>
  );
}
